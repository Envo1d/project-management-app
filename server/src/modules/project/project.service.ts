import { Project } from '@prisma/client'
import { prisma } from '../../plugins/prisma'
import { CreateProjectInput, UpdateProjectInput } from './project.dto'

export default class ProjectService {
	public async createProject(
		input: CreateProjectInput,
		userId: string
	): Promise<Project> {
		return await prisma.project.create({
			data: {
				title: input.title,
				description: input.description,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})
	}

	public async updateProject(
		projectId: string,
		input: UpdateProjectInput
	): Promise<Project> {
		const res = await prisma.project.update({
			where: {
				id: projectId
			},
			data: {
				title: input.title,
				description: input.description
			}
		})
		if (!res) throw Error('Project not found')

		return res
	}

	public async deleteProject(projectId: string): Promise<boolean> {
		const res = await prisma.project.delete({ where: { id: projectId } })

		if (!res) throw Error('Project not found')

		return true
	}

	public async getProjectById(projectId: string): Promise<Project> {
		const res = await prisma.project.findUnique({
			where: {
				id: projectId
			}
		})

		if (!res) throw Error('Project not found')

		return res
	}

	public async getProjectsByUser(userId: string): Promise<Project[]> {
		const res = await prisma.project.findMany({
			where: {
				userId
			}
		})

		if (!res) throw Error('Projects not found')

		return res
	}
}
