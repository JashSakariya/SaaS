import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ClientProject from 'App/Models/ClientProject'
export default class ProjectsController {
    public async index({params,response}: HttpContextContract){
        const clientId= params.id
        const res = await ClientProject.query().where("client_id",clientId)
        return response.status(200).json({
            data : res
        })
    }
}
