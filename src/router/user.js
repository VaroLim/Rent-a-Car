import express from 'express'

const router = express.Router()

router.get('/me', async (request, response) => {
  try {
    response.json(request.user)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

export default router
