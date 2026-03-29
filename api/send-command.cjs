const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { uid, deviceId, command } = req.body || {}

  if (!uid || !deviceId || !command) {
    return res.status(400).json({ error: "User ID, device ID, and command are required" })
  }

  try {
    const commandRef = db.collection("users").doc(uid).collection("devices").doc(deviceId).collection("commands").doc()
    await commandRef.set({
      ...command,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return res.status(200).json({ message: "Command sent successfully", commandId: commandRef.id })
  } catch (error) {
    console.error("Error sending command:", error)
    return res.status(500).json({ error: "Failed to send command" })
  }
}
