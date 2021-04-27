import * as React from "react"
import Head from "next/head"
import { faPlay } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "waveform-playlist"

const STATE_CURSOR = "STATE_CURSOR"
const STATE_SELECT = "STATE_SELECT"
const STATE_SHIFT = "STATE_SHIFT"
const STATE_FADEIN = "STATE_FADEIN"
const STATE_FADEOUT = "STATE_FADEOUT"

export default function Home() {
  const waveFormRef = React.useRef(null)
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

    $audioStart.val(cueFormatters(format)(start))
    $audioEnd.val(cueFormatters(format)(end))

    startTime = start
    endTime = end
  }

  React.useEffect(() => {
    const waveFormNode = waveFormRef.current

    var playlist = WaveformPlaylist({
      samplesPerPixel: 3000,
      zoomLevels: [500, 1000, 3000, 5000],
      mono: true,
      waveHeight: 100,
      container: waveFormNode,
      state: "cursor",
      waveOutlineColor: "#E0EFF1",
      colors: {
        waveOutlineColor: "#E0EFF1",
        timeColor: "grey",
        fadeColor: "black",
      },
      controls: {
        show: false, //whether or not to include the track controls
        width: 200, //width of controls in pixels
        widgets: {
          muteOrSolo: true,
          volume: true,
          stereoPan: false,
          collapse: false,
          remove: false,
        },
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
        var ee = playlist.getEventEmitter()
        setPlayer(ee)
        ee.on("select", updateSelect)
      })
  }, [waveFormRef])

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
                  <div className="btn-group">
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
                      <FontAwesomeIcon icon={faPlay} />
                    </button>
                    <button
                      type="button"
                      className={`btn-play btn btn-outline-success ${
                        isPlaying ? "hidden" : ""
                      }`}
                      title="Play"
                      onClick={() => {
                        player.emit("play")
                        setIsPlaying(true)
                      }}
                    >
                      <i className="fas fa-play"></i>
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
                      <i className="fas fa-stop"></i>
                    </button>
                  </div>

                  <div className="btn-group btn-playlist-state-group">
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
                      <i className="fas fa-headphones"></i>
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
                      <i className="fas fa-italic"></i>
                    </button>
                    <button
                      type="button"
                      className={`btn-shift btn btn-outline-dark ${
                        stateButton === STATE_SHIFT && "active"
                      }`}
                      title="Shift audio in time"
                      onClick={e => {
                        player.emit("statechange", "cursor")
                        setStateButton(STATE_SHIFT)
                      }}
                    >
                      <i className="fas fa-arrows-alt-h"></i>
                    </button>
                    <div className="btn-group btn-select-state-group">
                      <span
                        className="btn-loop btn btn-success disabled"
                        title="loop a selected segment of audio"
                      >
                        <i className="fa fa-repeat"></i>
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
