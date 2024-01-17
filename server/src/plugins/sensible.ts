import fastifySensible from '@fastify/sensible'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await fastify.register(fastifySensible)
})
