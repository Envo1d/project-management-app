import fastifyMultipart from '@fastify/multipart'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { access, mkdir } from 'fs/promises'
import { join } from 'path'

export const filesDirectory = join(process.cwd(), '/uploads')

const toBool = [() => true, () => false]

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		if (!(await access(filesDirectory).then(...toBool))) {
			await mkdir(filesDirectory)
		}

		await fastify.register(fastifyMultipart, {
			limits: {
				fieldNameSize: 0,
				fieldSize: 0,
				fields: 0,
				fileSize: 3000000, // 3mb,
				files: 1,
				headerPairs: 2000,
				parts: 1000
			}
		})
	},
	{ name: 'multipart', dependencies: ['config'] }
)
