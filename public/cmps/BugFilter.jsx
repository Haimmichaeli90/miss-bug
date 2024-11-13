export function BugFilter({ onSetFilter, filterBy }) {
    const handleChange = (ev) => {
        const { name, value } = ev.target
        onSetFilter({ [name]: value })
    }

    return (
        <div className="bug-filter">
            <input
                type="text"
                name="txt"
                placeholder="Filter by text"
                value={filterBy.txt || ''}
                onChange={handleChange}
            />
            <input
                type="number"
                name="severity"
                placeholder="Filter by severity"
                value={filterBy.severity || ''}
                onChange={handleChange}
            />
            <input
                type="text"
                name="labels"
                placeholder="Filter by labels (comma separated)"
                value={filterBy.labels || ''}
                onChange={handleChange}
            />
        </div>
    )
}