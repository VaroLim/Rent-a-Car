import express from 'express'
import {
  createPostCommentByUser,
  deletePostCommentByUser,
} from '../controllers/user.js'

const router = express.Router()

router.post('/:postId', async (request, response) => {
  try {
    await createPostCommentByUser({
      postId: request.params.postId,
      data: request.body,
      user: request.user,
    })

    response.json(true)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.delete('/:commentId', async (request, response) => {
  try {
    await deletePostCommentByUser({
      commentId: request.params.commentId,
      user: request.user,
    })
    response.json(true)
  } catch (error) {
    console.log(error)
    response.status(500).json(error.message)
  }
})

export default router
