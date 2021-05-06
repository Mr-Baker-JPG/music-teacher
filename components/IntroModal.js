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
      <Modal.Body>
        <p>
          This is my prototype for Web DAW Teacher: a web-based interactive tool
          to teach the basics of Digital Audio Workstations (DAWs). This sample
          tutorial page demonstrates the potential for external and
          teacher-created lessons to teach music history, composition, and DAW
          aptitude.
        </p>
      </Modal.Body>
    </Modal>
  )
}
