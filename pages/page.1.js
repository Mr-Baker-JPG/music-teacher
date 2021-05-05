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
    selections: [
      {
        color: "green",
        name:"I",
        timeSelection: {
          start: 0,
          end: 2,
        },
      },
    ],
  },
  {
    src: "media/106.Metro.mp3",
    zoomLevels: [512],
    hidden: true,
    states:{
      shift: false,
    },
    name: "metronome",
  },
  {
    src: "media/106.Brushes.mp3",
    zoomLevels: [512],
    hidden: true,
    states:{
      shift: false,
    },
    name: "backing",
  }
  
]

const shortCuts = [
  { key: "space", command: "play"},
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
            <h1 className="post-title">Tempo Allignment</h1>
            <p className="lead">
              Reflections in D- Duke Ellington
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
      <p>Samples typcially come in tempos very different from what a producer may need for a particular song. This one slows down towards the end and becomes out of sync wih our drum track. Trim the chords so that each lines up with the project BPM. (Hint: The highest/loudest points of the audio file show where a new chord is played. Align those peaks with the metronome notches).</p>
      <br></br>
      <p>Duke Ellington was an influential jazz composer, band leader, and pianist with a prolific career. He wrote colorful chord progressions utilizing the 7th, 9th, and 11th degree of scales in many well-respected songs. Reflections in D is one of his solo piano compositions.</p>
    </main>
  )
}