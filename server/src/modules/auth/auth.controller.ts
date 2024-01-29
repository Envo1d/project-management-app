import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateUserInput } from '../user/user.dto'
import UserService from '../user/user.service'
import { LoginInput } from './auth.dto'
import AuthService from './auth.service'

export default class UserController {
	private authService: AuthService
	private userService: UserService

	constructor(authService: AuthService, userService: UserService) {
		this.authService = authService
		this.userService = userService
	}

	public async registerHandler(
		req: FastifyRequest<{ Body: CreateUserInput }>,
		rep: FastifyReply
	) {
		try {
			const user = await this.userService.createUser(req.body)

			const { refreshToken, refreshTokenPayload, accessToken } =
				await this.authService.createTokens(user.id)

			return rep
				.code(201)
				.setCookie('refreshToken', refreshToken, {
					path: '/api/auth/refresh',
					secure: true,
					httpOnly: true,
					sameSite: 'none',
					expires: new Date(refreshTokenPayload.exp * 1000)
				})
				.send({ accessToken })
		} catch (error) {
			if (error instanceof Error) return rep.badRequest(error.message)
			throw error
		}
	}

	public async loginHandler(
		req: FastifyRequest<{ Body: LoginInput }>,
		rep: FastifyReply
	) {
		try {
			const user = await this.userService.getUserPasswordByEmail(req.body.email)

			if (
				!this.authService.verifyPassword(user.passwordHash, req.body.password)
			)
				throw new Error('Incorrect password')

			const { refreshToken, refreshTokenPayload, accessToken } =
				await this.authService.createTokens(user.id)

			return rep
				.code(200)
				.setCookie('refreshToken', refreshToken, {
					path: '/api/auth/refresh',
					secure: true,
					httpOnly: true,
					sameSite: 'none',
					expires: new Date(refreshTokenPayload.exp * 1000)
				})
				.send({ accessToken })
		} catch (error) {
			return rep.unauthorized('Email and/or password incorrect')
		}
	}

	public async refreshHandler(req: FastifyRequest, rep: FastifyReply) {
		try {
			const { refreshToken, refreshTokenPayload, accessToken } =
				await this.authService.refreshByToken(
					req.cookies.refreshToken as string
				)

			return rep
				.code(200)
				.setCookie('refreshToken', refreshToken, {
					path: '/api/auth/refresh',
					secure: true,
					httpOnly: true,
					sameSite: 'none',
					expires: new Date(refreshTokenPayload.exp * 1000)
				})
				.send({
					accessToken: accessToken
				})
		} catch (error) {
			return rep.unauthorized()
		}
	}

	public async logoutHandler(req: FastifyRequest, rep: FastifyReply) {
		await this.authService.deleteUserSessionByTokenFamily(req.user.tokenFamily)

		return rep
			.code(200)
			.clearCookie('refreshToken', {
				path: '/api/auth/refresh',
				secure: true,
				httpOnly: true,
				sameSite: 'none'
			})
			.send()
	}
}
