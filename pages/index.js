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
    src: "media/Reflections.3.mp3",
    zoomLevels: [500, 1000, 3000, 5000],
    name: "Vocals",
    // selections: [
    //   {
    //     color: "green",
    //     name:"I",
    //     timeSelection: {
    //       start: 1,
    //       end: 4,
    //     },
    //   },
    // ],
  },
  {
    src: "media/106.Metro.mp3",
    zoomLevels: [512],
    hidden: true,
    states: {
      shift: false,
    },
    name: "metronome",
  },
  {
    src: "media/106.Brushes.mp3",
    zoomLevels: [512],
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
        Duke Ellington-"From 1926 until his death in 1974, Duke Ellington was an
        enduring presence on American airwaves, first as a curiosity on local
        radio, then as an exotic attraction on network radio, and finally as a
        senior statesman as part of the sputtering endgame of jazz on American
        television"
      </p>
    </main>
  )
}
