// ngrok-clipboard.js
// Script to get ngrok public URL and copy to clipboard (cross-platform)
const { exec } = require("child_process")
const clipboardy = require("clipboardy")

exec("curl --silent http://127.0.0.1:4040/api/tunnels", (err, stdout) => {
  if (err) {
    console.error("ngrok not running or curl not available")
    process.exit(1)
  }
  try {
    const tunnels = JSON.parse(stdout).tunnels
    const publicUrl = tunnels && tunnels[0] && tunnels[0].public_url
    if (publicUrl) {
      clipboardy.writeSync(publicUrl)
      console.log("ngrok public URL copied to clipboard:", publicUrl)
    } else {
      console.error("No ngrok tunnel found")
      process.exit(1)
    }
  } catch (e) {
    console.error("Failed to parse ngrok tunnels")
    process.exit(1)
  }
})
