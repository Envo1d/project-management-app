import { FastifyInstance, FastifyPluginOptions } from 'fastify'

import fastifyPlugin from 'fastify-plugin'
import { authSchemas } from './auth.dto'
import authRoute from './auth.route'

export default fastifyPlugin(
	async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
		for (const schema of authSchemas) {
			fastify.addSchema(schema)
		}

		await fastify.register(authRoute, options)
	}
)
