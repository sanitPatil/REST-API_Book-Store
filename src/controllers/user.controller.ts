import { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/user.model'
import { User } from '../models/user.types.model'
import { config } from '../../config/config'
const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      const error = createHttpError(400, 'all Fields Required!!!')
      next(error)
    }

    const user = await userModel.find({ email })
    if (user) {
      const error = createHttpError(
        400,
        'User with email already Exist please Login!!!',
      )
      next(error)
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    })

    if (!newUser) {
      const error = createHttpError(
        500,
        'error while creating user please re-register!!!',
      )
      next(error)
    }

    const token = jwt.sign(
      {
        _id: newUser._id,
      },
      config.JWT_SECRET as string,
      {
        expiresIn: config.JWT_EXPIREIN,
      },
    )

    res.status(200).json({
      message: 'success',
      accessToken: token,
    })
  } catch (err) {
    next(`Error At User Register:: ${err}`)
  }
}

export { userRegister }
