import * as React from "react"
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

import ButtonGroup from "./ButtonGroup"
import Button from "./Button"

const STATE_CURSOR = "STATE_CURSOR"
const STATE_SELECT = "STATE_SELECT"
const STATE_SHIFT = "STATE_SHIFT"
const STATE_FADEIN = "STATE_FADEIN"
const STATE_FADEOUT = "STATE_FADEOUT"
const STATE_RESIZE_LEFT = "STATE_RESIZE_LEFT"
const STATE_RESIZE_RIGHT = "STATE_RESIZE_RIGHT"

const AudioToolBar = ({ emitter }) => {
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [stateButton, setStateButton] = React.useState(STATE_CURSOR)

  return (
    <div id="top-bar" className="playlist-top-bar">
      <div className="playlist-toolbar">
        <ButtonGroup>
          <Button
            title="Pause"
            onClick={() => {
              emitter.emit("pause")
              setIsPlaying(false)
            }}
            icon={faPause}
            className={`btn-outline-warning ${!isPlaying ? "hidden" : ""}`}
          />
          <Button
            title="Play"
            className={`btn-outline-success rounded-left ${
              isPlaying ? "hidden" : ""
            }`}
            icon={faPlay}
            onClick={() => {
              emitter.emit("play")
              setIsPlaying(true)
            }}
          />
          <Button
            title="Stop"
            icon={faStop}
            className="btn-outline-danger"
            onClick={() => {
              emitter.emit("stop")
              setIsPlaying(false)
            }}
          />
        </ButtonGroup>

        <ButtonGroup>
          <Button
            title="Select cursor"
            className={`btn-outline-dark ${
              stateButton === STATE_CURSOR && "active"
            }`}
            onClick={e => {
              emitter.emit("statechange", "cursor")
              setStateButton(STATE_CURSOR)
            }}
            icon={faHeadphones}
          />
          <Button
            title="Select audio region"
            className={`btn-outline-dark ${
              stateButton === STATE_SELECT && "active"
            }`}
            onClick={e => {
              emitter.emit("statechange", "cursor")
              setStateButton(STATE_SELECT)
            }}
            icon={faItalic}
          />
          <Button
            title="Shift audio in time"
            className={`btn-outline-dark ${
              stateButton === STATE_SHIFT && " active"
            }`}
            onClick={e => {
              emitter.emit("statechange", "shift")
              setStateButton(STATE_SHIFT)
            }}
            icon={faArrowsAltH}
          />

          <Button
            className={`btn-outline-dark ${
              stateButton === STATE_RESIZE_LEFT && "active"
            }`}
            title="Resize audio clip from the left"
            onClick={e => {
              emitter.emit("statechange", "resizeleft")
              setStateButton(STATE_RESIZE_LEFT)
            }}
            icon={faArrowLeft}
          />
          <Button
            className={`btn-outline-dark ${
              stateButton === STATE_RESIZE_RIGHT && "active"
            }`}
            title="Resize audio clip from the right"
            onClick={e => {
              emitter.emit("statechange", "resizeright")
              setStateButton(STATE_RESIZE_RIGHT)
            }}
            icon={faArrowRight}
          />
        </ButtonGroup>
      </div>
    </div>
  )
}

export default AudioToolBar