import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "../firebase/config"

function Signup() {
  const navigate = useNavigate()
  
  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [otp, setOtp] = useState("")
  
  // UI states
  const [step, setStep] = useState(1) // 1 = email form, 2 = OTP form
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP")
      }

      setOtpSent(true)
      setStep(2)
    } catch (err) {
      setError(err.message || "Failed to send verification code")
    }

    setLoading(false)
  }

  // Step 2: Verify OTP and create account
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Verify OTP with backend
      const response = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP")
      }

      // OTP verified! Now create Firebase account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        devices: []
      })

      navigate("/dashboard")
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists")
      } else {
        setError(err.message || "Verification failed")
      }
    }

    setLoading(false)
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP")
      }

      setError("") 
      alert("New code sent!")
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
  }

  // Google Sign Up (no OTP needed)
  const handleGoogleSignUp = async () => {
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName || "",
          emailVerified: true,
          createdAt: new Date().toISOString(),
          devices: []
        })
      }

      navigate("/dashboard")
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        return
      }
      setError("Google sign up failed. Try again.")
    }
  }

  // Go back to step 1
  const handleBack = () => {
    setStep(1)
    setOtp("")
    setError("")
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
        .signup-topbar { padding: 24px 28px; }
        .signup-form-area { padding: 0 24px 48px 24px; }
        .signup-card { max-width: 360px; padding: 36px 32px; }
        @media (max-width: 768px) {
          .signup-topbar { padding: 20px 16px; }
          .signup-form-area { padding: 0 16px 32px 16px; }
          .signup-card { max-width: 100%; padding: 28px 20px; }
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
          className="signup-topbar"
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
            onClick={() => navigate("/login")}
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
            Sign in
          </button>
        </div>

        {/* Form Area */}
        <div
          className="signup-form-area"
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
            className="signup-card"
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

            {/* ===== STEP 1: EMAIL + PASSWORD FORM ===== */}
            {step === 1 && (
              <>
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
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 6px 0' }}>
                    Create account
                  </h1>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>
                    Get started with RDManager
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', color: '#f87171' }}>
                    {error}
                  </div>
                )}

                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
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
                <form onSubmit={handleSendOTP}>
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
                        width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'General Sans, sans-serif', transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                    />
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      style={{
                        width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'General Sans, sans-serif', transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'General Sans, sans-serif', transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                    />
                  </div>

                  {/* Continue Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', height: '44px', borderRadius: '10px', background: '#ffffff',
                      color: '#000000', fontSize: '14px', fontWeight: '600', border: 'none',
                      cursor: loading ? 'default' : 'pointer', fontFamily: 'General Sans, sans-serif',
                      opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s ease'
                    }}
                  >
                    {loading ? "Sending code..." : "Continue"}
                  </button>
                </form>

                {/* Terms */}
                <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0', fontSize: '11px', color: 'rgba(255,255,255,0.25)', lineHeight: '1.5' }}>
                  By creating an account, you agree to our{" "}
                  <button type="button" style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', fontFamily: 'General Sans, sans-serif', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Terms</button>
                  {" & "}
                  <button type="button" style={{ color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', fontFamily: 'General Sans, sans-serif', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>Privacy Policy</button>
                </p>

                {/* Bottom */}
                <p style={{ textAlign: 'center', marginTop: '20px', marginBottom: '0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      color: 'rgba(255,255,255,0.7)', background: 'none', border: 'none',
                      fontFamily: 'General Sans, sans-serif', fontSize: '13px', cursor: 'pointer',
                      textDecoration: 'underline', transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    Sign in
                  </button>
                </p>
              </>
            )}

            {/* ===== STEP 2: OTP VERIFICATION ===== */}
            {step === 2 && (
              <>
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
                      <rect x="3" y="5" width="18" height="14" rx="2"/>
                      <polyline points="3 7 12 13 21 7"/>
                    </svg>
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 6px 0' }}>
                    Check your email
                  </h1>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>
                    We sent a code to <span style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</span>
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', color: '#f87171' }}>
                    {error}
                  </div>
                )}

                {/* OTP Form */}
                <form onSubmit={handleVerifyOTP}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Verification code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      required
                      maxLength={6}
                      style={{
                        width: '100%', height: '52px', padding: '0 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#ffffff', fontSize: '24px', fontWeight: '600', letterSpacing: '8px',
                        textAlign: 'center', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'General Sans, sans-serif', transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)' }}
                    />
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    style={{
                      width: '100%', height: '44px', borderRadius: '10px', background: '#ffffff',
                      color: '#000000', fontSize: '14px', fontWeight: '600', border: 'none',
                      cursor: (loading || otp.length !== 6) ? 'default' : 'pointer', fontFamily: 'General Sans, sans-serif',
                      opacity: (loading || otp.length !== 6) ? 0.6 : 1, transition: 'opacity 0.2s ease'
                    }}
                  >
                    {loading ? "Verifying..." : "Verify & Create Account"}
                  </button>
                </form>

                {/* Resend & Back */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button
                    onClick={handleBack}
                    style={{
                      color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none',
                      fontFamily: 'General Sans, sans-serif', fontSize: '13px', cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none',
                      fontFamily: 'General Sans, sans-serif', fontSize: '13px', cursor: 'pointer',
                      textDecoration: 'underline', transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'}
                  >
                    Resend code
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default Signup