'use client'
import { useEffect, useRef, useState } from 'react'

/*
 * Local A/V controls for the virtual office: toggle your own mic and camera
 * (works solo) and apply a virtual background to the camera.
 * Background replacement uses MediaPipe Selfie Segmentation, lazy-loaded from CDN
 * only when a background is selected. NOTE: this is local-only — streaming to
 * other people (WebRTC) is a separate, future phase.
 */

type Bg = 'none' | 'blur' | string // string = solid hex color
const BGS: { key: Bg; label: string; swatch: string }[] = [
  { key: 'none', label: 'Sem fundo', swatch: 'transparent' },
  { key: 'blur', label: 'Desfocar', swatch: '#94a3b8' },
  { key: '#0f172a', label: 'Escuro', swatch: '#0f172a' },
  { key: '#0f766e', label: 'Teal', swatch: '#0f766e' },
  { key: '#5b21b6', label: 'Roxo', swatch: '#5b21b6' },
  { key: '#b45309', label: 'Âmbar', swatch: '#b45309' },
]

const SEG_SRC = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js'

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res()
    const s = document.createElement('script')
    s.src = src; s.crossOrigin = 'anonymous'
    s.onload = () => res(); s.onerror = () => rej(new Error('load failed'))
    document.head.appendChild(s)
  })
}

export default function OfficeMedia() {
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [bg, setBg] = useState<Bg>('none')
  const [error, setError] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const micStream = useRef<MediaStream | null>(null)
  const camStream = useRef<MediaStream | null>(null)
  const segRef = useRef<any>(null)
  const bgRef = useRef<Bg>('none')
  const running = useRef(false)
  const rafId = useRef(0)
  const busy = useRef(false)
  bgRef.current = bg

  const onResults = (res: any) => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const w = c.width, h = c.height
    ctx.save()
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(res.segmentationMask, 0, 0, w, h)
    ctx.globalCompositeOperation = 'source-in'
    ctx.drawImage(res.image, 0, 0, w, h)
    ctx.globalCompositeOperation = 'destination-over'
    if (bgRef.current === 'blur') { ctx.filter = 'blur(10px)'; ctx.drawImage(res.image, 0, 0, w, h); ctx.filter = 'none' }
    else { ctx.fillStyle = bgRef.current as string; ctx.fillRect(0, 0, w, h) }
    ctx.restore()
  }

  async function ensureSeg() {
    if (segRef.current) return segRef.current
    await loadScript(SEG_SRC)
    const SS = (window as any).SelfieSegmentation
    if (!SS) throw new Error('segmentation unavailable')
    const seg = new SS({ locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}` })
    seg.setOptions({ modelSelection: 1, selfieMode: true })
    seg.onResults(onResults)
    segRef.current = seg
    return seg
  }

  async function startSeg() {
    try {
      const seg = await ensureSeg()
      running.current = true
      const tick = async () => {
        if (!running.current) return
        const v = videoRef.current
        if (v && !busy.current && v.readyState >= 2) {
          busy.current = true
          try { await seg.send({ image: v }) } catch {}
          busy.current = false
        }
        rafId.current = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      setError('Fundo virtual indisponível — mostrando câmera sem fundo')
      setBg('none')
    }
  }
  function stopSeg() {
    running.current = false
    cancelAnimationFrame(rafId.current)
  }

  async function toggleMic() {
    setError('')
    if (micOn) {
      micStream.current?.getTracks().forEach(t => t.stop())
      micStream.current = null
      setMicOn(false)
    } else {
      try {
        micStream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
        setMicOn(true)
      } catch { setError('Não consegui acessar o microfone') }
    }
  }

  async function toggleCam() {
    setError('')
    if (camOn) {
      stopSeg()
      camStream.current?.getTracks().forEach(t => t.stop())
      camStream.current = null
      setCamOn(false)
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        camStream.current = s
        const v = videoRef.current!
        v.srcObject = s
        await v.play()
        setCamOn(true)
        if (bgRef.current !== 'none') startSeg()
      } catch { setError('Não consegui acessar a câmera') }
    }
  }

  function pickBg(next: Bg) {
    setBg(next)
    if (!camOn) return
    if (next === 'none') stopSeg()
    else if (!running.current) startSeg()
  }

  useEffect(() => () => {
    stopSeg()
    micStream.current?.getTracks().forEach(t => t.stop())
    camStream.current?.getTracks().forEach(t => t.stop())
  }, [])

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      {/* self-view */}
      <div className={`relative rounded-xl overflow-hidden border border-white/15 bg-black shadow-2xl ${camOn ? 'block' : 'hidden'}`} style={{ width: 200, height: 150 }}>
        <video ref={videoRef} muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)', display: bg === 'none' ? 'block' : 'none' }} />
        <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-cover" style={{ display: bg === 'none' ? 'none' : 'block' }} />
      </div>

      {/* background picker */}
      {camOn && (
        <div className="flex items-center gap-1.5 bg-[#0f1420]/90 rounded-full px-3 py-1.5 border border-white/10">
          <span className="text-[11px] text-zinc-400 mr-1">Fundo:</span>
          {BGS.map(b => (
            <button key={String(b.key)} onClick={() => pickBg(b.key)} title={b.label}
              className={`w-5 h-5 rounded-full border-2 transition-all ${bg === b.key ? 'border-white scale-110' : 'border-white/20'}`}
              style={{ background: b.key === 'none' ? 'repeating-conic-gradient(#555 0% 25%, #888 0% 50%)' : b.key === 'blur' ? '#94a3b8' : b.swatch }} />
          ))}
        </div>
      )}

      {error && <div className="text-[11px] text-amber-300 bg-amber-950/70 rounded-lg px-3 py-1">{error}</div>}

      {/* control bar */}
      <div className="flex items-center gap-2 bg-[#0f1420]/90 rounded-full px-3 py-2 border border-white/10 shadow-xl">
        <button onClick={toggleMic} title={micOn ? 'Desligar microfone' : 'Ligar microfone'}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-green-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}>
          {micOn && <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping" />}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4" />
            {!micOn && <line x1="3" y1="3" x2="21" y2="21" stroke="#f87171" />}
          </svg>
        </button>
        <button onClick={toggleCam} title={camOn ? 'Desligar câmera' : 'Ligar câmera'}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${camOn ? 'bg-green-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            {!camOn && <line x1="3" y1="3" x2="21" y2="21" stroke="#f87171" />}
          </svg>
        </button>
      </div>
    </div>
  )
}
