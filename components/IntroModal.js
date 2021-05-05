import * as React from "react"
import { Modal } from "react-bootstrap"

export default function HelpModal() {
  const [show, setShow] = React.useState(true)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Web DAW Teacher</Modal.Title>
      </Modal.Header>
      <p>
        Hello. Greetings. Hola.
      </p>
      <Modal.Body>
        
      </Modal.Body>
    </Modal>
  )
}
