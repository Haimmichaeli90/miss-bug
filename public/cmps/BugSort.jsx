

export function BugSort({ onSetSort, sortBy }) {
    const handleSortChange = (ev) => {
        const { name, value } = ev.target
        const sortDirection = value === sortBy.type ? (sortBy.desc === 1 ? -1 : 1) : 1
        onSetSort({ type: value, desc: sortDirection })
    }

    return (
        <div className="bug-sort">
            <select name="sortBy" value={sortBy.type} onChange={handleSortChange}>
                <option value="title">Sort by Title</option>
                <option value="severity">Sort by Severity</option>
                <option value="createdAt">Sort by Created At</option>
            </select>
        </div>
    )
}
