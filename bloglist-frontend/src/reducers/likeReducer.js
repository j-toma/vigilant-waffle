import blogService from '../services/blog'
import userService from '../services/user'
//import commentService from '../services/comment'
import likeService from '../services/like'

const likeReducer = (state=[], action) => {
  switch(action.type) {
    case 'INIT_LIKES':
      return [...action.data]
    case 'CREATE_LIKE':
      return [...state, action.data]
    case 'REMOVE_LIKE':
      return state.filer(like => like.id !== action.data.id)
    default:
      return state
    }
}

export const addLike = data => {
  console.log('data received in like reducer:', data)
  return async dispatch => {
    const like = await likeService.create(data)
    dispatch({
      type: 'CREATE_LIKE',
      data: like 
    })
    const users = await userService.getAll()
    dispatch({
      type: 'USER_ADD_LIKE',
      data: users
    })
    const blogs = await blogService.getAll()
    dispatch({
      type: 'BLOG_ADD_LIKE',
      data: blogs
    })
  }
}

export const removeLike = data => {
  return async dispatch => {
    await likeService.remove(data.id)
    dispatch({
      type: 'REMOVE_LIKE',
      data: data
    })
  }
}

export const initialiseLikes = (state = [], action) => {
  return async dispatch => {
    const allLikes = await likeService.getAll()
    dispatch({
      type: "INIT_LIKES",
      data: allLikes
    })
  }
}

export default likeReducer
