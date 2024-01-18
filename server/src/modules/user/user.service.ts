import { hash } from 'argon2'
import { eq } from 'drizzle-orm'
import { db } from '../../plugins/drizzle'
import { CreateUserInput, User, users } from './user.schema'

export default class UserService {
	public async createUser(input: CreateUserInput): Promise<User> {
		try {
			if ((await this.getUserByEmail(input.email)) !== null) {
				throw new Error('Email is already in use')
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.message !== 'User not found') {
					throw error
				}
			}
		}

		const passwordHash = await hash(input.password)

		const user = await db
			.insert(users)
			.values({
				name: input.name,
				email: input.email,
				password: passwordHash
			})
			.returning({
				id: users.id,
				email: users.email,
				name: users.name,
				avatarPath: users.avatarPath
			})

		return user[0]
	}

	public async getUserByEmail(email: string): Promise<User> {
		const user: User | undefined = await db.query.users.findFirst({
			columns: {
				id: true,
				name: true,
				avatarPath: true,
				email: true
			},
			where: eq(users.email, email)
		})

		if (!user) throw Error('User not found')

		return user
	}

	public async getUserPasswordByEmail(
		email: string
	): Promise<{ id: string; password: string }> {
		const userPassword: { id: string; password: string } | undefined =
			await db.query.users.findFirst({
				columns: {
					id: true,
					password: true
				},
				where: eq(users.email, email)
			})

		if (!userPassword) throw Error('User not found')

		return userPassword
	}

	public async getUserById(id: string): Promise<User> {
		const user: User | undefined = await db.query.users.findFirst({
			columns: {
				id: true,
				name: true,
				avatarPath: true,
				email: true
			},
			where: eq(users.id, id)
		})

		if (!user) {
			throw Error('User not found')
		}

		return user
	}
}
