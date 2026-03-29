import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { motion, useInView } from "framer-motion"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"

// Reusable fade-in component
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{
        duration: 0.8,
        delay: delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    >
      {children}
    </motion.div>
  )
}

function Landing() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const features = [
    {
      title: "Live Location",
      desc: "Track your device in real-time with precise GPS coordinates and view complete location history on an interactive map.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3"/>
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>
        </svg>
      )
    },
    {
      title: "Remote Camera",
      desc: "Capture photos from front or back camera silently. Images are uploaded instantly and viewable from your dashboard.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
      )
    },
    {
      title: "Ring Device",
      desc: "Lost your phone? Trigger a loud alarm at maximum volume, even when the device is on silent or vibrate mode.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      )
    },
    {
      title: "Send SMS",
      desc: "Send text messages remotely from your phone to any contact number. View delivery status in real-time.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      title: "Flashlight Control",
      desc: "Toggle the device flashlight on or off remotely. Useful for locating your phone in dark environments.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      )
    },
    {
      title: "Remote Lock",
      desc: "Instantly lock your device screen if it gets lost or stolen. Display a custom recovery message for the finder.",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      )
    }
  ]

  if (loading) return null;

  return (
    <div className="relative w-full bg-black overflow-x-hidden">

      {/* ===== BACKGROUND VIDEO ===== */}
      <video
        className="fixed inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ===== OVERLAY ===== */}
      <div className="fixed inset-0 bg-black/50 z-[1]" />

      {/* ===== ALL PAGE CONTENT ===== */}
      <div className="relative z-[2]">

        {/* ========== HERO SECTION ========== */}
        <div className="relative min-h-screen w-full flex flex-col">

          {/* ===== NAVBAR ===== */}
          <nav
            className="w-full flex items-center justify-between"
            style={{
              paddingLeft: '120px',
              paddingRight: '120px',
              paddingTop: '20px',
              paddingBottom: '20px'
            }}
          >
            <div className="flex items-center">
              <div
  className="flex items-center"
  style={{ minHeight: '56px' }}
>
  <img
    src="/web-logo.png"
    alt="RDManager Logo"
    style={{
      height: '66px',
      width: 'auto',
      objectFit: 'contain'
    }}
  />
</div>

              <div
                className="hidden md:flex items-center"
                style={{ marginLeft: '40px', gap: '30px' }}
              >
                {["Get Started", "Features", "Download", "Resources"].map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      if (link === "Download") {
                        document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" })
                      } else if (link === "Features") {
                        document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" })
                      }
                    }}
                    className="flex items-center text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ fontSize: '14px', gap: '14px' }}
                  >
                    {link}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Navbar Buttons */}
            <div className="hidden md:flex items-center" style={{ gap: '12px' }}>
              {/* Download APK Button in Navbar */}
              <a
                href="/RDManager.apk"
                download="RDManager.apk"
                className="relative rounded-full cursor-pointer"
                style={{
                  border: '0.6px solid rgba(16, 185, 129, 0.5)',
                  padding: '1px',
                  textDecoration: 'none'
                }}
              >
                <div
                  className="rounded-full font-medium flex items-center"
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '10px',
                    paddingBottom: '10px',
                    fontSize: '13px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    gap: '8px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download APK
                </div>
              </a>

              {/* Get Started / Dashboard Button */}
              <button
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
                className="relative rounded-full cursor-pointer"
                style={{ border: '0.6px solid rgba(255, 255, 255, 0.5)', padding: '1px' }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ top: '-2px', width: '60%', height: '10px', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 70%)', filter: 'blur(4px)' }}
                />
                <div
                  className="bg-black rounded-full text-white font-medium"
                  style={{ paddingLeft: '29px', paddingRight: '29px', paddingTop: '11px', paddingBottom: '11px', fontSize: '14px' }}
                >
                  {user ? "Go to Dashboard" : "Get Started"}
                </div>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-white cursor-pointer"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </nav>

          <style>{`
            @media (max-width: 768px) {
              nav { padding-left: 24px !important; padding-right: 24px !important; }
            }
          `}</style>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden px-6 pb-4">
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', borderRadius: '12px', padding: '16px' }}>
                {["Get Started", "Features", "Download", "Resources"].map((link) => (
                  <button
                    key={link}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      if (link === "Download") {
                        setTimeout(() => document.getElementById("download-section")?.scrollIntoView({ behavior: "smooth" }), 300)
                      } else if (link === "Features") {
                        setTimeout(() => document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" }), 300)
                      }
                    }}
                    className="w-full py-3 px-4 text-white/80 text-[14px] font-medium text-left rounded-lg hover:bg-white/5 cursor-pointer"
                  >
                    {link}
                  </button>
                ))}
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {/* Mobile Download Button */}
                  <a
                    href="/RDManager.apk"
                    download="RDManager.apk"
                    className="w-full py-3 flex items-center justify-center gap-2 rounded-lg text-[14px] font-medium cursor-pointer"
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      textDecoration: 'none'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Download Android App
                  </a>
                  {!user && (
                    <button onClick={() => { setMobileMenuOpen(false); navigate("/login") }} className="w-full py-3 text-white/80 text-[14px] font-medium rounded-lg hover:bg-white/5 cursor-pointer">Login</button>
                  )}
                  <button onClick={() => { setMobileMenuOpen(false); navigate(user ? "/dashboard" : "/signup") }} className="w-full py-3 bg-white text-black text-[14px] font-medium rounded-lg cursor-pointer">
                    {user ? "Go to Dashboard" : "Get Started"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== HERO TEXT ===== */}
          <div
            className="flex-1 flex flex-col items-center justify-center text-center px-6"
            style={{ paddingBottom: '102px', gap: '40px' }}
          >
            <style>{`@media (max-width: 768px) { h1 { font-size: 36px !important; } }`}</style>

            <div
              className="inline-flex items-center font-medium"
              style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', gap: '8px', fontSize: '13px' }}
            >
              <span className="rounded-full bg-white" style={{ width: '4px', height: '4px' }} />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Early access available from</span>
              <span className="text-white">May 1, 2026</span>
            </div>

            <h1
              className="font-medium text-center"
              style={{ maxWidth: '613px', fontSize: '56px', lineHeight: '1.28', background: 'linear-gradient(144.5deg, #FFFFFF 28%, rgba(0,0,0,0) 115%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Control Your Phone From Anywhere
            </h1>

            <p className="font-normal text-center" style={{ maxWidth: '680px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '-16px' }}>
              Powering seamless device management and real-time connections, RDManager is the base for users who need control with purpose, leveraging security, speed, and reliability to manage their devices remotely.
            </p>

            {/* ===== HERO CTA BUTTONS ===== */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Get Started Button */}
              <button
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
                className="relative rounded-full cursor-pointer"
                style={{ border: '0.6px solid rgba(255,255,255,0.6)', padding: '1px' }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: '-2px', width: '60%', height: '10px', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, transparent 70%)', filter: 'blur(4px)' }} />
                <div className="bg-white rounded-full text-black font-medium" style={{ paddingLeft: '29px', paddingRight: '29px', paddingTop: '11px', paddingBottom: '11px', fontSize: '14px' }}>
                  {user ? "Go to Dashboard" : "Get Started"}
                </div>
              </button>

              {/* Download APK Button */}
              <a
                href="/RDManager.apk"
                download="RDManager.apk"
                className="relative rounded-full cursor-pointer"
                style={{
                  border: '0.6px solid rgba(16, 185, 129, 0.6)',
                  padding: '1px',
                  textDecoration: 'none'
                }}
              >
                <div
                  className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                  style={{ top: '-2px', width: '60%', height: '10px', background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.5) 0%, transparent 70%)', filter: 'blur(4px)' }}
                />
                <div
                  className="rounded-full font-medium flex items-center"
                  style={{
                    paddingLeft: '29px',
                    paddingRight: '29px',
                    paddingTop: '11px',
                    paddingBottom: '11px',
                    fontSize: '14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    gap: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Android App
                </div>
              </a>
            </div>

            {/* Login link */}
            {!user && (
              <p className="font-normal text-center" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '-20px' }}>
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="underline cursor-pointer transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </div>

        {/* ========== FEATURES SECTION ========== */}
        <section id="features-section">
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '120px', paddingBottom: '120px' }}>

            <FadeIn>
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.4)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
                  Features
                </p>
                <h2 style={{ fontSize: '36px', fontWeight: '600', color: '#ffffff', lineHeight: '1.3', marginBottom: '16px' }}>
                  Everything you need to
                  <br />
                  manage your device
                </h2>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
                  Powerful tools built for security, speed, and complete remote control over your Android device.
                </p>
              </div>
            </FadeIn>

            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '16px' }}>
              <style>{`
                @media (min-width: 640px) {
                  .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (min-width: 1024px) {
                  .features-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
              `}</style>
              {features.map((feature, index) => (
                <FadeIn key={index} delay={index * 0.1}>
                  <div
                    style={{
                      padding: '32px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      cursor: 'default',
                      height: '100%',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255, 255, 255, 0.6)', marginBottom: '24px'
                    }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '10px' }}>
                      {feature.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)', lineHeight: '1.65', margin: '0' }}>
                      {feature.desc}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* ========== DOWNLOAD APP SECTION ========== */}
        <section id="download-section">
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '120px', paddingBottom: '120px' }}>
            <FadeIn>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '48px',
                alignItems: 'center'
              }}>
                <style>{`
                  @media (min-width: 768px) {
                    .download-grid { grid-template-columns: 1fr 1fr !important; }
                  }
                `}</style>

                <div className="download-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '48px',
                  alignItems: 'center',
                  padding: '48px',
                  borderRadius: '24px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)'
                }}>

                  {/* Left side - Info */}
                  <div>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '6px 14px', borderRadius: '20px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      marginBottom: '24px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#10b981' }}>Android App</span>
                    </div>

                    <h2 style={{ fontSize: '32px', fontWeight: 600, color: '#ffffff', lineHeight: 1.3, marginBottom: '16px' }}>
                      Download the
                      <br />
                      <span style={{ color: '#10b981' }}>RDManager</span> App
                    </h2>

                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '32px', maxWidth: '420px' }}>
                      Install the companion app on your Android device to enable remote control. Sign in with the same account you use on the web dashboard.
                    </p>

                    {/* Download Button */}
                    <a
                      href="/RDManager.apk"
                      download="RDManager.apk"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 32px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 24px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 24px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download APK
                    </a>

                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '12px' }}>
                      v1.0.0 · Android 8.0+ required · ~15 MB
                    </p>
                  </div>

                  {/* Right side - Steps */}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px' }}>
                      How to install
                    </p>

                    {[
                      { step: "1", title: "Download the APK", desc: "Click the download button to get the RDManager APK file on your phone." },
                      { step: "2", title: "Allow Installation", desc: "Go to Settings → Security → Enable 'Install from Unknown Sources' for your browser." },
                      { step: "3", title: "Install & Sign In", desc: "Open the APK file, install the app, and sign in with your RDManager account." },
                      { step: "4", title: "Grant Permissions", desc: "Allow all required permissions (Camera, Location, SMS, etc.) for full functionality." },
                    ].map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          marginBottom: i < 3 ? '20px' : '0',
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        }}
                      >
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: '#10b981',
                          flexShrink: 0
                        }}>
                          {item.step}
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                            {item.title}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ========== CTA SECTION ========== */}
        <section>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '100px', paddingBottom: '100px' }}>
            <FadeIn>
              <div style={{
                textAlign: 'center', padding: '64px 32px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)'
              }}>
                <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>
                  {user ? "Ready to view your devices?" : "Ready to take control?"}
                </h2>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>
                  {user
                    ? "Go to your dashboard to manage connections and execute commands."
                    : "Create your free account and connect your first device in under two minutes."}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button
                      onClick={() => navigate(user ? "/dashboard" : "/signup")}
                      className="relative rounded-full cursor-pointer"
                      style={{ border: '0.6px solid rgba(255,255,255,0.6)', padding: '1px' }}
                    >
                      <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none" style={{ top: '-2px', width: '60%', height: '10px', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, transparent 70%)', filter: 'blur(4px)' }} />
                      <div className="bg-white rounded-full text-black font-medium" style={{ paddingLeft: '29px', paddingRight: '29px', paddingTop: '11px', paddingBottom: '11px', fontSize: '14px' }}>
                        {user ? "Go to Dashboard" : "Create free account"}
                      </div>
                    </button>

                    <a
                      href="/RDManager.apk"
                      download="RDManager.apk"
                      className="rounded-full font-medium flex items-center"
                      style={{
                        paddingLeft: '29px', paddingRight: '29px', paddingTop: '12px', paddingBottom: '12px',
                        fontSize: '14px', background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#10b981', gap: '8px', textDecoration: 'none'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download App
                    </a>
                  </div>

                  {!user && (
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                      No credit card required
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ========== FOOTER ========== */}
        <footer>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ maxWidth: '1100px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '40px', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                        <line x1="12" y1="18" x2="12" y2="18"/>
                      </svg>
                    </div>
                    <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>RDManager</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', maxWidth: '280px', lineHeight: '1.5' }}>
                    Secure remote device management for Android devices.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Product</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href="#features-section" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Features</a>
                      <a href="#download-section" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Download App</a>
                      <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Security</a>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Company</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>About</a>
                      <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Contact</a>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Legal</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Privacy</a>
                      <a href="#" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>Terms</a>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
                  © 2026 RDManager. All rights reserved.
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none' }}>Privacy Policy</a>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', textDecoration: 'none' }}>Terms of Service</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  )
}

export default Landing