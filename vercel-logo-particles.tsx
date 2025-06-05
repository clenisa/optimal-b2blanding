"use client"

import { useRef, useEffect, useState } from "react"
import { OPTIMAL_LOGO_PATH } from "./optimal-logo-path"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setIsMobile(window.innerWidth < 768) // Set mobile breakpoint
    }

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
      if (!ctx || !canvas) return 0

      ctx.fillStyle = "white"
      ctx.save()

      const logoHeight = isMobile ? 80 : 160 // Increased size since it's the only logo
      const logoWidth = logoHeight // The Optimal logo is square

      // Center the logo
      ctx.translate(canvas.width / 2 - logoWidth / 2, canvas.height / 2 - logoHeight / 2)

      // Draw Optimal logo
      ctx.save()
      ctx.translate(logoWidth / 2, logoHeight / 2) // Move to center of logo area
      ctx.scale(1, -1) // Flip vertically
      ctx.translate(-logoWidth / 2, -logoHeight / 2) // Move back
      const optimalScale = logoHeight / 5700 // Adjusted for the larger coordinate system of the new SVG
      ctx.scale(optimalScale, optimalScale)
      const path = new Path2D(OPTIMAL_LOGO_PATH)
      ctx.fill(path)
      ctx.restore()

      ctx.restore()

      textImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      return optimalScale
    }

    function createParticle(scale: number) {
      if (!ctx || !canvas || !textImageData) return null

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
      const baseParticleCount = 3000 // Fewer particles for more spacing
      const particleCount = Math.floor(baseParticleCount * Math.sqrt((canvas.width * canvas.height) / (1920 * 1080)))
      for (let i = 0; i < particleCount; i++) {
        const particle = createParticle(scale)
        if (particle) particles.push(particle)
      }
    }

    let animationFrameId: number

    let time = 0

    function animate(scale: number) {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += 0.01

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.angle += 0.01
        p.x = p.baseX + Math.cos(p.angle + time) * p.floatRadius
        p.y = p.baseY + Math.sin(p.angle + time) * p.floatRadius
        ctx.fillStyle = "white"
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

    const scale = createTextImage()
    createInitialParticles(scale)
    animate(scale)

    const handleResize = () => {
      updateCanvasSize()
      const newScale = createTextImage()
      particles = []
      createInitialParticles(newScale)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute top-0 left-0 touch-none"
        aria-label="Floating Optimal logo particles"
      />
      <div className="absolute bottom-[100px] text-center z-10">
        <p className="font-mono text-gray-400 text-xs sm:text-base md:text-sm ">
          keep up with{" "}
          <a
            href="https://substack.com/@carloslenis"
            target="_blank"
            className="invite-link text-gray-300 hover:text-indigo-400 transition-colors duration-300"
            rel="noreferrer"
          >
            optimal
          </a>{" "}
          <span>via the</span>
          <span className="transition-colors duration-300"> ceo's newsletter</span> <br />
          <a
            href="https://v0.dev/chat/RqstUbkUVcB?b=b_BoU5qmQ0ehp"
            className="text-gray-500 text-xs mt-2.5 inline-block"
            target="_blank"
            rel="noreferrer"
          >
            (fork this v0)
          </a>
          <style>{`
            a.invite-link:hover + span + span {
              color: #6366F1;
            }
          `}</style>
        </p>
      </div>
    </div>
  )
}
