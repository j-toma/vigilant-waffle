const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('../utils/test_helper')

beforeEach(async () => {
  await User.deleteMany({})

  const user = new User({
    username: 'root',
    name: 'Admin',
    password: 's3kr3t'
  })

  await user.save()
})

describe('CREATE users', () => {
  test('succeed with valid username and password', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'bino',
      name: 'Bino Le',
      password: 'binole'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('failed when missing username', async () => {
    const newUser = {
      username: '',
      name: 'Bino Le',
      password: 'binole'
    }

    const usersAtStart = await helper.usersInDb()

    const result = await createFailed(newUser)

    const usersAtEnd = await helper.usersInDb()

    expect(result).toHaveProperty('error')

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('failed when missing password', async () => {
    const newUser = {
      username: 'bino',
      name: 'Bino Le',
      password: ''
    }

    const usersAtStart = await helper.usersInDb()

    const result = await createFailed(newUser)

    const usersAtEnd = await helper.usersInDb()

    expect(result).toHaveProperty('error')

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('failed when the username is less than 3 characters', async () => {
    const newUser = {
      username: 'bi',
      name: 'Bino Le',
      password: 'binole'
    }

    const usersAtStart = await helper.usersInDb()
    const result = await createFailed(newUser)
    const usersAtEnd = await helper.usersInDb()
    expect(result).toHaveProperty('error')
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('failed when the password is less than 3 characters', async () => {
    const newUser = {
      username: 'bino',
      name: 'Bino Le',
      password: '12'
    }

    const usersAtStart = await helper.usersInDb()

    const result = await createFailed(newUser)

    const usersAtEnd = await helper.usersInDb()

    expect(result).toHaveProperty('error')

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('failed when the username is exists', async () => {
    const newUser = {
      username: 'root',
      name: 'Admin',
      password: 'password'
    }

    const usersAtStart = await helper.usersInDb()

    const result = await createFailed(newUser)

    const usersAtEnd = await helper.usersInDb()

    expect(result).toHaveProperty('error')

    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

describe('GET users', () => {
  test('responded all users', async () => {
    const result = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body.length).toBe(1)
    expect(result.body[0].username).toBe('root')
  })
})

async function createFailed(user) {
  return await api
    .post('/api/users')
    .send(user)
    .expect(400)
    .expect('Content-Type', /application\/json/)
}
