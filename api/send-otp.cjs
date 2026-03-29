const { setOtp } = require("./_otpStore.cjs")
const transporter = require("./_mailer.cjs")
const { generateOTP, checkEmailExists } = require("./_helpers.cjs")
const cors = require("./_cors.cjs")

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { email } = req.body || {}

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    const exists = await checkEmailExists(email)
    if (exists) {
      return res.status(400).json({
        error: "An account with this email already exists. Try logging in."
      })
    }
  } catch (error) {
    console.error("Error checking email:", error)
    return res.status(500).json({ error: "Something went wrong. Try again." })
  }

  const otp = generateOTP()

  await setOtp(email, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  })

  try {
    await transporter.sendMail({
      from: `"RDManager" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your RDManager Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; background: #0a0a0a; border-radius: 16px; border: 1px solid #222;">
          <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 8px 0;">Verification Code</h2>
          <p style="color: #888; font-size: 14px; margin: 0 0 24px 0;">Enter this code to verify your email</p>
          <div style="background: #111; border: 1px solid #333; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 12px; margin: 0;">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    })

    return res.status(200).json({ message: "OTP sent successfully" })
  } catch (error) {
    console.error("Email error:", error)
    return res.status(500).json({ error: "Failed to send email" })
  }
}