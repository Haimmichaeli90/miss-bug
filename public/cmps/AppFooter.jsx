import { showSuccessMsg } from '../services/event-bus.service.js'
const { useEffect } = React

export function AppFooter () {

    useEffect(() => {
        // component did mount when dependency array is empty
    }, [])

    return (
        <footer>
            <p>
                coffeeRights to all
            </p>
        </footer>
    )

}