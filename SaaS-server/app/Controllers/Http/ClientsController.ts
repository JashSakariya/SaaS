import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Clients from 'App/Models/Client'

export default class ClientsController {
    public async index({ response }: HttpContextContract) {
        const clients = await Clients.all()
        return response.ok({
            success: true,
            data: clients,
            message: 'Clients fetched successfully',
        })
    }



    public async store({ request, response }: HttpContextContract) {
        const data = request.only(['name', 'email', 'phone', 'gender', 'companyName'])
        console.log("data from frontend", data)
        await Clients.create(data)
        return response.status(200).json({
            message: "client stored successfully",
            data: data,
        })
    }

    public async update({ params, request, response }: HttpContextContract) {
        const clientId = params.id;
        console.log("data from update", clientId)
        const client = await Clients.findOrFail(clientId)
        const data = request.only(['name', 'email', 'phone', 'gender', 'companyName']);
        client.merge(data)
        await client.save()
        return response.ok({
            success: true,
            data: client,
            message: 'Client updated successfully',
        })
    }

    public async destroy({ params, request, response }: HttpContextContract) {
        console.log("getting id here start")
        const id = params.id;
        console.log('delete id is : ', id)
        const client = await Clients.findOrFail(id);

        if (!client) {
            return response.status(404).json({
                message: "client not found",
            })
        }
        await client.delete();
        return response.status(200).json({
            message: "client deleted successfully",
        })
    }

}