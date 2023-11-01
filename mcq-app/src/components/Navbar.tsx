import { useState } from "react"

export default function Navbar(props: { isOpened: boolean }) {
	const [opened, setOpened] = useState(props.isOpened)
}


