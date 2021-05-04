import * as React from "react"
import _ from "lodash"
import Head from "next/head"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
import AudioToolBar from "../components/AudioToolBar"

const tracks = [
  {
    src: "media/_Miles_1.mp3",
    name: "Vocals",
    colorSelections: [
      {
        color: "green",
        name: "Gmaj",
        timeSelection: {
          start: 1,
          end: 4,
        },
      },
    ],
  },
  {
    src: "media/metronome.mp3",
    name: "metronome",
    hidden: true,
  },
]

const selections = [
  {
    color: "green",
    name: "Gmaj",
    timeSelection: {
      start: 1,
      end: 4,
    },
  },
]

const timeSignature = {
  bpm: 260,
  beatsPerMeasure: 4,
  noteValue: 4,
}

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
              timeSignature={timeSignature}
            />
          </div>
        </article>
      </div>
    </main>
  )
}
