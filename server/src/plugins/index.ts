import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import config from './config'
import cookie from './cookie'
import cors from './cors'
import jwt from './jwt'
import multipart from './multipart'
import prisma from './prisma'
import redis from './redis'
import sensible from './sensible'
import swagger from './swagger'

export default fastifyPlugin(async (fastify: FastifyInstance) => {
	await Promise.all([fastify.register(config), fastify.register(sensible)])

	await Promise.all([
		fastify.register(prisma),
		fastify.register(redis),
		fastify.register(cookie),
		fastify.register(cors),
		fastify.register(multipart),
		fastify.config.NODE_ENV === 'local' ? fastify.register(swagger) : null
	])

	await Promise.all([fastify.register(jwt)])
})
