import { FastifyInstance, FastifyPluginOptions } from 'fastify'

import fastifyPlugin from 'fastify-plugin'
import { userSchemas } from './user.dto'
import userRoute from './user.route'

export default fastifyPlugin(
	async (fastify: FastifyInstance, options: FastifyPluginOptions) => {
		for (const schema of userSchemas) {
			fastify.addSchema(schema)
		}

		await fastify.register(userRoute, options)
	}
)
