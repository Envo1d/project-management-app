import { FastifyReply, FastifyRequest } from 'fastify'
import { CreateTaskInput, TaskId, UpdateTaskInput } from './task.dto'
import TaskService from './task.service'

const CACHE_TTL = 1800
const CACHE_KEY_TASK = 'task'

export default class TaskController {
	private taskService: TaskService

	constructor(taskService: TaskService) {
		this.taskService = taskService
	}

	public async createTaskHandler(
		req: FastifyRequest<{
			Body: CreateTaskInput
		}>,
		rep: FastifyReply
	) {
		try {
			const task = this.taskService.createTask(req.body, req.user.sub)
			return rep.code(201).send(task)
		} catch (e) {
			return rep.unauthorized()
		}
	}

	public async updateTaskHandler(
		req: FastifyRequest<{
			Params: TaskId
			Body: UpdateTaskInput
		}>,
		rep: FastifyReply
	) {
		try {
			const task = this.taskService.updateTask(req.params.id, req.body)
			return rep.code(200).send(task)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Task not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async deleteTaskHandler(
		req: FastifyRequest<{
			Params: TaskId
		}>,
		rep: FastifyReply
	) {
		try {
			this.taskService.deleteTask(req.params.id)
			return rep.code(200)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Task not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getTaskHandler(
		req: FastifyRequest<{
			Querystring: TaskId
		}>,
		rep: FastifyReply
	) {
		try {
			const task = this.taskService.getTaskById(req.query.id)
			return rep.code(200).send(task)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Task not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getTasksByProjectHandler(
		req: FastifyRequest<{
			Params: { project_id: string }
		}>,
		rep: FastifyReply
	) {
		try {
			const tasks = this.taskService.getTasksByProject(req.params.project_id)
			return rep.code(200).send(tasks)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Tasks not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getTasksByUserHandler(req: FastifyRequest, rep: FastifyReply) {
		try {
			const tasks = this.taskService.getTasksByUser(req.user.sub)
			return rep.code(200).send(tasks)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Tasks not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}
}
