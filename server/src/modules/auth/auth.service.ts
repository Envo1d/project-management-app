import { verify } from 'argon2'
import { and, eq } from 'drizzle-orm'
import { v4 } from 'uuid'
import { db } from '../../plugins/drizzle'
import { accessTokenPayload, jwt, refreshTokenPayload } from '../../plugins/jwt'
import TimeUtil from '../../utils/time'
import { userSessions } from '../user/user.schema'

export default class AuthService {
	public async verifyPassword(
		password: string,
		candidate: string
	): Promise<boolean> {
		return await verify(password, candidate)
	}

	private createAccessToken(refreshToken: string): {
		accessToken: string
		accessTokenPayload: accessTokenPayload
	} {
		const refreshTokenObject = jwt.decodeRefreshToken(refreshToken)

		const accessToken = jwt.signAccessToken({
			sub: refreshTokenObject.sub,
			iat: TimeUtil.getNowUnixTimeStamp(),
			tokenFamily: refreshTokenObject.tokenFamily
		})

		return {
			accessToken,
			accessTokenPayload: jwt.decodeAccessToken(accessToken)
		}
	}

	private async createRefreshToken(userId: string): Promise<{
		refreshToken: string
		refreshTokenPayload: refreshTokenPayload
	}> {
		const tokenFamily = v4()

		const refreshToken = jwt.signRefreshToken({
			sub: userId,
			iat: TimeUtil.getNowUnixTimeStamp(),
			aex: TimeUtil.getNowUnixTimeStamp() + 60 * 60 * 24 * 365,
			tokenFamily: tokenFamily
		})

		await db.insert(userSessions).values({
			refreshToken,
			tokenFamily,
			userId
		})

		return {
			refreshToken,
			refreshTokenPayload: jwt.decodeRefreshToken(refreshToken)
		}
	}

	private async renovateRefreshToken(oldRefreshToken: string): Promise<{
		refreshToken: string
		refreshTokenPayload: refreshTokenPayload
	}> {
		const oldTokenObject = jwt.decodeRefreshToken(oldRefreshToken)

		const refreshToken = jwt.signRefreshToken({
			sub: oldTokenObject.sub,
			iat: TimeUtil.getNowUnixTimeStamp(),
			aex: oldTokenObject.aex,
			tokenFamily: oldTokenObject.tokenFamily
		})

		await db
			.update(userSessions)
			.set({
				refreshToken
			})
			.where(eq(userSessions.refreshToken, oldRefreshToken))

		return {
			refreshToken,
			refreshTokenPayload: jwt.decodeRefreshToken(refreshToken)
		}
	}

	public async createTokens(userId: string): Promise<{
		refreshToken: string
		refreshTokenPayload: refreshTokenPayload
		accessToken: string
		accessTokenPayload: accessTokenPayload
	}> {
		const { refreshToken, refreshTokenPayload } =
			await this.createRefreshToken(userId)
		const { accessToken, accessTokenPayload } =
			this.createAccessToken(refreshToken)

		return {
			refreshToken: refreshToken,
			refreshTokenPayload: refreshTokenPayload,
			accessToken: accessToken,
			accessTokenPayload: accessTokenPayload
		}
	}

	public async refreshByToken(oldRefreshToken: string): Promise<{
		refreshToken: string
		refreshTokenPayload: refreshTokenPayload
		accessToken: string
		accessTokenPayload: accessTokenPayload
	}> {
		jwt.verify(oldRefreshToken)

		const refreshTokenObject = jwt.decodeRefreshToken(oldRefreshToken)

		if (refreshTokenObject.aex < TimeUtil.getNowUnixTimeStamp()) {
			await db
				.delete(userSessions)
				.where(eq(userSessions.tokenFamily, refreshTokenObject.tokenFamily))

			throw new Error('Refresh token has reached absolute expiry')
		}

		const userSession = await db.query.userSessions.findFirst({
			where: and(
				eq(userSessions.refreshToken, oldRefreshToken),
				eq(userSessions.userId, refreshTokenObject.sub)
			)
		})

		if (!userSession) {
			await db
				.delete(userSessions)
				.where(eq(userSessions.tokenFamily, refreshTokenObject.tokenFamily))

			throw new Error('Refresh token has already been used')
		}

		const { refreshToken, refreshTokenPayload } =
			await this.renovateRefreshToken(oldRefreshToken)
		const { accessToken, accessTokenPayload } =
			this.createAccessToken(refreshToken)

		return {
			refreshToken,
			refreshTokenPayload,
			accessToken,
			accessTokenPayload
		}
	}

	public async deleteUserSessionByTokenFamily(
		tokenFamily: string
	): Promise<void> {
		await db
			.delete(userSessions)
			.where(eq(userSessions.tokenFamily, tokenFamily))
	}
}
