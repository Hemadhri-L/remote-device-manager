const admin = require("./_firebaseAdmin.cjs")

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function checkEmailExists(email) {
  try {
    await admin.auth().getUserByEmail(email)
    return true
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return false
    }
    throw error
  }
}

module.exports = {
  generateOTP,
  checkEmailExists,
}