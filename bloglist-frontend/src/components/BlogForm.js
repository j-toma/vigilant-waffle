import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import { createBlog } from '../reducers/blogReducer'
import Heading from './Heading'
import { Form, Button } from 'react-bootstrap'

let BlogForm = props => {
  console.log('props in BlogForm:', props)

  const handleSubmit = (event) => {
    event.preventDefault()
    props.createBlog({
      title: event.target.title.value,
      author: event.target.author.value,
      url: event.target.url.value
    })
    event.target.reset()
    props.history.push('/')
  }

  return (
    <>
      <Heading text="Create Blog" type="h3" />
      <Form onSubmit={handleSubmit}>
        <Form.Label htmlFor="title">Title:</Form.Label>
        <Form.Control type="text" id="title" name="title" />
        <Form.Label htmlFor="author">Author:</Form.Label>
        <Form.Control type="text" id="author" name="author" />
        <Form.Label htmlFor="url">URL:</Form.Label>
        <Form.Control type="text" id="url" name="url" />
        <Button id="create-new-blog" variant="success" type="submit">Create</Button>
      </Form>
    </>
  )
}

const mapDispatchToProps = {
  createBlog
  }
BlogForm = withRouter(BlogForm)
export default connect(null, mapDispatchToProps)(BlogForm)
