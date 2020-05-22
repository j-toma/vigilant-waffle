const bcrypt = require('bcrypt')
const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

commentsRouter.get('/', async (request, response) => {
  const comments = await Comment
    .find({})
    .populate('blog', { title: 1 })
    .populate('user', { username: 1 })

  response.json(comments.map(u => u.toJSON()))
})

//commentsRouter.get('/:id', async (request, response, next) => {
//  try { 
//    const comment = await comment.findById(request.params.id)
//    if (comment) {
//      response.json(comment.toJSON())
//    } else {
//      response.status(404).end()
//    }
//  } catch (error) {
//    next(error)
//  }
//})

commentsRouter.post('/', async (request, response, next) => {

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body
    if (!body.content) {
      return response.status(400).end()
    }
    const user = await User.findById(decodedToken.id)
    const blog = await Blog.findById(body.blog)
    const comment = new Comment({
      content: body.content,
      blog: body.blog,
      user: user._id,
    })
    let savedComment = await comment.save()
    logger.info('savedComment._id:', savedComment._id)

    blog.comments = blog.comments.concat(savedComment._id)
    //await blog.save()
    await Blog.updateOne({ _id: blog.id}, blog, { new:true })

    user.comments = user.comments.concat(savedComment._id)
    await user.save()

    savedComment = savedComment.toJSON()

    response.status(201).json(savedComment)
  } catch(exception) {
    next(exception)
  }

})

module.exports = commentsRouter
