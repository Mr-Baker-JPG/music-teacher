import * as React from "react"
import _ from "lodash"
import WaveformPlaylist from "../library/waveform-playlist/src/app"
import loadLocalStorageAudioTracks from "../library/utils/localStorageAudioTracks"
import keyboardShortCut from "../library/utils/keyboardShortcut"
import Track from "../library/waveform-playlist/src/Track"
import Playout from "../library/waveform-playlist/src/Playout"

function WavePlayer({
  setEmitter,
  tracks,
  shortCuts = [],
  timeSignature = {
    bpm: 60,
    beatsPerMeasure: 4,
    noteValue: 4,
  },
}) {
  const waveFormRef = React.useRef(null)

  React.useEffect(() => {
    const waveFormNode = waveFormRef.current

    const init = async () => {
      let playlist = WaveformPlaylist({
        samplesPerPixel: 3000,
        zoomLevels: [500, 1000, 3000, 5000],
        mono: true,
        waveHeight: 100,
        container: waveFormNode,
        state: "cursor",
        isContinuousPlay: true,
        isAutomaticScroll: true,
        showTimeSignature: true,
        timeSignature,
        waveOutlineColor: "#E0EFF1",
        colors: {
          waveOutlineColor: "#E0EFF1",
          timeColor: "grey",
          fadeColor: "black",
        },
        controls: {
          show: false, //whether or not to include the track controls
        },
      })

      await loadLocalStorageAudioTracks(playlist, tracks)
      const ee = playlist.getEventEmitter()
      setEmitter(ee)

      const keyShortCutGenerator = keyboardShortCut(ee)
      shortCuts.forEach(({ key, command, opts = [] }) => {
        keyShortCutGenerator(key, command, ...opts)
      })
    }
    init()
  }, [waveFormRef])

  return <div ref={waveFormRef} id="playlist"></div>
}

export default React.memo(WavePlayer)
