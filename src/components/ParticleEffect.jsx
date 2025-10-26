"use client"

import { useEffect, useRef } from "react"

export default function ParticleEffect({ color = "#06b6d4", count = 20 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles = []

    class Particle {
      constructor() {
        this.element = document.createElement("div")
        this.element.className = "absolute rounded-full pointer-events-none"
        this.element.style.width = Math.random() * 4 + 2 + "px"
        this.element.style.height = this.element.style.width
        this.element.style.backgroundColor = color
        this.element.style.opacity = Math.random() * 0.5 + 0.3

        this.x = Math.random() * container.clientWidth
        this.y = Math.random() * container.clientHeight
        this.vx = (Math.random() - 0.5) * 2
        this.vy = (Math.random() - 0.5) * 2

        container.appendChild(this.element)
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > container.clientWidth) this.vx *= -1
        if (this.y < 0 || this.y > container.clientHeight) this.vy *= -1

        this.element.style.left = this.x + "px"
        this.element.style.top = this.y + "px"
      }

      remove() {
        this.element.remove()
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle())
    }

    const animate = () => {
      particles.forEach((p) => p.update())
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [color, count])

  return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}
