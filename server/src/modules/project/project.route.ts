import { FastifyInstance } from 'fastify'
import ProjectController from './project.controller'
import { $ref } from './project.dto'
import ProjectService from './project.service'

export default async (fastify: FastifyInstance) => {
	const projectController = new ProjectController(new ProjectService())

	fastify.post(
		'/create',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Project'],
				body: $ref('createProjectSchema'),
				response: {
					201: $ref('createProjectResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		projectController.createProjectHandler.bind(projectController)
	)

	fastify.get(
		'/get',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Project'],
				querystring: {
					id: { type: 'string' }
				},
				response: {
					200: $ref('projectResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		projectController.getProjectHandler.bind(projectController)
	)

	fastify.get(
		'/get/user',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Project'],
				response: {
					200: $ref('projectsResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		projectController.getProjectsByUserHandler.bind(projectController)
	)

	fastify.patch(
		'/update/:id',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Project'],
				body: $ref('updateProjectSchema'),
				response: {
					200: $ref('updateProjectResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		projectController.updateProjectHandler.bind(projectController)
	)

	fastify.delete(
		'/delete/:id',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Project'],
				response: {
					200: $ref('deleteProjectResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		projectController.deleteProjectHandler.bind(projectController)
	)
}
