//wheeeee
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

const STATE_CURSOR = "STATE_CURSOR"
const STATE_SELECT = "STATE_SELECT"
const STATE_SHIFT = "STATE_SHIFT"
const STATE_FADEIN = "STATE_FADEIN"
const STATE_FADEOUT = "STATE_FADEOUT"
const STATE_RESIZE_LEFT = "STATE_RESIZE_LEFT"
const STATE_RESIZE_RIGHT = "STATE_RESIZE_RIGHT"

export default function Home() {
  const waveFormRef = React.useRef(null)
  const [playList, setPlaylist] = React.useState({})
  const [player, setPlayer] = React.useState(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [stateButton, setStateButton] = React.useState(STATE_CURSOR)
  const [isLooping, setIsLooping] = React.useState(false)

  const updateSelect = (start, end) => {
    if (start < end) {
      document
        .getElementsByClassName("btn-trim-audio")[0]
        .classList.remove("disabled")
      document
        .getElementsByClassName("btn-loop")[0]
        .classList.remove("disabled")
    } else {
      document
        .getElementsByClassName("btn-trim-audio")[0]
        .classList.add("disabled")
      document.getElementsByClassName("btn-loop")[0].classList.add("disabled")
    }

    // $audioStart.val(cueFormatters(format)(start))
    // $audioEnd.val(cueFormatters(format)(end))

    // startTime = start
    // endTime = end
  }

  React.useEffect(() => {
    const waveFormNode = waveFormRef.current
    const audioCtx = new window.AudioContext()

    var playlist = WaveformPlaylist({
      samplesPerPixel: 3000,
      zoomLevels: [500, 1000, 3000, 5000],
      mono: true,
      waveHeight: 100,
      container: waveFormNode,
      state: "cursor",
      isContinuousPlay: true,
      timescale: true,
      waveOutlineColor: "#E0EFF1",
      colors: {
        waveOutlineColor: "#E0EFF1",
        timeColor: "grey",
        fadeColor: "black",
      },
      controls: {
        show: false, //whether or not to include the track controls
        width: 200, //width of controls in pixels
      },
    })

    playlist
      .load([
        {
          src: "media/_Miles_1.wav",
          name: "Vocals",
        },
      ])
      .then(function () {
        setPlaylist(playlist)
        const ee = playlist.getEventEmitter()
        setPlayer(ee)
        ee.on("select", updateSelect)

        ee.on("shift", shift(playlist))

        document.addEventListener("keyup", e => {
          if (e.key === "x") {
            cutClipAtCursor(playlist)
          }
        })
      })
  }, [waveFormRef])

  const isActiveInFront = (activeTrack, track) =>
    activeTrack.getStartTime() > track.getStartTime()

  const isActiveInBack = (activeTrack, track) =>
    activeTrack.getStartTime() < track.getStartTime()

  const movingRight = deltaTime => deltaTime > 0
  const movingLeft = deltaTime => deltaTime < 0

  const shift = playlist => (deltaTime, activeTrack) => {
    playlist.tracks.forEach(track => {
      const endTime = track.getEndTime()
      const startTime = track.getStartTime()
      if (track.name !== activeTrack.name) {
        if (movingLeft(deltaTime)) {
          if (isActiveInBack(activeTrack, track)) {
            // track.setCues(activeTrack.getEndTime(), endTime)
            // track.setStartTime(activeTrack.getEndTime())
          } else if (isActiveInFront(activeTrack, track)) {
            track.trim(startTime, activeTrack.getStartTime())
          }
        } else if (movingRight(deltaTime)) {
          if (isActiveInFront(activeTrack, track)) {
            // track.setCues(startTime, activeTrack.getStartTime())
          } else if (isActiveInBack(activeTrack, track)) {
            track.trim(activeTrack.getEndTime(), endTime)
          }
        }
        track.calculatePeaks(playlist.samplesPerPixel, playlist.sampleRate)
        playlist.adjustDuration()
        playlist.drawRequest()
        playlist.render()
      }
    })
  }

  const copyActiveTrack = async playlist => {
    const activeTrack = playlist.getActiveTrack()
    const newName = `${activeTrack.name}_copy_${Math.floor(
      Math.random() * 100
    )}`
    await playlist.load([
      {
        src: activeTrack.src,
        name: newName,
      },
    ])
    return playlist.tracks.filter(track => track.name === newName)[0]
  }

  const cutClipAtCursor = async playlist => {
    // Cut the current and new tracks
    const activeTrack = playlist.getActiveTrack()
    if (!activeTrack) {
      return false
    }

    const newClip = await copyActiveTrack(playlist)
    const cursor = playlist.cursor

    // cut the newClip
    newClip.trim(cursor, activeTrack.cueOut) // find finction to get cueOut
    newClip.calculatePeaks(playlist.samplesPerPixel, playlist.sampleRate)

    // cutting the initial clip
    activeTrack.trim(0, cursor)
    activeTrack.calculatePeaks(playlist.samplesPerPixel, playlist.sampleRate)

    playlist.setTimeSelection(0, 0)
    playlist.drawRequest()
    playlist.render()

    // define them uniquely
    // splice together
  }

  return (
    <>
      <Head></Head>
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
                        player.emit("pause")
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
                        player.emit("play")
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
                        player.emit("stop")
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
                        player.emit("statechange", "cursor")
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
                        player.emit("statechange", "cursor")
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
                        player.emit("statechange", "shift")
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
                        player.emit("statechange", "resizeleft")
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
                        player.emit("statechange", "resizeright")
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
              <div ref={waveFormRef} id="playlist"></div>
            </div>
          </article>
        </div>
      </main>
    </>
  )
}
