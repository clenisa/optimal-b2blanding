"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { OPTIMAL_LOGO_PATH } from "./optimal-logo-path"

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const ZOOM_FACTOR = 2

  useEffect(() => {
    setIsLoaded(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
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

      const logoHeight = (isMobile ? 92 : 184) * ZOOM_FACTOR
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
      setShowContent(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(animationFrameId)
    }
  }, [isMobile])

  // Toggle logo button
  const toggleLogo = () => {
    setShowContent(!showContent)
  }

  return (
    <div
      className="relative min-h-[100vh] overflow-x-hidden"
      style={{ backgroundColor: "var(--tva-black)", color: "var(--tva-white)" }}
    >
      <a href="#budgeting" className="skip-link">
        Skip to main content
      </a>

      {/* Canvas for particle logo */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 w-full h-screen transition-opacity duration-700 ${showContent ? "opacity-0" : "opacity-100"}`}
        style={{ zIndex: 5 }}
        aria-label="Floating Optimal logo particles"
        role="img"
      />

      {/* Toggle button */}
      <button onClick={toggleLogo} className="fixed bottom-4 right-4 z-50 btn-secondary px-4 py-2 transition-all">
        {showContent ? "Show Logo" : "Hide Logo"}
      </button>

      {/* Header - always visible */}
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
            <div className="nav-container">
              <div className="nav-brand font-bold text-xl">optimal</div>
              <div className="nav-dropdown">
                <a href="#budgeting" className="nav-dropdown-item">
                  Features
                </a>
                <a href="#community" className="nav-dropdown-item">
                  Community
                </a>
                <a href="#tools" className="nav-dropdown-item">
                  Dashboard
                </a>
                <a href="#about" className="nav-dropdown-item">
                  About
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://substack.com/@carloslenis" className="btn-ghost" aria-label="Access blog">
              <em>blog</em>
            </a>
            <a href="https://legacy.op-hub.com" className="btn-waitlist px-4 py-2 text-sm">
              See Live Demo
            </a>
            <a href="https://www.carloslenis.com/" className="btn-cta px-4 py-2 text-sm">
              <span>Get Started for Free</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Scroll hint - shows over particle logo */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-10 transition-opacity duration-700 ${showContent ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      >
        <div className="text-center mt-20">
          <p
            className="font-mono text-sm sm:text-base animate-pulse-subtle"
            style={{ color: "var(--tva-white-muted)" }}
          >
            Transform Your Financial Future with AI
          </p>
        </div>
      </div>

      {/* Content sections - positioned to allow scrolling */}
      <div style={{ paddingTop: "100vh" }}>
        {/* Hero content (headline & sub-headline) */}
        <section className="relative z-20 py-20 px-6 text-center" style={{ backgroundColor: "var(--tva-black)" }}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6" style={{ color: "var(--tva-white)" }}>
              The Intelligent Financial Dashboard That Grows With You
            </h1>
            <p className="text-xl sm:text-2xl max-w-3xl mx-auto" style={{ color: "var(--tva-white-muted)" }}>
              Upload your financial data and unlock powerful insights. Our AI-driven platform transforms complex financial information into clear, actionable intelligence that helps you make smarter money decisions.
            </p>
          </div>
        </section>
        {/* Budgeting Section */}
        <section
          id="budgeting"
          className="relative z-20 py-20 px-6"
          style={{ backgroundColor: "var(--tva-grey-dark)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Advanced Financial <span style={{ color: "var(--optimal-blue)" }}>Analytics</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--tva-white-muted)" }}>
                Experience the next generation of financial management. Our platform combines intelligent data processing with sophisticated visualization tools to give you unprecedented control over your financial life.
              </p>
            </div>

            <div className="features-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="feature-item card-minimal p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>Smart Data Import</h3>
                <p style={{ color: "var(--tva-white-muted)" }}>
                  Seamlessly import your financial data through our intelligent CSV processor. Advanced validation ensures accuracy while automatic categorization saves you hours of manual work.
                </p>
              </div>
              <div className="feature-item card-minimal p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>Interactive Visualizations</h3>
                <p style={{ color: "var(--tva-white-muted)" }}>
                  Visualize your financial story through interactive charts and real-time analytics. Track spending patterns, monitor account performance, and identify opportunities for optimization.
                </p>
              </div>
              <div className="feature-item card-minimal p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>AI Financial Assistant</h3>
                <p style={{ color: "var(--tva-white-muted)" }}>
                  Ask questions about your finances in natural language and receive intelligent, personalized recommendations. Our AI assistant analyzes your spending patterns to provide actionable insights for better financial decisions.
                </p>
              </div>
              <div className="feature-item card-minimal p-8 rounded-2xl">
                <h3 className="text-xl font-bold mb-3" style={{ color: "var(--tva-white)" }}>Multi-Account Tracking</h3>
                <p style={{ color: "var(--tva-white-muted)" }}>
                  Consolidate all your financial accounts into a single, comprehensive dashboard. Monitor balances, track transactions, and maintain complete visibility across your entire financial ecosystem.
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
                Join the <span style={{ color: "var(--optimal-blue)" }}>Optimal Community</span>
              </h2>
              <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--tva-white-muted)" }}>
                Connect with thousands of users who are transforming their financial lives. Share insights, learn from others, and accelerate your journey toward financial optimization.
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
                      {/* icon intentionally removed for professional tone */}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                        Daily Insights
                      </h3>
                      <p style={{ color: "var(--tva-white-muted)" }}>Share your progress and learn from community insights</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                    >
                      {/* icon intentionally removed for professional tone */}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                        Financial Challenges
                      </h3>
                      <p style={{ color: "var(--tva-white-muted)" }}>Participate in structured financial challenges designed to build lasting habits</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 188, 212, 0.2)" }}
                    >
                      {/* icon intentionally removed for professional tone */}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                        Expert Resources
                      </h3>
                      <p style={{ color: "var(--tva-white-muted)" }}>Access exclusive content and masterclasses from financial professionals</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-minimal p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-6" style={{ color: "var(--tva-white)" }}>
                  what members are saying
                </h3>
                <div className="space-y-4">
                  <div className="testimonial-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="testimonial-avatar">S</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--tva-white)" }}>Sarah, 24</p>
                        <p className="text-xs" style={{ color: "var(--tva-white-muted)" }}>Marketing Coordinator</p>
                      </div>
                    </div>
                    <p style={{ color: "var(--tva-white)" }}>
                      "Saved $3,000 in two months by identifying spending patterns I never noticed before."
                    </p>
                  </div>

                  <div className="testimonial-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="testimonial-avatar">M</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--tva-white)" }}>Marcus, 28</p>
                        <p className="text-xs" style={{ color: "var(--tva-white-muted)" }}>Software Engineer</p>
                      </div>
                    </div>
                    <p style={{ color: "var(--tva-white)" }}>
                      "Finally have complete visibility into my spending habits. The insights have been transformative."
                    </p>
                  </div>

                  <div className="testimonial-card">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="testimonial-avatar">A</div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--tva-white)" }}>Alex, 26</p>
                        <p className="text-xs" style={{ color: "var(--tva-white-muted)" }}>Graphic Designer</p>
                      </div>
                    </div>
                    <p style={{ color: "var(--tva-white)" }}>
                      "The community support has been invaluable. We're all working toward better financial futures together."
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
              Built for <span style={{ color: "var(--optimal-blue)" }}>Modern Financial Management</span>
            </h2>
            <p className="text-xl max-w-3xl mx-auto mb-16" style={{ color: "var(--tva-white-muted)" }}>
              Designed with modern users in mind. Our platform combines powerful functionality with intuitive design.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-minimal p-6 rounded-2xl">
                <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                  Mobile Optimized
                </h3>
                <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                  Full functionality across all devices with responsive design
                </p>
              </div>

              <div className="card-minimal p-6 rounded-2xl">
                <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                  AI-Powered Insights
                </h3>
                <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                  Intelligent recommendations tailored to your financial goals
                </p>
              </div>

              <div className="card-minimal p-6 rounded-2xl">
                <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                  Enterprise Security
                </h3>
                <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                  Your financial data is protected with enterprise-grade security
                </p>
              </div>

              <div className="card-minimal p-6 rounded-2xl">
                <h3 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                  Real-Time Sync
                </h3>
                <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                  Seamless synchronization across all your devices
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About Optimal Section */}
        <section id="team" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-black)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">About Optimal</h2>
            </div>

            <div className="max-w-md mx-auto">
              <div className="team-card">
                <div className="team-avatar">CL</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                  Carlos Lenis
                </h3>
                <p className="text-lg mb-4" style={{ color: "var(--optimal-blue)" }}>
                  CEO & Founder
                </p>
                <p className="leading-relaxed mb-6" style={{ color: "var(--tva-white-muted)" }}>
                  Carlos founded Optimal to democratize sophisticated financial tools. Through his newsletter and platform, he helps thousands of users optimize their financial lives through data-driven insights and intelligent automation.
                </p>
                <a
                  href="https://substack.com/@carloslenis"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-cta inline-block px-6 py-2 rounded-lg text-sm"
                >
                  <span>read the newsletter</span>
                </a>
              </div>
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-8" style={{ color: "var(--tva-white)" }}>
                featured posts
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-minimal p-6 rounded-xl">
                  <h4 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                    coming soon
                  </h4>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    featured newsletter posts will appear here
                  </p>
                </div>
                <div className="card-minimal p-6 rounded-xl">
                  <h4 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                    coming soon
                  </h4>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    featured newsletter posts will appear here
                  </p>
                </div>
                <div className="card-minimal p-6 rounded-xl">
                  <h4 className="font-bold mb-2" style={{ color: "var(--tva-white)" }}>
                    coming soon
                  </h4>
                  <p className="text-sm" style={{ color: "var(--tva-white-muted)" }}>
                    featured newsletter posts will appear here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="about" className="relative z-20 py-20 px-6" style={{ backgroundColor: "var(--tva-grey-dark)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl leading-relaxed mb-8" style={{ color: "var(--tva-white)" }}>
              Optimal exists to make sophisticated financial management accessible to everyone. We believe that with the right tools and insights, anyone can take control of their financial future.
            </p>
            <p className="text-lg leading-relaxed mb-12" style={{ color: "var(--tva-white-muted)" }}>
              Our platform is designed for ambitious individuals who want to optimize their finances without sacrificing their lifestyle or values.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-cta text-lg px-8 py-4">
                <span>Start Your Financial Transformation</span>
              </button>
              <Button variant="outline" size="lg" className="btn-secondary text-lg px-8 py-4 rounded-lg">
                Explore the Platform
              </Button>
            </div>
          </div>
        </section>
      </div>

      <footer className="relative z-10 py-8 text-center">
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
          <span className="transition-colors duration-300"> ceo's newsletter</span>
        </p>
      </footer>
    </div>
  )
}
