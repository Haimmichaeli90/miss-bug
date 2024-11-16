import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { bugService } from './services/bug.service.js'
import { userService } from './services/user.service.js'

const app = express()

// Config the Express App
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// List
app.get('/api/bug', (req, res) => {
  const filterBy = {
    txt: req.query.txt || '',
    severity: +req.query.severity || 0,
    labels: req.query.labels || '',
    userId: req.query.userId || '',
  }
  const sortBy = {
    type: req.query.type || '',
    desc: req.query.desc || 1,
  }
  if (req.query.pageIdx) filterBy.pageIdx = req.query.pageIdx
  bugService.query(filterBy, sortBy).then((bugs) => {
    // console.log('Got Bugs', bugs)
    res.send(bugs)
  })
})

// PDF
app.get('/api/bug/pdf', (req, res) => {
  bugService
    .getPdf()
    .then((r) => {
      res.send(r)
    })
    .catch((err) => {
      loggerService.error('Cannot download Buds Pdf', err)
      res.status(400).send('Cannot download Buds Pdf')
    })
})

// Read
app.get('/api/bug/:bugId', (req, res) => {
  const { bugId } = req.params
  let visitedBugIds = req.cookies.visitedBugIds || []
  if (!visitedBugIds.includes(bugId)) visitedBugIds.push(bugId)
  if (visitedBugIds.length > 3) return res.status(401).send('Wait for a bit')
  bugService
    .getById(bugId)
    .then((bug) => {
      res.cookie('visitedBugIds', visitedBugIds, { maxAge: 1000 * 60 * 3 })
      res.send(bug)
    })
    .catch((err) => {
      console.log('Error:', err)
      res.status(401).send('Cannot get bug')
    })
})

// Delete
app.delete('/api/bug/:bugId', (req, res) => {
  const { loginToken } = req.cookies
  const loggedinUser = userService.validateToken(loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot delete bug')

  const { bugId } = req.params
  bugService
    .remove(bugId, loggedinUser)
    .then(() => {
      res.send(`Bug id : ${bugId} deleted`)
    })
    .catch((err) => {
      console.log('Had issues :', err)
      res.status(401).send('Cannot remove bug')
    })
})

// Create
app.post('/api/bug', (req, res) => {
  const { loginToken } = req.cookies
  const loggedinUser = userService.validateToken(loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot add bug')

  const bug = req.body
  console.log('bug:', bug)
  delete loggedinUser.username
  bug.creator = loggedinUser

  bugService.save(bug).then((addedBug) => {
    res.send(addedBug)
  })
})

// Update
app.put('/api/bug', (req, res) => {
  const { loginToken } = req.cookies
  const loggedinUser = userService.validateToken(loginToken)
  if (!loggedinUser) return res.status(401).send('Cannot update bug')

  const bug = req.body
  console.log('bug:', bug)

  bugService
    .save(bug, loggedinUser)
    .then((savedBug) => {
      res.send(savedBug)
    })
    .catch((err) => {
      console.log('Had issues:', err)
    })
})

// USER
app.get('/api/user', (req, res) => {
  userService
    .query()
    .then((users) => res.send(users))
    .catch((err) => res.status(500).send('Cannot get users'))
})

app.get('/api/user/:userId', (req, res) => {
  const { userId } = req.params

  userService
    .getById(userId)
    .then((user) => res.send(user))
    .catch((err) => res.status(500).send('Cannot get user'))
})

app.delete('/api/user/:userId', (req, res) => {
  const { userId } = req.params
  bugService
    .hasBugs(userId)
    .then(() => {
      userService
        .remove(userId)
        .then(() => res.send('Removed!'))
        .catch((err) => res.status(401).send(err))
    })
    .catch((err) => res.status(401).send('Cannot delete user with bugs'))
})

// Autherize
app.post('/api/login', (req, res) => {
  console.log('req.body', req.body)
  const credentials = {
    username: req.body.username,
    password: req.body.password,
  }
  // const credentials = req.body
  userService
    .checkLogin(credentials)
    .then((user) => {
      if (user) {
        const loginToken = userService.getLoginToken(user)
        res.cookie('loginToken', loginToken)
        res.send(user)
      } else {
        res.status(401).send('Invalid credentials')
      }
    })
    .catch((err) => res.status(401).send(err))
})

app.post('/api/logout', (req, res) => {
  res.clearCookie('loginToken')
  res.send('Logged out')
})

app.post('/api/signup', (req, res) => {
  const credentials = req.body
  console.log('credentials', credentials)

  userService.save(credentials).then((user) => {
    const loginToken = userService.getLoginToken(user)
    res.cookie('loginToken', loginToken)
    res.send(user)
  })
})

// Fallback route
app.get('/**', (req, res) => {
  res.sendFile(path.resolve('public/index.html'))
})

const port = 3030

app.listen(port, () => {
  console.log(`Server is ready at ${port} http://127.0.0.1:${port}/`)
})
