const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')
const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers
  if (!authorization || !authorization.startsWith('Bearer'))
    throw new UnauthenticatedError('Not authorized to access this route...')

  try {
    const token = authorization.split(' ')[1]
    // verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { userId: payload.userId, name: payload.name }
    next()
  } catch (error) {
    throw new UnauthenticatedError('Not authorized to access this route')
  }
}

module.exports = authMiddleware
