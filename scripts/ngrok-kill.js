// ngrok-kill.js
// Script to kill all ngrok processes (cross-platform)
const { exec } = require("child_process")

function killNgrok() {
  const isWin = process.platform === "win32"
  const cmd = isWin ? "taskkill /IM ngrok.exe /F" : "pkill ngrok"
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      // ngrok may not be running, ignore error
      process.exit(0)
    } else {
      process.exit(0)
    }
  })
}
killNgrok()
