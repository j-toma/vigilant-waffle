const logger = require('../utils/logger')
const mongoose =require('mongoose')
const Comment = require('../models/comment')
const User = require('../models/user')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

//blogSchema.pre('updateOne', function() {
//  logger.info('pre update')
//  //logger.info(this)
//})
//
//blogSchema.post('findByIdAndRemove', function(next) {
blogSchema.post('deleteOne', function(next) {
  logger.info('post update')
  //Comment.deleteMany({ blog: this._id }).exec()
  //User.updateOne(
  //  {
  //    blogs: { $in: [this.id] },
  //  },
  //  { 
  //    $pull: { 'blogs': this.id },
  //  }
  //).exec()
  //User.update(
  //  {
  //    likedBlogs: { $in: [this.id] },
  //  },
  //  { 
  //    $pull: { 'likedBlogs': this.id },
  //  },
  //  { multi: true }
  //).exec()
  //next()
    //.populate( 'blogs', { title: 1 })
    //.populate( 'comments', { content: 1 })
    //.populate( 'likedBlogs', { title: 1})
  //logger.info(this)
})

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
