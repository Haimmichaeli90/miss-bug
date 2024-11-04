import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'


const app = express()

app.use(express.static('public'))
app.use(cookieParser())

app.get('/api/bug', (req, res) => {
    // const views = req.cookies.views ? parseInt(req.cookies.views) : 0

    // if (views >= 3) {
    //     return res.status(429).send('You have reached the maximum number of views for now')
    // }

    // // עדכון ספירת העוגייה
    // res.cookie('views', views + 1, { maxAge: 60 * 60 * 1000 }) // 1 שעה
    bugService.query()
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
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
    const { bugId } = req.params
    let visitedBugs = req.cookies.visitedBugs ? JSON.parse(req.cookies.visitedBugs) : []

    if (!visitedBugs.includes(bugId)) {
        visitedBugs.push(bugId)
    }

    if (visitedBugs.length > 3) {
        return res.status(401).send('Wait for a bit')
    }
    console.log('User visited the following bugs:', visitedBugs)

    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7 * 1000, httpOnly: true })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
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




