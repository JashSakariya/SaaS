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

}