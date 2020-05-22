import React from 'react'
import Heading from './Heading'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { Form, Button } from 'react-bootstrap'
import { addComment } from '../reducers/commentReducer'

let CommentForm = props => {
  //const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
  console.log('props in COmmentFOrmm:', props)

  const handleSubmit = (event) => {
    event.preventDefault()
    props.addComment({
      blog: props.blog,
      content: event.target.content.value
    })
    event.target.reset()
    //props.history.push('/')
  }

  //const handleSubmit = (event) => {
  //  console.log('intended content:', event.target.content.value)
  //  event.preventDefault()
  //  comment({ 
  //    blog: blog.id,
  //    content: event.target.content.value
  //  })
  //  event.target.reset()
  //}

  return (
    <div>
      <Heading text="Leave a Comment" type="h4" />
      <Form onSubmit={handleSubmit}>
        <Form.Control type="text" name="content" />
        <Button type="submit" variant="success">Add Comment</Button>
      </Form>
    </div>
  )
}

const mapDispatchToProps = {
  addComment
}
//CommentForm = withRouter(CommentForm)
export default connect(null, mapDispatchToProps)(CommentForm)
//export default CommentForm
