import { FastifyInstance } from 'fastify'
import FileController from './file.controller'
import FileService from './file.service'

export default async (fastify: FastifyInstance) => {
	const fileController = new FileController(new FileService())

	fastify.post(
		'/upload',
		{
			// schema: {
			// 	tags: ['Auth'],
			// 	body: $ref('createUserSchema'),
			// 	response: {
			// 		201: $ref('registerResponseSchema')
			// 	}
			// }
		},
		fileController.uploadHandler.bind(fileController)
	)
}
