import * as React from "react"
import _ from "lodash"
import WaveformPlaylist from "../library/waveform-playlist/src/app"

function WavePlayer({ setEmitter }) {
  const waveFormRef = React.useRef(null)
  // const [playList, setPlaylist] = React.useState({})

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
      showTimeSignature: true,
      timeSignature: {
        bpm: 60,
        beatsPerMeasure: 4,
        noteValue: 4,
      },
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
          src: "media/_Miles_1.mp3",
          name: "Vocals",
        },
      ])
      .then(function () {
        // setPlaylist(playlist)

        console.log("LOADED", playlist)
        // ee.on("select", updateSelect)

        // ee.on("shift", shift(playlist))
      })

    document.addEventListener("keyup", e => {
      if (e.key === "x") {
        cutClipAtCursor(playlist)
      }
    })
    const ee = playlist.getEventEmitter()
    setEmitter(ee)

    ee.on("audiosourcesloaded", () => console.log("rendered"))
  }, [waveFormRef])

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
    // playlist.render()

    // define them uniquely
    // splice together
  }

  return <div ref={waveFormRef} id="playlist"></div>
}

export default React.memo(WavePlayer)
