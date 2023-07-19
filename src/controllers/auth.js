import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { isValid } from 'date-fns'

/**
 * @param {string} email
 * @param {string} password
 * @return {Promise<string>}
 */
export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error('Some fields are missing')
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new Error('User not found')
  }

  const matchedPassword = await bcrypt.compare(password, user.password)

  if (!matchedPassword) {
    throw new Error('Invalid password')
  }

  return jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET)
}

/**
 * @param {string} email
 * @param {string} password
 * @param {number} phone
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} dateOfBirth
 * @param {string} dni
 * @param {'seller' | 'customer'} rol
 * @return {Promise<string>}
 */

export const signup = async ({
  email,
  password,
  phone,
  firstName,
  lastName,
  dateOfBirth,
  dni,
  rol,
}) => {
  if (!email || !password || !rol) {
    throw new Error('Some fields are missing')
  }

  const hasUser = await User.findOne({ email })

  if (hasUser) {
    throw new Error('Email already in use')
  }

  if (phone && typeof phone !== 'number') {
    throw new Error('Phone must only contain numbers')
  }

  if (firstName && firstName.length < 3) {
    throw new Error('First name must be 3 characters or longer')
  }

  if (lastName && lastName.length < 3) {
    throw new Error('Last name must be 3 characters or longer')
  }

  if (dateOfBirth && !isValid(dateOfBirth)) {
    throw new Error('Your birthdate is invalid')
  }

  if (dni && typeof dni !== 'string') {
    throw new Error('DNI must be composed of numbers and letters')
  }

  const validRoles = ['seller', 'customer']
  if (rol && !validRoles.includes(rol)) {
    throw new Error(`Your role must be one of the following: ${validRoles}`)
  }

  const saltRounds = 10
  const salt = await bcrypt.genSalt(saltRounds)

  const hashedPassword = await bcrypt.hash(password, salt)
  const user = new User({
    email,
    password: hashedPassword,
    salt,
    phone,
    firstName,
    lastName,
    dateOfBirth,
    dni,
    rol,
  })

  await user.save()

  return jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET)
}
