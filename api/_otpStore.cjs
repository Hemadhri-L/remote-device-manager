const admin = require("./_firebaseAdmin.cjs")

const db = admin.firestore()
const OTP_COLLECTION = "_otps"

/**
 * Store an OTP in Firestore
 * @param {string} key - The key (email or reset_email)
 * @param {object} data - { otp, expiresAt, verified? }
 */
async function setOtp(key, data) {
  const docRef = db.collection(OTP_COLLECTION).doc(key.replace(/[\/\.]/g, "_"))
  await docRef.set({
    ...data,
    createdAt: Date.now(),
  })
}

/**
 * Get an OTP from Firestore, returns null if not found or expired
 * @param {string} key
 * @returns {object|null}
 */
async function getOtp(key) {
  const docRef = db.collection(OTP_COLLECTION).doc(key.replace(/[\/\.]/g, "_"))
  const doc = await docRef.get()

  if (!doc.exists) return null

  const data = doc.data()

  // Auto-delete if expired
  if (Date.now() > data.expiresAt) {
    await docRef.delete()
    return null
  }

  return data
}

/**
 * Delete an OTP from Firestore
 * @param {string} key
 */
async function deleteOtp(key) {
  const docRef = db.collection(OTP_COLLECTION).doc(key.replace(/[\/\.]/g, "_"))
  await docRef.delete()
}

/**
 * Update fields on an existing OTP doc
 * @param {string} key
 * @param {object} updates
 */
async function updateOtp(key, updates) {
  const docRef = db.collection(OTP_COLLECTION).doc(key.replace(/[\/\.]/g, "_"))
  await docRef.update(updates)
}

module.exports = { setOtp, getOtp, deleteOtp, updateOtp }