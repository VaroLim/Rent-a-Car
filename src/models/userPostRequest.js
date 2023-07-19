import mongoose from 'mongoose'

const UserPostRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      require: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      require: true,
    },
    status: {
      type: String,
    },
    createdAt: {
      type: Date,
      require: true,
      default: Date.now,
    },
  },
  { collection: 'userPostRequests' }
)

const UserPostRequest = mongoose.model('Request', UserPostRequestSchema)

export default UserPostRequest
