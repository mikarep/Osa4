const _ = require('lodash')
const dummy = (blogs) => {
    // ...
    return 1
  }

  const totalLikes = (blogs) => {
    let likes = 0
    blogs.forEach(element => {
        likes = likes + element.likes
    });
    return likes
  }

  const favoriteBlogs = (blogs) => {
    const likes = blogs.map(element => element.likes)
    const maxLikes = Math.max(...likes)
    const favoriteBlog = blogs.find(element => element.likes === maxLikes)
    return favoriteBlog
  }

  const mostBlogs = (blogs) => {
    const groupBlogs = _.groupBy(blogs, 'author')
    const blog = _.map(groupBlogs)
    const most = blog.map(element => element.length)
    const maxMost = Math.max(...most)
    const mostBlog = blog.find(element => element.length === maxMost)
    if (mostBlog !== undefined) {
        return {
            author: mostBlog[0].author,
            blogs: maxMost
        }
    } else {
        return
    }
  }

  const mostLikes = (blogs) => {
    const groupBlogs = _.groupBy(blogs, 'author')
    const blog = _.map(groupBlogs)
    let bloggers = []
    let luku = 0
    let author = ''
    blog.forEach(element => {
        luku = 0
        element.forEach(element2 => {
            luku = luku + element2.likes
            author = element2.author
        })
        const newBlogger = {
            author: author,
            likes: luku
        }
        bloggers.push(newBlogger)
    })
    const most = bloggers.map(element => element.likes)
    const maxMost = Math.max(...most)
    const mostLikes = bloggers.find(element => element.likes === maxMost)
    return mostLikes
  }
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlogs,
    mostBlogs,
    mostLikes
  }