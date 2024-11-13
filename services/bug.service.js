import fs from 'fs'

const PAGE_SIZE = 5
import { utilService } from './util.service.js'

const bugs = utilService.readJsonFile('data/bugs.json')

export const bugService = {
  query,
  getById,
  save,
  remove,

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
    filteredBugs = filteredBugs.filter((bug) => bug.severity === filterBy.severity)
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

function remove(bugId) {
  const bugIdx = bugs.findIndex((bug) => bug._id === bugId)
  bugs.splice(bugIdx, 1)
  return _saveBugsToFile()
}

// TODO:Updated at key
function save(bugToSave) {
  if (bugToSave._id) {
    const bugIdx = bugs.findIndex((bug) => bug._id === bugToSave._id)

    bugToSave = { ...bugs[bugIdx], ...bugToSave, updateAt: Date.now() }
    bugs[bugIdx] = bugToSave

  } else {
    bugToSave._id = utilService.makeId()
    bug.labels = ['critical', 'need-CR']
    bugToSave.createdAt = Date.now()
    bugs.unshift(bugToSave)
  }
  return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(bugs, null, 4)
    fs.writeFile('data/bugs.json', data, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}
