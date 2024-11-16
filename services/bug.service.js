import fs from 'fs'

const PAGE_SIZE = 5
import { utilService } from './util.service.js'
import { pdfService } from './pdf.service.js'

const bugs = utilService.readJsonFile('data/bugs.json')

export const bugService = {
  query,
  getById,
  save,
  remove,
  hasBugs,
  getPdf
}

// TODO: next and prev bug
// TODO: Filter bugs


function query(filterBy = { txt: '', severity: 0, sortBy: { type: 'title', desc: 1 }, pageIdx: 0  }) {
  let filteredBugs = bugs
  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i')
    filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
  }
  if (filterBy.severity) {
    filteredBugs = filteredBugs.filter((bug) => bug.severity > filterBy.severity)
  }
  if (filterBy.labels && filterBy.labels.length) {
    const labelsToFilter = filterBy.labels
    bugs = bugs.filter((bug) =>
    labelsToFilter.every((label) => bug.labels.includes(label))
    )
  }
  const { sortBy } = filterBy
  if (sortBy) {
    const { type, desc = 1 } = sortBy
    filteredBugs.sort((a, b) => {
      if (type === 'title') {
        return desc * a.title.localeCompare(b.title)
      } else if (type === 'severity') {
        return desc * (a.severity - b.severity)
      } else if (type === 'createdAt') {
        return desc * (a.createdAt - b.createdAt)
      }
      return 0
    })
  }

  const pageIdx = filterBy.pageIdx || 0
  const startIdx = pageIdx * PAGE_SIZE
  filteredBugs = filteredBugs.slice(startIdx, startIdx + PAGE_SIZE)

  return Promise.resolve(filteredBugs)
}


function getById(bugId) {
  const bug = bugs.find((bug) => bug._id === bugId)
  if (!bug) return Promise.reject('cannot find bug' + bugId)
  return Promise.resolve(bug)
}

function remove(bugId, loggedinUser) {
  const idx = gBugs.findIndex((bug) => bug._id === bugId)
  if (idx === -1) return Promise.reject('No bug found')

  if (gBugs[idx].creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
    return Promise.reject('Not authorized delete this bug')
  }

  gBugs.splice(idx, 1)
  return _saveBugsToFile()
}

// TODO:Updated at key
function save(bug, loggedinUser) {
  if (bug._id) {
    const idx = gBugs.findIndex((currBug) => currBug._id === bug._id)
    if (idx === -1) return Promise.reject('No such bug')

    if (gBugs[idx].creator._id !== loggedinUser._id && !loggedinUser.isAdmin) {
      return Promise.reject('Not authorized update this bug')
    }
    gBugs[idx] = bug
  } else {
    bug.createdAt = Date.now()
    bug.labels = ['critical', 'need-CR']
    bug._id = _makeId()
    bug.description =
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, earum sed corrupti voluptatum voluptatem at.'
    gBugs.push(bug)
  }
  return _saveBugsToFile().then(() => bug)
}

function hasBugs(userId) {
  const hasBugs = gBugs.some((bug) => bug.creator._id === userId)

  if (hasBugs) return Promise.reject('Cannot remove user with bugs')

  return Promise.resolve()
}

function getPdf() {
  pdfService.buildBugsPDF(gBugs) //pdf bonus
  return Promise.resolve()
}

function _saveBugsToFile() {
  console.log('gBugs:', gBugs)
  return new Promise((resolve, reject) => {
    fs.writeFile('data/bug.json', JSON.stringify(gBugs, null, 2), (err) => {
      if (err) {
        console.log(err)
        reject('Cannot write to file')
      } else {
        console.log('Wrote Successfully!')
        resolve()
      }
    })
  })
}
