import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'

export const taskCore = {
	title: z
		.string({
			required_error: 'Title is required'
		})
		.min(3),
	projectId: z
		.string({
			required_error: 'Project id is required'
		})
		.min(5)
}

export const createTaskSchema = z.object({
	...taskCore
})

export const createTaskResponseSchema = z.object({
	...taskCore
})

export const taskResponseSchema = z.object({
	id: z.string(),
	...taskCore,
	description: z.string().optional(),
	imagePath: z.string().optional()
})

export const tasksResponseSchema = z
	.object({
		id: z.string(),
		...taskCore,
		description: z.string().optional(),
		imagePath: z.string().optional()
	})
	.array()

export const updateTaskSchema = z.object({
	title: taskCore.title.optional(),
	description: z.string().optional()
})

export const deleteTaskSchema = z.object({
	id: z.string()
})

export const updateTaskResponseSchema = z.object({})

export const deleteTaskResponseSchema = z.object({})

export const taskIdSchema = z.object({
	id: z.string()
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type TaskId = z.infer<typeof taskIdSchema>

export const { schemas: taskSchemas, $ref } = buildJsonSchemas(
	{
		taskIdSchema,
		createTaskSchema,
		createTaskResponseSchema,
		taskResponseSchema,
		tasksResponseSchema,
		updateTaskSchema,
		updateTaskResponseSchema,
		deleteTaskSchema,
		deleteTaskResponseSchema
	},
	{
		$id: 'taskSchema'
	}
)
