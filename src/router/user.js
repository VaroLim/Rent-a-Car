import express from 'express'
import { getRequestByUser } from '../controllers/user.js'

const router = express.Router()

router.get('/me', async (request, response) => {
  try {
    response.json(request.user)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.get('/me/requests', async (request, response) => {
  try {
    const postsRequests = await getRequestByUser(request.user)
    response.json(postsRequests)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

export default router
