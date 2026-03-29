import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Email/Password Login
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/dashboard")
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email")
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password")
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password")
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address")
      } else {
        setError("Login failed. Please try again.")
      }
    }
    setLoading(false)
  }

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      // If first time Google sign in, create user document
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName || "",
          createdAt: new Date().toISOString(),
          devices: []
        })
      }

      navigate("/dashboard")
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        // User closed the popup, do nothing
        return
      }
      setError("Google sign in failed. Try again.")
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'General Sans, sans-serif'
      }}
    >

      {/* Background Video */}
      <video
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0
        }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1
        }}
      />

      {/* Responsive styles */}
      <style>{`
        .login-topbar { padding: 24px 28px; }
        .login-form-area { padding: 0 24px 48px 24px; }
        .login-card { max-width: 360px; padding: 36px 32px; }
        @media (max-width: 768px) {
          .login-topbar { padding: 20px 16px; }
          .login-form-area { padding: 0 16px 32px 16px; }
          .login-card { max-width: 100%; padding: 28px 20px; }
        }
      `}</style>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >

        {/* Top Bar */}
        <div
          className="login-topbar"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <button
            onClick={() => navigate("/")}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'General Sans, sans-serif',
              cursor: 'pointer',
              letterSpacing: '-0.3px'
            }}
          >
            RDMANAGER
          </button>

          <button
            onClick={() => navigate("/signup")}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'General Sans, sans-serif',
              cursor: 'pointer',
              padding: '8px 18px',
              borderRadius: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            Create account
          </button>
        </div>

        {/* Form Area */}
        <div
          className="login-form-area"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* Form Card */}
          <div
            className="login-card"
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxSizing: 'border-box'
            }}
          >

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto'
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                  <line x1="12" y1="18" x2="12" y2="18"/>
                </svg>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 6px 0' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>
                Sign in to your account
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '12px 14px',
                  marginBottom: '20px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '13px',
                  color: '#f87171'
                }}
              >
                {error}
              </div>
            )}

            {/* Google Button - Put on top for easy access */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'General Sans, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '20px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>or email</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>

              {/* Email */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'General Sans, sans-serif',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                    e.target.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.target.style.background = 'rgba(255,255,255,0.06)'
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)' }}>
                    Password
                  </label>
                  <button
  type="button"
  onClick={() => navigate("/forgot-password")}
  style={{
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'General Sans, sans-serif',
    transition: 'color 0.2s ease'
  }}
  onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
  onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.35)'}
>
  Forgot?
</button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'General Sans, sans-serif',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)'
                    e.target.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.1)'
                    e.target.style.background = 'rgba(255,255,255,0.06)'
                  }}
                />
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: loading ? 'default' : 'pointer',
                  fontFamily: 'General Sans, sans-serif',
                  opacity: loading ? 0.6 : 1,
                  transition: 'opacity 0.2s ease'
                }}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Bottom */}
            <p style={{ textAlign: 'center', marginTop: '24px', marginBottom: '0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              No account?{" "}
              <button
                onClick={() => navigate("/signup")}
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  background: 'none',
                  border: 'none',
                  fontFamily: 'General Sans, sans-serif',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
              >
                Create one
              </button>
            </p>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Login