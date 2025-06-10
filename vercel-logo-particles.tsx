"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OPTIMAL_LOGO_PATH } from "./optimal-logo-path"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [reveal, setReveal] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const ZOOM_FACTOR = 2

  useEffect(() => {
    setIsLoaded(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      setIsMobile(window.innerWidth < 768)
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

      const logoHeight = (isMobile ? 80 : 160) * ZOOM_FACTOR
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
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#0a0a0a"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

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
    <div
      className="relative min-h-[200vh] overflow-x-hidden"
      style={{ backgroundColor: "var(--tva-black)", color: "var(--tva-white)" }}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-screen touch-none transition-opacity duration-700 ${reveal ? "opacity-0" : "opacity-100"}`}
        aria-label="Floating Optimal logo particles"
        role="img"
      />

      <header
        className="fixed top-0 inset-x-0 z-30 backdrop-blur-md"
        style={{ backgroundColor: "rgba(10, 10, 10, 0.8)" }}
      >
        <nav
          className="max-w-6xl mx-auto flex items-center justify-between p-4 text-sm"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-8">
            <span className="font-bold text-xl" style={{ color: "var(--tva-white)" }}>
              optimal
            </span>
            <ul className="hidden md:flex items-center gap-6" role="menubar">
              <li role="none">
                <a href="#budgeting" className="nav-item" role="menuitem">
                  budgeting
                </a>
              </li>
              <li role="none">
                <a href="#community" className="nav-item" role="menuitem">
                  community
                </a>
              </li>
              <li role="none">
                <a href="#tools" className="nav-item" role="menuitem">
                  tools
                </a>
              </li>
              <li role="none">
                <a href="#about" className="nav-item" role="menuitem">
                  about
                </a>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://op-hub.com" className="btn-ghost" aria-label="Login to your account">
              login
            </a>
            <Button variant="outline" size="sm" className="btn-secondary">
              join waitlist
            </Button>
            <Button size="sm" className="btn-accent">
              start budgeting
            </Button>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section
          className={`fixed inset-0 flex flex-col items-center justify-center text-center z-10 px-6 transition-opacity duration-700 ${reveal ? "opacity-100" : "opacity-0 pointer-events-none"} ${isLoaded ? "animate-fade-in-up" : ""}`}
          aria-live="polite"
        >
          <div
            className="mb-4 px-4 py-2 rounded-full text-sm font-medium border"
            style={{
              backgroundColor: "rgba(0, 188, 212, 0.1)",
              borderColor: "rgba(0, 188, 212, 0.3)",
              color: "var(--optimal-blue)",
            }}
          >
            ✨ optimal budgeting is here
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold max-w-5xl leading-tight mb-6">
            stop being broke,
            <br />
            <span style={{ color: "var(--optimal-blue)" }}>start being optimal</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed" style={{ color: "var(--tva-white-muted)" }}>
            join the community of smart adults who've mastered their money. no guilt, no shame, just pure financial wins
            💪
          </p>

          <div className="hero-info-grid mt-8">
            <div className="info-card">
              <span className="info-label">avg savings increase</span>
              <span className="info-value">247%</span>
            </div>
            <div className="info-card">
              <span className="info-label">members winning</span>
              <span className="info-value">12.5k+</span>
            </div>
            <div className="info-card">
              <span className="info-label">time to first win</span>
              <span className="info-value">&lt; 7 days</span>
            </div>
            <div className="info-card">
              <span className="info-label">monthly cost</span>
              <span className="info-value">$0*</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="btn-accent text-lg px-8 py-4 rounded-lg">
              unlock optimal budgeting 🚀
            </Button>
            <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4 rounded-lg">
              see the proof 📊
            </Button>
          </div>

          <form className="mt-8 flex w-full max-w-md gap-3 justify-center">
            <Input
              type="email"
              placeholder="your email (we don't spam, promise)"
              className="flex-1 rounded-lg"
              style={{
                backgroundColor: "var(--tva-grey)",
                borderColor: "var(--tva-grey-light)",
                color: "var(--tva-white)",
              }}
              aria-label="Email address for newsletter signup"
            />
            <Button type="submit" className="btn-accent rounded-lg px-6">
              join
            </Button>
          </form>

          <p className="text-xs mt-3" style={{ color: "var(--tva-white-muted)" }}>
            *free during beta. seriously, no catch.
          </p>
        </section>
      </main>

      <div className="market-ticker fixed top-16 inset-x-0 z-20" role="marquee" aria-label="Member statistics ticker">
        <div className="ticker-content">
          <div className="ticker-item">
            <span className="ticker-symbol">💰 SAVINGS</span>
            <span className="ticker-price">+$2,847</span>
            <span className="ticker-change positive">avg member gain</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">📈 GROWTH</span>
            <span className="ticker-price">+156%</span>
            <span className="ticker-change positive">portfolio boost</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">🎯 GOALS</span>
            <span className="ticker-price">89%</span>
            <span className="ticker-change positive">hit their targets</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">⚡ SPEED</span>
            <span className="ticker-price">3.2x</span>
            <span className="ticker-change positive">faster results</span>
          </div>
        </div>
      </div>

      {/* Budgeting Section */}
      <section id="budgeting" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-grey-dark)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              budgeting that actually <span style={{ color: "var(--optimal-blue)" }}>works</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--tva-white-muted)" }}>
              forget boring spreadsheets and guilt trips. our ai-powered system learns your habits and helps you win
              with money while still living your best life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-minimal p-8 rounded-2xl">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>
                smart tracking
              </h3>
              <p style={{ color: "var(--tva-white-muted)" }}>
                connects to your accounts and categorizes everything automatically. no manual entry, no headaches.
              </p>
            </div>

            <div className="card-minimal p-8 rounded-2xl">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>
                goal crushing
              </h3>
              <p style={{ color: "var(--tva-white-muted)" }}>
                set goals that matter to you. vacation? new car? house? we'll show you exactly how to get there.
              </p>
            </div>

            <div className="card-minimal p-8 rounded-2xl">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>
                real insights
              </h3>
              <p style={{ color: "var(--tva-white-muted)" }}>
                get personalized tips that actually make sense for your lifestyle. no generic advice here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-black)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              join the <span style={{ color: "var(--optimal-blue)" }}>optimal community</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--tva-white-muted)" }}>
              connect with 12,500+ members who are all about that financial growth mindset. share wins, get advice,
              level up together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                  >
                    <span style={{ color: "var(--optimal-blue)" }} className="text-xl">
                      💬
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                      daily check-ins
                    </h3>
                    <p style={{ color: "var(--tva-white-muted)" }}>share your wins, get support when you need it</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                  >
                    <span style={{ color: "var(--optimal-blue)" }} className="text-xl">
                      🏆
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                      challenges & rewards
                    </h3>
                    <p style={{ color: "var(--tva-white-muted)" }}>gamified savings challenges with real prizes</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                  >
                    <span style={{ color: "var(--optimal-blue)" }} className="text-xl">
                      📚
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                      exclusive content
                    </h3>
                    <p style={{ color: "var(--tva-white-muted)" }}>weekly masterclasses from financial experts</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-minimal p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-6" style={{ color: "var(--tva-white)" }}>
                what members are saying
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--tva-grey)" }}>
                  <p className="mb-2" style={{ color: "var(--tva-white)" }}>
                    "saved $3k in 2 months without feeling restricted at all 🔥"
                  </p>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    - sarah, 24
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--tva-grey)" }}>
                  <p className="mb-2" style={{ color: "var(--tva-white)" }}>
                    "finally understand where my money goes. game changer fr"
                  </p>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    - marcus, 28
                  </p>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: "var(--tva-grey)" }}>
                  <p className="mb-2" style={{ color: "var(--tva-white)" }}>
                    "the community support hits different. we all winning together"
                  </p>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    - alex, 26
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-grey-dark)" }}>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            tools that <span style={{ color: "var(--optimal-blue)" }}>actually help</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto mb-16" style={{ color: "var(--tva-white-muted)" }}>
            built for the modern generation. clean, simple, effective.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-minimal p-6 rounded-2xl">
              <div className="text-3xl mb-4">📱</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                mobile first
              </h3>
              <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                manage everything from your phone
              </p>
            </div>

            <div className="card-minimal p-6 rounded-2xl">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                ai insights
              </h3>
              <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                personalized recommendations
              </p>
            </div>

            <div className="card-minimal p-6 rounded-2xl">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                bank level security
              </h3>
              <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                your data stays protected
              </p>
            </div>

            <div className="card-minimal p-6 rounded-2xl">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                instant sync
              </h3>
              <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                real-time updates across devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-black)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            why <span style={{ color: "var(--optimal-blue)" }}>optimal</span> exists
          </h2>
          <p className="text-xl leading-relaxed mb-8" style={{ color: "var(--tva-white)" }}>
            we got tired of financial apps that felt like homework and advice that didn't fit our lives. so we built
            something different - a community and tools that actually get it.
          </p>
          <p className="text-lg leading-relaxed mb-12" style={{ color: "var(--tva-white-muted)" }}>
            optimal is for the ambitious, the dreamers, the ones who want more but don't want to sacrifice everything to
            get there. we're here to help you win with money while still being you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-accent text-lg px-8 py-4 rounded-lg">
              start your optimal journey
            </Button>
            <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4 rounded-lg">
              learn more about us
            </Button>
          </div>
        </div>
      </section>

      <footer className="absolute bottom-4 w-full text-center z-10">
        <p className="font-mono text-xs sm:text-base md:text-sm" style={{ color: "var(--tva-white-muted)" }}>
          keep up with{" "}
          <a
            href="https://substack.com/@carloslenis"
            target="_blank"
            className="transition-colors duration-300 hover:text-blue-400"
            rel="noreferrer"
            style={{ color: "var(--tva-white)" }}
          >
            optimal
          </a>{" "}
          <span>via the</span>
          <span className="transition-colors duration-300"> ceo's newsletter</span> <br />
          <a
            href="https://v0.dev/chat/RqstUbkUVcB?b=b_BoU5qmQ0ehp"
            className="text-xs mt-2.5 inline-block"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--tva-white-muted)" }}
          >
            (fork this v0)
          </a>
        </p>
      </footer>
    </div>
  )
}
