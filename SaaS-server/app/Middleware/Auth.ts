import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import JwtService from 'App/Services/JwtService'

export default class Auth {

  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {

    const authHeader = request.header('Authorization')
    console.log("its a auth header" , authHeader)

    if (!authHeader) {
      return response.unauthorized({
        message: 'Token missing'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    console.log("its a token from auth",token)

    try {
      const user = JwtService.verifyAccessToken(token)
      request.user = user
      await next()
      
      
      
    } catch(error) {
      console.log(error) 
      return response.unauthorized({
        // message : error.message
        message: "invalid token.."
      })
    }
  }
}




// Bearer "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImVtYWlsIjoiYWJjY2NhYWFAaGVsbG8uY29tIiwiaWF0IjoxNzg0NzAxMTA2LCJleHAiOjE3ODUzMDU5MDZ9.KVdJ8sjXLwje89ilBRBU-SfyMCQhF_FluqtV4smtnPc"


// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjMsImVtYWlsIjoiYWJjY2NhYWFAaGVsbG8uY29tIiwiaWF0IjoxNzg0NzAxMTA2LCJleHAiOjE3ODUzMDU5MDZ9.KVdJ8sjXLwje89ilBRBU-SfyMCQhF_FluqtV4smtnPc"

// JsonWebTokenError: invalid token