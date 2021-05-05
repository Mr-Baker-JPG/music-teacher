import * as React from "react"
import { Modal } from "react-bootstrap"
import Button from "../components/Button"
import {
  faArrowLeft,
  faArrowRight,
  faArrowsAltH,
  faHeadphones,
  faSearchMinus,
  faSearchPlus,
} from "@fortawesome/free-solid-svg-icons"

export function ModalLink({ handleShow, children }) {
  return (
    <a
      style={{ color: "blue", textDecoration: "underline" }}
      onClick={handleShow}
    >
      {children}
    </a>
  )
}

export default function HelpModal({ show, handleClose }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Music Teacher::Help</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Button
          title="Zoom in"
          className={`btn-outline-dark`}
          onClick={() => {}}
          icon={faSearchPlus}
        />
        <Button
          title="Zoom out"
          className={`btn-outline-dark`}
          onClick={() => {}}
          icon={faSearchMinus}
        />
        <p>Zoom in/out</p>
        <br></br>
        <Button
          title={"Backing Off"}
          className={`btn-outline-dark`}
          onClick={e => {}}
        />

        <Button
          title={"Backing Off"}
          className={`btn-outline-dark`}
          onClick={e => {}}
        />
        <p>Toggles backing track</p>
        <br></br>
        <Button
          title={"Metronome Off"}
          className={`btn-outline-dark`}
          onClick={e => {}}
        />

        <Button
          title={"Metronome Off"}
          className={`btn-outline-dark`}
          onClick={e => {}}
        />
        <p>Toggles metronome</p>
        <br></br>
        <Button
          title="Select cursor"
          className={`btn-outline-dark `}
          onClick={e => {}}
          icon={faHeadphones}
        />
        <p>Click + x to cut audio clip</p>
        <br></br>
        <Button
          title="Shift audio in time"
          className={`btn-outline-dark `}
          onClick={e => {}}
          icon={faArrowsAltH}
        />
        <p>Click and drag to shift audio clip</p>
        <br></br>
        <Button
          className={`btn-outline-dark `}
          title="Resize audio clip from the left"
          onClick={e => {}}
          icon={faArrowLeft}
        />
        <Button
          className={`btn-outline-dark `}
          title="Resize audio clip from the right"
          onClick={e => {}}
          icon={faArrowRight}
        />
        <p>Resize the left/right side of a clip.</p>
        <p>(gif) alligning chord to project tempo</p>
        <br></br>
      </Modal.Body>
    </Modal>
  )
}
