"use client"

import { useRef, useEffect, useState } from "react"
import { OPTIMAL_LOGO_PATH } from "./optimal-logo-path"

export default function LogoParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const ZOOM_FACTOR = 2

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width || window.innerWidth
      const height = rect.height || window.innerHeight

      canvas.width = width
      canvas.height = height

      // Only set ready if we have valid dimensions
      if (width > 0 && height > 0) {
        setIsReady(true)
      }
    }

    // Initial size setup
    updateCanvasSize()

    let particles: {
      x: number
      y: number
      baseX: number
      baseY: number
      size: number
      life: number
      floatRadius: number
      angle: number
      isOptimal: boolean
    }[] = []

    let textImageData: ImageData | null = null

    function createTextImage() {
      if (!ctx || !canvas || canvas.width === 0 || canvas.height === 0) return 0

      ctx.fillStyle = "white"
      ctx.save()

      const logoHeight = 184 * ZOOM_FACTOR
      const logoWidth = logoHeight

      ctx.translate(canvas.width / 2 - logoWidth / 2, canvas.height / 2 - logoHeight / 2)

      ctx.save()
      ctx.translate(logoWidth / 2, logoHeight / 2)
      ctx.scale(1, -1)
      ctx.translate(-logoWidth / 2, -logoHeight / 2)
      const optimalScale = logoHeight / 5700
      ctx.scale(optimalScale, optimalScale)
      const path = new Path2D(OPTIMAL_LOGO_PATH)
      ctx.fill(path)
      ctx.restore()

      ctx.restore()

      // Only get image data if canvas has valid dimensions
      if (canvas.width > 0 && canvas.height > 0) {
        textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }

      return optimalScale
    }

    function createParticle(scale: number) {
      if (!ctx || !canvas || !textImageData || canvas.width === 0 || canvas.height === 0) return null

      const data = textImageData.data

      for (let attempt = 0; attempt < 100; attempt++) {
        const x = Math.floor(Math.random() * canvas.width)
        const y = Math.floor(Math.random() * canvas.height)

        if (data[(y * canvas.width + x) * 4 + 3] > 128) {
          return {
            x: x,
            y: y,
            baseX: x,
            baseY: y,
            size: Math.random() * 1 + 0.5,
            life: Math.random() * 100 + 50,
            floatRadius: Math.random() * 10 + 2,
            angle: Math.random() * Math.PI * 2,
            isOptimal: true,
          }
        }
      }

      return null
    }

    function createInitialParticles(scale: number) {
      if (!canvas || canvas.width === 0 || canvas.height === 0) return

      const baseParticleCount = 3000
      const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)))
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(scale)
        if (particle) particles.push(particle)
      }
    }

    let animationFrameId: number
    let time = 0

    function animate(scale: number) {
      if (!ctx || !canvas || canvas.width === 0 || canvas.height === 0) return

      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      time += 0.01

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.angle += 0.01
        p.x = p.baseX + Math.cos(p.angle + time) * p.floatRadius
        p.y = p.baseY + Math.sin(p.angle + time) * p.floatRadius
        ctx.fillStyle = "#f5f5f5"
        ctx.fillRect(p.x, p.y, p.size, p.size)

        p.life--
        if (p.life <= 0) {
          const newParticle = createParticle(scale)
          if (newParticle) {
            particles[i] = newParticle
          } else {
            particles.splice(i, 1)
            i--
          }
        }
      }

      const baseParticleCount = 3000
      const targetParticleCount = Math.floor(
        baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)),
      )
      while (particles.length < targetParticleCount) {
        const newParticle = createParticle(scale)
        if (newParticle) particles.push(newParticle)
      }

      animationFrameId = requestAnimationFrame(() => animate(scale))
    }

    function initializeAnimation() {
      if (!isReady || !canvas || canvas.width === 0 || canvas.height === 0) return

      const scale = createTextImage()
      particles = [] // Reset particles
      createInitialParticles(scale)

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animate(scale)
    }

    const handleResize = () => {
      updateCanvasSize()
      // Delay initialization to ensure canvas is properly sized
      setTimeout(initializeAnimation, 100)
    }

    window.addEventListener("resize", handleResize)

    // Initialize when ready
    if (isReady) {
      initializeAnimation()
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isReady])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ background: "transparent", display: "block" }}
      aria-label="Floating Optimal logo particles"
      role="img"
    />
  )
}
