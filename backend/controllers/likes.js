const bcrypt = require('bcrypt')
const likesRouter = require('express').Router()
const Like = require('../models/like')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

likesRouter.get('/', async (request, response) => {
  const likes = await Like
    .find({})
    .populate('blog', { title: 1 })
    .populate('user', { username: 1 })
  logger.info('likes in likesRouter getAll:', likes)
  response.json(likes.map(l => l.toJSON()))
})

likesRouter.post('/', async (request, response, next) => {
  //logger.info('like router request token:', request.token)
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body
    //logger.info('request.params.id:', request.params.id)
    //logger.info('decodedToken.id:', decodedToken.id)
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(body.blog)
    //logger.info('blog:', blog)
    //logger.info('user:', user)
    const like = new Like({
      blog: blog._id,
      user: user._id,
    })
    //logger.info('like to save:', like)
    let savedlike = await like.save()
    //logger.info('savedlike._id:', savedlike._id)

    blog.likedBy = blog.likedBy.concat(user._id)
    blog.likes = blog.likes + 1
    await blog.save()
    //await Blog.updateOne({ _id: blog.id}, blog, { new:true })
    user.likedBlogs = user.likedBlogs.concat(blog._id)
    await user.save()

    savedlike = savedlike.toJSON()

    response.status(201).json(savedlike)
  } catch(exception) {
    next(exception)
  }
})

likesRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const like = await Like.findById(request.params.id)
  logger.info('like to delete:', like)

  const blog = await Blog.findById(like.blog.id)
  logger.info('blog to modify:', blog)
  const user = await Blog.findById(like.user.id)
  logger.info('user to modify:', user)
  try {
    if (like.user.toString() === decodedToken.id.toString()) {
      await Like.findByIdAndRemove(request.params.id)
      // remove blog from user
      await User.updateOne({ _id: user._id }, { $pull: { 'likedBlogs': blog._id } })
      await Blog.updateOne({ _id: blog._id }, { $pull: { 'likedBy': user._id } })
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'only owner can delete' })
    }
  } catch (exception) {
    response.status(400).end()
    next(exception)
  }
})

module.exports = likesRouter
