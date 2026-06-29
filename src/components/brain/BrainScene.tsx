import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// ─────────────────────────────────────────────────────────────────────────────
// 3D wireframe brain
//
// An icosphere deformed into a brain shape (two hemispheres, a sagittal
// fissure, cortical wrinkles) and rendered as a glowing phosphor-green
// wireframe. No external model asset, and — unlike the previous procedural
// line-soup — this renders reliably and reads clearly as a brain.
// ─────────────────────────────────────────────────────────────────────────────

// Multi-octave product-of-sines field. Products of sines vanish along planes,
// giving ridge/valley patterns reminiscent of cortical gyri.
function foldField(x: number, y: number, z: number): number {
  return (
    0.5 * Math.sin(3.4 * x) * Math.sin(4.1 * y) * Math.sin(3.6 * z) +
    0.28 * Math.sin(7.1 * x + 1.2) * Math.sin(6.7 * y + 0.7) * Math.sin(7.3 * z + 2.1) +
    0.16 * Math.sin(12.0 * x) * Math.sin(13.0 * y) * Math.sin(11.0 * z)
  )
}

const DIM = new THREE.Color('#0a7a32')
const BRIGHT = new THREE.Color('#46ff8c')

function useBrainGeometry() {
  return useMemo(() => {
    // Detail 11 keeps the wireframe readable (not a solid white fuzz).
    const geo = new THREE.IcosahedronGeometry(1, 11)
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const count = pos.count
    const colors = new Float32Array(count * 3)

    const dir = new THREE.Vector3()
    const c = new THREE.Color()

    for (let i = 0; i < count; i++) {
      dir.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()

      // Cortical wrinkles.
      const fold = foldField(dir.x, dir.y, dir.z)
      let r = 1 + fold * 0.12

      // Sagittal fissure: a deep groove down the midline (x≈0), present along
      // the whole top half so the two hemispheres read clearly.
      const midline = Math.exp(-(dir.x * dir.x) / 0.012)
      const top = Math.max(0, dir.y + 0.15)
      r -= 0.22 * midline * top

      // Flatten the underside (where the brainstem/cerebellum would sit).
      const bottom = Math.max(0, -dir.y)
      r -= 0.08 * bottom * bottom

      // Ellipsoid: longer front-to-back (z), flatter on top (y), narrower (x).
      pos.setXYZ(i, dir.x * 0.9 * r, dir.y * 0.82 * r, dir.z * 1.16 * r)

      // Brighter green on the ridges to emphasise the folds.
      const t = THREE.MathUtils.clamp(fold * 0.5 + 0.5, 0, 1)
      c.copy(DIM).lerp(BRIGHT, t)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    pos.needsUpdate = true
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])
}

function BrainMesh({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const geometry = useBrainGeometry()

  useFrame((state, delta) => {
    if (!group.current || !animate) return
    group.current.rotation.y += delta * 0.25
    group.current.rotation.x = 0.12 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01
    group.current.scale.setScalar(pulse)
  })

  return (
    <group ref={group} rotation={[0.12, -0.5, 0]}>
      {/* Phosphor-green wireframe surface. Lower opacity + normal blending
          keeps overlapping lines green instead of stacking to white. */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          vertexColors
          wireframe
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      {/* Subtle additive vertex sparkle for the CRT glow. */}
      <points geometry={geometry}>
        <pointsMaterial
          color="#7dff9f"
          size={0.02}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

// React Three Fiber can lock the drawing buffer to height 0 when the Canvas
// mounts inside a lazy/Suspense boundary before layout settles (an invisible
// brain until the next window resize). Measure the real container size and
// push it to the renderer directly, bypassing the flaky auto-measurement.
function ForceSize() {
  const gl = useThree((s) => s.gl)
  const setSize = useThree((s) => s.setSize)

  useEffect(() => {
    const parent = gl.domElement.parentElement
    if (!parent) return

    let raf = 0
    let matchedFrames = 0
    const start = performance.now()

    // Drive sizing from the container's layout size (clientWidth/Height), which
    // — unlike getBoundingClientRect that R3F uses internally — is immune to the
    // ancestor CRT-boot scale transform. Keep correcting until the canvas
    // matches for a few frames (or we give up after a few seconds).
    const tick = () => {
      const w = parent.clientWidth
      const h = parent.clientHeight
      if (w > 0 && h > 0) {
        if (Math.abs(gl.domElement.clientHeight - h) > 1 || Math.abs(gl.domElement.clientWidth - w) > 1) {
          setSize(w, h)
          matchedFrames = 0
        } else {
          matchedFrames += 1
        }
      }
      if (matchedFrames < 8 && performance.now() - start < 5000) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gl, setSize])

  return null
}

// Drag-to-orbit using three.js's built-in OrbitControls (no extra dependency).
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
    return () => controls.dispose()
  }, [controls])

  useFrame(() => controls.update())
  return null
}

export default function BrainScene({ animate }: { animate: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.1], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ForceSize />
      <BrainMesh animate={animate} />
      <Controls />
    </Canvas>
  )
}
