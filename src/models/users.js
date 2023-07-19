import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      require: true,
    },

    password: {
      type: String,
      require: true,
    },

    firstName: {
      type: String,
    },

    lastName: {
      type: String,
    },

    dateOfBirth: {
      type: Date,
    },

    phone: {
      type: Number,
    },

    dni: {
      type: String,
    },

    rol: {
      type: String,
      enum: ['admin', 'seller', 'customer'],
    },

    salt: {
      type: String,
      require: true,
    },

    createdAt: {
      type: Date,
      require: true,
      default: Date.now,
    },

    favPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
  },
  { collection: 'users' }
)

const User = mongoose.model('User', UserSchema)

export default User
