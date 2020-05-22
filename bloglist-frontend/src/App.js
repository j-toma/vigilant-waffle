import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { initialiseBlogs } from './reducers/blogReducer' 
import { initialiseUsers } from './reducers/userReducer'
import { initialiseComments } from './reducers/commentReducer'
import { setUser } from './reducers/loginReducer'
import blogService from './services/blog'
import commentService from './services/comment'

import Blog from './components/Blog'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import BlogList from './components/BlogList'
import Users from './components/Users'
import User from './components/User'
import Heading from './components/Heading'
import Menu from './components/Menu'


//import loginService from './services/login'
//import userService from './services/user'

import { Container } from 'react-bootstrap'

const App = (props) => {
  //const [blogs, setBlogs] = useState([])
  //const [liked, setLiked] = useState(false)
  //const [comments, setComments] = useState([])
  //const [username, setUsername] = useState('')
  //const [password, setPassword] = useState('')
  //const [user, setUser] = useState(null)
  //const [users, setUsers] = useState([])
  //const [notification, setNotification] = useState({ message:'', type: null })

  useEffect(() => {
    props.initialiseBlogs()
    props.initialiseUsers()
    props.initialiseComments()
  }, [props])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      props.setUser(user)
      commentService.setToken(user.token)
      blogService.setToken(user.token)
    }
  }, [])

  //const handleLogout = () => {
  //  window.localStorage.removeItem('loggedBlogappUser')
  //  setUser(null)
  //}

  //const handleLogin = async (submitObject) => {
  //  try {
  //    const user = await loginService.login(submitObject)
  //    window.localStorage.setItem(
  //      'loggedBlogappUser', JSON.stringify(user)
  //    )
  //    blogService.setToken(user.token)
  //    console.log('user:', user)
  //    setUser(user)
  //    setUsername('')
  //    setPassword('')
  //    notify(`successfully logged in as ${user.name}`, 'success')
  //  } catch (except) {
  //    notify('Wrong credentials', 'error')
  //  }
  //}

  //const createBlog = (blogObject) => {
  //  blogService
  //    .create(blogObject)
  //    .then(data => {
  //      notify(`a new blog ${blogObject.title} by ${blogObject.author} added`, 'success')
  //      setBlogs(blogs.concat(data))
  //    })
  //}

  //const handleComment = (commentObject) => {
  //  commentService
  //    .create(commentObject)
  //    .then(data => {
  //      notify(`your comment has been submitted`, 'success')
  //      setComments(comments.concat(data))
  //    })
  //}
  //
  //const handleLike = async blog => {
  //
  //  try {
  //    if (liked === false) {
  //      const newObject = { ...blog.blog, likes: blog.blog.likes + 1 }
  //      blogService.update(blog.blog.id, newObject)
  //      setBlogs(blogs.map(p => (p.id === blog.blog.id ? newObject : p)))
  //      setLiked(true)
  //    } else {
  //      const newObject = { ...blog.blog, likes: blog.blog.likes - 1 }
  //      blogService.update(blog.blog.id, newObject)
  //      setBlogs(blogs.map(p => (p.id === blog.blog.id ? newObject : p)))
  //      setLiked(false)
  //    }
  //  } catch (error) {
  //    notify('cannot like for some reason', 'error')
  //  }
  //}

  //const handleRemove = async blog => {
  //  const confirmation = window.confirm(`Really remove blog ${blog.blog.title}?`)
  //  try {
  //    if (confirmation) {
  //      await blogService.remove(blog.blog.id)
  //      setBlogs(blogs.filter(b => b.id !== blog.blog.id))
  //      notify('blog has been deleted','success')
  //    }
  //  } catch (error) {
  //    notify('blog has not been removed', 'error')
  //  }
  //}

  //const notify = (message, type) => {
  //  setNotification({ message, type })
  //  setTimeout(() => setNotification({}),5000)
  //}

  return (
    <Container>
      <BrowserRouter>
        <div>
          <Heading text="Blog Application" type="h1" />
          <Notification />
          { props.user === null ?
            <LoginForm /> :
            (
              <>
                <Menu />
                <Route path="/login" render={() => <LoginForm />} />
                <Route exact path="/" render={() => <BlogList />} />
                <Route path="/blogs/:id" render={({match}) => <Blog blog={match.params.id} />} />
                <Route exact path="/users" render={() => <Users />} />
                <Route path="/users/:id" render={({match}) => <User user={match.params.id} />} />
                <Route path="/create" render={() => <BlogForm />} />
              </>
            )
          }
        </div>
      </BrowserRouter>
    </Container>

  )
}

const mapStateToProps = state => {
  return {
    user: state.user
    }
}

const mapDispatchToProps = {
  initialiseBlogs,
  initialiseUsers,
  initialiseComments,
  setUser
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
//export default App
