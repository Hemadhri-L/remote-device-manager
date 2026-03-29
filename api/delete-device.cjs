const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { uid, deviceId } = req.body || {}

  if (!uid || !deviceId) {
    return res.status(400).json({ error: "User ID and device ID are required" })
  }

  try {
    await db.collection("users").doc(uid).collection("devices").doc(deviceId).delete()
    return res.status(200).json({ message: "Device deleted successfully" })
  } catch (error) {
    console.error("Error deleting device:", error)
    return res.status(500).json({ error: "Failed to delete device" })
  }
}
