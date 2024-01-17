import Fastify from 'fastify'
import { getLoggerConfig } from './config/logger'
import modules from './modules'
import plugins from './plugins'

const build = async () => {
	const fastify = Fastify({
		logger: getLoggerConfig()
	})

	const startPluginsInit = performance.now()
	await fastify.register(plugins)
	fastify.log.info(
		`Plugins ${(performance.now() - startPluginsInit).toFixed(2)} ms`
	)

	const startModulesInit = performance.now()
	await fastify.register(modules, { prefix: '/api' })
	fastify.log.info(
		`Modules ${(performance.now() - startModulesInit).toFixed(2)} ms`
	)

	return fastify
}

export default build
