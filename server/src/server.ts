import dotenv from 'dotenv'
import { FastifyInstance } from 'fastify'
import build from './app'

const bootstrap = async () => {
	dotenv.config()

	let fastify: FastifyInstance

	const start = performance.now()
	try {
		fastify = await build()
	} catch (error) {
		console.error('Error occured while building fastify app')
		console.error(error)
		process.exit(1)
	}

	fastify.log.info(
		`Successfully built fastify instance in ${(
			performance.now() - start
		).toFixed(2)} ms`
	)

	await fastify.listen({
		host: fastify.config.HOST,
		port: fastify.config.PORT
	})
}

bootstrap()
