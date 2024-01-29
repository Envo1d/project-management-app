import { Task } from '@prisma/client'
import { prisma } from '../../plugins/prisma'
import { CreateTaskInput, UpdateTaskInput } from './task.dto'

export default class TaskService {
	public async createTask(
		input: CreateTaskInput,
		userId: string
	): Promise<Task> {
		return await prisma.task.create({
			data: {
				title: input.title,
				project: {
					connect: {
						id: input.projectId
					}
				},
				user: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	public async updateTask(
		taskId: string,
		input: UpdateTaskInput
	): Promise<Task> {
		const res = await prisma.task.update({
			where: {
				id: taskId
			},
			data: {
				title: input.title,
				description: input.description
			}
		})
		if (!res) throw Error('Task not found')

		return res
	}

	public async deleteTask(taskId: string): Promise<boolean> {
		const res = await prisma.task.delete({ where: { id: taskId } })

		if (!res) throw Error('Task not found')

		return true
	}

	public async getTaskById(taskId: string): Promise<Task> {
		const res = await prisma.task.findUnique({
			where: {
				id: taskId
			}
		})

		if (!res) throw Error('Task not found')

		return res
	}

	public async getTasksByProject(projectId: string): Promise<Task[]> {
		const res = await prisma.task.findMany({
			where: {
				projectId
			}
		})

		if (!res) throw Error('Tasks not found')

		return res
	}

	public async getTasksByUser(userId: string): Promise<Task[]> {
		const res = await prisma.task.findMany({
			where: {
				userId
			}
		})

		if (!res) throw Error('Tasks not found')

		return res
	}
}
