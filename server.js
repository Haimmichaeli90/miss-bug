import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { pdfService } from './services/pdf.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        severity: +req.query.severity || 0,
        labels: req.query.labels || ''
    }
    if (req.query.pageIdx) filterBy.pageIdx = req.query.pageIdx
    if (req.query.sortBy) filterBy.sortBy = JSON.parse(req.query.sortBy)

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
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


app.post('/api/bug', (req, res) => {
    const bug = req.body
    bugService.save(bug)
        .then((addedBug) => {
            res.send(addedBug)
        })
        .catch((err) => {
            console.log('Had issues adding:', err)
        })
})

app.put('/api/bug', (req, res) => {
    const bug = req.body
    bugService.save(bug)
        .then(savedBug => {
            res.send(savedBug)
        })
        .catch((err) => {
            console.log('Had issues editing:', err)
        })
})




app.delete('/api/bug/:bugId', (req, res) => {
    const {bugId} = req.params
    bugService.remove(bugId)
    .then(()=> res.send(bugId + 'Removed Successfully! from server'))
    .catch(err => {
        loggerService.error('Cannot remove car',err)
        res.status(500).send('Cannot remove car')
    })
})

app.get('/pdf', (req, res) => {
    const path = './pdfs/'
    console.log('in pdf')
    
  
    bugService.query().then(bugs => {
      bugs.sort((a, b) => b.createdAt - a.createdAt)
      const rows = bugs.map(({ title, description, severity }) => [title, description, severity])
      const headers = ['Title', 'Description', 'Severity']
  
      const fileName = 'bugs'
      pdfService.createPdf({ headers, rows, title: 'Bugs report', fileName }).then(() => {
        res.setHeader('Content-Type', 'application/pdf');
        res.sendFile(`${process.cwd()}/pdfs/${fileName}.pdf`);
        
     }).catch((err)=>{
  
        console.error(err);
        loggerService.error('Cannot download Pdf',err)
        res.send('We have a problem, try agin soon')
    })
 })
  

})

app.get('/api/logs', (req, res) => {
    const path = process.cwd()
    res.sendFile(path + '/logs/backend.log')
})


const port = 3030
app.get('/', (req, res) => res.send('Hello there'))
app.listen(port, () => console.log(`Server listening on port http://127.0.0.1:${port}/`))




