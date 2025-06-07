"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OPTIMAL_LOGO_PATH } from "./optimal-logo-path"
import { cn } from "@/lib/utils"

function LoginCycleButton() {
  const [showStart, setShowStart] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setShowStart(s => !s), 4000)
    return () => clearInterval(id)
  }, [])
  return (
    <Button
      asChild
      variant="accent"
      size="sm"
      className="min-w-[8rem] px-6 rounded-lg cycle-colors font-bold relative overflow-hidden"
    >
      <a href="https://op-hub.com">
      <span
        className={cn(
          "transition-opacity",
          showStart ? "opacity-0" : "opacity-100"
        )}
      >
        Login
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          showStart ? "opacity-100" : "opacity-0"
        )}
      >
        Start Free
      </span>
      </a>
    </Button>
  )
}

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [reveal, setReveal] = useState(false)
  // Controls how much the logo is zoomed in without increasing canvas size
  const ZOOM_FACTOR = 2

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

      const logoHeight = (isMobile ? 80 : 160) * ZOOM_FACTOR // Zoomed size
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

    const handleScroll = () => {
      if (window.scrollY > 50) setReveal(true)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  return (
    <div className="relative min-h-[200vh] bg-black text-white overflow-x-hidden">
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-screen touch-none transition-opacity duration-700 ${reveal ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Floating Optimal logo particles"
      />

      <header className="fixed top-0 inset-x-0 z-30">
        <nav className="max-w-6xl mx-auto flex items-center justify-between p-4 text-sm font-mono">
          <div className="flex items-center gap-8">
            <span className="font-bold text-lg">optimal</span>
            <ul className="hidden md:flex items-center gap-6">
              <li>
                <a href="#" className="nav-item" data-section="products">
                  Products
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" data-section="solutions">
                  Solutions
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" data-section="developers">
                  Developers
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" data-section="company">
                  Company
                </a>
              </li>
              <li>
                <a href="#" className="nav-item" data-section="pricing">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <LoginCycleButton />
          </div>
        </nav>
      </header>

      <section
        className={`fixed inset-0 flex flex-col items-center justify-center text-center z-10 px-6 transition-opacity duration-700 ${reveal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold max-w-4xl">
          The Serverless Optimal Home
        </h1>
        <p className="text-gray-300 mt-4 max-w-2xl text-base sm:text-lg">
          Intelligent automation that transforms houses into responsive, efficient, and delightful living spaces
        </p>

        <div className="hero-info-grid">
          <div className="info-card">
            <span className="info-label">SMART AUTOMATION</span>
            <span className="info-value">Always On</span>
          </div>
          <div className="info-card">
            <span className="info-label">ENERGY SAVINGS</span>
            <span className="info-value">Up to 40%</span>
          </div>
          <div className="info-card">
            <span className="info-label">SETUP TIME</span>
            <span className="info-value">Under 1 Hour</span>
          </div>
          <div className="info-card">
            <span className="info-label">MONTHLY COST</span>
            <span className="info-value">Starting $99</span>
          </div>
        </div>

        <form className="mt-6 flex w-full max-w-sm gap-2 justify-center">
          <Input type="email" placeholder="Join newsletter" className="bg-gray-800 border-gray-700" />
          <Button type="submit" variant="accent" size="sm">
            Subscribe
          </Button>
        </form>
      </section>

      <div className="market-ticker fixed top-16 inset-x-0 z-20 font-mono">
        <div className="ticker-content">
          <div className="ticker-item">
            <span className="ticker-symbol">SMART</span>
            <span className="ticker-price">$156.20</span>
            <span className="ticker-change positive">+1.8%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">IOT</span>
            <span className="ticker-price">$89.75</span>
            <span className="ticker-change negative">-0.5%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">TSLA</span>
            <span className="ticker-price">$248.50</span>
            <span className="ticker-change positive">+2.4%</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 w-full text-center z-10">
        <p className="font-mono text-gray-400 text-xs sm:text-base md:text-sm">
          keep up with{' '}
          <a
            href="https://substack.com/@carloslenis"
            target="_blank"
            className="invite-link text-gray-300 hover:text-indigo-400 transition-colors duration-300"
            rel="noreferrer"
          >
            optimal
          </a>{' '}
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
