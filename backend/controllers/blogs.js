const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  logger.info('in get')
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1 })
    .populate('comments', { content: 1})
  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response, next) => {
  try { 
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }
})
  

blogsRouter.post('/', async (request, response, next) => {

  try {
    //const token = getTokenFrom(request)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }
    const body = request.body
    if (!body.title || !body.url) {
      return response.status(400).end()
    }


    const user = await User.findById(decodedToken.id)
    const blog = new Blog({
      title: body.title,
      url: body.url,
      likes: body.likes === undefined ? 0 : body.likes,
      author: body.author,
      user: user._id,
      comments: []
      //user: body.user
    })
    let savedBlog = await blog.save()
    logger.info('savedBlog._id:', savedBlog._id)
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    savedBlog = savedBlog.toJSON()
    savedBlog.user = { username: user.username }
    response.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }

})

blogsRouter.delete('/:id', async (request, response, next) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  try {
    if (blog.user.toString() === decodedToken.id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      // remove blog from user
      await User.updateOne({ _id: decodedToken.id }, { $pull: { 'blogs': request.params.id } })
      // need to remove comments on a particular blog
      await Comment.deleteMany( { 'blog': request.params.id } )
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'only owner can delete' })
    }
  } catch (exception) {
    response.status(400).end()
    next(exception)
  }
})

//blogsRouter.post('/', async (request, response, next) => {
//  try {
//    const decodedToken = jwt.verify(request.token, process.env.SECRET);
//
//    const { title, url, author, likes } = request.body
//
//    if (!title || !url) {
//      return response.status(400).end()
//    }
//
//    const user = await User.findById(decodedToken.id)
//
//    const blog = new Blog({ title, url, likes, author, user: user._id })
//
//    const createdBlog = await blog.save()
//
//    user.blogs =
//      user.blogs && user.blogs.length > 0
//        ? user.blogs.concat(createdBlog._id)
//        : [createdBlog._id]
//
//    await user.save()
//
//    response.status(201).json(createdBlog.toJSON())
//  } catch (exception) {
//    next(exception)
//  }
//})



blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body
  try {
    if (!body.likes || !body.title || !body.author || !body.url) {
      return response.status(400).json({
        error: 'content missing'
      })
    }

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    }

    const updatedBlog = await Blog
      .findByIdAndUpdate(request.params.id, blog, { new: true })
      .populate('user', { username: 1 })
      .populate('comments', { content: 1 })
    response.json(updatedBlog.toJSON())
  } catch (error) {
    next(error)
  }
})


//blogsRouter.put('/:id', async (request, response) => {
//  const body = request.body
//  const blog = {
//    title: body.title,
//    author: body.author,
//    url: body.url,
//    likes: body.likes === undefined ? 0 : body.likes
//  }
//  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
//  response.status(201).json(updatedBlog.toJSON())
//})

module.exports = blogsRouter
