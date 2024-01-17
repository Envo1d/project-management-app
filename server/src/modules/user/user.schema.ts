import { relations } from 'drizzle-orm'
import { pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: uuid('id').primaryKey().notNull().defaultRandom(),
	name: varchar('name', { length: 50 }).notNull(),
	email: varchar('email', { length: 50 }).unique().notNull(),
	password: varchar('password_hash', { length: 255 }).notNull(),
	avatarPath: varchar('avatar_path', { length: 150 }),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const userSessions = pgTable('user_sessions', {
	id: serial('id').primaryKey().notNull(),
	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	refreshToken: varchar('token', { length: 1024 }).notNull(),
	tokenFamily: varchar('token_family', { length: 36 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(userSessions)
}))

export type User = typeof users.$inferSelect
export type CreateUserInput = typeof users.$inferInsert
export type UserSession = typeof userSessions.$inferSelect
export type CreateUserSession = typeof userSessions.$inferInsert

//TODO: add drizzle-zod functionality
