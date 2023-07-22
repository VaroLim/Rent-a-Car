import express from 'express'
import { getUsers, getUserById, removeUserById } from '../controllers/user.js'

const router = express.Router()

router.get('/users', async (request, response) => {
  try {
    const users = await getUsers(request.user)
    response.json({ users })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.delete('/users/:id', async (request, response) => {
  try {
    await removeUserById(request.params.id)
    response.json({ removed: true })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

export default router
