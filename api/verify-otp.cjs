const { getOtp, deleteOtp } = require("./_otpStore.cjs")
const cors = require("./_cors.cjs")

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, otp } = req.body || {}

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" })
  }

  try {
    const stored = await getOtp(email)

    if (!stored) {
      return res.status(400).json({ error: "No OTP found or it has expired. Request a new one." })
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" })
    }

    await deleteOtp(email)
    return res.status(200).json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return res.status(500).json({ error: "Verification failed. Try again." })
  }
}