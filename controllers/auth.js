const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { UnauthenticatedError, BadRequestError } = require('../errors')

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  // generate the token
  const token = user.generateToken()
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })
}

const login = async (req, res) => {
  // get the email and password in req.body
  // find if the user exists. If not send him a messge to register
  // if user exists, check his password and compare with stored hash using bcrypt
  // if successful then send the token like u did in register

  const { email, password } = req.body
  if (!email || !password)
    throw new BadRequestError('Please provide email and password')

  const user = await User.findOne({ email })

  // compare passwords
  // const passwordsMatched = await bcryptjs.compare(password, user.password)  // this is put in UserSchema method comparePasswords()
  if (!user) throw new UnauthenticatedError('Invalid Credentials')
  const isPasswordCorrect = await user.comparePasswords(password)

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const token = user.generateToken()
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = { register, login }
