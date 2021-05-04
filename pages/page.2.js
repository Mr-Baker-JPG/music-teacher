import * as React from "react"
import _ from "lodash"
import Head from "next/head"

import styles from "../styles/Home.module.css"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import WavePlayer from "../components/WavePlayer"
import AudioToolBar from "../components/AudioToolBar"

const tracks = [
  {
    src: "media/Swing.mp3",
    name: "Vocals",
  },
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
              Duke Ellington- It Don't Mean a Thing
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
      <p>Again, shorten the ends of the chords to match the sample to the desired BPM, but this time without a guide.</p>
      <br></br>
      <p>Duke Ellington-"From 1926 until his death in 1974, Duke Ellington was an enduring
presence on American airwaves, first as a curiosity on local radio, then as
an exotic attraction on network radio, and finally as a senior statesman
as part of the sputtering endgame of jazz on American television"</p>
    </main>
  )
}