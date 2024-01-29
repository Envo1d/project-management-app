import { FastifyReply, FastifyRequest } from 'fastify'
import {
	CreateProjectInput,
	ProjectId,
	UpdateProjectInput
} from './project.dto'
import ProjectService from './project.service'

const CACHE_TTL = 1800
const CACHE_KEY_PROJECT = 'project'

export default class ProjectController {
	private projectService: ProjectService

	constructor(projectService: ProjectService) {
		this.projectService = projectService
	}

	public async createProjectHandler(
		req: FastifyRequest<{
			Body: CreateProjectInput
		}>,
		rep: FastifyReply
	) {
		try {
			const task = this.projectService.createProject(req.body, req.user.sub)
			return rep.code(201).send(task)
		} catch (e) {
			return rep.unauthorized()
		}
	}

	public async updateProjectHandler(
		req: FastifyRequest<{
			Params: ProjectId
			Body: UpdateProjectInput
		}>,
		rep: FastifyReply
	) {
		try {
			const project = this.projectService.updateProject(req.params.id, req.body)
			return rep.code(200).send(project)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Project not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async deleteProjectHandler(
		req: FastifyRequest<{
			Params: ProjectId
		}>,
		rep: FastifyReply
	) {
		try {
			this.projectService.deleteProject(req.params.id)
			return rep.code(200)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Project not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getProjectHandler(
		req: FastifyRequest<{
			Querystring: ProjectId
		}>,
		rep: FastifyReply
	) {
		try {
			const project = this.projectService.getProjectById(req.query.id)
			return rep.code(200).send(project)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Project not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}

	public async getProjectsByUserHandler(
		req: FastifyRequest,
		rep: FastifyReply
	) {
		try {
			const projects = this.projectService.getProjectsByUser(req.user.sub)
			return rep.code(200).send(projects)
		} catch (e) {
			if (e instanceof Error) {
				if (e.message === 'Projects not found') return rep.badRequest(e.message)
			}
			return rep.unauthorized()
		}
	}
}
