import * as React from "react"
import _ from "lodash"
import Head from "next/head"

// Aaron, include the following:
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

// STOP

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
import AudioToolBar from "../components/AudioToolBar"
import TimeScale from "../library/waveform-playlist/src/TimeScale"

const tracks = [
  {
    src: "media/Reflections.3.mp3",
    zoomLevels: [50, 100, 200, 500, 1000, 3000, 5000],
    name: "Vocals",
    colorSelections: [
      {
        color: "green",
        name: "I",
        timeSelection: {
          start: 1,
          end: 4,
        },
      },
    ],
  },
  {
    src: "media/106.Metro.mp3",
    zoomLevels: [50, 100, 200, 500, 1000, 3000, 5000],
    hidden: true,
    states: {
      shift: false,
    },
    name: "metronome",
  },
  {
    src: "media/106.Brushes.mp3",
    zoomLevels: [50, 100, 200, 500, 1000, 3000, 5000],
    hidden: true,
    states: {
      shift: false,
    },
    name: "backing",
  },
]

const shortCuts = [
  { key: "space", command: "play" },
  { key: "x", command: "cutchannel" },
  { key: "c", command: "trim" },
  { key: "m", command: "startaudiorendering", opts: ["wav"] },
  { key: "s", command: "identify" },
]

const timeSignature = {
  bpm: 106,
  beatsPerMeasure: 4,
  noteValue: 4,
}

export default function Home() {
  const [emitter, setEmitter] = React.useState(null)
  const [show, setShow] = React.useState(false)

  const handleClose = () => setShow(false)
  const handleShow = () => setShow(true)

  return (
    <main className="container">
      <div className="wrapper">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">Individual Track State</h1>
            <p className="lead">Reflections in D- Duke Ellington</p>
          </header>
          <div className="post-content">
            <AudioToolBar emitter={emitter} />
            <WavePlayer
              setEmitter={setEmitter}
              tracks={tracks}
              shortCuts={shortCuts}
              timeSignature={timeSignature}
              name="Test"
            />
          </div>
        </article>
      </div>
      <p>
        The sample here is at a slower tempo then the metronome. Trim the sample
        to just the highlighted areas and allign them with the project tempo.
      </p>
      <br></br>
      <p>
        Duke Ellington-"From 1926 until his death in 1974,{" "}
        <a
          style={{ color: "blue", textDecoration: "underline" }}
          onClick={handleShow}
        >
          Duke Ellington
        </a>{" "}
        was an enduring presence on American airwaves, first as a curiosity on
        local radio, then as an exotic attraction on network radio, and finally
        as a senior statesman as part of the sputtering endgame of jazz on
        American television"
      </p>

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
    </main>
  )
}
