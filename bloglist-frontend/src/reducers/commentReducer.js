import blogService from '../services/blog'
import userService from '../services/user'
import commentService from '../services/comment'

const commentReducer = (state=[], action) => {
  switch(action.type) {
    case 'INIT_COMMENTS':
      return [...action.data]
    case 'CREATE_COMMENT':
      return [...state, action.data]
    default:
      return state
    }
}

export const addComment = data => {
  console.log('data received in reducer:', data)
  return async dispatch => {
    const comment = await commentService.create(data)
    dispatch({
      type: 'CREATE_COMMENT',
      data: comment
    })
    const users = await userService.getAll()
    dispatch({
      type: 'USER_ADD_COMMENT',
      data: users
    })
    const blogs = await blogService.getAll()
    dispatch({
      type: 'BLOG_ADD_COMMENT',
      data: blogs
    })
  }
}

export const initialiseComments = (state = [], action) => {
  return async dispatch => {
    const allComments = await commentService.getAll()
    dispatch({
      type: "INIT_COMMENTS",
      data: allComments
    })
  }
}

export default commentReducer
