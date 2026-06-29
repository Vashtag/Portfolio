import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Brain geometry
//
// The hero brain stays procedural to avoid shipping a model asset, but the point
// cloud is shaped as two separate hemispheres rather than a single blob. The
// sampled surface includes a sagittal fissure, front/back asymmetry, temporal
// lobe bulges, and darker sulcal groove bands so it reads more like cortex.

const DIM_GREEN = new THREE.Color('#0a8f2a')
const MID_GREEN = new THREE.Color('#18d957')
const BRIGHT_GREEN = new THREE.Color('#7dff9f')

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1)
}

function gaussian(value: number, width: number) {
  return Math.exp(-(value * value) / width)
}

function corticalFoldField(x: number, y: number, z: number, hemi: number): number {
  return (
    0.38 * Math.sin(10.5 * z + 4.2 * y + hemi * 0.7) +
    0.3 * Math.sin(13.0 * y - 3.6 * x + hemi * 1.4) +
    0.22 * Math.sin(17.5 * (z + x * 0.3) + 1.6) +
    0.16 * Math.sin(24.0 * (y - z * 0.18) + hemi * 0.9)
  )
}

function grooveMask(x: number, y: number, z: number, hemi: number): number {
  const lateralSulcus = gaussian(y + 0.18 + z * 0.08, 0.006) * gaussian(Math.abs(x) - 0.62, 0.09)
  const centralSulcus = gaussian(z - 0.08 + hemi * x * 0.08, 0.008) * clamp01((y + 0.1) / 0.9)
  const parietoOccipital = gaussian(z + 0.46 - y * 0.2, 0.01) * clamp01((y + 0.15) / 0.8)
  const frontalCurves = gaussian(z - 0.55, 0.09) * (0.5 + 0.5 * Math.sin(18 * y + hemi * 2.2))

  return clamp01(lateralSulcus * 0.85 + centralSulcus * 0.7 + parietoOccipital * 0.55 + frontalCurves * 0.25)
}

function useBrainGeometry() {
  return useMemo(() => {
    const rings = 86
    const segments = 132
    const count = 2 * (rings + 1) * (segments + 1)
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const tmpColor = new THREE.Color()
    let index = 0

    for (const hemi of [-1, 1]) {
      for (let r = 0; r <= rings; r++) {
        const lat = -Math.PI / 2 + (r / rings) * Math.PI
        const y0 = Math.sin(lat)
        const latitudeRadius = Math.cos(lat)

        for (let s = 0; s <= segments; s++) {
          const lon = -Math.PI / 2 + (s / segments) * Math.PI
          const lateral = Math.cos(lon)
          const z0 = Math.sin(lon) * latitudeRadius
          const x0 = hemi * lateral * latitudeRadius

          const top = clamp01((y0 + 1) / 2)
          const bottom = 1 - top
          const front = clamp01(z0)
          const back = clamp01(-z0)

          const frontRoundness = 1 + 0.08 * front
          const backTaper = 1 - 0.1 * back * back
          const temporalBulge = gaussian(y0 + 0.33, 0.075) * gaussian(z0 + 0.08, 0.8) * lateral
          const occipitalLift = gaussian(z0 + 0.62, 0.18) * gaussian(y0 + 0.03, 0.4)

          let x = hemi * (0.065 + Math.abs(x0) * 0.9 * frontRoundness * backTaper)
          let y = y0 * 0.76 - temporalBulge * 0.1 + occipitalLift * 0.04
          let z = z0 * 1.15 * (1 + 0.04 * front - 0.05 * back)

          x += hemi * temporalBulge * 0.16
          y += bottom * 0.03 * Math.sin(hemi * 2.4 + z0 * 3.2)

          const fold = corticalFoldField(x, y, z, hemi)
          const groove = grooveMask(x, y, z, hemi)
          const displacement = 1 + fold * 0.03 - groove * 0.055

          x *= displacement
          y *= displacement
          z *= displacement

          positions[index * 3] = x
          positions[index * 3 + 1] = y
          positions[index * 3 + 2] = z

          const ridgeLight = clamp01(0.46 + fold * 0.24 - groove * 0.42 + top * 0.12)
          tmpColor.copy(DIM_GREEN).lerp(MID_GREEN, ridgeLight).lerp(BRIGHT_GREEN, clamp01(ridgeLight - 0.55))
          colors[index * 3] = tmpColor.r
          colors[index * 3 + 1] = tmpColor.g
          colors[index * 3 + 2] = tmpColor.b

          index++
        }
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.computeBoundingSphere()
    return geometry
  }, [])
}

// Soft round sprite so each point glows instead of being a hard square.
function useGlowTexture() {
  return useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.3, 'rgba(180,255,200,0.85)')
    grad.addColorStop(1, 'rgba(0,255,65,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [])
}

function BrainPoints({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const geometry = useBrainGeometry()
  const glow = useGlowTexture()

  useFrame((state, delta) => {
    if (!ref.current) return

    if (animate) {
      ref.current.rotation.y += delta * 0.32
      ref.current.rotation.x = 0.08 + Math.sin(state.clock.elapsedTime * 0.35) * 0.035
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01
      ref.current.scale.setScalar(pulse)
    }
  })

  return (
    <points ref={ref} geometry={geometry} rotation={[0.08, -0.45, 0]}>
      <pointsMaterial
        size={0.019}
        map={glow}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// Drag-to-orbit controls using three.js's built-in OrbitControls (no extra
// dependency). Zoom/pan disabled so the brain stays centered; the object itself
// rotates so the motion is visible even when the user never interacts.
function Controls() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl])

  useEffect(() => {
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 0.5
    controls.autoRotate = false
    return () => controls.dispose()
  }, [controls])

  useFrame(() => controls.update())
  return null
}

export default function BrainScene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.35], fov: 48 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <group rotation={[0.12, 0, 0]}>
        <BrainPoints animate={animate} />
      </group>
      <Controls />
    </Canvas>
  )
}
