import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ClientProject from 'App/Models/ClientProject'
export default class ProjectsController {
    public async index({ params, response }: HttpContextContract) {
        const clientId = params.id
        const res = await ClientProject.query().where("client_id", clientId)
        return response.status(200).json({
            data: res
        })
    }


    public async store({ params, request, response }: HttpContextContract) {
        const clientId = params.id
        const payload = request.only([
            'title',
            'description',
            'status',
            'due_date',
        ])

        try {
            const res = await ClientProject.create({
                ...payload,
                clientId,
            })

            return response.status(201).json({
                message: 'Project created successfully',
                data: res,
            })
        } catch (error) {
            console.error('Error creating project:', error)

            return response.status(400).json({
                message: 'Failed to create project',
                error: error.message,
            })
        }
    }
}
