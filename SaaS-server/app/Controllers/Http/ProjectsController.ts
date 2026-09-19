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
        const rawDueDate = request.input('dueDate') !== undefined ? request.input('dueDate') : request.input('due_date')
        const dueDate = rawDueDate && typeof rawDueDate === 'string' && rawDueDate.trim() !== '' ? rawDueDate.trim() : (rawDueDate && typeof rawDueDate !== 'string' ? rawDueDate : null)

        try {
            const res = await ClientProject.create({
                title: request.input('title'),
                description: request.input('description'),
                status: request.input('status') || 'planning',
                dueDate: dueDate,
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

    public async destroy({params ,response}: HttpContextContract) {
        const clientId = params.id 
        const projectId = params.pid
        try{
            const res = await ClientProject.query().where("client_id", clientId).where("id", projectId).first()
            if(!res){
                return response.status(404).json({
                    message:"Project not found"
                })
            }
            await res.delete()
            return response.status(200).json({
                message:"Project deleted successfully"
            })

        }catch(e)
        {
            console.error('Error deleting project:', e)

            return response.status(400).json({
                message: 'Failed to delete project',
                error: e.message,
            })  
        }           
    }


    
    public async update({request,params,response}: HttpContextContract) {
        const clientId = params.id
        const pid = params.pid
        try{
            const res = await ClientProject.query().where("client_id", clientId).where("id", pid).first()
            if(!res){
                return response.status(404).json({
                    message:"Project not found"
                })
            }
            if (request.input('title') !== undefined) {
                res.title = request.input('title')
            }
            if (request.input('description') !== undefined) {
                res.description = request.input('description')
            }
            if (request.input('status') !== undefined) {
                res.status = request.input('status')
            }
            if (request.input('dueDate') !== undefined || request.input('due_date') !== undefined) {
                const rawDueDate = request.input('dueDate') !== undefined ? request.input('dueDate') : request.input('due_date')
                res.dueDate = rawDueDate && typeof rawDueDate === 'string' && rawDueDate.trim() !== '' ? rawDueDate.trim() : (rawDueDate && typeof rawDueDate !== 'string' ? rawDueDate : null)
            }
            await res.save()
            return response.status(200).json({
                message:"Project updated successfully",
                data:res
            })
        }catch(e){
            console.error('Error updating project:', e)
            return response.status(400).json({
                message: 'Failed to update project',
                error: e.message,
            })
        }                   
    }
    
    public async show({params, response}: HttpContextContract){
        try{
       const pid = params.pid
       const clientId = params.id
    //    const res = ClientProject.query().where("id", pid)
       const res = await ClientProject.query().where("client_id", clientId).where("id", pid).first()
       response.status(200).json({
        pid,
        clientId,
        data : res,
        message: 'data fetch sucessfully'
       })
    }
    catch(e){
        response.status(404).json({
            message:"project is not found"
        })
    }
    }
}
