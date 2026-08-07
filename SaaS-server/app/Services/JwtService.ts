import jwt from 'jsonwebtoken'
import Env from '@ioc:Adonis/Core/Env'

export default class JwtService {
    public static generateAccessToken(user: any) {
        return jwt.sign({
            id: user.id,
            email: user.email
        },
            Env.get('JWT_SECRET'),
            {
                expiresIn: '15m',
            }
        )
    }

    public static generateRefreshToken(user:any){
            return jwt.sign({
                id : user.id
            },
             Env.get('JWT_REFRESH_SECRET'),
             {
                expiresIn : '7d'
             }
            )
    }

    public static verifyRefreshToken(token:string){
         return jwt.verify(token, Env.get('JWT_REFRESH_SECRET'))
    }


    public static verifyAccessToken(token: string){
        return jwt.verify(token, Env.get('JWT_SECRET'))
     }
}