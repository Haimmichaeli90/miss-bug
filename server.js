import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'


const app = express()

app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug'
    , (req, res) => {
        bugService.query()
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bugs',err)
            res.status(500)('Cannot get bugs')
        })
    })


app.get('/api/bug/save', (req, res) => {
    
    const bugToSave = {
        _id: req.query._id || '',
        title: req.query.title || '',
        description: req.query.description || '',
        severity: +req.query.severity || 0,
    }

    bugService.save(bugToSave)
    .then(savedBug => res.send(savedBug))
    .catch((err => {
        loggerService.error('Cannot save bug',err)
        res.status(500).send('Cannot save bug',err)
    }))
})   


app.get('/api/bug/:bugId', (req, res) => {
    const {bugId} = req.params
    bugService.getById(bugId)
    .then(bug => res.send(bug))
    .catch(err => {
        loggerService.error('Cannot get bug',err)
        res.status(500).send('Cannot get bug')
    })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const {bugId} = req.params
    bugService.remove(bugId)
    .then(()=> res.send(bugId + 'Removed Successfully! from server'))
    .catch(err => {
        loggerService.error('Cannot remove car',err)
        res.status(500).send('Cannot remove car')
    })
})

app.get('/api/logs', (req, res) => {
    const path = process.cwd()
    res.sendFile(path + '/logs/backend.log')
})


const port = 3030
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))




