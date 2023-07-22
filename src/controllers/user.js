import User from '../models/user.js'
import { getPostById } from './posts.js'
import UserPostComment from '../models/userPostComment.js'
import UserPostValoration from '../models/userPostValoration.js'
import UserPostRequest from '../models/userPostRequest.js'
import { validatePostAvailableTimeData } from '../utils/post.js'

/**
 * @returns {Promise<object>}
 */

export const getUsers = async (user) => {
  if (!user || user.rol !== 'admin') {
    throw new Error('You dont have permission')
  }
  return User.find()
}

/**
 *
 * @param {string} id
 * @returns {Promise<object>}
 */

export const getUserById = async (id) => {
  const user = await User.findOne({ _id: id }).populate('favPosts')

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

/**
 *
 * @param {string} id
 * @param {object} user
 * @param {'admin' | 'seller' | 'customer'} user.rol
 * @returns {Promise<boolean>}
 */
export const removeUserById = async (id, user) => {
  if (!user || user.rol !== 'admin') {
    throw new Error('You dont have permission')
  }
  await User.deleteOne({ _id: id })

  return true
}

/**
 *
 * @param {string} postId
 * @param {object} user
 * @param {object[]} user.favPosts
 */

export const togglePostFavByUser = async (postId, user) => {
  if (!postId) {
    throw new Error('PostId is required')
  }
  const post = await getPostById(postId)
  const currentFavs = user.favPosts || []
  const existedFav = currentFavs.find(
    (currentId) => currentId.toString() === postId.toString()
  )

  let newFavList = []
  if (!existedFav) {
    newFavList = [...currentFavs, postId]
  } else {
    newFavList = currentFavs.filter(
      (currentId) => currentId.toString() !== postId.toString()
    )
  }

  await User.updateOne({ _id: user._id }, { favPosts: newFavList })
}

/**
 *
 * @param {string} postId
 * @param {object} data
 * @param {string} data.comment
 * @param {object} user
 * @param {string} user._id
 */

export const createPostCommentByUser = async ({ postId, data, user }) => {
  if (user.rol === 'seller') {
    throw new Error('You cant post a comment')
  }

  if (!data.comment) {
    throw new Error('Missing comment')
  }

  const post = await getPostById(postId)
  const postComment = new UserPostComment({
    postId: post._id,
    customerId: user._id,
    comment: data.comment,
  })

  await postComment.save()
}

/**
 *
 * @param {string} commentId
 * @param {object} user
 * @param {string} user._id
 * @param {'admin' | 'seller' | 'customer'} user.rol
 * @returns {Promise<boolean>}
 */

export const deletePostCommentByUser = async ({ commentId, user }) => {
  const comment = await UserPostComment.findOne({ _id: commentId })
  if (!comment) {
    throw new Error('Comment not found')
  }

  if (
    comment.customerId.toString() !== user._id.toString() &&
    user.rol !== 'admin'
  ) {
    throw new Error(
      'This comment can only be deleted by its author or the admin'
    )
  }

  await UserPostComment.deleteOne({
    _id: commentId,
    customerId: user._id,
  })

  return true
}

/**
 *
 * @param {string} postId
 * @param {object} data
 * @param {number} data.rate
 * @param {object} user
 * @param {string} user._id
 */

export const createPostValorationByUser = async ({ postId, data, user }) => {
  if (!data.rate) {
    throw new Error('Missing valoration')
  }

  const formattedRate = Number(data.rate)

  if (isNaN(formattedRate)) {
    throw new Error('Rate must be a number')
  }

  if (formattedRate < 0 || formattedRate > 5) {
    throw new Error('Range must be between 0 and 5')
  }

  const post = await getPostById(postId)
  const postRate = new UserPostValoration({
    postId: post._id,
    customerId: user._id,
    rate: data.rate,
  })

  await postRate.save()
}

/**
 *
 * @param {string} postId
 * @param {object} data
 * @param {string} data.status
 * @param {object[]} data.time
 * @param {'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'} data.time.weekDay
 * @param {object[]} data.time.timing
 * @param {Date} data.time.timing.start
 * @param {Date} data.time.timing.end
 */

export const createPostRequestByUser = async ({ postId, data, user }) => {
  if (!postId || !data.availableTime) {
    throw new Error('Missing some fields')
  }

  validatePostAvailableTimeData(data.availableTime)

  const post = await getPostById(postId)
  //TODO validar que el post esta disponible para el tiempo requerido
  const postRequest = new UserPostRequest({
    postId: post._id,
    customerId: user._id,
    status: data.status,
    time: data.availableTime,
  })

  await postRequest.save()
}

export const updateRequestStatusBySeller = async ({
  postId,
  data,
  user,
  requestId,
}) => {
  const post = await getPostById(postId)
  const postRequest = await UserPostRequest.findOne({ _id: requestId })
  if (
    post.sellerId.toString() !== user._id.toString() &&
    user.rol !== 'admin'
  ) {
    throw new Error('You dont have permission to edit this request')
  }

  if (data.status) {
    postRequest.status = data.status
  }

  await post.save()

  return post
}
