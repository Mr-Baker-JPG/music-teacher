import * as React from "react"
import _ from "lodash"
import Head from "next/head"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
import AudioToolBar from "../components/AudioToolBar"

const tracks = [
  {
    src: "media/85.piano.mp3",
    name: "Vocals",
  },
  {
    src: "media/85.metro.mp3",
    zoomLevels: [512],
    hidden: true,
    states:{
      shift: false,
    },
    name: "metronome",
  },
  {
    src: "media/85.backing.mp3",
    zoomLevels: [512],
    hidden: true,
    states:{
      shift: false,
    },
    name: "backing",
  }
]

const shortCuts = [
  { key: "x", command: "cutchannel" },
  { key: "c", command: "trim" },
  { key: "m", command: "startaudiorendering", opts: ["wav"] },
  { key: "s", command: "identify" },
]

export default function Home() {
  const [emitter, setEmitter] = React.useState(null)

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
          
            <AudioToolBar emitter={emitter} />
            <WavePlayer
              setEmitter={setEmitter}
              tracks={tracks}
              shortCuts={shortCuts}
              name="page3"
            />
          </div>
        </article>
      </div>
      <p>The are many chords to choose from. Be creative.</p>
      <br></br>
      <p>Ella Fitzgerald and Louis Armstrong- "lorem ipsum"</p>
    </main>
  )
}