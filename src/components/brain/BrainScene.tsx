import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Brain geometry
//
// The hero brain is a procedural wireframe inspired by anatomical low-poly
// references: two folded cortical hemispheres, a visible longitudinal fissure,
// cerebellum, and brainstem. It avoids model assets while reading as a real
// side-view wireframe brain instead of a generic particle cloud.

const WIRE_DARK = new THREE.Color('#007a6d')
const WIRE_MID = new THREE.Color('#00e6ff')
const WIRE_HOT = new THREE.Color('#7dff9f')

type Sample = {
  point: THREE.Vector3
  light: number
}

type SidePoint = {
  y: number
  z: number
}

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1)
}

function gaussian(value: number, width: number) {
  return Math.exp(-(value * value) / width)
}

function corticalFoldField(x: number, y: number, z: number, hemi: number): number {
  return (
    0.42 * Math.sin(8.5 * z + 5.4 * y + hemi * 0.8) +
    0.34 * Math.sin(11.5 * y - 4.8 * x + hemi * 1.6) +
    0.24 * Math.sin(15.0 * (z + x * 0.35) + 1.6) +
    0.18 * Math.sin(21.0 * (y - z * 0.2) + hemi * 1.1)
  )
}

function grooveMask(x: number, y: number, z: number, hemi: number): number {
  const lateralSulcus = gaussian(y + 0.2 + z * 0.1, 0.006) * gaussian(Math.abs(x) - 0.6, 0.08)
  const centralSulcus = gaussian(z - 0.08 + hemi * x * 0.09, 0.007) * clamp01((y + 0.1) / 0.9)
  const parietoOccipital = gaussian(z + 0.45 - y * 0.22, 0.01) * clamp01((y + 0.15) / 0.8)
  const frontalCurves = gaussian(z - 0.55, 0.08) * (0.5 + 0.5 * Math.sin(17 * y + hemi * 2.2))

  return clamp01(lateralSulcus * 0.9 + centralSulcus * 0.75 + parietoOccipital * 0.6 + frontalCurves * 0.28)
}

function cortexSample(hemi: number, latT: number, lonT: number): Sample {
  const lat = -Math.PI / 2 + latT * Math.PI
  const lon = -Math.PI / 2 + lonT * Math.PI
  const y0 = Math.sin(lat)
  const latitudeRadius = Math.cos(lat)
  const lateral = Math.cos(lon)
  const z0 = Math.sin(lon) * latitudeRadius
  const x0 = hemi * lateral * latitudeRadius

  const top = clamp01((y0 + 1) / 2)
  const bottom = 1 - top
  const front = clamp01(z0)
  const back = clamp01(-z0)

  const frontalLobe = 1 + 0.12 * front
  const occipitalTaper = 1 - 0.13 * back * back
  const temporalBulge = gaussian(y0 + 0.35, 0.07) * gaussian(z0 + 0.02, 0.75) * lateral
  const occipitalRound = gaussian(z0 + 0.65, 0.16) * gaussian(y0 + 0.03, 0.45)

  let x = hemi * (0.07 + Math.abs(x0) * 0.88 * frontalLobe * occipitalTaper)
  let y = y0 * 0.76 - temporalBulge * 0.13 + occipitalRound * 0.05
  let z = z0 * 1.18 * (1 + 0.05 * front - 0.04 * back)

  x += hemi * temporalBulge * 0.18
  y += bottom * 0.035 * Math.sin(hemi * 2.4 + z0 * 3.2)

  const fold = corticalFoldField(x, y, z, hemi)
  const groove = grooveMask(x, y, z, hemi)
  const displacement = 1 + fold * 0.038 - groove * 0.075

  x *= displacement
  y *= displacement
  z *= displacement

  return {
    point: new THREE.Vector3(x, y, z),
    light: clamp01(0.48 + fold * 0.22 - groove * 0.38 + top * 0.12),
  }
}

function sideCortexSample(hemi: number, side: SidePoint, lift = 0): Sample {
  const y = side.y
  const z = side.z
  const oval =
    Math.pow((z - 0.02) / 1.18, 2) +
    Math.pow((y + 0.01 + 0.08 * Math.max(0, -z)) / 0.78, 2)
  const lateral = Math.sqrt(Math.max(0.08, 1 - oval * 0.62))
  const temporalShelf = gaussian(y + 0.42, 0.04) * gaussian(z + 0.04, 0.5)
  const fold = corticalFoldField(hemi * lateral, y, z, hemi)
  const groove = grooveMask(hemi * lateral, y, z, hemi)

  const point = new THREE.Vector3(
    hemi * (0.7 + 0.2 * lateral + temporalShelf * 0.08 + lift),
    y + fold * 0.012 - groove * 0.018,
    z + fold * 0.015,
  )

  return {
    point,
    light: clamp01(0.68 + fold * 0.16 - groove * 0.18 + lift * 0.8),
  }
}

function ellipsoidSample(
  latT: number,
  lonT: number,
  center: THREE.Vector3,
  scale: THREE.Vector3,
  phase = 0,
): Sample {
  const lat = -Math.PI / 2 + latT * Math.PI
  const lon = lonT * Math.PI * 2
  const cosLat = Math.cos(lat)
  const wave = 1 + 0.04 * Math.sin(11 * lon + phase) * Math.sin(7 * lat - phase)
  const point = new THREE.Vector3(
    center.x + Math.cos(lon) * cosLat * scale.x * wave,
    center.y + Math.sin(lat) * scale.y * wave,
    center.z + Math.sin(lon) * cosLat * scale.z * wave,
  )

  return { point, light: clamp01(0.42 + 0.22 * Math.sin(9 * lon + phase) + 0.15 * latT) }
}

function brainstemSample(rowT: number, sideT: number): Sample {
  const angle = sideT * Math.PI * 2
  const radius = THREE.MathUtils.lerp(0.12, 0.06, rowT)
  const point = new THREE.Vector3(
    Math.cos(angle) * radius,
    -0.72 - rowT * 0.5,
    -0.34 + Math.sin(angle) * radius * 0.7 + rowT * 0.08,
  )
  return { point, light: 0.48 + 0.18 * Math.sin(angle) }
}

function useBrainWireGeometry() {
  return useMemo(() => {
    const linePositions: number[] = []
    const lineColors: number[] = []
    const tmpColor = new THREE.Color()

    const pushVertex = (sample: Sample) => {
      linePositions.push(sample.point.x, sample.point.y, sample.point.z)
      tmpColor.copy(WIRE_DARK).lerp(WIRE_MID, sample.light).lerp(WIRE_HOT, clamp01(sample.light - 0.64))
      lineColors.push(tmpColor.r, tmpColor.g, tmpColor.b)
    }

    const pushSegment = (a: Sample, b: Sample) => {
      pushVertex(a)
      pushVertex(b)
    }

    const pushSideCurve = (hemi: number, points: SidePoint[], light = 0.88, lift = 0.026) => {
      for (let i = 0; i < points.length - 1; i++) {
        const a = sideCortexSample(hemi, points[i], lift)
        const b = sideCortexSample(hemi, points[i + 1], lift)
        pushSegment({ ...a, light }, { ...b, light })
      }
    }

    const pushSideLoop = (
      hemi: number,
      center: SidePoint,
      radiusY: number,
      radiusZ: number,
      phase: number,
      light = 0.82,
    ) => {
      const steps = 46
      const points: SidePoint[] = []
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2
        const wobble = 1 + 0.16 * Math.sin(3 * t + phase) + 0.08 * Math.sin(5 * t - phase)
        points.push({
          y: center.y + Math.sin(t) * radiusY * wobble,
          z: center.z + Math.cos(t) * radiusZ * (1 + 0.1 * Math.sin(2 * t + phase)),
        })
      }
      pushSideCurve(hemi, points, light, 0.034)
    }

    const cortexRings = 44
    const cortexSegments = 66
    for (const hemi of [-1, 1]) {
      for (let r = 0; r <= cortexRings; r++) {
        for (let s = 0; s < cortexSegments; s++) {
          pushSegment(
            cortexSample(hemi, r / cortexRings, s / cortexSegments),
            cortexSample(hemi, r / cortexRings, (s + 1) / cortexSegments),
          )
        }
      }

      for (let s = 0; s <= cortexSegments; s++) {
        for (let r = 0; r < cortexRings; r++) {
          pushSegment(
            cortexSample(hemi, r / cortexRings, s / cortexSegments),
            cortexSample(hemi, (r + 1) / cortexRings, s / cortexSegments),
          )
        }
      }

      pushSideCurve(hemi, [
        { y: -0.1, z: 0.75 },
        { y: -0.16, z: 0.52 },
        { y: -0.2, z: 0.28 },
        { y: -0.24, z: 0.02 },
        { y: -0.26, z: -0.28 },
        { y: -0.2, z: -0.55 },
      ], 0.96, 0.045)
      pushSideCurve(hemi, [
        { y: 0.64, z: 0.08 },
        { y: 0.46, z: 0.0 },
        { y: 0.25, z: -0.05 },
        { y: 0.03, z: -0.04 },
        { y: -0.16, z: 0.02 },
      ], 0.93, 0.044)
      pushSideCurve(hemi, [
        { y: 0.43, z: 0.62 },
        { y: 0.48, z: 0.35 },
        { y: 0.46, z: 0.05 },
        { y: 0.38, z: -0.28 },
        { y: 0.27, z: -0.58 },
      ], 0.82, 0.032)
      pushSideCurve(hemi, [
        { y: 0.19, z: 0.5 },
        { y: 0.22, z: 0.24 },
        { y: 0.18, z: -0.04 },
        { y: 0.13, z: -0.32 },
        { y: 0.04, z: -0.58 },
      ], 0.8, 0.03)
      pushSideCurve(hemi, [
        { y: -0.36, z: 0.48 },
        { y: -0.4, z: 0.2 },
        { y: -0.42, z: -0.08 },
        { y: -0.38, z: -0.38 },
      ], 0.85, 0.038)
      pushSideCurve(hemi, [
        { y: -0.5, z: 0.35 },
        { y: -0.54, z: 0.06 },
        { y: -0.52, z: -0.22 },
        { y: -0.45, z: -0.5 },
      ], 0.76, 0.026)

      const loops = [
        { center: { y: 0.3, z: 0.62 }, ry: 0.16, rz: 0.18, phase: 0.2 },
        { center: { y: 0.1, z: 0.56 }, ry: 0.13, rz: 0.16, phase: 1.3 },
        { center: { y: 0.5, z: 0.24 }, ry: 0.13, rz: 0.18, phase: 2.0 },
        { center: { y: 0.28, z: 0.14 }, ry: 0.12, rz: 0.15, phase: 2.8 },
        { center: { y: 0.5, z: -0.22 }, ry: 0.12, rz: 0.17, phase: 0.7 },
        { center: { y: 0.24, z: -0.38 }, ry: 0.13, rz: 0.19, phase: 1.8 },
        { center: { y: -0.06, z: -0.54 }, ry: 0.14, rz: 0.18, phase: 2.6 },
        { center: { y: -0.38, z: 0.12 }, ry: 0.1, rz: 0.2, phase: 3.1 },
        { center: { y: -0.36, z: -0.28 }, ry: 0.1, rz: 0.17, phase: 0.9 },
      ]
      loops.forEach((loop, i) => {
        pushSideLoop(hemi, loop.center, loop.ry, loop.rz, loop.phase + hemi * 0.4, 0.76 + (i % 3) * 0.04)
      })
    }

    const cerebellumCenter = new THREE.Vector3(0, -0.58, -0.72)
    const cerebellumScale = new THREE.Vector3(0.52, 0.24, 0.34)
    const cerebellumRings = 20
    const cerebellumSegments = 42
    for (let r = 0; r <= cerebellumRings; r++) {
      for (let s = 0; s < cerebellumSegments; s++) {
        pushSegment(
          ellipsoidSample(r / cerebellumRings, s / cerebellumSegments, cerebellumCenter, cerebellumScale, 0.8),
          ellipsoidSample(r / cerebellumRings, (s + 1) / cerebellumSegments, cerebellumCenter, cerebellumScale, 0.8),
        )
      }
    }
    for (let s = 0; s < cerebellumSegments; s += 2) {
      for (let r = 0; r < cerebellumRings; r++) {
        pushSegment(
          ellipsoidSample(r / cerebellumRings, s / cerebellumSegments, cerebellumCenter, cerebellumScale, 0.8),
          ellipsoidSample((r + 1) / cerebellumRings, s / cerebellumSegments, cerebellumCenter, cerebellumScale, 0.8),
        )
      }
    }
    for (let band = 0; band < 8; band++) {
      const y = -0.7 + band * 0.035
      const points: Sample[] = []
      for (let s = 0; s <= 52; s++) {
        const t = (s / 52) * Math.PI * 2
        const ripple = 1 + 0.05 * Math.sin(8 * t + band)
        points.push({
          point: new THREE.Vector3(
            Math.cos(t) * cerebellumScale.x * ripple,
            y + 0.015 * Math.sin(3 * t + band),
            cerebellumCenter.z + Math.sin(t) * cerebellumScale.z * 0.82,
          ),
          light: 0.72,
        })
      }
      for (let i = 0; i < points.length - 1; i++) {
        pushSegment(points[i], points[i + 1])
      }
    }

    const stemRows = 12
    const stemSegments = 18
    for (let r = 0; r <= stemRows; r++) {
      for (let s = 0; s < stemSegments; s++) {
        pushSegment(brainstemSample(r / stemRows, s / stemSegments), brainstemSample(r / stemRows, (s + 1) / stemSegments))
      }
    }
    for (let s = 0; s < stemSegments; s += 3) {
      for (let r = 0; r < stemRows; r++) {
        pushSegment(brainstemSample(r / stemRows, s / stemSegments), brainstemSample((r + 1) / stemRows, s / stemSegments))
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))
    geometry.computeBoundingSphere()
    return geometry
  }, [])
}

function BrainWireframe({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.LineSegments>(null)
  const geometry = useBrainWireGeometry()

  useFrame((state, delta) => {
    if (!ref.current) return

    if (animate) {
      ref.current.rotation.y += delta * 0.24
      ref.current.rotation.x = 0.03 + Math.sin(state.clock.elapsedTime * 0.35) * 0.025
      ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.75) * 0.006)
    }
  })

  return (
    <lineSegments ref={ref} geometry={geometry} rotation={[0.03, -1.15, 0]}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.92}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
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
      camera={{ position: [0, 0, 3.45], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <group position={[0, 0.05, 0]} rotation={[0.08, 0, 0]}>
        <BrainWireframe animate={animate} />
      </group>
      <Controls />
    </Canvas>
  )
}
