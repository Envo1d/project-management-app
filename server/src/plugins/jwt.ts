import fastifyJwt, { JWT, SignOptions } from '@fastify/jwt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

interface SignJWTOptions extends SignOptions {}

export type signTokenPayload = {
	sub: string
	iat: number
	tokenFamily: string
}
export type tokenPayload = {
	exp: number
} & signTokenPayload

export type signRefreshTokenPayload = {
	aex: number
} & signTokenPayload
export type refreshTokenPayload = tokenPayload & signRefreshTokenPayload

export type signAccessTokenPayload = signTokenPayload
export type accessTokenPayload = tokenPayload & signAccessTokenPayload

export type user = {
	exp: number
} & tokenPayload

declare module 'fastify' {
	interface FastifyRequest {
		jwt: JWT
	}
	interface FastifyInstance {
		authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		payload: refreshTokenPayload | accessTokenPayload
		user: user
	}
	interface JWT {
		decodeAccessToken: (refreshToken: string) => accessTokenPayload
		decodeRefreshToken: (refreshToken: string) => refreshTokenPayload

		sign(
			payload: signAccessTokenPayload | signRefreshTokenPayload,
			options?: Partial<SignJWTOptions>
		): string
		signRefreshToken: (refreshTokenPayload: signRefreshTokenPayload) => string
		signAccessToken: (accessTokenPayload: signAccessTokenPayload) => string
	}
}

export let jwt: JWT

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		await fastify.register(fastifyJwt, {
			secret: {
				private: fastify.config.PRIVATE_KEY,
				public: fastify.config.PUBLIC_KEY
			},
			sign: {
				algorithm: 'EdDSA'
			},
			cookie: {
				cookieName: 'refreshToken',
				signed: false
			}
		})

		jwt = fastify.jwt

		jwt.signRefreshToken = (refreshTokenPayload: signRefreshTokenPayload) => {
			return jwt.sign(refreshTokenPayload, { expiresIn: '30d' })
		}
		jwt.decodeRefreshToken = (refreshToken: string) => {
			const refreshTokenObject = jwt.decode<refreshTokenPayload>(
				refreshToken
			) as refreshTokenPayload

			return refreshTokenObject
		}

		jwt.signAccessToken = (accessTokenPayload: signAccessTokenPayload) => {
			return jwt.sign(accessTokenPayload, { expiresIn: '1h' })
		}
		jwt.decodeAccessToken = (accessToken: string) => {
			const accessTokenObject = jwt.decode<accessTokenPayload>(
				accessToken
			) as accessTokenPayload

			return accessTokenObject
		}

		fastify.decorate(
			'authenticate',
			async (request: FastifyRequest, reply: FastifyReply) => {
				try {
					await request.jwtVerify()
				} catch (e) {
					reply.unauthorized()
				}
			}
		)
	},
	{ dependencies: ['config', 'cookie'] }
)
