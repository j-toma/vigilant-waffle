const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('../utils/test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  const promiseArr = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArr)
})

describe('api test:', () => {

  describe('testing GET:', () => {
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
    test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body.length).toBe(helper.initialBlogs.length)
    })

    test('the unique id property is id not _id', async () => {
      const response = await api.get('/api/blogs')
      expect(response.body[0].id).toBeDefined()
    })
  })
  describe('testing POST:', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length +1)
      const contents = blogsAtEnd.map(n => n.title)
      expect(contents).toContain(
        'Type wars'
      )
    })

    test('if likes property is missing, it will get value 0', async () => {
      const newBlog = {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        __v: 0
      }
      const savedNote = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
      expect(savedNote.body.likes).toBe(0)
      const blogsAtEnd = await helper.blogsInDb()
      const likes = blogsAtEnd.map(n => n.likes)
      expect(likes).not.toContain(undefined)
    })

    test('if title or url props are missing from post request, api respons with 400 status code', async () => {
      const newBlog = {
        _id: '5a422bc61b54a676234d17fc',
        author: 'Robert C. Martin',
        __v: 0
      }
      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    })
  })

  describe('testing DELETE:', () => {
    test('can delete a blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)
      const contents = blogsAtEnd.map(r => r.id)
      expect(contents).not.toContain(blogToDelete.id)
    })
  })

  describe('testing PUT:', () => {
    test('can update a blog', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]
      const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 100 }
      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length)
      const contents = blogsAtEnd.map(b => b.likes)
      expect(contents).toContain(updatedBlog.likes)
    })
  })
})

afterAll(() => {
  mongoose.connection.close()
})
