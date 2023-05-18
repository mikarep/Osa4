const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcryptjs')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

const blogs = [
    {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      user: "Id",
      __v: 0
    },
    {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      user: "Id",
      __v: 0
    }
  ]
  
    beforeEach(async () => {
      await User.deleteMany({})
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
      await user.save()

      blogs[0].user = user._id
      blogs[1].user = user._id

      await Blog.deleteMany({})
      let blogObject = new Blog(blogs[0])
      await blogObject.save()
      blogObject = new Blog(blogs[1])
      await blogObject.save()
    })

test('blogs are returned as json', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(response.body).toHaveLength(blogs.length)
    })

    test('new blog has id', async () => {
        const newBlog = {
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2
        }

        const responseLogin = await api
          .post('/api/login')
          .send({ username: 'root', password: 'sekret'})
          .expect(200)
        
        const response = await api
           .post('/api/blogs')
           .set('Authorization', `Bearer ${responseLogin.body.token}`)
           .send(newBlog)
           .expect(201)
           .expect('Content-Type', /application\/json/)
        expect(response.body.id).toBeDefined()

        const responseGetAll = await api
           .get('/api/blogs')
           .expect(200)
           .expect('Content-Type', /application\/json/)
        const blogsPlusOne = blogs.length + 1
        expect(responseGetAll.body).toHaveLength(blogsPlusOne)
       })

    test('new blog likes default value is 0', async () => {
        const newBlog = {
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
        }
        
        const responseLogin = await api
          .post('/api/login')
          .send({ username: 'root', password: 'sekret'})
          .expect(200)

        const response = await api
           .post('/api/blogs')
           .set('Authorization', `Bearer ${responseLogin.body.token}`)
           .send(newBlog)
           .expect(201)
        expect(response.body.likes).toBe(0)
    })

    test('new blog has not title or url', async () => {
        const newBlog = {
            author: "Robert C. Martin",
            likes: 2
        }

        const responseLogin = await api
          .post('/api/login')
          .send({ username: 'root', password: 'sekret'})
          .expect(200)

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${responseLogin.body.token}`)
            .send(newBlog)
            .expect(400)
    })

    test('delete blog', async () => {
      const responseLogin = await api
          .post('/api/login')
          .send({ username: 'root', password: 'sekret'})
          .expect(200)


      await api
        .delete('/api/blogs/5a422aa71b54a676234d17f8')
        .set('Authorization', `Bearer ${responseLogin.body.token}`)
        .expect(204)
      
      const getAll = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      const blogMinusOne = blogs.length - 1
      expect(getAll.body).toHaveLength(blogMinusOne)
    })

    test('change likes from one of the blogs', async () => {
      const likes = {
        likes: 10
      }
      await api
        .put('/api/blogs/5a422aa71b54a676234d17f8')
        .send(likes)
        .expect(200)

      const getBlog = await api
        .get('/api/blogs/5a422aa71b54a676234d17f8')
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(getBlog.body.likes).toBe(10)
    })

    test('post without token', async () => {
      const newBlog = {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html"
      }

      await api
       .post('/api/blogs')
       .send(newBlog)
       .expect(401)
    })

afterAll(async () => {
  await mongoose.connection.close()
})

