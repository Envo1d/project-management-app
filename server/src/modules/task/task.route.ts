import { FastifyInstance } from 'fastify'
import TaskController from './task.controller'
import { $ref } from './task.dto'
import TaskService from './task.service'

export default async (fastify: FastifyInstance) => {
	const taskController = new TaskController(new TaskService())

	fastify.post(
		'/create',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				body: $ref('createTaskSchema'),
				response: {
					201: $ref('createTaskResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.createTaskHandler.bind(taskController)
	)

	fastify.get(
		'/get',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				querystring: {
					id: { type: 'string' }
				},
				response: {
					200: $ref('taskResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.getTaskHandler.bind(taskController)
	)

	fastify.get(
		'/get/:project_id',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				response: {
					200: $ref('tasksResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.getTasksByProjectHandler.bind(taskController)
	)

	fastify.get(
		'/get/user',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				response: {
					200: $ref('tasksResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.getTasksByUserHandler.bind(taskController)
	)

	fastify.patch(
		'/update/:id',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				body: $ref('updateTaskSchema'),
				response: {
					200: $ref('updateTaskResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.updateTaskHandler.bind(taskController)
	)

	fastify.delete(
		'/delete/:id',
		{
			schema: {
				headers: {
					Authorization: true
				},
				tags: ['Task'],
				response: {
					200: $ref('deleteTaskResponseSchema')
				}
			},
			onRequest: [fastify.authenticate]
		},
		taskController.deleteTaskHandler.bind(taskController)
	)
}
