import * as localForage from "localforage"
import cycle from "./cycle"
cycle()

export default async function loadLocalStorageAudioTracks(playlist, tracks) {
  const storage = window.localStorage
  let oldPlayList = storage.getItem("musicPlayer")
  if (oldPlayList) {
    oldPlayList = JSON.retrocycle(JSON.parse(oldPlayList))
    const tracks = await Promise.all(
      oldPlayList.tracks.map(async track => {
        let src = track.src
        if (typeof src === "object") {
          src = await localForage.getItem("musicPlayer::BUFFER")
        }
        return {
          src,
          name: track.name,
          start: track.startTime,
          cuein: track.cueIn,
          cueout: track.cueOut,
          customClass: track.customClass,
          waveOutlineColor: track.waveOutlineColor,
          hidden: track.hidden,
        }
      })
    )
    await playlist.load(tracks)
    playlist.tracks.forEach(track => {
      const oTrack = oldPlayList.tracks.find(
        oTrack => oTrack.name === track.name
      )
      // console.log(track.name, oTrack)
      if (oTrack) {
        oTrack.selections.forEach(s =>
          track.addSelection(s.timeSelection, s.name)
        )
      }
    })
    playlist.drawRequest()
  } else {
    await playlist.load(tracks)
    storage.setItem("musicPlayer", JSON.stringify(JSON.decycle(playlist)))
  }
}
