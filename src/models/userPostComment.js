import mongoose from 'mongoose'

const UserPostCommentSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: String,
      require: true,
    },
    createdAt: {
      type: Date,
      require: true,
      default: Date.now,
    },
  },
  { collection: 'userPostComments' }
)

const UserPostComment = mongoose.model('UserPostComment', UserPostCommentSchema)

export default UserPostComment
