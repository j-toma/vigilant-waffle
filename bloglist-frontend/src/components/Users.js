import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Heading from './Heading'
import { Table } from 'react-bootstrap'

const Users = props => {
  console.log('props in Users.js:', props)

  return (
    <>
      <Heading text="Users" type="h2" />
      <Table striped bordered hover size="md">
        <thead>
          <tr>
            <td>Author</td> 
            <td>Blogs Created</td>
            <td>Num. Comments</td>
          </tr>
        </thead>
        <tbody>
          { props.users.map(user => 
            <tr key={user.id}>
              <td>
                <Link to={`/users/${user.id}`}>{user.username}</Link>
              </td>
              <td>{user.blogs.length}</td>
              <td>{user.comments.length}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  )
}

const mapStateToProps = state => {
  return {
    users: state.users
  }
}

export default connect(mapStateToProps, null)(Users)
//export default Users
