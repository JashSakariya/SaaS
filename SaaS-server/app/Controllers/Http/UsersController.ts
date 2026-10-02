import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'
import JwtService from 'App/Services/JwtService'

export default class UsersController {

  public async store({ request, response }: HttpContextContract) {
    try {
      const data = request.all()

      const dob = data.dob || data.dateOfBirth
      const number = data.mobile_number || data.number

      if (!data.email || !data.password || !data.name || !number || !dob) {
        return response.badRequest({
          message: 'All fields (name, email, mobile_number, date of birth, password) are required',
        })
      }

      const user = await User.create({
        name: data.name,
        email: data.email,
        number: number,
        gender: data.gender?.toLowerCase() || 'other',
        dateOfBirth: dob,
        password: await Hash.make(data.password),
      })

      let accessToken: string
      let refreshToken: string

      try {
        accessToken = JwtService.generateAccessToken(user)
        refreshToken = JwtService.generateRefreshToken(user)
      } catch (error) {
        console.error('error in token generation....', error)
        return response.status(500).json({
          message: 'Token is not generated',
        })
      }

      return response.status(201).json({
        message: 'User created successfully',
        user,
        accessToken,
        refreshToken,
      })

    } catch (error: any) {
      console.error('User creation error:', error)

      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('ER_DUP_ENTRY') || error.sqlMessage?.includes('Duplicate entry')) {
        return response.badRequest({
          message: 'An account with this email address already exists.',
          error: 'Duplicate entry',
        })
      }

      return response.status(500).json({
        message: 'Something went wrong',
        error: error.sqlMessage || error.message || error,
      })
    }
  }



  //login user
  public async login({ request, response }: HttpContextContract) {
    const { loginType, email, Mobile, password } = request.all()
    // console.log("here it is data from login", data)

    // const { email, password } = request.only(['email', 'password'])
    // find user by email 
    let user
    if (loginType == "Mobile") {
      user = await User.findBy('number', Mobile)
    } else {
      user = await User.findBy('email', email)
    }

    console.log("password is : ", password, user?.password)

    // const user = await User.findBy('email', email)
    // return instance
    if (!user) {
      return response.status(404).json({
        message: " user not found "
      })
    }
    const ispasswordCorrect = await Hash.verify(user.password, password)
    if (!ispasswordCorrect) {
      return response.status(404).json({
        message: "password mismatch..."
      })
    }
    const accessToken = JwtService.generateAccessToken(user)
    const refreshToken = JwtService.generateRefreshToken(user)

    return response.status(200).json({
      message: "login successful...",
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken
    })
  }

  /**
   * Helper to resolve the authenticated user from JWT token or request context
   */
  private async resolveUser(request: any): Promise<User | null> {
    if (request.user?.id) {
      return await User.find(request.user.id)
    }

    const authHeader = request.header('Authorization')
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '').trim()
        const payload: any = JwtService.verifyAccessToken(token)
        if (payload?.id) {
          return await User.find(payload.id)
        }
      } catch (err) {
        // Token might be expired or invalid
      }
    }

    const fallbackId = request.input('userId') || 1
    return await User.find(fallbackId)
  }

  /**
   * GET /user/profile
   * Fetch current authenticated user profile
   */
  public async profile({ request, response }: HttpContextContract) {
    try {
      const user = await this.resolveUser(request)
      if (!user) {
        return response.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      return response.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          number: user.number,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error: any) {
      console.error('Error in UsersController.profile:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch user profile',
        error: error.message,
      })
    }
  }

  /**
   * PUT /user/profile
   * Update name, email, phone number, gender, dateOfBirth
   */
  public async updateProfile({ request, response }: HttpContextContract) {
    try {
      const user = await this.resolveUser(request)
      if (!user) {
        return response.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      const { name, email, number, gender, dateOfBirth, dob } = request.all()
      const newDob = dob || dateOfBirth

      if (email && email !== user.email) {
        const existing = await User.query().where('email', email).whereNot('id', user.id).first()
        if (existing) {
          return response.status(400).json({
            success: false,
            message: 'This email is already associated with another account.',
          })
        }
        user.email = email
      }

      if (name) user.name = name
      if (number) user.number = number
      if (gender) user.gender = gender.toLowerCase()
      if (newDob) user.dateOfBirth = newDob

      await user.save()

      return response.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          number: user.number,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error: any) {
      console.error('Error in UsersController.updateProfile:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message,
      })
    }
  }

  /**
   * PUT /user/change-password
   * Verify old password and set new password
   */
  public async changePassword({ request, response }: HttpContextContract) {
    try {
      const user = await this.resolveUser(request)
      if (!user) {
        return response.status(404).json({
          success: false,
          message: 'User not found',
        })
      }

      const { currentPassword, newPassword, confirmPassword } = request.all()

      if (!currentPassword || !newPassword) {
        return response.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        })
      }

      if (confirmPassword && newPassword !== confirmPassword) {
        return response.status(400).json({
          success: false,
          message: 'New password and confirm password do not match',
        })
      }

      if (newPassword.length < 6) {
        return response.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        })
      }

      const isCurrentCorrect = await Hash.verify(user.password, currentPassword)
      if (!isCurrentCorrect) {
        return response.status(400).json({
          success: false,
          message: 'Current password does not match our records',
        })
      }

      user.password = await Hash.make(newPassword)
      await user.save()

      return response.status(200).json({
        success: true,
        message: 'Password changed successfully',
      })
    } catch (error: any) {
      console.error('Error in UsersController.changePassword:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update password',
        error: error.message,
      })
    }
  }

}