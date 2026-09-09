// CutSync Dopamine Sound Effects Engine (Web Audio API Synthesizer)
// Pure synthesized audio: 0kb download, zero lag, 100% browser compatibility without external audio files.

let audioCtx = null

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

// Sound enabled state in localStorage
export function isSoundEnabled() {
  const saved = localStorage.getItem('cutsync_sound_enabled')
  return saved === null ? true : saved === 'true'
}

export function setSoundEnabled(enabled) {
  localStorage.setItem('cutsync_sound_enabled', enabled ? 'true' : 'false')
}

// 1. Soft Pop Sound (for tool clicks, drawing, buttons)
export function playPop() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(450, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch (e) {
    // Graceful fallback if audio context blocked
  }
}

// 2. Delightful Task Check Chime (Ascending two-tone ding: C5 -> G5)
export function playCheck() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Tone 1: C5 (523.25 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'triangle'
    osc1.frequency.setValueAtTime(523.25, now)
    gain1.gain.setValueAtTime(0.18, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.12)

    // Tone 2: G5 (783.99 Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(783.99, now + 0.08)
    gain2.gain.setValueAtTime(0.22, now + 0.08)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.08)
    osc2.stop(now + 0.35)
  } catch (e) {}
}

// 3. Grand Fanfare Celebration Arpeggio (C4 -> E4 -> G4 -> C5 victory chord)
export function playCelebration() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [
      { f: 523.25, t: 0.00, d: 0.20 }, // C5
      { f: 659.25, t: 0.10, d: 0.20 }, // E5
      { f: 783.99, t: 0.20, d: 0.25 }, // G5
      { f: 1046.50, t: 0.30, d: 0.65 } // C6 (grand finish)
    ]

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, now + t)
      gain.gain.setValueAtTime(0.2, now + t)
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + t)
      osc.stop(now + t + d)
    })
  } catch (e) {}
}

// 4. Crisp High Ping for Copy Link
export function playCopy() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now) // A5
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15)

    gain.gain.setValueAtTime(0.18, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
  } catch (e) {}
}

// 5. Playful Boing / Spring Sound for Emoji Reactions
export function playReaction() {
  if (!isSoundEnabled()) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.linearRampToValueAtTime(680, now + 0.12)
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.2)

    gain.gain.setValueAtTime(0.16, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {}
}
