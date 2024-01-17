import swagger from '@fastify/swagger'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import config from './config'
import cookie from './cookie'
import cors from './cors'
import drizzle from './drizzle'
import jwt from './jwt'
import redis from './redis'
import sensible from './sensible'

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await Promise.all([fastify.register(config), fastify.register(sensible)])

	await Promise.all([
		fastify.register(drizzle),
		fastify.register(redis),
		fastify.register(cookie),
		fastify.register(cors),
		fastify.config.NODE_ENV === 'local' ? fastify.register(swagger) : null
	])

	await Promise.all([fastify.register(jwt)])
})
