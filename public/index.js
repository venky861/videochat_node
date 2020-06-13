let Peer = require("simple-peer")
let socket = io()
let video = document.querySelector("video")
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    socket.emit("NewClient")
    console.log(stream)
    video.srcObject = stream
    video.play()
    let client = {}

    function InitPeer(type) {
      console.log("peer received")
      let peer = new Peer({
        initiator: type === "init" ? true : false,
        stream: stream,
        trickle: false,
      })

      console.log("peer", peer)

      peer.on("stream", (stream) => {
        console.log("stream", stream)
        let video = document.createElement("video")
        video.id = "peerVideo"
        video.setAttribute("class", "embed-responsive-item")
        document.querySelector("#peerDiv").appendChild(video)
        video.srcObject = stream
        video.play()
      })

      peer.on("close", () => {
        document.getElementById("peerVideo").remove()
        peer.destroy()
        console.log("peer destroyed")
      })

      return peer
    }

    socket.on("CreatePeer", () => {
      client.gotAnswer = false

      let peer = InitPeer("init")
      peer.on("signal", (data) => {
        if (!client.gotAnswer) {
          socket.emit("offer", data)
        }
      })
      client.peer = peer
    })

    socket.on("backOffer", (offer) => {
      let peer = InitPeer("notInit")

      peer.on("signal", (data) => {
        socket.emit("Answer", data)
      })
      peer.signal(offer)
      client.peer = peer
    })

    socket.on("backAnswer", (answer) => {
      client.gotAnswer = true
      let peer = client.peer
      peer.signal(answer)
    })

    socket.on("SessionActive", () => {
      document.write("Session is active , comeback later")
    })
  })
  .catch((err) => document.write(err))

console.log(socket)
