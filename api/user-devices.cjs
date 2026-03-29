const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const uid = req.query.uid

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" })
  }

  try {
    const devicesRef = db.collection("users").doc(uid).collection("devices")
    const snapshot = await devicesRef.get()

    const devices = []
    snapshot.forEach(doc => {
      devices.push({ id: doc.id, ...doc.data() })
    })

    return res.status(200).json({ devices })
  } catch (error) {
    console.error("Error getting devices:", error)
    return res.status(500).json({ error: "Failed to get devices" })
  }
}
