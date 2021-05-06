import { Navbar, Nav } from "react-bootstrap"
import Link from "next/link"

export default function NavBar() {
  return (
    <Navbar sticky="top" variant="light" bg="light">
      <Navbar.Brand>DAW Teacher</Navbar.Brand>
      <Nav>
        <Nav.Link href="/page.1">Lesson 1</Nav.Link>
        {/* <Nav.Link href="/page.2">Lesson 2</Nav.Link>
        <Nav.Link href="/page.3">Lesson 3</Nav.Link> */}
      </Nav>
    </Navbar>
  )
}
