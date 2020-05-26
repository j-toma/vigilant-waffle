import React from 'react'
import { connect } from 'react-redux'
import { withRouter, Route, Link } from 'react-router-dom'
//import { likeBlog, removeBlog, unlikeBlog } from '../reducers/blogReducer'
import { updateBlog, removeBlog } from '../reducers/blogReducer'
import { addLike, removeLike } from '../reducers/likeReducer'
import Heading from './Heading'
import Comments from './Comments'
import CommentForm from './CommentForm'
import { Button } from 'react-bootstrap'


let Blog = props => {
  console.log('props in Blog.js:',props)
  const blog = props.blogs.find(blog => blog.id === props.blog)
  const comments = blog.comments.map(x => x.id)
  const likedBy = blog.likedBy.map(x => x.username)
  //const blog.likedBy.includes(props.user.username)
  //const comments = props.comments.filter(comment => comment.blog === props.blog)
  //const match = props.match

  const handleClick = (type, blog) => {
    if  (type === 'like') {
      console.log('in component Blog')
      console.log('blog to submit, blog.id:', blog.id)
      props.updateBlog(blog)
    //} else if ( type === 'unlike') {
    //  const likesOnBlog = props.likes.filter(x => x.blog.id === blog.id)
    //  console.log('likes on blog:', likesOnBlog)
    //  const likesWithUsername = likesOnBlog.find(x => x.user.username === props.user.username)
    //  console.log('likes on blog with username:', likesWithUsername)
    //  const like = likesWithUsername
    //  props.removeLike(like)
    } else {
      props.removeBlog(blog)
      props.history.push('/')
    }
  }


  return (
    <>
      { blog
        ? (
          <div>
            <Heading text={`Blog Title: ${blog.title}`} type="h3" />
            <p>
              Likes: {blog.likes} <br />
              Added by: {blog.user.username} <br />
              More Info: <a href={blog.url} target="_blank" rel="noopener roreferrer">{blog.url}</a>
            </p>
            <div>
              {
                likedBy.includes(props.user.username)
                ? <Button variant="primary" onClick={() => handleClick('like', blog)}>UnLike</Button>
                : <Button variant="primary" onClick={() => handleClick('like', blog)}>Like</Button>
              }
              {
                blog.user.username === props.user.username
                ? <Button variant="danger" onClick={() => handleClick('delete', blog)}>Delete</Button>
                : null
              }
              <hr />
              <CommentForm blog={blog.id} />
              <hr />
              <Comments blogComments={comments} />
            </div>
          </div>
        ) : null
      }
    </>
  )
}

const mapStateToProps = state => {
  return {
    //likes: state.likes,
    blogs: state.blogs,
    user: state.user
  }
}

const mapDispatchToProps = {
  updateBlog,
  //addLike,
  //removeLike,
  //unlikeBlog,
  //likeBlog,
  removeBlog
}

Blog = withRouter(Blog)
export default connect(mapStateToProps, mapDispatchToProps)(Blog)
             // <Link to={`${props.match.url}/comments`}>View Comments</Link>
             // <Route path={`${props.match.path}/comments`} render={() => <Comments comments={comments}/>} />
//
//export default Blog

//    <div style={blogStyle} className='blog'>
//      <div style={hideWhenExpanded}>
//        {blog.title} {blog.author}
//        <button onClick={() => setExpanded(!expanded)}>detail</button>
//        <button onClick={() => remove(blog.id, blog.title) }>remove</button>
//      </div>
//      <div style={showWhenExpanded}>
//        {blog.title} by {blog.author} <br />
//        <a href={blog.url}>{blog.url}</a> <br />
//        <div>
//          {blog.likes} likes
//          <div style={hideWhenLiked}>
//            <button value={blog.id} onClick={() => {handleLike({ blog }); setLiked(!liked)}}>like</button> <br />
//          </div>
//          <div style={showWhenLiked}>
//            <button value={blog.id} onClick={() => {handleUnlike({ blog }); setLiked(!liked)}}>unlike</button> <br />
//          </div>
//        </div>
//        added by {blog.user.name} <br />
//        <button onClick={() => setExpanded(!expanded)}>hide detail</button>
//      </div>
//    </div>
