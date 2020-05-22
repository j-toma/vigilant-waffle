const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { title: 1, author: 1 })
    .populate('comments', { content: 1 })
  response.json(users.map(u => u.toJSON()))
})

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    response.status(400).send({
      error: 'Username and password are required to create a new user'
    })
    return
  }

  if (password.length < 3) {
    response.status(400).send({
      error: 'password needs to be three or more characters'
    })
  }

  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    const user = new User({
      username:username,
      name:name,
      passwordHash
    })
    const savedUser = await user.save()
    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter
