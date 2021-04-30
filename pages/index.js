import * as React from "react"
import _ from "lodash"
import Head from "next/head"
import {
  faArrowCircleRight,
  faArrowLeft,
  faArrowRight,
  faArrowsAltH,
  faHeadphones,
  faItalic,
  faPause,
  faPlay,
  faRedo,
  faStop,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
const STATE_CURSOR = "STATE_CURSOR"
const STATE_SELECT = "STATE_SELECT"
const STATE_SHIFT = "STATE_SHIFT"
const STATE_FADEIN = "STATE_FADEIN"
const STATE_FADEOUT = "STATE_FADEOUT"
const STATE_RESIZE_LEFT = "STATE_RESIZE_LEFT"
const STATE_RESIZE_RIGHT = "STATE_RESIZE_RIGHT"

export default function Home() {
  const [emitter, setEmitter] = React.useState(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [stateButton, setStateButton] = React.useState(STATE_CURSOR)

  return (
    <main className="container">
      <div className="wrapper">
        <article className="post">
          <header className="post-header">
            <h1 className="post-title">Individual Track State</h1>
            <p className="lead">
              Vocals track can not be shifted in time, only the Drums track.
            </p>
          </header>
          <div className="post-content">
            <div id="top-bar" className="playlist-top-bar">
              <div className="playlist-toolbar">
                <div className="btn-group btn-playlist-state-group">
                  <button
                    type="button"
                    className={`btn-pause btn btn-outline-warning ${
                      !isPlaying ? "hidden" : ""
                    }`}
                    title="Pause"
                    onClick={() => {
                      emitter.emit("pause")
                      setIsPlaying(false)
                    }}
                  >
                    <FontAwesomeIcon icon={faPause} />
                  </button>
                  <button
                    type="button"
                    className={`rounded-left btn-play btn btn-outline-success ${
                      isPlaying ? "hidden" : ""
                    }`}
                    title="Play"
                    onClick={() => {
                      emitter.emit("play")
                      setIsPlaying(true)
                    }}
                  >
                    <FontAwesomeIcon aria-hidden={!isPlaying} icon={faPlay} />
                  </button>
                  <button
                    type="button"
                    className="btn-stop btn btn-outline-danger"
                    title="Stop"
                    onClick={() => {
                      emitter.emit("stop")
                      setIsPlaying(false)
                    }}
                  >
                    <FontAwesomeIcon aria-hidden={!isPlaying} icon={faStop} />
                  </button>

                  <button
                    type="button"
                    className={`btn-cursor btn btn-outline-dark ${
                      stateButton === STATE_CURSOR && "active"
                    }`}
                    title="Select cursor"
                    onClick={e => {
                      emitter.emit("statechange", "cursor")
                      setStateButton(STATE_CURSOR)
                    }}
                  >
                    <FontAwesomeIcon icon={faHeadphones} />
                  </button>
                  <button
                    type="button"
                    className={`btn-cursor btn btn-outline-dark ${
                      stateButton === STATE_SELECT && "active"
                    }`}
                    title="Select audio region"
                    onClick={e => {
                      emitter.emit("statechange", "cursor")
                      setStateButton(STATE_SELECT)
                    }}
                  >
                    <FontAwesomeIcon icon={faItalic} />
                  </button>
                  <button
                    type="button"
                    className={`btn-shift btn btn-outline-dark ${
                      stateButton === STATE_SHIFT && "active"
                    }`}
                    title="Shift audio in time"
                    onClick={e => {
                      emitter.emit("statechange", "shift")
                      setStateButton(STATE_SHIFT)
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowsAltH} />
                  </button>
                  <button
                    type="button"
                    className={`btn-resize-left btn btn-outline-dark ${
                      stateButton === STATE_RESIZE_LEFT && "active"
                    }`}
                    title="Resize audio clip from the left"
                    onClick={e => {
                      emitter.emit("statechange", "resizeleft")
                      setStateButton(STATE_RESIZE_LEFT)
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  <button
                    type="button"
                    className={`btn-shift btn btn-outline-dark ${
                      stateButton === STATE_RESIZE_RIGHT && "active"
                    }`}
                    title="Resize audio clip from the right"
                    onClick={e => {
                      emitter.emit("statechange", "resizeright")
                      setStateButton(STATE_RESIZE_RIGHT)
                    }}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                  <div className="btn-group btn-select-state-group">
                    <span
                      className="btn-loop btn btn-success disabled"
                      title="loop a selected segment of audio"
                    >
                      <FontAwesomeIcon icon={faRedo} />
                    </span>
                    <span
                      title="keep only the selected audio region for a track"
                      className="btn-trim-audio btn btn-primary disabled"
                    >
                      Trim
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <WavePlayer setEmitter={setEmitter} />
          </div>
        </article>
      </div>
    </main>
  )
}
