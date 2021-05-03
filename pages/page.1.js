import * as React from "react"
import _ from "lodash"
import Head from "next/head"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
import AudioToolBar from "../components/AudioToolBar"
import TimeScale from "../library/waveform-playlist/src/TimeScale"

const tracks = [
  {
    src: "media/reflections.2.mp3",
    zoomLevels: [512],
    name: "Vocals",
    selections: [
      {
        color: "green",
        name:"I",
        timeSelection: {
          start: 1,
          end: 4,
        },
      },
    ],
  },
]

const shortCuts = [
  { key: "space", command: "play"},
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
            />
          </div>
        </article>
      </div>
      This
    </main>
  )
}