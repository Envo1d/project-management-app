import { FastifyInstance, FastifyPluginOptions } from 'fastify'

import fastifyPlugin from 'fastify-plugin'
import { projectSchemas } from './project.dto'
import projectRoute from './project.route'

export default fastifyPlugin(
	async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
		for (const schema of projectSchemas) {
			fastify.addSchema(schema)
		}

		await fastify.register(projectRoute, options)
	}
)
