import { buildJsonSchemas } from 'fastify-zod'
import { z } from 'zod'
import {
	createUserResponseSchema,
	createUserSchema,
	userCore,
	userResponseSchema
} from '../user/user.dto'

const loginSchema = z.object({
	email: userCore.email,
	password: z
		.string({
			required_error: 'Password is required',
			invalid_type_error: 'Password must be a string'
		})
		.min(8)
})

const registerResponseSchema = z.object({
	accessToken: z.string()
})

const loginResponseSchema = z.object({
	accessToken: z.string()
})

const refreshResponseSchema = z.object({
	accessToken: z.string()
})

const logoutResponseSchema = z.object({})

export type LoginInput = z.infer<typeof loginSchema>

export const { schemas: authSchemas, $ref } = buildJsonSchemas(
	{
		createUserSchema,
		createUserResponseSchema,
		registerResponseSchema,
		loginSchema,
		loginResponseSchema,
		refreshResponseSchema,
		logoutResponseSchema,
		userResponseSchema
	},
	{
		$id: 'authSchema'
	}
)
