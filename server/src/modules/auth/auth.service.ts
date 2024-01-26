import { verify } from 'argon2'
import { v4 } from 'uuid'
import { accessTokenPayload, jwt, refreshTokenPayload } from '../../plugins/jwt'
import { prisma } from '../../plugins/prisma'
import TimeUtil from '../../utils/time'

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

		await prisma.userSession.create({
			data: {
				refreshToken,
				tokenFamily,
				userId
			}
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

		await prisma.userSession.update({
			where: {
				tokenFamily: oldTokenObject.tokenFamily
			},
			data: {
				refreshToken: refreshToken
			}
		})

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
			await prisma.userSession.delete({
				where: {
					tokenFamily: refreshTokenObject.tokenFamily
				}
			})

			throw new Error('Refresh token has reached absolute expiry')
		}

		const userSession = await prisma.userSession.findFirst({
			where: {
				refreshToken: oldRefreshToken,
				userId: refreshTokenObject.sub
			}
		})

		if (!userSession) {
			await prisma.userSession.delete({
				where: {
					tokenFamily: refreshTokenObject.tokenFamily
				}
			})

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
		await prisma.userSession.deleteMany({
			where: {
				tokenFamily: tokenFamily
			}
		})
	}
}
