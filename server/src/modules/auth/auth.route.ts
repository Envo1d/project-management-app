import { FastifyInstance } from 'fastify'
import UserService from '../user/user.service'
import AuthController from './auth.controller'
import { $ref } from './auth.dto'
import AuthService from './auth.service'

export default async (fastify: FastifyInstance) => {
	const authController = new AuthController(
		new AuthService(),
		new UserService()
	)

	fastify.post(
		'/register',
		{
			schema: {
				tags: ['Auth'],
				body: $ref('registerSchema'),
				response: {
					201: $ref('registerResponseSchema')
				}
			}
		},
		authController.registerHandler.bind(authController)
	)

	fastify.post(
		'/login',
		{
			schema: {
				tags: ['Auth'],
				body: $ref('loginSchema'),
				response: {
					200: $ref('loginResponseSchema')
				}
			}
		},
		authController.loginHandler.bind(authController)
	)

	fastify.post(
		'/refresh',
		{
			schema: {
				tags: ['Auth'],
				response: {
					200: $ref('refreshResponseSchema')
				},
				description: 'The `refreshToken` cookie is required'
			}
		},
		authController.refreshHandler.bind(authController)
	)

	fastify.post(
		'/logout',
		{
			schema: {
				tags: ['Auth'],
				response: {
					200: $ref('logoutResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		authController.logoutHandler.bind(authController)
	)
}
