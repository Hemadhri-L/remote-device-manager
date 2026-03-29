const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { uid, deviceData } = req.body || {}

  if (!uid || !deviceData) {
    return res.status(400).json({ error: "User ID and device data are required" })
  }

  try {
    const deviceRef = db.collection("users").doc(uid).collection("devices").doc()
    await deviceRef.set({
      ...deviceData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    return res.status(200).json({ message: "Device added successfully", deviceId: deviceRef.id })
  } catch (error) {
    console.error("Error adding device:", error)
    return res.status(500).json({ error: "Failed to add device" })
  }
}
