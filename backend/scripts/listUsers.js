require('dotenv').config({ path: __dirname + '/../.env' })
const mongoose = require('mongoose')
const User = require('../models/User')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careerak'

async function list(){
  try{
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    const users = await User.find().sort({ createdAt: -1 }).limit(50).lean()
    console.log('Found', users.length, 'users')
    users.forEach(u => console.log(u._id.toString(), '-', u.email, '-', u.name, '-', u.role))
  }catch(err){
    console.error('Error listing users:', err.message)
  }finally{
    mongoose.disconnect()
  }
}

list()
