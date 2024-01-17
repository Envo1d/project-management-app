import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import postgres from 'postgres'
import * as schema from '../schema'

export let db: PostgresJsDatabase<typeof schema>

declare module 'fastify' {
	interface FastifyInstance {
		drizzle: PostgresJsDatabase<typeof schema>
	}
}

export default fastifyPlugin(
	async (fastify: FastifyInstance) => {
		let queryClient: postgres.Sql
		try {
			queryClient = postgres({
				host: fastify.config.POSTGRES_HOST,
				port: fastify.config.POSTGRES_PORT,
				user: fastify.config.POSTGRES_USER,
				pass: fastify.config.POSTGRES_PASSWORD,
				db: fastify.config.POSTGRES_DB
			})
			fastify.drizzle = drizzle(queryClient, { schema })
			db = fastify.drizzle

			if (fastify.config.MIGRATE_DB === true) {
				let sql: postgres.Sql = postgres({
					host: fastify.config.POSTGRES_HOST,
					port: fastify.config.POSTGRES_PORT,
					user: fastify.config.POSTGRES_USER,
					pass: fastify.config.POSTGRES_PASSWORD,
					db: fastify.config.POSTGRES_DB,
					max: 1
				})
				let tmpDB = drizzle(sql)
				await migrate(tmpDB, { migrationsFolder: 'migrations' })
				await sql.end()
			}
		} catch (error) {
			fastify.log.error(error)
		}

		fastify.addHook('onClose', async () => {
			await queryClient.end()
		})
	},
	{ dependencies: ['config'], name: 'drizzle' }
)
