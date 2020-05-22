import React from 'react'
import { connect } from 'react-redux'
import Heading from './Heading'
import { Table, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const BlogList = props => {
  console.log('props at BlogList:', props)

  return ( 
    <>
      <Heading text="All Blogs" type="h4" />
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Title</th>
            <th>author</th>
            <th>Num. Comments</th>
            <th>Num. Likes</th>
          </tr>
        </thead>
        <tbody>
          { props.blogs.map(blog =>
            <tr key={blog.id}>
              <td>
                <Link className="bloglist" to={`/blogs/${blog.id}`}>
                  <p>{ blog.title }</p>
                </Link>
              </td>
              <td>
                  <p>{blog.author}</p>
              </td>
              <td>
                  <p>{blog.comments.length}</p>
              </td>
              <td>
                  <p>{blog.likes}</p>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Link to="/create"><Button id="create-blog" variant="primary">Create Blog</Button></Link>
    </>
  )

}

const mapStateToProps = state => {
  return {
    comments: state.comments,
    blogs: state.blogs,
    users: state.users
  }
}

export default connect(mapStateToProps, null)(BlogList)

