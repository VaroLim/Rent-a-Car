import express from 'express'
import {
  createPost,
  getPostById,
  getPosts,
  removePostById,
  updatePost,
} from '../controllers/posts.js'
import {
  createPostCommentByUser,
  deletePostCommentByUser,
  togglePostFavByUser,
  createPostValorationByUser,
  createPostRequestByUser,
  updateRequestStatusBySeller,
} from '../controllers/user.js'

const router = express.Router()

router.get('/', async (_, response) => {
  try {
    const posts = await getPosts()
    response.json({ posts })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.get('/:id', async (request, response) => {
  try {
    const post = await getPostById(request.params.id)
    response.json({ post })
  } catch (error) {
    if (error.message === 'Post not found') {
      response.status(404).json(error.message)
    }
    response.status(500).json(error.message)
  }
})

router.post('/', async (request, response) => {
  try {
    const createdPost = await createPost(
      {
        ...request.body,
        sellerId: request.user._id,
      },
      request.user
    )
    response.json({ post: createdPost })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.put('/:id', async (request, response) => {
  try {
    const updatedPost = await updatePost(
      request.params.id,
      request.body,
      request.user
    )
    response.json({ post: updatedPost })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.delete('/:id', async (request, response) => {
  try {
    await removePostById(request.params.id, request.user)
    response.json({ removed: true })
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.post('/:postId/comments', async (request, response) => {
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

router.delete('/comments/:commentId', async (request, response) => {
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

router.post('/:postId/favs', async (request, response) => {
  try {
    await togglePostFavByUser(request.params.postId, request.user)
    response.json(true)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.post('/rate/:postId', async (request, response) => {
  try {
    await createPostValorationByUser({
      postId: request.params.postId,
      data: request.body,
      user: request.user,
    })

    response.json(true)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.post('/:postId/request', async (request, response) => {
  try {
    await createPostRequestByUser({
      postId: request.params.postId,
      data: request.body,
      user: request.user,
    })
    response.json(true)
  } catch (error) {
    response.status(500).json(error.message)
  }
})

router.put('/request/:postId/:requestId', async (request, response) => {
  try {
    await updateRequestStatusBySeller(
      request.params.postId,
      request.body,
      request.user
    )
  } catch (error) {
    response.status(500).json(error.message)
  }
})

export default router
