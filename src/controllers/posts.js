import Post from '../models/posts.js'
import UserPostComment from '../models/user_post_comment.js'
import UserPostRequest from '../models/user_post_request.js'
import UserPostValoration from '../models/user_post_valoration.js'
import { validatePostAvailableTimesData } from '../utils/post.js'

/**
 * @returns {Promise<object>}
 */

export const getPosts = async () => {
  return Post.find()
}

/**
 *
 * @param {string} id
 * @returns {Promise<object>}
 */

export const getPostById = async (id) => {
  const post = await Post.findOne({ _id: id })

  if (!post) {
    throw new Error('Post not found')
  }

  const postComments = await UserPostComment.find({
    postId: post._id,
  })

  const postValorations = await UserPostValoration.find({
    postId: post._id,
  })

  const rating = postValorations.reduce((acc, current) => {
    return acc + current.rate
  }, 0)

  const postRequests = await UserPostRequest.find({
    postId: post._id,
  })

  return {
    ...post.toObject(),
    comments: postComments,
    rating: rating / 5,
    requests: postRequests,
  }
}

/**
 *
 * @param {object} data
 * @param {string} data.brand
 * @param {string} data.name
 * @param {string} data.model
 * @param {number} data.plateNumber
 * @param {number} data.km
 * @param {number} data.carSeats
 * @param {number} data.doors
 * @param {string} data.sellerId
 * @param {'electric' | 'gas'} data.fuel
 * @param {'manual' | 'automatic'} data.gearBox
 * @param {'car' | 'motorbike' | 'van'} data.vehicle
 */
export const createPost = async (
  {
    vehicle,
    name,
    brand,
    model,
    plateNumber,
    km,
    carSeats,
    fuel,
    gearBox,
    doors,
    sellerId,
    availableTimes,
  },
  user
) => {
  if (user.rol === 'customer') {
    throw new Error('You dont have permission for this')
  }

  if (
    !vehicle ||
    !brand ||
    !model ||
    !plateNumber ||
    !carSeats ||
    !km ||
    !name ||
    !sellerId
  ) {
    throw new Error('Missing some fields')
  }

  const validPostVehicle = ['car', 'van', 'motorbike']
  if (!validPostVehicle.includes(vehicle)) {
    throw new Error(`The type of vehicle must be ${validPostVehicle}`)
  }

  const validFuel = ['gas', 'electric']
  if (fuel && !validFuel.includes(fuel)) {
    throw new Error('This fuel type is not valid')
  }

  const validGearBox = ['manual', 'automatic']
  if (gearBox && !validGearBox.includes(gearBox)) {
    throw new Error('This gearbox type is invalid')
  }

  const validDoors = ['3', '5']
  if (doors && !validDoors.includes(doors)) {
    throw new Error('The number of doors is not valid')
  }

  if (availableTimes) {
    validatePostAvailableTimesData(availableTimes)
  }

  const existingPost = await Post.findOne({ name, vehicle, sellerId })
  if (existingPost) {
    throw new Error('This post already exists')
  }

  const post = new Post({
    vehicle,
    name,
    brand,
    model,
    plateNumber,
    km,
    carSeats,
    fuel,
    gearBox,
    doors,
    sellerId,
    availableTimes,
  })

  return post.save()
}

/**
 *
 * @param {string} id
 * @param {object} user
 * @param {'admin' | 'seller' | 'customer'} user.rol
 * @param {string} user._id
 * @param {object} data
 * @param {string} data.name
 * @param {string} data.brand
 * @param {string} data.model
 * @param {number} data.plateNumber
 * @param {number} data.km
 * @param {number} data.carSeats
 * @param {number} data.doors
 * @param {string} data.sellerId
 * @param {'electric' | 'gas'} data.fuel
 * @param {'manual' | 'automatic'} data.gearBox
 * @param {'car' | 'motorbike' | 'van'} data.vehicle
 */

export const updatePost = async (
  id,
  {
    vehicle,
    name,
    brand,
    model,
    plateNumber,
    km,
    carSeats,
    fuel,
    gearBox,
    doors,
    availableTimes,
  },
  user
) => {
  const post = await Post.findOne({ _id: id })
  if (!post) {
    throw new Error('Post not found')
  }

  if (
    post.sellerId.toString() !== user._id.toString() &&
    user.rol !== 'admin'
  ) {
    throw new Error('This post can only be edited by its author')
  }

  if (name) {
    post.name = name
  }

  if (brand) {
    post.brand = brand
  }

  if (model) {
    post.model = model
  }

  if (plateNumber) {
    post.plateNumber = plateNumber
  }

  if (km) {
    post.km = km
  }

  if (carSeats) {
    post.carSeats = carSeats
  }

  if (availableTimes) {
    validatePostAvailableTimesData(availableTimes)

    post.availableTimes = availableTimes
  }

  const validPostVehicle = ['car', 'van', 'motorbike']

  if (vehicle) {
    if (!validPostVehicle.includes(vehicle)) {
      throw new Error(`The type of vehicle must be ${validPostVehicle}`)
    }
  } else {
    post.vehicle = vehicle
  }

  const validFuel = ['gas', 'electric']

  if (fuel) {
    if (fuel && !validFuel.includes(fuel)) {
      throw new Error('This fuel type is not valid')
    }
  } else {
    post.fuel = fuel
  }

  const validGearBox = ['manual', 'automatic']

  if (gearBox) {
    if (gearBox && !validGearBox.includes(gearBox)) {
      throw new Error('This gearbox type is invalid')
    }
  } else {
    post.gearBox = gearBox
  }

  const validDoors = ['3', '5']

  if (doors) {
    if (doors && !validDoors.includes(doors)) {
      throw new Error('The number of doors is not valid')
    }
  } else {
    post.doors = doors
  }

  await post.save()

  return post
}

/**
 *
 * @param {string} id
 * @param {string} sellerId
 * @param {object} user
 * @param {string} user._id
 * @param {'admin' | 'seller' | 'customer'} user.rol
 * @returns {Promise<boolean>}
 */
export const removePostById = async (id, user) => {
  const post = await getPostById(id)

  if (
    post.sellerId.toString() !== user._id.toString() &&
    user.rol !== 'admin'
  ) {
    throw new Error('This post can only be deleted by its author or the admin')
  }

  await Post.deleteOne({ _id: id })

  return true
}
