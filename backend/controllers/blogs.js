const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Like = require('../models/like')
const Comment = require('../models/comment')
const logger = require('../utils/logger')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  logger.info('in get')
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1 })
    .populate('comments', { content: 1})
    //.populate('likedBy', { username: 1})
    .populate('likedBy', { username: 1})
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
      //likes: body.likes === undefined ? 0 : body.likes,
      likes: 0,
      author: body.author,
      user: user._id,
      comments: [],
      likedBy: []
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
      //await Blog.findByIdAndRemove(request.params.id)
      await Blog.deleteOne({ _id: request.params.id })
      // remove blog from user
      // this works only after refresh
      //await User.updateOne({ _id: decodedToken.id }, { $pull: { 'blogs': request.params.id } })
      await Comment.deleteMany( { 'blog': request.params.id } )

      //await User.findOneAndUpdate(
      //  { _id: decodedToken.id },
      //  { 
      //    $pull: { 'blogs': request.params.id },
      //  }
      //)

      //await User.updateOne({ _id: decodedToken.id }, { $pull: { 'likedBlogs': request.params.id } })
      //await User.findOneAndUpdate({ _id: decodedToken.id }, { $pull: { 'likedBlogs': request.params.id } })

      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'only owner can delete' })
    }
  } catch (exception) {
    response.status(400).end()
    next(exception)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  logger.info('in blogsRouter put')
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  try {
    const blog = await Blog.findById(request.params.id)
    if ( blog.user.toString() === decodedToken.id.toString()) {
      //logger.info('passed verification')
      const user = await User.findById(decodedToken.id)
      //logger.info('got user')
      //const res1 = await Blog.find( { _id: request.params.id })
      //logger.info('blog:', blog)
      //logger.info('blog.likedBy:', blog.likedBy[0])
      //logger.info('user._id:', user._id)
      //logger.info('typeOf(blog.likedBy):', typeof(blog.likedBy[0].toString()))
      //logger.info('typeOf(user._id):', typeof(user._id))
      //logger.info('typeOf(user._id):', typeof(user._id.toString()))
      //logger.info('equal?:', blog.likedBy[0].toString() === user._id.toString())
      //if ( blog.likedBy.length > 0 && blog.likedBy.some(x => x.toString() === user._id.toString())) {
      if ( blog.likedBy.some(x => x.toString() === user._id.toString())) {
        const updatedBlog = await Blog.findOneAndUpdate(
          { 
            _id: request.params.id ,
            likedBy: user._id
          },
          { 
            $inc: { likes: -1 },
            $pull: { likedBy: user._id } 
          },
          { new: true }
        )
          .populate( 'user', { username: 1 } )
          .populate( 'likedBy', { username: 1 } )

        logger.info('user:', user)
        logger.info('user.likedBlogs before:', user.likedBlogs)
        user.likedBlogs = user.likedBlogs.filter(x => x.toString() !== request.params.id.toString())
        logger.info('user.likedBlogs after:', user.likedBlogs)
        await user.save()

        response.status(201).json(updatedBlog)

      } else {
        const updatedBlog = await Blog.findOneAndUpdate(
          { 
            _id: request.params.id ,
            likedBy: { $ne: user._id }
          },
          { 
            $inc: { likes: 1 },
            $push: { likedBy: user._id } 
          },
          { new: true }
        )
          .populate( 'user', { username: 1 } )
          .populate( 'likedBy', { username: 1})

        user.likedBlogs = user.likedBlogs.concat(request.params.id)
        await user.save()

        response.status(201).json(updatedBlog)
      }


      //logger.info('res1:', res1)
      //const res2 = await Blog
      //  .find( { _id: request.params.id })
      //  .elemMatch("likedBy", { _id: user._id })
      //logger.info('res2:', res2)
      //const res3 = await Blog.findByIdAndUpdate(
      //  request.params.id,
      //  { 
      //    $inc: { likes: 1 },
      //    $push: { likedBy: user._id } 
      //  },
      //  { new: true }
      //)
      //logger.info('res3:', res3)
      //const res4 = await Blog.updateOne(
      //
      //
      // this seems to work for like
      //const res4 = await Blog.findOneAndUpdate(
      //  { 
      //    _id: request.params.id ,
      //    likedBy: { $ne: user._id }
      //  },
      //  { 
      //    $inc: { likes: 1 },
      //    $push: { likedBy: user._id } 
      //  },
      //  { new: true }
      //)
      //  .populate( 'user', { username: 1 } )
      //  .populate( 'likedBy', { username: 1})
      //logger.info('res4:', res4)
      //const res5 = await Blog.find( { _id: request.params.id })
      //logger.info('res5:', res5)
      //const res6 = await Blog.updateOne(
      // unlke
      //const res6 = await Blog.findOneAndUpdate(
      //  { 
      //    _id: request.params.id ,
      //    likedBy: user._id
      //  },
      //  { 
      //    $inc: { likes: -1 },
      //    $pull: { likedBy: user._id } 
      //  },
      //  { new: true }
      //)
      //logger.info('res6:', res6)
      // this seems to work for conditional execution
      //const res7 = blog.likedBy.some(x => x.equals(user._id))
      //logger.info('res7:', res7)



      //logger.info('elemMatch:', elemMatch)

    } else {
      return response.status(401).json({ error: 'only owner can update' })
    }
  } catch (error) {
    next(error)
  }
})

//blogsRouter.put('/:id', async (request, response, next) => {
//  logger.info('in blogsRouter put')
//  //const body = request.body
//  //logger.info('request.params.id:', request.params.id)
//  //logger.info('body:', body)
//
//  const decodedToken = jwt.verify(request.token, process.env.SECRET)
//  //logger.info('decodedToken.id:', decodedToken.id)
//  if (!request.token || !decodedToken.id) {
//    //logger.info('fail verif')
//    return response.status(401).json({ error: 'token missing or invalid' })
//  }
//
//  try {
//    const blog = await Blog.findById(request.params.id)
//    //logger.info('origBlog:', origBlog)
//    //logger.info('origBlog.user', origBlog.user)
//    //logger.info('decodedToken.id:', decodedToken.id)
//    //logger.info('are those equal?', origBlog.user.toString() === decodedToken.id.toString())
//
//    if ( blog.user.toString() === decodedToken.id.toString()) {
//      //if (!body.title || !body.author || !body.url) {
//      //  logger.info('missing info')
//      //  return response.status(400).json({
//      //    error: 'content missing'
//      //  })
//      //}
//      //const blog = new Blog({
//      //  title: body.title,
//      //  author: body.author,
//      //  url: body.url,
//      //  likedBy: body.likedBy,
//      //  likes: body.likes,
//      //})
//
//      // for likes
//      // if user likes blog
//      //logger.info('blog.likedBy:', blog.likedBy)
//      //const likesBlogIds = blog.likedBy.map(x => x.id)
//      //logger.info('likesBlogIds:', likesBlogIds)
//      //const userLikesBlog = blog.likedBy.map(x => x.id).includes(decodedToken.id)
//      //logger.info('user likes blog:', userLikesBlog)
//      //logger.info('userLikesBlog2:', userLikesBlog2)
//      
//      const user = await User.findById(decodedToken.id)
//      logger.info('user before:', user)
//
//      //const userLikesBlog2 = blog.likedBy.includes(decodedToken.id)
//      //logger.info('userLikesBlog2:', userLikesBlog2)
//      const userLikesBlog3 = user.likedBlogs.includes(request.params.id)
//      if ( userLikesBlog3 ) {
//        logger.info('in unlike:')
//        // unlike
//        // remove user from blog's likes 
//        //logger.info('blog before unlike:', blog)
//        //const likedBy = body.likedBy
//        //logger.info('likedBy:', likedBy)
//        //const newLikedBy = likedBy.filter(x => x !== user._id)
//        //logger.info('newLikedBy:', newLikedBy)
//        //const blog = new Blog({
//        //  title: body.title,
//        //  author: body.author,
//        //  url: body.url,
//        //  likedBy: body.likedBy.filter(x => x !== user._id),
//        //  likes: body.likes - 1,
//        //  user: user._id
//        //})
//        //blog.likedBy = blog.likedBy.filter(x => x.id !== user._id)
//        //await Blog.updateOne( { _id: request.params.id }, { $pull: { 'likedBy': decodedToken.id } })
//        // decrement blog likes count
//        //blog.likes = blog.likes - 1
//        let updatedBlog = blog.save()
//        logger.info('blog after unlike:', blog)
//        // remove blog from user's likes 
//        user.likedBlogs = user.likedBlogs.filter(x => x.id !== request.params.id)
//        await user.save()
//        logger.info('user after unlike:', user)
//        response.status(201).json(updatedBlog)
//        //await User.updateOne( { _id: decodedToken.id }, { $pull: { 'likedBlogs': request.params.id } } )
//      } else {
//        logger.info('in like:')
//        // like
//        // add user to blog's likes
//        //logger.info('decodedToken.id:', decodedToken.id)
//        const blog = new Blog({
//          title: body.title,
//          author: body.author,
//          url: body.url,
//          likedBy: body.likedBy.concat(user._id),
//          likes: body.likes + 1,
//          user: user._id
//        })
//        //logger.info('blog before like:', blog)
//        //blog.likedBy = blog.likedBy.concat(user._id)
//        // increment blog likes count
//        //blog.likes += 1
//        let updatedBlog = await blog.save()
//        logger.info('blog after like:', blog)
//        // add blog to user's likes
//        user.likedBlogs = user.likedBlogs.concat(blog._id)
//        logger.info('user after like:', user)
//        await user.save()
//        response.status(201).json(updatedBlog)
//        //await User.updateOne( { _id: decodedToken.id }, { $push: { 'likedBlogs': request.params.id } } )
//      }
//
//      //logger.info('blog to save:', blog)
//      ////let updatedBlog = await blog.save()
//      //blog.toJSON()
//
//      // update blog
//      //logger.info('blog to submit:', blog)
//      //const updatedBlog = await Blog.updateOne( { _id: blog.id }, blog, { new: true })
//      //logger.info('updatedBlog:', updatedBlog)
//
//
//    } else {
//      return response.status(401).json({ error: 'only owner can update' })
//    }
//  } catch (error) {
//    next(error)
//  }
//})


        //.populate('user', { username: 1 })
        //.populate('comments', { content: 1 })
        //.populate('likedBy', { username: 1})

      //await User.updateOne({ _id: decodedToken.id }, { $push: { 'likedBlogs': request.params.id } })
      //const user = await Blog.find({ _id: request.params.id }, { likedBy: { $elemMatch: { $eq: decodedToken.id } } })
      //logger.info('user:', user)

      //if (blog.likes.includes(decodedToken.id)) {
      //if (blog.likedBy.includes(decodedToken.id)) {
      //  logger.info('includes')
      //  //const updatedBlog = await Blog
      //  await Blog.updateOne( { _id: request.params.id }, 
      //      { $inc: { likes: -1 } },
      //      { $pull: { likedBy: decodedToken.id } })
      //  //logger.info('updatedBlog:', updatedBlog)
      //  //response.json(updatedBlog.toJSON())
      //} else { 
      //  logger.info('does not include')
      //  const updatedBlog = await Blog
      //  	.updateOne( { _id: request.params.id }, 
      //      { $push: { likedBy: decodedToken.id } },
      //      { $inc: { likes: 1 } },
      //  )
        //logger.info('updatedBlog:', updatedBlog)
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
        //
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

module.exports = blogsRouter
