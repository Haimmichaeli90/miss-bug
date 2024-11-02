import fs from 'fs'

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


function query(filterBy={}) {
  let filteredBugs = bugs
  if (filterBy.txt) {
    const regExp = new RegExp(filterBy.txt, 'i')
    filteredBugs = filteredBugs.filter((bug) => regExp.test(bug.title))
  }
  if (filterBy.minSeverity) {
    filteredBugs = filteredBugs.filter((bug) => bug.severity >= filterBy.minSeverity)
  }

  getNextBug(filteredBugs)

  return Promise.resolve(filteredBugs)
}

function getNextBug(bugs){
    bugs.forEach((bug,idx) => {
      bug.prevId=bugs[idx-1]?bugs[idx-1]._id: bugs[bugs.length-1]._id 
      bug.nextId=bugs[idx+1]?bugs[idx+1]._id:bugs[0]._id
    });
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
    
    bugToSave= {...bugs[bugIdx], ...bugToSave,updateAt: Date.now()}
    bugs[bugIdx]=bugToSave

  } else {
    bugToSave._id = utilService.makeId()
    bugToSave.createdAt=Date.now()
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

// TODO:Convert to PDF service PDF service

// const STORAGE_KEY = 'bugDB'
// _createBugs()

// function _createBugs() {
//   let bugs = utilService.loadFromStorage(STORAGE_KEY)
//   if (!bugs || !bugs.length) {
//     bugs = [
//       {
//         title: 'Infinite Loop Detected',
//         severity: 4,
//         _id: '1NF1N1T3'
//       },
//       {
//         title: 'Keyboard Not Found',
//         severity: 3,
//         _id: 'K3YB0RD'
//       },
//       {
//         title: '404 Coffee Not Found',
//         severity: 2,
//         _id: 'C0FF33'
//       },
//       {
//         title: 'Unexpected Response',
//         severity: 1,
//         _id: 'G0053'
//       }
//     ]
//     utilService.saveToStorage(STORAGE_KEY, bugs)
//   }
// }
