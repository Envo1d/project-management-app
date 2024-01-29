import { FastifyInstance, FastifyPluginOptions } from 'fastify'

import fastifyPlugin from 'fastify-plugin'
import { taskSchemas } from './task.dto'
import taskRoute from './task.route'

export default fastifyPlugin(
	async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
		for (const schema of taskSchemas) {
			fastify.addSchema(schema)
		}

		await fastify.register(taskRoute, options)
	}
)
