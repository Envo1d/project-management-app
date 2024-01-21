import { FastifyReply, FastifyRequest } from 'fastify'
import FileService from './file.service'

export default class FileController {
	private fileService: FileService

	constructor(fileService: FileService) {
		this.fileService = fileService
	}

	public async uploadHandler(req: FastifyRequest, rep: FastifyReply) {
		try {
			const file = await req.file()
			if (file) {
				await this.fileService.saveFile(file)

				return rep.code(200).send({ message: 'uploaded' })
			} else throw new Error('File upload error')
		} catch (error) {
			if (error instanceof Error) return rep.badRequest(error.message)
			throw error
		}
	}
}
