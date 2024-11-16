import { bugService } from '../services/bug.service.js'
import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugSort } from '../cmps/BugSort.jsx'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'
import { BugList } from '../cmps/BugList.jsx'

const { useState, useEffect } = React
const { Link } = ReactRouterDOM


export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [maxPage, setMaxPage] = useState(null)
    
    const [filterBy, setFilterBy] = useState({
        txt: '',
        severity: 0,
        sortBy: { type: 'title', desc: 1 },
        pageIdx: 0,
        labels: []
    })

    console.log('bugindex', bugs)

    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy).then(setBugs)
    }

    function onSetFilter(newFilter) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...newFilter }))
    }

    function onSetSort(sortBy) {
        setFilterBy(prevFilter => ({
            ...prevFilter,
            sortBy: { ...prevFilter.sortBy, ...sortBy }
        }))
    }

    function onChangePageIdx(diff) {
        setFilterBy(prevFilter => {
            let newPageIdx = prevFilter.pageIdx + diff
            if (newPageIdx < 0) newPageIdx = 0
            if (newPageIdx > maxPage) newPageIdx = maxPage + 1
            if (newPageIdx === maxPage) newPageIdx = maxPage - 1
            return { ...prevFilter, pageIdx: newPageIdx, }
        })
    }


    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Successfully!');
                setBugs(prevBugs => prevBugs.filter(bug => bug._id !== bugId))
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const title = prompt('Bug title?')
        const severity = +prompt('Bug severity?')
        const bug = { title, severity }
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs(prevBugs => [...prevBugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                setBugs(prevBugs =>
                    prevBugs.map(currBug =>
                        currBug._id === savedBug._id ? savedBug : currBug
                    )
                )
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    return (
        <div>
            <main className="main-layout">
                <BugFilter onSetFilter={onSetFilter} filterBy={{ ...filterBy }} />
                <BugSort onSetSort={onSetSort} sortBy={{ ...filterBy.sortBy }} />
                <button className="btn" onClick={onAddBug}>
                    <Link to="/bug/edit">Add Bug ⛐</Link>
                </button>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
                <div className="paging flex">
                    <button
                        className="btn"
                        onClick={() => onChangePageIdx(-1)}
                        // disabled={filterBy.pageIdx <= 0}
                    >
                        Previous
                    </button>
                    <span>{filterBy.pageIdx + 1}</span>
                    <button
                        className="btn"
                        onClick={() => onChangePageIdx(1)}
                    >
                        Next
                    </button>
                </div>
            </main>
        </div>
    )
}
