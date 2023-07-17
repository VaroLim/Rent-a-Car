import express from 'express'
import bodyParser from 'body-parser'
import connectToDb from './src/services/db.js'
import carRouter from './src/router/car.js'
import authRouter from './src/router/auth.js'
import dotenv from 'dotenv'
import { ensureAuthenticated } from './src/middleware/auth.js'
import cors from 'cors'

dotenv.config()

const startApp = async () => {
  const app = express()
  const port = 8080

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(cors())

  app.get('/', (request, response) => {
    response.json({ info: 'Hola mundo' })
  })

  app.use(ensureAuthenticated)

  app.use('/cars', carRouter)
  app.use('/auth', authRouter)

  try {
    await connectToDb()
    app.listen(port, () => {
      console.log(`Server start in ${port} port`)
    })
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

startApp()
