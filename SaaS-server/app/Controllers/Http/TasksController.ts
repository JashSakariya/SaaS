import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import Developer from 'App/Models/Developer'

export default class TasksController {
  public async index({ params, response }: HttpContextContract) {
    const projectId = params.pid
    try {
      const res = await Task.query().where('project_id', projectId).preload('developer')
      return response.status(200).json({
        data: res,
      })
    } catch (e) {
      console.error('Error fetching tasks:', e)
      return response.status(400).json({
        message: 'Failed to fetch tasks',
        error: e.message,
      })
    }
  }

  public async store({ params, request, response }: HttpContextContract) {
    const projectId = params.pid
    const dueDate = request.input('dueDate') || request.input('due_date') || null
    const developerId = request.input('developerId') !== undefined
      ? request.input('developerId')
      : (request.input('developer_id') !== undefined ? request.input('developer_id') : null)

    const devId = developerId ? Number(developerId) : null
    let assignee = request.input('assignee') || null
    if (devId && !assignee) {
      const dev = await Developer.find(devId)
      if (dev) {
        assignee = dev.name
      }
    }

    try {
      const res = await Task.create({
        title: request.input('title'),
        assignee: assignee,
        developerId: devId,
        status: request.input('status') || 'todo',
        dueDate: dueDate,
        projectId: projectId,
      })

      await res.load('developer')

      return response.status(201).json({
        message: 'Task created successfully',
        data: res,
      })
    } catch (error) {
      console.error('Error creating task:', error)
      return response.status(400).json({
        message: 'Failed to create task',
        error: error.message,
      })
    }
  }

  public async show({ params, response }: HttpContextContract) {
    const pid = params.pid
    const tid = params.tid
    try {
      const res = await Task.query()
        .where('project_id', pid)
        .where('id', tid)
        .preload('developer')
        .first()

      if (!res) {
        return response.status(404).json({
          message: 'Task not found',
        })
      }
      return response.status(200).json({
        pid,
        tid,
        data: res,
        message: 'Task fetched successfully',
      })
    } catch (e) {
      console.error('Error fetching task:', e)
      return response.status(404).json({
        message: 'Task not found',
        error: e.message,
      })
    }
  }

  public async update({ request, params, response }: HttpContextContract) {
    const pid = params.pid
    const tid = params.tid

    try {
      const res = await Task.query().where('project_id', pid).where('id', tid).first()
      if (!res) {
        return response.status(404).json({
          message: 'Task not found',
        })
      }

      if (request.input('title') !== undefined) {
        res.title = request.input('title')
      }
      if (request.input('assignee') !== undefined) {
        res.assignee = request.input('assignee')
      }
      if (request.input('developerId') !== undefined || request.input('developer_id') !== undefined) {
        const devId = request.input('developerId') !== undefined ? request.input('developerId') : request.input('developer_id')
        res.developerId = devId ? Number(devId) : null
        if (res.developerId) {
          const dev = await Developer.find(res.developerId)
          if (dev) {
            res.assignee = dev.name
          }
        } else if (devId === null) {
          res.assignee = null
        }
      }
      if (request.input('status') !== undefined) {
        res.status = request.input('status')
      }
      const dueDate = request.input('dueDate') !== undefined ? request.input('dueDate') : request.input('due_date')
      if (dueDate !== undefined) {
        res.dueDate = dueDate
      }

      await res.save()
      await res.load('developer')

      return response.status(200).json({
        message: 'Task updated successfully',
        data: res,
      })
    } catch (e) {
      console.error('Error updating task:', e)
      return response.status(400).json({
        message: 'Failed to update task',
        error: e.message,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const pid = params.pid
    const tid = params.tid
    try {
      const res = await Task.query().where('project_id', pid).where('id', tid).first()
      if (!res) {
        return response.status(404).json({
          message: 'Task not found',
        })
      }
      await res.delete()
      return response.status(200).json({
        message: 'Task deleted successfully',
      })
    } catch (e) {
      console.error('Error deleting task:', e)
      return response.status(400).json({
        message: 'Failed to delete task',
        error: e.message,
      })
    }
  }
}
