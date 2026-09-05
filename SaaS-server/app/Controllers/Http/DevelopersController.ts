import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Developer from 'App/Models/Developer'

export default class DevelopersController {
  public async index({ request, response }: HttpContextContract) {
    const category = request.input('category')
    try {
      const query = Developer.query()
      if (category && category !== 'All') {
        query.where('category', category)
      }
      const developers = await query.orderBy('name', 'asc')
      return response.status(200).json({
        data: developers,
      })
    } catch (error) {
      console.error('Error fetching developers:', error)
      return response.status(400).json({
        message: 'Failed to fetch developers',
        error: error.message,
      })
    }
  }

  public async store({ request, response }: HttpContextContract) {
    const payload = request.only(['name', 'category', 'email', 'phone'])

    if (!payload.name || !payload.category) {
      return response.status(422).json({
        message: 'Developer name and category are required',
      })
    }

    try {
      const developer = await Developer.create({
        name: payload.name.trim(),
        category: payload.category.trim(),
        email: payload.email ? payload.email.trim() : null,
        phone: payload.phone ? payload.phone.trim() : null,
      })

      return response.status(201).json({
        message: 'Developer created successfully',
        data: developer,
      })
    } catch (error) {
      console.error('Error creating developer:', error)
      return response.status(400).json({
        message: 'Failed to create developer',
        error: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const id = params.id
    try {
      const developer = await Developer.query().where('id', id).preload('tasks').first()
      if (!developer) {
        return response.status(404).json({
          message: 'Developer not found',
        })
      }
      return response.status(200).json({
        data: developer,
        message: 'Developer fetched successfully',
      })
    } catch (error) {
      console.error('Error fetching developer:', error)
      return response.status(400).json({
        message: 'Failed to fetch developer',
        error: error.message,
      })
    }
  }

  public async update({ request, params, response }: HttpContextContract) {
    const id = params.id
    const payload = request.only(['name', 'category', 'email', 'phone'])

    try {
      const developer = await Developer.query().where('id', id).first()
      if (!developer) {
        return response.status(404).json({
          message: 'Developer not found',
        })
      }

      if (payload.name !== undefined) developer.name = payload.name.trim()
      if (payload.category !== undefined) developer.category = payload.category.trim()
      if (payload.email !== undefined) developer.email = payload.email ? payload.email.trim() : null
      if (payload.phone !== undefined) developer.phone = payload.phone ? payload.phone.trim() : null

      await developer.save()

      return response.status(200).json({
        message: 'Developer updated successfully',
        data: developer,
      })
    } catch (error) {
      console.error('Error updating developer:', error)
      return response.status(400).json({
        message: 'Failed to update developer',
        error: error.message,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const id = params.id
    try {
      const developer = await Developer.query().where('id', id).first()
      if (!developer) {
        return response.status(404).json({
          message: 'Developer not found',
        })
      }
      await developer.delete()
      return response.status(200).json({
        message: 'Developer deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting developer:', error)
      return response.status(400).json({
        message: 'Failed to delete developer',
        error: error.message,
      })
    }
  }
}
