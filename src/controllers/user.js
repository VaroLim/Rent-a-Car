import User from '../models/user.js'
import { getPostById } from './posts.js'
import UserPostComment from '../models/userPostComment.js'
import UserPostValoration from '../models/userPostValoration.js'
import UserPostRequest from '../models/userPostRequest.js'
import { startOfDay, endOfDay } from 'date-fns'
import Post from '../models/posts.js'

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
 * @param {Array<object>} user.favPosts
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
    newFavList = [...currentFavs, post]
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
  if (user.rol === 'seller') {
    throw new Error('You cant post ratings')
  }

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

  const hasRating = await UserPostValoration.findOne({
    customerId: user._id,
    postId: post._id,
  })

  if (hasRating) {
    throw new Error('This post is already rated by you')
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
 * @param {Array<string>} data.weekDay
 * @param {'approved | 'pending' | 'rejected' | 'canceled'} data.status
 */

export const createPostRequestByUser = async ({ postId, data, user }) => {
  if (user.rol === 'seller') {
    throw new Error('You cant make a request')
  }

  if (!postId || !data.weekDay) {
    throw new Error('Missing some fields')
  }

  const post = await getPostById(postId)

  if (!post.availableTimes.includes(data.weekDay)) {
    throw new Error(`${data.weekDay} is not available`)
  }

  const isRequested = await UserPostRequest.findOne({
    postId: post._id,
    weekDay: data.weekDay,
    createdAt: {
      $gte: startOfDay(new Date()),
      $lte: endOfDay(new Date()),
    },
    status: 'approved',
  })

  if (isRequested) {
    throw new Error('The date is already booked')
  }

  const postRequest = new UserPostRequest({
    postId: post._id,
    customerId: user._id,
    status: data.status,
    weekDay: data.weekDay,
  })

  await postRequest.save()
}

/**
 * @param {string} requestId
 * @param {object} data
 * @param {'approved | 'pending' | 'rejected' | 'canceled'} data.status
 */

export const updateRequestStatusByUser = async ({ requestId, data, user }) => {
  const postRequest = await UserPostRequest.findOne({ _id: requestId })

  if (!postRequest) {
    throw new Error('Post request not found')
  }

  if (
    user.rol === 'customer' &&
    user._id.toString() !== postRequest.customerId.toString()
  ) {
    throw new Error('You dont have permission')
  }

  if (user.rol === 'seller') {
    const post = await Post.find({ _id: postRequest.postId })
    if (post.sellerId.toString() !== user._id) {
      throw new Error('You arent the author of the request')
    }
  }

  if (data.status) {
    if (data.status === 'approved') {
      const sameRequestDay = await UserPostRequest.find({
        _id: { $ne: postRequest._id },
        weekDay: postRequest.weekDay,
        postId: postRequest.postId,
        createdAt: {
          $gte: startOfDay(postRequest.createdAt),
          $lte: endOfDay(postRequest.createdAt),
        },
      })

      const sameRequestIds = sameRequestDay.map((request) => request._id)
      if (sameRequestIds.length > 0) {
        await UserPostRequest.updateMany(
          { _id: { $in: sameRequestIds } },
          { status: 'rejected' }
        )
      }
    }

    postRequest.status = data.status
  }

  await postRequest.save()

  return postRequest
}

export const getRequestByUser = async (user) => {
  if (user.rol === 'customer') {
    return UserPostRequest.find({ customerId: user._id })
  }

  const sellerPosts = await Post.find({ sellerId: user._id })

  const postsIds = sellerPosts.map((post) => post._id)

  return UserPostRequest.find({ postId: { $in: postsIds } })
}
