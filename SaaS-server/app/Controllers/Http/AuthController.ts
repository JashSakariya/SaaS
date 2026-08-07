import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import JwtService from 'App/Services/JwtService'

export default class AuthController {
  public async refresh({ request, response }: HttpContextContract) {
    try {
      const { refreshToken } = request.only(['refreshToken'])

      if (!refreshToken) {
        return response.badRequest({
          message: 'Refresh token missing',
        })
      }

      const payload: any = JwtService.verifyRefreshToken(refreshToken)

      const user = await User.find(payload.id)

      if (!user) {
        return response.notFound({
          message: 'User not found',
        })
      }

      const accessToken = JwtService.generateAccessToken(user)

      return response.ok({
        message: 'Token refreshed successfully',
        accessToken,
      })
    } catch (error) {
      return response.unauthorized({
        message: 'Invalid or expired refresh token',
      })
    }
  }
}
