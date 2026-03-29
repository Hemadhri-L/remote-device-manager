const admin = require("./_firebaseAdmin.cjs")
const cors = require("./_cors.cjs")

const db = admin.firestore()

module.exports = async function handler(req, res) {
  if (cors(req, res)) return

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { uid, deviceId } = req.query

  if (!uid || !deviceId) {
    return res.status(400).json({ error: "User ID and device ID are required" })
  }

  try {
    const commandsRef = db.collection("users").doc(uid).collection("devices").doc(deviceId).collection("commands")
    const snapshot = await commandsRef.orderBy("createdAt", "desc").get()

    const commands = []
    snapshot.forEach(doc => {
      commands.push({ id: doc.id, ...doc.data() })
    })

    return res.status(200).json({ commands })
  } catch (error) {
    console.error("Error getting commands:", error)
    return res.status(500).json({ error: "Failed to get commands" })
  }
}
