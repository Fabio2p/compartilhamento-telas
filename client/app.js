const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const {v4: uuidv4} = require('uuid')
const screenshot = require('screenshot-desktop')
const socket = require('socket.io-client')('http://192.168.2.104:3000')
const robot = require("robotjs")


let interval

function createWindow () {
  const win = new BrowserWindow({
    width: 500,
    height: 150,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })

  win.removeMenu()
  win.loadFile('index.html')

  socket.on('mouse-move', (data) => {
    robot.moveMouse(data.x, data.y)
  })

  socket.on('mouse-click', (data) => {
    
    robot.mouseClick()
  })

  socket.on('type', (data) => {
    robot.keyTap(data.key)
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

//Inicia compartilhamento
ipcMain.on('start-share', (event, arg) => {
  let uuid = uuidv4()
  socket.emit('join-message', uuid)
  
  event.reply('uuid', uuid)

  interval = setInterval( () => {

    screenshot().then( (img) =>{
      var img = new Buffer(img).toString('base64')
      let obj = {}
      obj.room = uuid
      obj.image = img

      socket.emit('screen-data', JSON.stringify(obj))

    })

  }, 100)
})

//Para compartilhamento
ipcMain.on('stop-share', (event, arg) => {
  clearInterval(interval)
})
