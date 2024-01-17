import { hash } from 'argon2'
import { eq } from 'drizzle-orm'
import { db } from '../../plugins/drizzle'
import { CreateUserInput, User, users } from './user.schema'

export default class UserService {
	public async createUser(input: CreateUserInput): Promise<User> {
		if ((await this.getUserByEmail(input.email)) !== null) {
			throw new Error('Email is already in use')
		}

		return await db
			.insert(users)
			.values({
				name: input.name,
				email: input.email,
				password: await hash(input.password)
			})
			.returning({ id: users.id, name: users.name, email: users.name })[0]
	}

	public async getUserByEmail(email: string): Promise<User> {
		const user: User = await db
			.select({ id: users.id, name: users.name, avatarPath: users.avatarPath })
			.from(users)
			.where(eq(users.email, email))[0]

		if (!user) throw Error('User not found')

		return user
	}

	public async getUserById(id: string): Promise<User> {
		const user: User = await db
			.select({ id: users.id, name: users.name, avatarPath: users.avatarPath })
			.from(users)
			.where(eq(users.id, id))[0]

		if (!user) {
			throw Error('User not found')
		}

		return user
	}
}
