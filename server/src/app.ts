import Fastify from 'fastify'
import { getLoggerConfig } from './config/logger'

const build = async () => {
	const fastify = Fastify({
		logger: getLoggerConfig()
	})

	return fastify
}

export default build
