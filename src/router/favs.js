import express from 'express'
import { togglePostFavByUser } from '../controllers/user.js'

const router = express.Router()

router.post('/favs/:postId', async (request, response) => {
  try {
    await togglePostFavByUser(request.params.postId, request.user)
    response.json(true)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

export default router
