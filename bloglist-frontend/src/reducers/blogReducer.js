import blogService from '../services/blog'
import userService from '../services/user'

const sort = state => state.sort((a,b) => (a.likes < b.likes) ? 1 : -1)

const blogReducer = (state=[], action) => {
  switch(action.type) {
  case 'INIT_BLOGS':
    return sort(action.data)
  case 'CREATE_BLOG':
    return sort([...state, action.data])
  case 'BLOG_ADD_COMMENT':
    //return sort([...state, action.data])
    return sort([...action.data])
  //case 'BLOG_ADD_LIKE':
  //  return sort([...action.data])
  case 'LIKE_BLOG':
    return sort(state.map(blog => blog.id !== action.data.id ? blog : action.data))
    //return sort([...action.data])
  //case 'UNLIKE_BLOG':
  //  return sort(state.map(blog => blog.id !== action.data.id ? blog : action.data))
  case 'REMOVE_BLOG':
    return state.filter(blog => blog.id !== action.data.id)
  default:
    return state
  }
}

export const initialiseBlogs = () => {
  return async dispatch => {
    const response = await blogService.getAll()
    dispatch({
      type: 'INIT_BLOGS',
      data: response
    })
  }
}

export const createBlog = data => {
  return async dispatch => {
    const response = await blogService.create(data)
    dispatch({
      type: 'CREATE_BLOG',
      data: response
    })
    const response2 = await userService.getAll()
    dispatch({
      type: 'USER_CREATED_BLOG',
      data: response2
    })
  }
}

export const updateBlog = data => {
  console.log('in blogg reducer')
  console.log('blogReducer data:', data)
  return async dispatch => {
    //const response = await blogService.update(data.id, { ...data, likes: data.likes + 1 })
    //const response = await blogService.like(data)
    const response = await blogService.update(data)
    dispatch({
      type: 'LIKE_BLOG',
      data: response
    })
    const response2 = await userService.getAll()
    dispatch({
      type: 'USER_LIKE_BLOG',
      data: response2
    })
  }
}

export const removeBlog = data => {
  return async dispatch => {
    await blogService.remove(data.id)
    dispatch({
      type: 'REMOVE_BLOG',
      data: data
    })
    const response2 = await userService.getAll()
    dispatch({
      type: 'USER_REMOVE_BLOG',
      data: response2
    })
  }
}

export default blogReducer

//export const unlikeBlog = data => {
//  return async dispatch => {
//    //const response = await blogService.update(data.id, { ...data, likes: data.likes + 1 })
//    const response = await blogService.unlike(data)
//    dispatch({
//      type: 'UNLIKE_BLOG',
//      data: response
//    })
//  }
//}
