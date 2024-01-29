import { FastifyInstance } from 'fastify'
import UserService from '../user/user.service'
import UserController from './user.controller'
import { $ref } from './user.dto'

export default async (fastify: FastifyInstance) => {
	const userController = new UserController(new UserService())

	fastify.get(
		'/me',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['User'],
				response: {
					200: $ref('userResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		userController.getUserHandler.bind(userController)
	)

	fastify.patch(
		'/update',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['User'],
				body: $ref('updateUserSchema'),
				response: {
					200: $ref('updateUserResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		userController.updateUserHandler.bind(userController)
	)

	fastify.delete(
		'/delete',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['User'],
				response: {
					200: $ref('deleteUserResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		userController.deleteUserHandler.bind(userController)
	)
}
