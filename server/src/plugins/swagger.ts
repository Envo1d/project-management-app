import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		await fastify.register(fastifySwagger, {
			mode: 'dynamic',
			openapi: {
				info: {
					title: 'API',
					version: '0.1.0'
				}
			}
		})

		await fastify.register(fastifySwaggerUI, {
			routePrefix: '/api/docs',
			initOAuth: {},
			uiConfig: {
				docExpansion: 'full',
				deepLinking: false
			},
			uiHooks: {
				onRequest: function (request, reply, next) {
					next()
				},
				preHandler: function (request, reply, next) {
					next()
				}
			},
			staticCSP: true,
			transformStaticCSP: header => header,
			transformSpecification: (swaggerObject, request, reply) => {
				return swaggerObject
			},
			transformSpecificationClone: true
		})
	},
	{ dependencies: ['config'] }
)
