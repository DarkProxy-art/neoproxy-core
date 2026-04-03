'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export default function ARPage() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [score, setScore] = useState(0)
  const [ammo, setAmmo] = useState(12)
  const [hit, setHit] = useState(false)
  const scoreRef = useRef(0)
  const ammoRef = useRef(12)

  useEffect(() => {
    if (!mountRef.current) return
    const W = window.innerWidth
    const H = window.innerHeight
    const video = document.createElement('video')
    video.autoplay = true
    video.playsInline = true
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(s => { video.srcObject = s })
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(70, W/H, 0.01, 100)
    const vc = document.createElement('canvas')
    vc.width = W; vc.height = H
    const vCtx = vc.getContext('2d')
    const vTex = new THREE.CanvasTexture(vc)
    const bgScene = new THREE.Scene()
    const bgCam = new THREE.OrthographicCamera(-1,1,1,-1,-1,1)
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2,2), new THREE.MeshBasicMaterial({ map: vTex, depthTest: false }))
    bg.renderOrder = -1
    bgScene.add(bg)
    scene.add(new THREE.PointLight(0xff0000, 2, 10))
    scene.add(new THREE.AmbientLight(0x330000, 1))
    const enemies = []
    function spawn() {
      const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.15), new THREE.MeshStandardMaterial({ color: 0xcc0000, emissive: 0x440000, roughness: 0.3, metalness: 0.8 }))
      m.position.set((Math.random()-.5)*3, (Math.random()-.5)*1.5, -3-Math.random()*3)
      m.userData = { id: 'NP-ENT-' + Date.now() }
      scene.add(m); enemies.push(m)
    }
    for (let i=0;i<5;i++) spawn()
    const ray = new THREE.Raycaster()
    function shoot() {
      if (ammoRef.current <= 0) return
      ammoRef.current -= 1; setAmmo(ammoRef.current)
      ray.setFromCamera(new THREE.Vector2(0,0), camera)
      const hits = ray.intersectObjects(enemies)
      if (hits.length > 0) {
        const t = hits[0].object
        scene.remove(t); enemies.splice(enemies.indexOf(t),1)
        scoreRef.current += 100; setScore(scoreRef.current); setHit(true)
        setTimeout(() => setHit(false), 200)
        fetch('/api/memory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ title: 'KILL_' + Date.now(), content: JSON.stringify({ type:'kill', id: t.userData.id, score: scoreRef.current }) }) })
        if (enemies.length < 3) spawn()
      }
      if (ammoRef.current === 0) setTimeout(() => { ammoRef.current = 12; setAmmo(12) }, 2000)
    }
    window.addEventListener('click', shoot)
    window.addEventListener('touchend', e => { e.preventDefault(); shoot() }, { passive: false })
    let id
    const clock = new THREE.Clock()
    function loop() {
      id = requestAnimationFrame(loop)
      const t = clock.getElapsedTime()
      if (video.readyState >= 2) { vCtx.drawImage(video,0,0,W,H); vTex.needsUpdate = true }
      enemies.forEach(e => { e.rotation.x = t*.8; e.rotation.y = t*1.2 })
      renderer.autoClear = false; renderer.clear()
      renderer.render(bgScene, bgCam); renderer.render(scene, camera)
    }
    loop()
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('click', shoot)
      renderer.dispose()
      const s = video.srcObject; s && s.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{ position:'fixed', inset:0, background:'#000', overflow:'hidden' }}>
      <div ref={mountRef} style={{ position:'absolute', inset:0 }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, display:'flex', justifyContent:'space-between', padding:'1rem 1.5rem', fontFamily:'monospace', fontSize:'11px', letterSpacing:'0.2em', color:'#cc0000', pointerEvents:'none' }}>
        <span>NEO·PROXY COMBAT v0.1</span>
        <span>SCORE: {String(score).padStart(6,'0')}</span>
      </div>
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', pointerEvents:'none' }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <line x1="20" y1="5" x2="20" y2="14" stroke={hit?'#fff':'#cc0000'} strokeWidth="1"/>
          <line x1="20" y1="26" x2="20" y2="35" stroke={hit?'#fff':'#cc0000'} strokeWidth="1"/>
          <line x1="5" y1="20" x2="14" y2="20" stroke={hit?'#fff':'#cc0000'} strokeWidth="1"/>
          <line x1="26" y1="20" x2="35" y2="20" stroke={hit?'#fff':'#cc0000'} strokeWidth="1"/>
          <circle cx="20" cy="20" r="2" fill="none" stroke={hit?'#fff':'#cc0000'} strokeWidth="1"/>
        </svg>
      </div>
      <div style={{ position:'absolute', bottom:'2rem', right:'1.5rem', fontFamily:'monospace', fontSize:'10px', letterSpacing:'0.3em', color:'#cc0000', pointerEvents:'none' }}>
        {ammo === 0 ? 'RELOADING...' : 'AMMO: ' + String(ammo).padStart(2,'0') + ' / 12'}
      </div>
      <div style={{ position:'absolute', bottom:'2rem', left:'1.5rem', fontFamily:'monospace', fontSize:'9px', letterSpacing:'0.2em', color:'#330000', pointerEvents:'none' }}>
        OPERATOR: DARKPROXY
