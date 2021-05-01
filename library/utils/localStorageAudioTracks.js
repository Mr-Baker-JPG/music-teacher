import cycle from "./cycle"
cycle()

export default async function loadLocalStorageAudioTracks(playlist, tracks) {
  const storage = window.localStorage
  let oldPlayList = storage.getItem("musicPlayer")
  if (oldPlayList) {
    oldPlayList = JSON.retrocycle(JSON.parse(oldPlayList))
    playlist.load(
      oldPlayList.tracks.map(track => ({
        src: track.src,
        name: track.name,
        start: track.startTime,
        cuein: track.cueIn,
        cueout: track.cueOut,
        customClass: track.customClass,
        waveOutlineColor: track.waveOutlineColor,
      }))
    )
  } else {
    await playlist.load(tracks)
    storage.setItem("musicPlayer", JSON.stringify(JSON.decycle(playlist)))
  }
}
