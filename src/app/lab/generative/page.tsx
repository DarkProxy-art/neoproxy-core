'use client'
import { useEffect, useRef, useState } from 'react'

export default function GenerativeLab() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const [info, setInfo] = useState('INICIANDO...')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.babylonjs.com/babylon.js'
    script.onload = init
    document.head.appendChild(script)

    function init() {
      const BABYLON = window.BABYLON
      const canvas = canvasRef.current
      const engine = new BABYLON.Engine(canvas, true)
      const scene = new BABYLON.Scene(engine)
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 1)

      const camera = new BABYLON.ArcRotateCamera("cam", 0, 1.2, 12, BABYLON.Vector3.Zero(), scene)
      camera.attachControl(canvas, true)
      camera.lowerRadiusLimit = 3
      camera.upperRadiusLimit = 30

      const light = new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0,1,0), scene)
      light.intensity = 0.5
      const point = new BABYLON.PointLight("p", new BABYLON.Vector3(0,5,0), scene)
      point.diffuse = new BABYLON.Color3(0.8, 0, 0)
      point.intensity = 1.5

      // GENERATIVE SYSTEM
      const meshes = []
      const count = 80

      for (let i = 0; i < count; i++) {
        const types = ['sphere', 'box', 'torus', 'ico', 'tetra']
        const type = types[Math.floor(Math.random() * types.length)]
        let mesh

        if (type === 'sphere') mesh = BABYLON.MeshBuilder.CreateSphere("g"+i, { diameter: Math.random()*0.6+0.2, segments: 4 }, scene)
        else if (type === 'box') mesh = BABYLON.MeshBuilder.CreateBox("g"+i, { size: Math.random()*0.5+0.1 }, scene)
        else if (type === 'torus') mesh = BABYLON.MeshBuilder.CreateTorus("g"+i, { diameter: Math.random()*0.8+0.3, thickness: 0.1, tessellation: 8 }, scene)
        else if (type === 'ico') mesh = BABYLON.MeshBuilder.CreateIcoSphere("g"+i, { radius: Math.random()*0.4+0.15, subdivisions: 1 }, scene)
        else mesh = BABYLON.MeshBuilder.CreatePolyhedron("g"+i, { type: 0, size: Math.random()*0.3+0.1 }, scene)

        // Position on sphere surface
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        const r = 2 + Math.random() * 5
        mesh.position = new BABYLON.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )

        const mat = new BABYLON.StandardMaterial("m"+i, scene)
        const isWire = Math.random() > 0.5
        mat.wireframe = isWire
        mat.emissiveColor = isWire
          ? new BABYLON.Color3(0.8, 0, 0)
          : new BABYLON.Color3(Math.random()*0.3, 0, 0)
        mat.diffuseColor = new BABYLON.Color3(0.6, 0, 0)
        mesh.material = mat

        mesh.userData = {
          rotX: (Math.random()-0.5)*0.02,
          rotY: (Math.random()-0.5)*0.02,
          floatSpeed: Math.random()*0.005+0.002,
          floatPhase: Math.random()*Math.PI*2,
          baseY: mesh.position.y
        }
        meshes.push(mesh)
      }

      sceneRef.current = { scene, engine, meshes }
      setInfo('SISTEMA GENERATIVO ACTIVO')

      let t = 0
      engine.runRenderLoop(() => {
        t += 0.01
        meshes.forEach(m => {
          m.rotation.x += m.userData.rotX
          m.rotation.y += m.userData.rotY
          m.position.y = m.userData.baseY + Math.sin(t * m.userData.floatSpeed * 100 + m.userData.floatPhase) * 0.3
        })
        scene.render()
      })

      window.addEventListener('resize', () => engine.resize())
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.engine.dispose()
      }
    }
  }, [])

  return (
    <div style={{ position:'relative', width:'100vw', height:'100vh', background:'#000' }}>
      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block' }} />
      <div style={{
        position:'absolute', top:'1rem', left:'1rem',
        fontFamily:'monospace', fontSize:'10px',
        letterSpacing:'0.2em', color:'#cc0000',
        pointerEvents:'none'
      }}>
        NEO·PROXY // GENERATIVE LAB
      </div>
      <div style={{
        position:'absolute', bottom:'1rem', left:'1rem',
        fontFamily:'monospace', fontSize:'9px',
        color:'#330000', pointerEvents:'none'
      }}>
        {info} · DRAG TO ROTATE · SCROLL TO ZOOM
      </div>
    </div>
  )
}
