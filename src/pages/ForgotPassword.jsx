import { useState } from "react"
import { useNavigate } from "react-router-dom"

function ForgotPassword() {
  const navigate = useNavigate()
  
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [step, setStep] = useState(1) // 1 = email, 2 = OTP, 3 = new password
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Step 1: Send reset OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code")
      }

      setStep(2)
    } catch (err) {
      setError(err.message || "Failed to send reset code")
    }

    setLoading(false)
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid code")
      }

      setStep(3)
    } catch (err) {
      setError(err.message || "Verification failed")
    }

    setLoading(false)
  }

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }

      setSuccess("Password reset successful! Redirecting to login...")
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to reset password")
    }

    setLoading(false)
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("http://localhost:5000/api/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code")
      }

      alert("New code sent!")
    } catch (err) {
      setError(err.message)
    }

    setLoading(false)
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
        .forgot-topbar { padding: 24px 28px; }
        .forgot-form-area { padding: 0 24px 48px 24px; }
        .forgot-card { max-width: 360px; padding: 36px 32px; }
        @media (max-width: 768px) {
          .forgot-topbar { padding: 20px 16px; }
          .forgot-form-area { padding: 0 16px 32px 16px; }
          .forgot-card { max-width: 100%; padding: 28px 20px; }
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
          className="forgot-topbar"
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
            Back to login
          </button>
        </div>

        {/* Form Area */}
        <div
          className="forgot-form-area"
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
            className="forgot-card"
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

            {/* ===== STEP 1: ENTER EMAIL ===== */}
            {step === 1 && (
              <>
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 6px 0' }}>
                    Forgot password?
                  </h1>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>
                    No worries, we'll send you a reset code
                  </p>
                </div>

                {error && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', color: '#f87171' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSendOTP}>
                  <div style={{ marginBottom: '24px' }}>
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
                    {loading ? "Sending..." : "Send reset code"}
                  </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', marginBottom: '0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                  Remember your password?{" "}
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

            {/* ===== STEP 2: ENTER OTP ===== */}
            {step === 2 && (
              <>
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
                    Code sent to <span style={{ color: 'rgba(255,255,255,0.7)' }}>{email}</span>
                  </p>
                </div>

                {error && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', color: '#f87171' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOTP}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Reset code
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
                    {loading ? "Verifying..." : "Verify code"}
                  </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                  <button
                    onClick={() => { setStep(1); setOtp(""); setError("") }}
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

            {/* ===== STEP 3: NEW PASSWORD ===== */}
            {step === 3 && (
              <>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 18px auto'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0 0 6px 0' }}>
                    Set new password
                  </h1>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '0' }}>
                    Your identity has been verified
                  </p>
                </div>

                {error && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '13px', color: '#f87171' }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div style={{ padding: '12px 14px', marginBottom: '20px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '13px', color: '#10b981' }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleResetPassword}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                      Confirm new password
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

                  <button
                    type="submit"
                    disabled={loading || success}
                    style={{
                      width: '100%', height: '44px', borderRadius: '10px', background: '#ffffff',
                      color: '#000000', fontSize: '14px', fontWeight: '600', border: 'none',
                      cursor: (loading || success) ? 'default' : 'pointer', fontFamily: 'General Sans, sans-serif',
                      opacity: (loading || success) ? 0.6 : 1, transition: 'opacity 0.2s ease'
                    }}
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword