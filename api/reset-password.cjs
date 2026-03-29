const { getOtp, deleteOtp } = require("./_otpStore.cjs")
const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email, newPassword } = req.body || {}

  if (!email || !newPassword) {
    return res.status(400).json({ error: "Email and new password are required" })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" })
  }

  try {
    // Check if OTP was verified
    const stored = await getOtp(`reset_${email}`)

    if (!stored || !stored.verified) {
      return res.status(400).json({ error: "Please verify your email first" })
    }

    // Get user by email
    const user = await admin.auth().getUserByEmail(email)

    // Update password using Firebase Admin
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
    })

    // Delete the OTP record
    await deleteOtp(`reset_${email}`)

    return res.status(200).json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Password reset error:", error)
    return res.status(500).json({ error: "Failed to reset password. Try again." })
  }
}