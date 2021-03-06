import axios from 'axios'
const baseUrl = '/api/comments'

let token = null

const setToken = newToken => {
  token = `bearer ${newToken}`
  console.log('token in blog reducer set Token:', token)
}

const create = async newObject => {
  const config = {
    headers: { Authorization: token }
  }
  console.log('token in blog reducer create:', token)
  const response = await axios.post(baseUrl, newObject, config)
  return response.data
}

const getAll = () => {
  const request = axios.get(baseUrl)
  return request.then(response => response.data)
}

export default { getAll, create, setToken }
