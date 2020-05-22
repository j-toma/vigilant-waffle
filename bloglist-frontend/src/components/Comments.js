import React from 'react'
import { connect } from 'react-redux'
import Heading from './Heading'
import { ListGroup } from 'react-bootstrap'

let Comments = props => {
  console.log('props in Comments.js:', props)
  //const commentIds = props.blogComments.map(x => x.id)
  const comments = props.comments.filter(comment => props.blogComments.includes(comment.id))
  console.log('comments (after filter in Comments.js):', comments)
  // remove comments for deleted blogs
  // delte blogs still causes problem
  //console.log('props.comments before remove null:', props.comments)
  //let comments = props.comments.filter(x => x)
  //console.log('comments after remove null:', comments
  //console.log('props.comments:', props.comments)
  //const comments = props.comments.filter(comment => comment.blog.id === props.blog)
  //console.log('comments after filter:', comments)

  return (
    <div>
      <Heading text="Comments" type="h3" />
      <ListGroup as="ul">
        {
          comments.length 
            ? comments.map((comment,i) => 
              <ListGroup.Item as="li" key={`${i}-comment`}>{comment.content}</ListGroup.Item>)
            : <ListGroup.Item as="li">No comments yet, feel free to leave one!</ListGroup.Item>
        }
      </ListGroup>
    </div>
  )
}

const mapStateToProps = state => {
  return {
    comments: state.comments
  }
}

export default connect(mapStateToProps, null)(Comments)
//export default Comments
