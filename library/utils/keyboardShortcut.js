const keyboardShortCut = emitter => (key, action) => {
  document.addEventListener("keyup", e => {
    if (e.key === key) {
      emitter.emit(action)
    }
  })
}

export default keyboardShortCut
