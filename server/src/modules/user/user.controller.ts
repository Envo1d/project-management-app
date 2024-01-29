import { User } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'
import { UpdateUserInput } from './user.dto'
import UserService from './user.service'

const CACHE_TTL = 1800
const CACHE_KEY_USER = 'user'

export default class UserController {
	private userService: UserService

	constructor(userService: UserService) {
		this.userService = userService
	}

	public async updateUserHandler(
		req: FastifyRequest<{ Body: UpdateUserInput }>,
		rep: FastifyReply
	) {
		try {
			const user = this.userService.updateUser(req.user.sub, req.body)
			return rep.code(200).send(user)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'User not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async deleteUserHandler(req: FastifyRequest, rep: FastifyReply) {
		try {
			this.userService.deleteUser(req.user.sub)
			return rep.code(200)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'User not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getUserHandler(req: FastifyRequest, rep: FastifyReply) {
		try {
			const user = await req.redis.rememberJSON<User>(
				CACHE_KEY_USER + req.user.sub,
				CACHE_TTL,
				async () => {
					return await this.userService.getUserById(req.user.sub)
				}
			)
			return rep.code(200).send(user)
		} catch (e) {
			return rep.unauthorized()
		}
	}
}
