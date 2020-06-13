const express = require("express")
const app = express()
const socketio = require("socket.io")
const path = require("path")

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => console.log(`Port is running on ${PORT}`))

app.use(express.static(path.join(__dirname, "public")))
// console.log(path.join(__dirname, "public"))

app.get("/", (req, res) => {
  res.send("this is new page")
})

const io = socketio(server)

let clients = 0

io.on("connection", (socket) => {
  console.log("socket connected")

  socket.on("NewClient", () => {
    if (clients < 2) {
      if (clients == 1) {
        console.log("someone joined")
        socket.emit("CreatePeer")
      }
    } else {
      socket.emit("SessionActive")
    }
    clients++
    console.log("clients inside socket", clients)
  })

  socket.on("offer", (offer) => {
    socket.broadcast.emit("backOffer", offer)
  })

  socket.on("Answer", (data) => {
    socket.broadcast.emit("backAnswer", data)
  })
  socket.on("disconnect", () => {
    if (clients > 0) {
      clients--
    }
    console.log("user has left the chat")
  })
})

console.log("total clients", clients)
// console.log(server)
