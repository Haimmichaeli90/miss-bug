const { Link } = ReactRouterDOM

import { BugPreview } from './BugPreview.jsx'

export function BugList({ bugs, onRemoveBug, onEditBug }) {

    if (!bugs) return <div>Loading...</div>
    return (
        <section className="bug-list grid cards">
            {bugs.map(bug => (
                <article className="bug-preview card" key={bug._id}>
                    <BugPreview bug={bug} />
                    <div className="flex space-between">
                        <button className="btn" onClick={() => onEditBug(bug)}>
                            Edit
                        </button>
                        <button className="btn" onClick={() => onRemoveBug(bug._id)}>
                            Delete
                        </button>
                        <Link className="btn" to={`/bug/${bug._id}`}>
                            Details
                        </Link>
                    </div>
                </article>
            ))}
        </section>
    )
}
