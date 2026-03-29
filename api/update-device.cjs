const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { uid, deviceId, updates } = req.body || {}

  if (!uid || !deviceId || !updates) {
    return res.status(400).json({ error: "User ID, device ID, and updates are required" })
  }

  try {
    await db.collection("users").doc(uid).collection("devices").doc(deviceId).update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return res.status(200).json({ message: "Device updated successfully" })
  } catch (error) {
    console.error("Error updating device:", error)
    return res.status(500).json({ error: "Failed to update device" })
  }
}
