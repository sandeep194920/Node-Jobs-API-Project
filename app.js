require('dotenv').config()
require('express-async-errors')

const express = require('express')
const app = express()

// extra security-packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

// Swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

// CONNECT DB
const connectDB = require('./db/connect')

// ROUTER
const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

// token verification to access secured route
const authMiddleware = require('./middleware/authentication')

app.use(express.json())

// for heroku we need to do this
app.set('trust proxy', 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests in 15 mins
  })
)
app.use(helmet())
app.use(cors())
app.use(xss())

// Home route
app.get('/', (req, res) => {
  res.send('<h1>Jobs API</h1><a href ="/api-docs">API Documentation</a>')
})

// Document route
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authMiddleware, jobsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3111

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}
start()
