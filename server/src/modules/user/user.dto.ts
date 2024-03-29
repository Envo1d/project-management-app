import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'

export const userCore = {
	name: z
		.string({
			required_error: 'Name is required'
		})
		.min(3),
	email: z
		.string({
			required_error: 'Email is required',
			invalid_type_error: 'Email must be a string'
		})
		.min(5)
		.email()
}

export const createUserSchema = z.object({
	...userCore,
	password: z
		.string({
			required_error: 'Password is required',
			invalid_type_error: 'Password must be a string'
		})
		.min(8)
})

export const createUserResponseSchema = z.object({
	...userCore
})

export const userResponseSchema = z.object({
	...userCore
})

export const updateUserSchema = z.object({
	...userCore
})

export const updateUserResponseSchema = z.object({})

export const deleteUserResponseSchema = z.object({})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const { schemas: userSchemas, $ref } = buildJsonSchemas(
	{
		createUserSchema,
		createUserResponseSchema,
		userResponseSchema,
		updateUserSchema,
		updateUserResponseSchema,
		deleteUserResponseSchema
	},
	{
		$id: 'userSchema'
	}
)
