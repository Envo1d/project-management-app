import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'

export const projectCore = {
	title: z
		.string({
			required_error: 'Title is required'
		})
		.min(3),
	description: z
		.string({
			required_error: 'Description is required'
		})
		.min(15)
}

export const createProjectSchema = z.object({
	...projectCore
})

export const createProjectResponseSchema = z.object({
	...projectCore
})

export const projectResponseSchema = z.object({
	id: z.string(),
	...projectCore,
	description: z.string(),
	imagePath: z.string().optional()
})

export const projectsResponseSchema = z
	.object({
		id: z.string(),
		...projectCore,
		description: z.string(),
		imagePath: z.string().optional()
	})
	.array()

export const updateProjectSchema = z.object({
	title: projectCore.title.optional(),
	description: z.string().optional()
})

export const deleteProjectSchema = z.object({
	id: z.string()
})

export const updateProjectResponseSchema = z.object({})

export const deleteProjectResponseSchema = z.object({})

export const projectIdSchema = z.object({
	id: z.string()
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectId = z.infer<typeof projectIdSchema>

export const { schemas: projectSchemas, $ref } = buildJsonSchemas(
	{
		projectIdSchema,
		createProjectSchema,
		createProjectResponseSchema,
		projectResponseSchema,
		projectsResponseSchema,
		updateProjectSchema,
		updateProjectResponseSchema,
		deleteProjectSchema,
		deleteProjectResponseSchema
	},
	{
		$id: 'projectSchema'
	}
)
