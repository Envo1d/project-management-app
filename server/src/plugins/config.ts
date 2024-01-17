import fastifyEnv from '@fastify/env'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

import dotenv from 'dotenv'
dotenv.config()

const NODE_ENVS = ['prod', 'test', 'local'] as const
type NODE_ENV = (typeof NODE_ENVS)[number]

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			SECRET: string
			PRIVATE_KEY: string
			PUBLIC_KEY: string
			HOST: string
			PORT: number
			MIGRATE_DB: boolean
			POSTGRES_USER: string
			POSTGRES_DB: string
			POSTGRES_PASSWORD: string
			POSTGRES_PORT: number
			POSTGRES_HOST: string
			REDIS_HOST: string
			REDIS_PORT: number
			REDIS_PASSWORD: string
			NODE_ENV: NODE_ENV
			ALLOWED_ORIGINS: string[]
		}
	}
}

export default fastifyPlugin(
	(
		fastify: FastifyInstance,
		_options: FastifyPluginOptions,
		done: (err?: Error | undefined) => void
	) => {
		const schema = {
			type: 'object',
			required: [
				'SECRET',
				'PRIVATE_KEY',
				'PUBLIC_KEY',
				'POSTGRES_USER',
				'POSTGRES_DB',
				'POSTGRES_PASSWORD',
				'POSTGRES_PORT',
				'POSTGRES_HOST',
				'REDIS_HOST',
				'REDIS_PORT',
				'REDIS_PASSWORD'
			],
			properties: {
				SECRET: {
					type: 'string'
				},
				PRIVATE_KEY: {
					type: 'string'
				},
				PUBLIC_KEY: {
					type: 'string'
				},
				HOST: {
					type: 'string',
					default: '0.0.0.0'
				},
				PORT: {
					type: 'number',
					default: 3000
				},
				MIGRATE_DB: {
					type: 'boolean',
					default: false
				},
				POSTGRES_USER: {
					type: 'string'
				},
				POSTGRES_PASSWORD: {
					type: 'string'
				},
				POSTGRES_DB: {
					type: 'string'
				},
				POSTGRES_HOST: {
					type: 'string'
				},
				POSTGRES_PORT: {
					type: 'number'
				},
				REDIS_HOST: {
					type: 'string'
				},
				REDIS_PORT: { type: 'number' },
				REDIS_USER: { type: 'string' },
				NODE_ENV: {
					type: 'string',
					default: 'prod'
				},
				ALLOWED_ORIGINS: {
					type: 'string',
					separator: ',',
					default: 'http://localhost:3000'
				}
			}
		}

		const configOptions = {
			confKey: 'config',
			schema: schema,
			data: process.env,
			dotenv: true,
			removeAdditional: true
		}

		if (
			NODE_ENVS.find(validName => validName === process.env.NODE_ENV) ===
			undefined
		) {
			throw new Error(
				"NODE_ENV is not valid, it must be one of 'prod', 'test' or 'local', not \"" +
					process.env.NODE_ENV +
					'"'
			)
		}

		fastifyEnv(fastify, configOptions, done)
	},
	{ name: 'config' }
)
