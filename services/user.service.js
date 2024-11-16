import fs from 'fs'
import Cryptr from 'cryptr'

import { utilService } from './util.service.js'
let users = utilService.readJsonFile('data/user.json')
const cryptr = new Cryptr(process.env.SECRET1 || 'secret-puk-1234')

export const userService = {
  query,
  checkLogin,
  remove,
  getById,
  getLoginToken,
  validateToken,
  save,
}

function query() {
  return Promise.resolve(users)
}

function getLoginToken(user) {
  return cryptr.encrypt(JSON.stringify(user))
}

function validateToken(loginToken) {
  const json = cryptr.decrypt(loginToken)
  const loggedinUser = JSON.parse(json)
  return loggedinUser
}

function checkLogin({ username, password }) {
  let user = users.find((user) => user.username === username && user.password === password)

  if (user) {
    user = {
      _id: user._id,
      fullname: user.fullname,
      isAdmin: user.isAdmin,
    }
  }

  return Promise.resolve(user)
}

function save(user) {
  user = {
    _id: utilService.makeId(),
    fullname: user.fullname,
    password: user.password,
    username: user.username,
  }
  users.push(user)
  return _saveUsersToFile().then(() => user)
}

function remove(userId) {
  console.log(userId)
  const idx = users.findIndex((user) => user._id === userId)
  if (idx === -1) return Promise.reject('sorry not found')
  users.splice(idx, 1)

  return _saveUsersToFile()
}

function getById(userId) {
  const user = users.find((user) => user._id === userId)
  if (!user) return Promise.reject('user not found')
  return Promise.resolve(user)
}

function _saveUsersToFile() {
  return new Promise((resolve, reject) => {
    const content = JSON.stringify(users, null, 2)
    fs.writeFile('./data/user.json', content, (err) => {
      if (err) {
        console.error(err)
        return reject(err)
      }
      resolve()
    })
  })
}
