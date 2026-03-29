const { getOtp, updateOtp } = require("./_otpStore.cjs")
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
    const stored = await getOtp(`reset_${email}`)

    if (!stored) {
      return res.status(400).json({ error: "No reset code found or it has expired. Request a new one." })
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ error: "Invalid code" })
    }

    // Mark as verified but don't delete yet (need it for password reset step)
    await updateOtp(`reset_${email}`, { verified: true })

    return res.status(200).json({
      message: "Code verified successfully",
      verified: true,
    })
  } catch (error) {
    console.error("Verify reset OTP error:", error)
    return res.status(500).json({ error: "Verification failed. Try again." })
  }
}