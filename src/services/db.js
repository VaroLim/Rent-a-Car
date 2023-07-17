import mongoose from 'mongoose'

const connectToDb = async () => {
  console.log('Start DB connection...')
  await mongoose.connect('mongodb://localhost:27017/RentACar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log('Connected to DB')
}

export default connectToDb
