import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TaskComment from 'App/Models/TaskComment'
import JwtService from 'App/Services/JwtService'
import User from 'App/Models/User'

export default class TaskCommentsController {
  public async index({ params, response }: HttpContextContract) {
    const tid = params.tid
    try {
      const res = await TaskComment.query().where('task_id', tid).orderBy('created_at', 'asc')
      return response.status(200).json({
        data: res,
      })
    } catch (e) {
      console.error('Error fetching comments:', e)
      return response.status(400).json({
        message: 'Failed to fetch comments',
        error: e.message,
      })
    }
  }

  public async store({ params, request, response }: HttpContextContract) {
    const tid = params.tid
    const text = request.input('text')
    let author = request.input('author')

    if (!text || !text.trim()) {
      return response.status(422).json({
        message: 'Comment text is required',
      })
    }

    if (!author) {
      const authHeader = request.header('Authorization')
      if (authHeader) {
        try {
          const token = authHeader.replace('Bearer ', '')
          const decoded: any = JwtService.verifyAccessToken(token)
          if (decoded) {
            if (decoded.name) {
              author = decoded.name
            } else if (decoded.id) {
              const user = await User.find(decoded.id)
              if (user && user.name) {
                author = user.name
              } else if (user && user.email) {
                author = user.email.split('@')[0]
              }
            }
          }
        } catch (e) {
          console.error('Error extracting user from token for comment:', e)
        }
      }
    }

    try {
      const res = await TaskComment.create({
        taskId: Number(tid),
        text: text.trim(),
        author: author || 'User',
      })

      return response.status(201).json({
        message: 'Comment created successfully',
        data: res,
      })
    } catch (error) {
      console.error('Error creating comment:', error)
      return response.status(400).json({
        message: 'Failed to create comment',
        error: error.message,
      })
    }
  }

  public async update({ request, params, response }: HttpContextContract) {
    const cid = params.cid

    try {
      const res = await TaskComment.query().where('id', cid).first()
      if (!res) {
        return response.status(404).json({
          message: 'Comment not found',
        })
      }

      if (request.input('text') !== undefined) {
        res.text = request.input('text').trim()
      }

      await res.save()

      return response.status(200).json({
        message: 'Comment updated successfully',
        data: res,
      })
    } catch (e) {
      console.error('Error updating comment:', e)
      return response.status(400).json({
        message: 'Failed to update comment',
        error: e.message,
      })
    }
  }

  public async destroy({ params, response }: HttpContextContract) {
    const cid = params.cid
    try {
      const res = await TaskComment.query().where('id', cid).first()
      if (!res) {
        return response.status(404).json({
          message: 'Comment not found',
        })
      }
      await res.delete()
      return response.status(200).json({
        message: 'Comment deleted successfully',
      })
    } catch (e) {
      console.error('Error deleting comment:', e)
      return response.status(400).json({
        message: 'Failed to delete comment',
        error: e.message,
      })
    }
  }
}
