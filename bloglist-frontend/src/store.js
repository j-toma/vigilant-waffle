import thunk from 'redux-thunk'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import blogReducer from './reducers/blogReducer'
import loginReducer from './reducers/loginReducer'
import usersReducer from './reducers/userReducer'
import commentReducer from './reducers/commentReducer'
import notificationReducer from './reducers/notificationReducer'

const reducer = combineReducers({
  comments: commentReducer,
  blogs: blogReducer,
  user: loginReducer,
  users: usersReducer,
  notification: notificationReducer,
})

const store = createStore(reducer, applyMiddleware(thunk))
export default store
