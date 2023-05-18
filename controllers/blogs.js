const blogsRoutes = require('express').Router()
const { request, response } = require('../app')
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
const User = require('../models/user')

const jwt = require('jsonwebtoken')


blogsRoutes.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, _id: 1})
    response.json(blogs)
  })
  
  blogsRoutes.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    
    const user = request.user

    const newBlog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    })
  
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  })

  blogsRoutes.delete('/:id', middleware.userExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    const user = request.user
    if ( blog.user.toString() === user._id.toString()) {
      await Blog.findByIdAndDelete(request.params.id)
      response.status(204).end()
    } else {
      return response.status(401).json({ error: 'Wrong user' })
    }
  })

  blogsRoutes.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    const savedBlog = await Blog.findByIdAndUpdate(request.params.id, blog)
    response.json(savedBlog)
  })

  blogsRoutes.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  })

module.exports = blogsRoutes