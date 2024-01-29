import { User } from '@prisma/client'
import { hash } from 'argon2'
import { prisma } from '../../plugins/prisma'
import { CreateUserInput, UpdateUserInput } from './user.dto'

export default class UserService {
	public async createUser(input: CreateUserInput): Promise<User> {
		if (await this.isEmailInUse(input.email)) {
			throw new Error('Email is already in use')
		}

		const passwordHash = await hash(input.password)

		return await prisma.user.create({
			data: {
				name: input.name,
				passwordHash,
				email: input.email
			}
		})
	}

	public async getUserByEmail(email: string): Promise<User> {
		const user = await prisma.user.findUnique({
			where: {
				email
			}
		})

		if (!user) throw Error('User not found')

		return user
	}

	private async isEmailInUse(email: string): Promise<boolean> {
		try {
			await this.getUserByEmail(email)

			return true
		} catch (error) {
			return false
		}
	}

	public async getUserPasswordByEmail(
		email: string
	): Promise<{ id: string; passwordHash: string }> {
		const userPasswordHash = await prisma.user.findUnique({
			where: {
				email
			},
			select: {
				id: true,
				passwordHash: true
			}
		})

		if (!userPasswordHash) throw Error('User not found')

		return userPasswordHash
	}

	public async getUserById(id: string): Promise<User> {
		const user = await prisma.user.findUnique({
			where: {
				id
			}
		})

		if (!user) {
			throw Error('User not found')
		}

		return user
	}

	public async updateUser(id: string, input: UpdateUserInput): Promise<User> {
		const res = await prisma.user.update({
			where: {
				id
			},
			data: {
				name: input.name,
				email: input.email
			}
		})
		if (!res) throw Error('User not found')

		return res
	}

	public async deleteUser(id: string): Promise<boolean> {
		const res = await prisma.user.delete({ where: { id } })

		if (!res) throw Error('User not found')

		return true
	}
}
