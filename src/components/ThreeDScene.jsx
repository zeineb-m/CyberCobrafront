"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeDScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x0f172a, 0.1)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    camera.position.z = 5

    const geometry = new THREE.IcosahedronGeometry(2, 4)
    const material = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      wireframe: false,
      shininess: 100,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true
    scene.add(mesh)

    // Add wireframe overlay
    const wireframeGeometry = new THREE.IcosahedronGeometry(2, 4)
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee, linewidth: 2 })
    const wireframe = new THREE.LineSegments(new THREE.EdgesGeometry(wireframeGeometry), wireframeMaterial)
    mesh.add(wireframe)

    const light1 = new THREE.PointLight(0x06b6d4, 1.5, 100)
    light1.position.set(5, 5, 5)
    light1.castShadow = true
    scene.add(light1)

    const light2 = new THREE.PointLight(0x22d3ee, 0.8, 100)
    light2.position.set(-5, -5, 5)
    light2.castShadow = true
    scene.add(light2)

    const light3 = new THREE.PointLight(0xff006e, 0.5, 100)
    light3.position.set(0, 5, -5)
    scene.add(light3)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambientLight)

    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 150
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 20
      positions[i + 1] = (Math.random() - 0.5) * 20
      positions[i + 2] = (Math.random() - 0.5) * 20

      velocities[i] = (Math.random() - 0.5) * 0.02
      velocities[i + 1] = (Math.random() - 0.5) * 0.02
      velocities[i + 2] = (Math.random() - 0.5) * 0.02
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    const particlesMaterial = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.15, sizeAttenuation: true })
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particles)

    const orbitGeometry = new THREE.SphereGeometry(0.3, 16, 16)
    const orbitMaterial = new THREE.MeshPhongMaterial({ color: 0xff006e, emissive: 0xff006e })
    const orbitingSphere1 = new THREE.Mesh(orbitGeometry, orbitMaterial)
    const orbitingSphere2 = new THREE.Mesh(orbitGeometry, orbitMaterial)

    scene.add(orbitingSphere1)
    scene.add(orbitingSphere2)

    // Animation loop
    let animationId
    let time = 0
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      // Main mesh rotation
      mesh.rotation.x += 0.001
      mesh.rotation.y += 0.002

      // Particle animation
      particles.rotation.x += 0.0001
      particles.rotation.y += 0.0002

      // Update particle positions for floating effect
      const positionAttribute = particlesGeometry.getAttribute("position")
      const positionArray = positionAttribute.array
      for (let i = 0; i < positionArray.length; i += 3) {
        positionArray[i] += velocities[i]
        positionArray[i + 1] += velocities[i + 1]
        positionArray[i + 2] += velocities[i + 2]

        // Wrap around boundaries
        if (Math.abs(positionArray[i]) > 10) velocities[i] *= -1
        if (Math.abs(positionArray[i + 1]) > 10) velocities[i + 1] *= -1
        if (Math.abs(positionArray[i + 2]) > 10) velocities[i + 2] *= -1
      }
      positionAttribute.needsUpdate = true

      // Orbiting spheres
      orbitingSphere1.position.x = Math.cos(time) * 4
      orbitingSphere1.position.y = Math.sin(time * 0.7) * 4
      orbitingSphere1.position.z = Math.sin(time * 0.5) * 4

      orbitingSphere2.position.x = Math.cos(time + Math.PI) * 4
      orbitingSphere2.position.y = Math.sin((time + Math.PI) * 0.7) * 4
      orbitingSphere2.position.z = Math.sin((time + Math.PI) * 0.5) * 4

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)
      containerRef.current?.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      wireframeGeometry.dispose()
      wireframeMaterial.dispose()
      orbitGeometry.dispose()
      orbitMaterial.dispose()
      particlesGeometry.dispose()
      particlesMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} className="w-full h-full" />
}
