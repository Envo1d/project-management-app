import { FastifyInstance, FastifyPluginOptions } from 'fastify'

import fastifyPlugin from 'fastify-plugin'
import auth from './auth'
import file from './file'
import project from './project'
import task from './task'
import user from './user'

const getOptionsWithPrefix = (
	options: FastifyPluginOptions,
	prefix: string
) => {
	return {
		...options,
		prefix: options.prefix + prefix
	}
}

export default fastifyPlugin(
	async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
		fastify.get(
			'/api/health',
			{
				schema: {
					tags: ['Test']
				}
			},
			async () => {
				return { status: 'OK' }
			}
		)

		await Promise.all([
			fastify.register(auth, getOptionsWithPrefix(options, '/auth')),
			fastify.register(file, getOptionsWithPrefix(options, '/file')),
			fastify.register(user, getOptionsWithPrefix(options, '/user')),
			fastify.register(task, getOptionsWithPrefix(options, '/task')),
			fastify.register(project, getOptionsWithPrefix(options, '/project'))
		])
	}
)
