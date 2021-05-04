import _defaults from "lodash.defaultsdeep"
import _ from "lodash"
import cycle from "../../utils/cycle"
cycle()
import * as localForage from "localforage"

import h from "virtual-dom/h"
import diff from "virtual-dom/diff"
import patch from "virtual-dom/patch"
import InlineWorker from "inline-worker"

import { pixelsToSeconds } from "./utils/conversions"
import LoaderFactory from "./track/loader/LoaderFactory"
import ScrollHook from "./render/ScrollHook"
import TimeScale from "./TimeScale"
import TimeSignature from "./TimeSignature"
import Track from "./Track"
import Playout from "./Playout"
import AnnotationList from "./annotation/AnnotationList"

import RecorderWorkerFunction from "./utils/recorderWorker"
import ExportWavWorkerFunction from "./utils/exportWavWorker"

const movingRight = deltaTime => deltaTime > 0
const movingLeft = deltaTime => deltaTime < 0
const isActiveInFront = (activeTrack, track) =>
  activeTrack.getStartTime() >= track.getStartTime()

const isActiveTrackBehind = (activeTrack, track) =>
  activeTrack.getStartTime() < track.getStartTime() &&
  activeTrack.getEndTime() >= track.getStartTime() &&
  track.getStartTime() !== track.getEndTime()
const isActiveTrackBefore = (activeTrack, track) =>
  track.getStartTime() < activeTrack.getStartTime() &&
  track.getEndTime() >= activeTrack.getStartTime() &&
  track.getStartTime() !== track.getEndTime()

const isActiveInBack = (activeTrack, track) =>
  activeTrack.getStartTime() <= track.getStartTime()

const copyActiveTrack = async playlist => {
  const activeTrack = playlist.getActiveTrack()
  const newName = `${activeTrack.name}_copy_${Math.floor(Math.random() * 100)}`
  await playlist.load([
    {
      src: activeTrack.src,
      name: newName,
    },
  ])
  const copy = playlist.tracks.filter(track => track.name === newName)[0]

  const selections = activeTrack.getSelections()
  selections.forEach(s => copy.addSelection(s.timeSelection, s.name))
  return copy
}

export default class {
  constructor() {
    this.tracks = []
    this.soloedTracks = []
    this.mutedTracks = []
    this.collapsedTracks = []
    this.playoutPromises = []
    this.hiddenTracks = []
    this.coloredSelections = []

    this.cursor = 0
    this.playbackSeconds = 0
    this.duration = 0
    this.scrollLeft = 0
    this.scrollTimer = undefined
    this.showTimescale = false
    this.showTimeSignature = false
    this.timeSignature = { bpm: 60, beatsPerMeasure: 4, noteValue: 4 }
    // whether a user is scrolling the waveform
    this.isScrolling = false

    this.fadeType = "logarithmic"
    this.masterGain = 1
    this.annotations = []
    this.durationFormat = "hh:mm:ss.uuu"
    this.isAutomaticScroll = false
    this.resetDrawTimer = undefined
    this.isLooping = true
  }

  // TODO extract into a plugin
  initExporter() {
    this.exportWorker = new InlineWorker(ExportWavWorkerFunction)
  }

  // TODO extract into a plugin
  initRecorder(stream) {
    this.mediaRecorder = new MediaRecorder(stream)

    this.mediaRecorder.onstart = () => {
      const track = new Track()
      track.setName("Recording")
      track.setEnabledStates()
      track.setEventEmitter(this.ee)

      this.recordingTrack = track
      this.tracks.push(track)

      this.chunks = []
      this.working = false
    }

    this.mediaRecorder.ondataavailable = e => {
      this.chunks.push(e.data)

      // throttle peaks calculation
      if (!this.working) {
        const recording = new Blob(this.chunks, {
          type: "audio/ogg; codecs=opus",
        })
        const loader = LoaderFactory.createLoader(recording, this.ac)
        loader
          .load()
          .then(audioBuffer => {
            // ask web worker for peaks.
            this.recorderWorker.postMessage({
              samples: audioBuffer.getChannelData(0),
              samplesPerPixel: this.samplesPerPixel,
            })
            this.recordingTrack.setCues(0, audioBuffer.duration)
            this.recordingTrack.setBuffer(audioBuffer)
            this.recordingTrack.setPlayout(new Playout(this.ac, audioBuffer))
            this.adjustDuration()
          })
          .catch(() => {
            this.working = false
          })
        this.working = true
      }
    }

    this.mediaRecorder.onstop = () => {
      this.chunks = []
      this.working = false
    }

    this.recorderWorker = new InlineWorker(RecorderWorkerFunction)
    // use a worker for calculating recording peaks.
    this.recorderWorker.onmessage = e => {
      this.recordingTrack.setPeaks(e.data)
      this.working = false
      this.drawRequest()
    }
  }

  setColoredSelections(selections) {
    this.coloredSelections = selections
  }

  addColoredSelection(
    timeSelection,
    name = `chord_${Math.round(Math.random() * 1000)}`,
    color = "green"
  ) {
    this.coloredSelections.push({ name, timeSelection, color })
  }

  getColoredSelections() {
    return this.coloredSelections
  }

  setShowTimeScale(show) {
    this.showTimescale = show
  }

  setShowTimeSignature(show) {
    this.showTimeSignature = show
  }

  setTimeSignature(signature) {
    this.timeSignature = signature
  }

  setMono(mono) {
    this.mono = mono
  }

  setExclSolo(exclSolo) {
    this.exclSolo = exclSolo
  }

  setSeekStyle(style) {
    this.seekStyle = style
  }

  getSeekStyle() {
    return this.seekStyle
  }

  setSampleRate(sampleRate) {
    this.sampleRate = sampleRate
  }

  setSamplesPerPixel(samplesPerPixel) {
    this.samplesPerPixel = samplesPerPixel
  }

  setAudioContext(ac) {
    this.ac = ac
  }

  setControlOptions(controlOptions) {
    this.controls = controlOptions
  }

  setWaveHeight(height) {
    this.waveHeight = height
  }

  setCollapsedWaveHeight(height) {
    this.collapsedWaveHeight = height
  }

  setColors(colors) {
    this.colors = colors
  }

  setAnnotations(config) {
    const controlWidth = this.controls.show ? this.controls.width : 0
    this.annotationList = new AnnotationList(
      this,
      config.annotations,
      config.controls,
      config.editable,
      config.linkEndpoints,
      config.isContinuousPlay,
      controlWidth
    )
  }

  setEventEmitter(ee) {
    this.ee = ee
  }

  getEventEmitter() {
    return this.ee
  }

  setUpEventEmitter() {
    const ee = this.ee

    ee.on("audiosourcesrendered", t => {
      console.log(t, this)
    })

    ee.on("audiorenderingfinished", async (type, data) => {
      if (type == "wav") {
        await localForage.setItem("musicPlayer::BUFFER", data)
        this.tracks = this.collapsedTracks
        this.load([
          {
            src: data,
            name: "Vocals",
          },
        ])
      }
    })

    ee.on("automaticscroll", val => {
      this.isAutomaticScroll = val
    })

    ee.on("durationformat", format => {
      this.durationFormat = format
      this.drawRequest()
    })

    ee.on("identify", () => {
      if (!this.isPlaying()) {
        this.addColoredSelection(this.timeSelection)
        // this.activeTrack?.addSelection(this.timeSelection)
        this.tracks.forEach(t =>
          t.calculatePeaks(this.samplesPerPixel, this.sampleRate)
        )
        this.setTimeSelection(0, 0)
        this.seek(0, 0, this.activeTrack)
        this.drawRequest()
      }
    })

    ee.on("select", (start, end, track) => {
      if (this.isPlaying()) {
        this.lastSeeked = start
        this.pausedAt = undefined
        this.restartPlayFrom(start)
      } else {
        // reset if it was paused.
        this.seek(start, end, track)
        this.ee.emit("timeupdate", start)
        this.drawRequest()
      }
    })

    ee.on("startaudiorendering", type => {
      this.startOfflineRender(type)
    })

    ee.on("statechange", state => {
      this.setState(state)
      this.drawRequest()
    })

    ee.on("cutchannel", async () => {
      const activeTrack = this.getActiveTrack()

      if (!activeTrack) {
        return false
      }

      const newClip = await copyActiveTrack(this)
      const cursor = this.cursor

      // cut the newClip
      newClip.trim(cursor, activeTrack.cueOut)
      newClip.calculatePeaks(this.samplesPerPixel, this.sampleRate)

      // cutting the initial clip
      activeTrack.trim(0, cursor)
      activeTrack.calculatePeaks(this.samplesPerPixel, this.sampleRate)
      this.setTimeSelection(0, 0)
      this.drawRequest()
    })

    ee.on("resettracks", () => {
      window.localStorage.removeItem("musicPlayer")
      window.location.reload()
    })

    ee.on("shift", (deltaTime, activeTrack) => {
      if (activeTrack.getStartTime() < 0) {
        activeTrack.setStartTime(0)
        return true
      }

      activeTrack.setStartTime(activeTrack.getStartTime() + deltaTime)

      this.tracks.forEach(track => {
        if (!track.hidden) {
          const endTime = track.getEndTime()
          const startTime = track.getStartTime()
          if (track.name !== activeTrack.name) {
            if (movingLeft(deltaTime)) {
              if (isActiveInFront(activeTrack, track)) {
                track.trim(startTime, activeTrack.getStartTime())
              } else if (isActiveInBack(activeTrack, track)) {
                // track.setCues(activeTrack.getEndTime(), endTime)
                // track.setStartTime(activeTrack.getEndTime())
              }
            } else if (movingRight(deltaTime)) {
              if (isActiveInBack(activeTrack, track)) {
                track.trim(activeTrack.getEndTime(), endTime)
              } else if (isActiveInFront(activeTrack, track)) {
                // track.setCues(startTime, activeTrack.getStartTime())
              }
            }
            track.calculatePeaks(this.samplesPerPixel, this.sampleRate)
          }
        }
      })
      this.adjustDuration()
      // if (+new Date() % 100 > 5) {
      this.drawRequest()
    })

    ee.on("splitchannels", () => {
      const channels = document.querySelectorAll(".channel-wrapper")

      Array.from(channels).forEach(c => {
        c.classList.remove("playing")
      })
    })

    ee.on("mergechannels", () => {
      const channels = Array.from(document.querySelectorAll(".channel-wrapper"))
      if (channels.length > 1) {
        channels.forEach(c => {
          c.classList.add("playing")
        })
      }
    })

    ee.on("applyclass", (start, end, track) => {
      if (!this.isPlaying()) {
        this.drawRequest()
      }
    })

    ee.on("resizeright", (deltaTime, activeTrack) => {
      if (deltaTime === 0) return
      if (movingLeft(deltaTime)) {
        activeTrack.trim(
          activeTrack.getStartTime(),
          activeTrack.getEndTime() + deltaTime
        )
      } else if (movingRight(deltaTime)) {
        activeTrack.setCues(
          activeTrack.getStartTime(),
          activeTrack.getEndTime() + deltaTime
        )

        // if overlap resize overlapped clip
        this.tracks.forEach(track => {
          if (!track.hidden) {
            if (isActiveTrackBehind(activeTrack, track)) {
              track.setCues(activeTrack.getEndTime(), track.getEndTime())
              track.setStartTime(activeTrack.getEndTime())
            }
            track.calculatePeaks(this.samplesPerPixel, this.sampleRate)
          }
        })
      }
      activeTrack.calculatePeaks(this.samplesPerPixel, this.sampleRate)
      this.adjustDuration()
      this.drawRequest()
    })

    // TODO: BUG HERE
    ee.on("resizeleft", (deltaTime, activeTrack) => {
      if (deltaTime === 0) return
      if (activeTrack.getStartTime() < 0) {
        activeTrack.setCues(0, activeTrack.getEndTime())
        activeTrack.setStartTime(0)
        return true
      }
      if (movingLeft(deltaTime)) {
        activeTrack.setCues(
          activeTrack.getStartTime() + deltaTime,
          activeTrack.getEndTime()
        )
        activeTrack.setStartTime(activeTrack.getStartTime() + deltaTime)
        this.tracks.forEach(track => {
          if (!track.hidden) {
            if (isActiveTrackBefore(activeTrack, track)) {
              track.trim(track.getStartTime(), activeTrack.getStartTime())
            }
            track.calculatePeaks(this.samplesPerPixel, this.sampleRate)
          }
        })
        // activeTrack.setStartTime(activeTrack.getStartTime() + deltaTime)
      } else if (movingRight(deltaTime)) {
        activeTrack.trim(
          activeTrack.getStartTime() + deltaTime,
          activeTrack.getEndTime()
        )
        // track.setStartTime(track.getStartTime() + deltaTime)
      }
      activeTrack.calculatePeaks(this.samplesPerPixel, this.sampleRate)
      this.adjustDuration()
      this.drawRequest()
    })

    ee.on("record", () => {
      this.record()
    })

    ee.on("play", (start, end) => {
      this.play(start, end)
    })

    ee.on("pause", () => {
      this.pause()
    })

    ee.on("stop", () => {
      this.stop()
    })

    ee.on("rewind", () => {
      this.rewind()
    })

    ee.on("fastforward", () => {
      this.fastForward()
    })

    // TODO: Craig HERE
    ee.on("finished", function () {
      if (this.isLooping) {
        let playoutPromises = this.play(0, 0)
        playoutPromises.then(function () {
          playoutPromises = playlist.play(0, 0)
        })
      }
    })

    ee.on("clear", () => {
      this.clear().then(() => {
        this.drawRequest()
      })
    })

    ee.on("solo", track => {
      this.soloTrack(track)
      this.adjustTrackPlayout()
      this.drawRequest()
    })

    ee.on("mute", track => {
      this.muteTrack(track)
      this.adjustTrackPlayout()
      this.drawRequest()
    })

    ee.on("removeTrack", track => {
      if (!this.isPlaying()) {
        this.removeTrack(track)
        this.rewind()
        this.adjustTrackPlayout()
        this.drawRequest()
      }
    })

    ee.on("changeTrackView", (track, opts) => {
      this.collapseTrack(track, opts)
      this.drawRequest()
    })

    ee.on("volumechange", (volume, track) => {
      track.setGainLevel(volume / 100)
      this.drawRequest()
    })

    ee.on("mastervolumechange", volume => {
      this.masterGain = volume / 100
      this.tracks.forEach(track => {
        track.setMasterGainLevel(this.masterGain)
      })
    })

    ee.on("fadein", (duration, track) => {
      track.setFadeIn(duration, this.fadeType)
      this.drawRequest()
    })

    ee.on("fadeout", (duration, track) => {
      track.setFadeOut(duration, this.fadeType)
      this.drawRequest()
    })

    ee.on("stereopan", (panvalue, track) => {
      track.setStereoPanValue(panvalue)
      this.drawRequest()
    })

    ee.on("fadetype", type => {
      this.fadeType = type
    })

    ee.on("newtrack", file => {
      this.load([
        {
          src: file,
          name: file.name,
        },
      ])
    })

    ee.on("trim", () => {
      const track = this.getActiveTrack()
      const timeSelection = this.getTimeSelection()
      if (timeSelection.start === timeSelection.end) return false

      track.trim(timeSelection.start, timeSelection.end)
      track.calculatePeaks(this.samplesPerPixel, this.sampleRate)

      this.setTimeSelection(0, 0)
      this.drawRequest()
    })

    ee.on("zoomin", () => {
      const zoomIndex = Math.max(0, this.zoomIndex - 1)
      const zoom = this.zoomLevels[zoomIndex]

      if (zoom !== this.samplesPerPixel) {
        this.setZoom(zoom)
        this.drawRequest()
      }
    })

    ee.on("zoomout", () => {
      const zoomIndex = Math.min(this.zoomLevels.length - 1, this.zoomIndex + 1)
      const zoom = this.zoomLevels[zoomIndex]

      if (zoom !== this.samplesPerPixel) {
        this.setZoom(zoom)
        this.drawRequest()
      }
    })

    ee.on("scroll", () => {
      this.isScrolling = true
      this.drawRequest()
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.isScrolling = false
      }, 200)
    })
  }

  load(trackList) {
    const loadPromises = trackList.map(trackInfo => {
      const loader = LoaderFactory.createLoader(trackInfo.src, this.ac, this.ee)
      return loader.load()
    })

    return Promise.all(loadPromises)
      .then(audioBuffers => {
        this.ee.emit("audiosourcesloaded")

        const tracks = audioBuffers.map((audioBuffer, index) => {
          const info = trackList[index]
          const selections = info.selections || []
          const name = info.name || "Untitled"
          const start = info.start || 0
          const states = info.states || {}
          const fadeIn = info.fadeIn
          const fadeOut = info.fadeOut
          const cueIn = info.cuein || 0
          const cueOut = info.cueout || audioBuffer.duration
          const gain = info.gain || 1
          const muted = info.muted || false
          const soloed = info.soloed || false
          const selection = info.selected
          const peaks = info.peaks || { type: "WebAudio", mono: this.mono }
          const customClass = info.customClass || undefined
          const waveOutlineColor = info.waveOutlineColor || undefined
          const stereoPan = info.stereoPan || 0
          const isHidden = info.hidden || false

          // webaudio specific playout for now.
          const playout = new Playout(this.ac, audioBuffer)

          const track = new Track()
          track.src = info.src
          track.setBuffer(audioBuffer)
          track.setName(name)
          track.setEventEmitter(this.ee)
          track.setEnabledStates(states)
          track.setCues(cueIn, cueOut)
          track.setCustomClass(customClass)
          track.setWaveOutlineColor(waveOutlineColor)
          track.setHidden(isHidden)

          selections.forEach(s => {
            track.addSelection(s.timeSelection, s.name)
          })

          if (fadeIn !== undefined) {
            track.setFadeIn(fadeIn.duration, fadeIn.shape)
          }

          if (fadeOut !== undefined) {
            track.setFadeOut(fadeOut.duration, fadeOut.shape)
          }

          if (selection !== undefined) {
            this.setActiveTrack(track)
            this.setTimeSelection(selection.start, selection.end)
          }

          if (peaks !== undefined) {
            track.setPeakData(peaks)
          }

          track.setState(this.getState())
          track.setStartTime(start)
          track.setPlayout(playout)

          track.setGainLevel(gain)
          track.setStereoPanValue(stereoPan)

          if (muted) {
            this.muteTrack(track)
          }

          if (soloed) {
            this.soloTrack(track)
          }

          // extract peaks with AudioContext for now.
          track.calculatePeaks(this.samplesPerPixel, this.sampleRate)

          return track
        })

        this.tracks = this.tracks.concat(tracks)
        // this.tracks = this.tracks.concat(tracks).filter(t => !t.isHidden())
        // this.hiddenTracks = this.hiddenTracks.concat(tracks).filter(t => {
        //   console.log(t)
        //   return t.isHidden()
        // })
        this.adjustDuration()
        this.draw(this.render())

        this.ee.emit("audiosourcesrendered")
      })
      .catch(e => {
        this.ee.emit("audiosourceserror", e)
      })
  }

  /*
    track instance of Track.
  */
  setActiveTrack(track) {
    this.activeTrack = track
  }

  getActiveTrack() {
    return this.activeTrack
  }

  isSegmentSelection() {
    return this.timeSelection.start !== this.timeSelection.end
  }

  /*
    start, end in seconds.
  */
  setTimeSelection(start = 0, end) {
    this.timeSelection = {
      start,
      end: end === undefined ? start : end,
    }

    this.cursor = start
  }

  startOfflineRender(type) {
    if (this.isRendering) {
      return
    }

    this.isRendering = true
    this.offlineAudioContext = new OfflineAudioContext(
      2,
      44100 * this.duration,
      44100
    )

    const currentTime = this.offlineAudioContext.currentTime

    this.tracks.forEach(track => {
      track.setOfflinePlayout(
        new Playout(this.offlineAudioContext, track.buffer)
      )
      track.schedulePlay(currentTime, 0, 0, {
        shouldPlay: this.shouldTrackPlay(track),
        masterGain: 1,
        isOffline: true,
      })
    })

    /*
      TODO cleanup of different audio playouts handling.
    */
    this.offlineAudioContext
      .startRendering()
      .then(audioBuffer => {
        if (type === "buffer") {
          this.ee.emit("audiorenderingfinished", type, audioBuffer)
          this.isRendering = false
          return
        }

        this.initExporter()
        if (type === "wav") {
          this.exportWorker.postMessage({
            command: "init",
            config: {
              sampleRate: 44100,
            },
          })

          // callback for `exportWAV`
          this.exportWorker.onmessage = e => {
            this.ee.emit("audiorenderingfinished", type, e.data)
            this.isRendering = false

            // clear out the buffer for next renderings.
            this.exportWorker.postMessage({
              command: "clear",
            })
          }

          // send the channel data from our buffer to the worker
          this.exportWorker.postMessage({
            command: "record",
            buffer: [
              audioBuffer.getChannelData(0),
              audioBuffer.getChannelData(1),
            ],
          })

          // ask the worker for a WAV
          this.exportWorker.postMessage({
            command: "exportWAV",
            type: "audio/wav",
          })
        }
      })
      .catch(e => {
        throw e
      })
  }

  getTimeSelection() {
    return this.timeSelection
  }

  setState(state) {
    this.state = state

    this.tracks.forEach(track => {
      track.setState(state)
    })
  }

  getState() {
    return this.state
  }

  setZoomIndex(index) {
    this.zoomIndex = index
  }

  setZoomLevels(levels) {
    this.zoomLevels = levels
  }

  setZoom(zoom) {
    this.samplesPerPixel = zoom
    this.zoomIndex = this.zoomLevels.indexOf(zoom)
    this.tracks.forEach(track => {
      track.calculatePeaks(zoom, this.sampleRate)
    })
  }

  muteTrack(track) {
    const index = this.mutedTracks.indexOf(track)

    if (index > -1) {
      this.mutedTracks.splice(index, 1)
    } else {
      this.mutedTracks.push(track)
    }
  }

  soloTrack(track) {
    const index = this.soloedTracks.indexOf(track)

    if (index > -1) {
      this.soloedTracks.splice(index, 1)
    } else if (this.exclSolo) {
      this.soloedTracks = [track]
    } else {
      this.soloedTracks.push(track)
    }
  }

  collapseTrack(track, opts) {
    if (opts.collapsed) {
      this.collapsedTracks.push(track)
    } else {
      const index = this.collapsedTracks.indexOf(track)

      if (index > -1) {
        this.collapsedTracks.splice(index, 1)
      }
    }
  }

  removeTrack(track) {
    if (track.isPlaying()) {
      track.scheduleStop()
    }

    const trackLists = [
      this.mutedTracks,
      this.soloedTracks,
      this.collapsedTracks,
      this.tracks,
    ]
    trackLists.forEach(list => {
      const index = list.indexOf(track)
      if (index > -1) {
        list.splice(index, 1)
      }
    })
  }

  adjustTrackPlayout() {
    this.tracks.forEach(track => {
      track.setShouldPlay(this.shouldTrackPlay(track))
    })
  }

  adjustDuration() {
    this.duration = this.tracks.reduce(
      (duration, track) => Math.max(duration, track.getEndTime()),
      0
    )
  }

  shouldTrackPlay(track) {
    let shouldPlay
    // if there are solo tracks, only they should play.
    if (this.soloedTracks.length > 0) {
      shouldPlay = false
      if (this.soloedTracks.indexOf(track) > -1) {
        shouldPlay = true
      }
    } else {
      // play all tracks except any muted tracks.
      shouldPlay = true
      if (this.mutedTracks.indexOf(track) > -1) {
        shouldPlay = false
      }
    }

    return shouldPlay
  }

  isPlaying() {
    return this.tracks.reduce(
      (isPlaying, track) => isPlaying || track.isPlaying(),
      false
    )
  }

  /*
   *   returns the current point of time in the playlist in seconds.
   */
  getCurrentTime() {
    const cursorPos = this.lastSeeked || this.pausedAt || this.cursor

    return cursorPos + this.getElapsedTime()
  }

  getElapsedTime() {
    return this.ac.currentTime - this.lastPlay
  }

  setMasterGain(gain) {
    this.ee.emit("mastervolumechange", gain)
  }

  restartPlayFrom(start, end) {
    this.stopAnimation()

    this.tracks.forEach(editor => {
      editor.scheduleStop()
    })

    return Promise.all(this.playoutPromises).then(
      this.play.bind(this, start, end)
    )
  }

  play(startTime, endTime) {
    clearTimeout(this.resetDrawTimer)

    const currentTime = this.ac.currentTime
    const selected = this.getTimeSelection()
    const playoutPromises = []

    let start = startTime || this.pausedAt || this.cursor
    let end = endTime

    if (!end && selected.end !== selected.start && selected.end > start) {
      end = selected.end
    }

    if (this.isPlaying()) {
      return this.restartPlayFrom(start, end)
    }

    this.tracks.forEach(track => {
      track.setState("cursor")
      playoutPromises.push(
        track.schedulePlay(currentTime, start, end, {
          shouldPlay: this.shouldTrackPlay(track),
          masterGain: this.masterGain,
        })
      )
    })

    this.lastPlay = currentTime
    // use these to track when the playlist has fully stopped.
    this.playoutPromises = playoutPromises
    this.startAnimation(start)

    return Promise.all(this.playoutPromises)
  }

  pause() {
    if (!this.isPlaying()) {
      return Promise.all(this.playoutPromises)
    }

    this.pausedAt = this.getCurrentTime()
    return this.playbackReset()
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop()
    }

    this.pausedAt = undefined
    this.playbackSeconds = 0
    return this.playbackReset()
  }

  playbackReset() {
    this.lastSeeked = undefined
    this.stopAnimation()

    this.tracks.forEach(track => {
      track.scheduleStop()
      track.setState(this.getState())
    })

    this.drawRequest()
    return Promise.all(this.playoutPromises)
  }

  rewind() {
    return this.stop().then(() => {
      this.scrollLeft = 0
      this.ee.emit("select", 0, 0)
    })
  }

  fastForward() {
    return this.stop().then(() => {
      if (this.viewDuration < this.duration) {
        this.scrollLeft = this.duration - this.viewDuration
      } else {
        this.scrollLeft = 0
      }

      this.ee.emit("select", this.duration, this.duration)
    })
  }

  clear() {
    return this.stop().then(() => {
      this.tracks = []
      this.soloedTracks = []
      this.mutedTracks = []
      this.playoutPromises = []

      this.cursor = 0
      this.playbackSeconds = 0
      this.duration = 0
      this.scrollLeft = 0

      this.seek(0, 0, undefined)
    })
  }

  record() {
    const playoutPromises = []
    this.mediaRecorder.start(300)

    this.tracks.forEach(track => {
      track.setState("none")
      playoutPromises.push(
        track.schedulePlay(this.ac.currentTime, 0, undefined, {
          shouldPlay: this.shouldTrackPlay(track),
        })
      )
    })

    this.playoutPromises = playoutPromises
  }

  startAnimation(startTime) {
    this.lastDraw = this.ac.currentTime
    this.animationRequest = window.requestAnimationFrame(() => {
      this.updateEditor(startTime)
    })
  }

  stopAnimation() {
    window.cancelAnimationFrame(this.animationRequest)
    this.lastDraw = undefined
  }

  seek(start, end, track) {
    if (this.isPlaying()) {
      this.lastSeeked = start
      this.pausedAt = undefined
      this.restartPlayFrom(start)
    } else {
      // reset if it was paused.
      this.setActiveTrack(track || this.tracks[0])
      this.pausedAt = start
      this.setTimeSelection(start, end)
      if (this.getSeekStyle() === "fill") {
        this.playbackSeconds = start
      }
    }
  }

  /*
   * Animation function for the playlist.
   * Keep under 16.7 milliseconds based on a typical screen refresh rate of 60fps.
   */
  updateEditor(cursor) {
    const currentTime = this.ac.currentTime
    const selection = this.getTimeSelection()
    const cursorPos = cursor || this.cursor
    const elapsed = currentTime - this.lastDraw

    if (this.isPlaying()) {
      const playbackSeconds = cursorPos + elapsed
      this.ee.emit("timeupdate", playbackSeconds)
      this.animationRequest = window.requestAnimationFrame(() => {
        this.updateEditor(playbackSeconds)
      })

      this.playbackSeconds = playbackSeconds
      this.draw(this.render())
      this.lastDraw = currentTime
    } else {
      if (
        cursorPos + elapsed >=
        (this.isSegmentSelection() ? selection.end : this.duration)
      ) {
        this.ee.emit("finished")
        // this.cursor = 0
        this.ee.emit("rewind")
        this.ee.emit("play")
      }

      this.stopAnimation()

      this.resetDrawTimer = setTimeout(() => {
        this.pausedAt = undefined
        this.lastSeeked = undefined
        this.setState(this.getState())

        this.playbackSeconds = 0
        this.draw(this.render())
      }, 0)
    }
  }

  drawRequest() {
    window.requestAnimationFrame(() => {
      this.draw(this.render())
    })
  }

  draw(newTree) {
    window.localStorage.setItem(
      "musicPlayer",
      JSON.stringify(JSON.decycle(this))
    )
    const patches = diff(this.tree, newTree)
    this.rootNode = patch(this.rootNode, patches)
    this.tree = newTree

    // use for fast forwarding.
    // this.viewDuration = pixelsToSeconds(
    //   this.rootNode.clientWidth - this.controls.width,
    //   this.samplesPerPixel,
    //   this.sampleRate
    // )
  }

  getTrackRenderData(data = {}) {
    const defaults = {
      height: this.waveHeight,
      resolution: this.samplesPerPixel,
      sampleRate: this.sampleRate,
      controls: this.controls,
      isActive: false,
      timeSelection: this.getTimeSelection(),
      playlistLength: this.duration,
      playbackSeconds: this.playbackSeconds,
      colors: this.colors,
      isLast: false,
    }

    return _defaults({}, data, defaults)
  }

  isActiveTrack(track) {
    const activeTrack = this.getActiveTrack()

    if (this.isSegmentSelection()) {
      return activeTrack === track
    }

    return true
  }

  isLastTrack(track) {
    return this.tracks[this.tracks.length - 1].name === track.name
  }

  renderAnnotations() {
    return this.annotationList.render()
  }

  renderTimeSignature() {
    const controlWidth = this.controls.show ? this.controls.width : 0
    const timeSignature = new TimeSignature(
      this.timeSignature,
      this.duration,
      this.scrollLeft,
      this.samplesPerPixel,
      this.sampleRate,
      controlWidth,
      this.colors
    )

    return timeSignature.render()
  }

  renderTimeScale() {
    const controlWidth = this.controls.show ? this.controls.width : 0
    const timeScale = new TimeScale(
      this.duration,
      this.scrollLeft,
      this.samplesPerPixel,
      this.sampleRate,
      controlWidth,
      this.colors
    )

    return timeScale.render()
  }

  renderTrackSection() {
    const trackElements = this.tracks.reduce((trackEls, track) => {
      console.log("RENDERING", track)
      const collapsed = this.collapsedTracks.indexOf(track) > -1
      if (!track.hidden) {
        trackEls.push(
          track.render(
            this.getTrackRenderData({
              coloredSelections: this.getColoredSelections(),
              isActive: this.isActiveTrack(track),
              isLastTrack: this.isLastTrack(track),
              shouldPlay: this.shouldTrackPlay(track),
              soloed: this.soloedTracks.indexOf(track) > -1,
              muted: this.mutedTracks.indexOf(track) > -1,
              collapsed,
              height: collapsed ? this.collapsedWaveHeight : this.waveHeight,
            })
          )
        )
      }
      return trackEls
    }, [])

    return h(
      "div.playlist-tracks",
      {
        attributes: {
          style: "overflow: auto;position: relative;",
        },
        onscroll: e => {
          this.scrollLeft = pixelsToSeconds(
            e.target.scrollLeft,
            this.samplesPerPixel,
            this.sampleRate
          )

          this.ee.emit("scroll")
        },
        hook: new ScrollHook(this),
      },
      trackElements
    )
  }

  render() {
    const containerChildren = []

    if (this.showTimescale) {
      containerChildren.push(this.renderTimeScale())
    }

    if (this.showTimeSignature) {
      containerChildren.push(this.renderTimeSignature())
    }

    containerChildren.push(this.renderTrackSection())

    if (this.annotationList.length) {
      containerChildren.push(this.renderAnnotations())
    }

    return h(
      "div.playlist",
      {
        attributes: {
          style: "overflow: hidden; position: relative;",
        },
      },
      containerChildren
    )
  }

  getInfo() {
    const info = []

    this.tracks.forEach(track => {
      info.push(track.getTrackDetails())
    })

    return info
  }
}
