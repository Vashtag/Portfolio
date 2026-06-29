import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─────────────────────────────────────────────────────────────────────────────
// Brain geometry
//
// We don't load an external 3D model — instead we deform an icosphere into a
// brain-like, wrinkled blob procedurally. This keeps the bundle small, removes
// any asset dependency, and still reads clearly as a "brain" once it rotates.
// ─────────────────────────────────────────────────────────────────────────────

// Multi-octave product-of-sines "fold" field. Products of sines vanish along
// planes, producing ridge/valley patterns reminiscent of cortical gyri.
function foldField(x: number, y: number, z: number): number {
  return (
    0.5 * Math.sin(3.1 * x) * Math.sin(3.7 * y) * Math.sin(3.3 * z) +
    0.25 * Math.sin(6.3 * x + 1.2) * Math.sin(5.9 * y + 0.7) * Math.sin(6.7 * z + 2.1) +
    0.12 * Math.sin(11.0 * x) * Math.sin(12.0 * y) * Math.sin(10.0 * z)
  )
}

const DIM_GREEN = new THREE.Color('#0a8f2a')
const BRIGHT_GREEN = new THREE.Color('#5dff8a')

function useBrainGeometry() {
  return useMemo(() => {
    // Dense icosphere as the source of evenly distributed points.
    const source = new THREE.IcosahedronGeometry(1, 24)
    const srcPos = source.getAttribute('position') as THREE.BufferAttribute

    const count = srcPos.count
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const dir = new THREE.Vector3()
    const tmpColor = new THREE.Color()

    for (let i = 0; i < count; i++) {
      dir.set(srcPos.getX(i), srcPos.getY(i), srcPos.getZ(i)).normalize()

      // Base ellipsoid: longer front-to-back (z), slightly flatter top (y).
      const ex = dir.x * 0.95
      const ey = dir.y * 0.9
      const ez = dir.z * 1.18

      // Cortical wrinkles displaced along the surface direction.
      const fold = foldField(dir.x * 1.0, dir.y * 1.0, dir.z * 1.0)
      let radius = 1 + fold * 0.09

      // Central sagittal fissure: a groove splitting the two hemispheres,
      // strongest along the top (y > 0) midline (x ≈ 0).
      const midline = Math.exp(-(dir.x * dir.x) / 0.01)
      const topMask = Math.max(0, dir.y)
      radius -= 0.12 * midline * topMask

      positions[i * 3] = ex * radius
      positions[i * 3 + 1] = ey * radius
      positions[i * 3 + 2] = ez * radius

      // Brighter green on the ridges to emphasise the folds.
      const t = THREE.MathUtils.clamp(fold * 0.5 + 0.5, 0, 1)
      tmpColor.copy(DIM_GREEN).lerp(BRIGHT_GREEN, t)
      colors[i * 3] = tmpColor.r
      colors[i * 3 + 1] = tmpColor.g
      colors[i * 3 + 2] = tmpColor.b
    }

    source.dispose()

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
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

  // A faint, slow "breathing" pulse on the whole brain.
  useFrame((state) => {
    if (!ref.current || !animate) return
    const t = state.clock.elapsedTime
    const pulse = 1 + Math.sin(t * 0.8) * 0.012
    ref.current.scale.setScalar(pulse)
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        size={0.022}
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
// dependency). Zoom/pan disabled so the brain stays centered; auto-rotates
// unless reduced motion is requested.
function Controls({ animate }: { animate: boolean }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl])

  useEffect(() => {
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.rotateSpeed = 0.5
    controls.autoRotate = animate
    controls.autoRotateSpeed = 0.6
    return () => controls.dispose()
  }, [controls, animate])

  useFrame(() => controls.update())
  return null
}

export default function BrainScene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.3], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <group rotation={[0.15, 0, 0]}>
        <BrainPoints animate={animate} />
      </group>
      <Controls animate={animate} />
    </Canvas>
  )
}
