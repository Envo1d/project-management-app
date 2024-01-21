import { MultipartFile } from '@fastify/multipart'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { filesDirectory } from '../../plugins/multipart'

const pump = promisify(pipeline)

export default class FileService {
	public async saveFile(file: MultipartFile) {
		try {
			const res = await pump(
				file.file,
				createWriteStream(`${filesDirectory}/${file.filename}`)
			)
			console.log(res)
		} catch (error) {
			throw new Error('File upload error')
		}
	}
}
