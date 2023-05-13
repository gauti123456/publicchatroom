const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const multer = require("multer");

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/chatapp";

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const MessageSchema = new mongoose.Schema({
  author: String,
  content: String,
  image: String,
});

const Message = mongoose.model("Message", MessageSchema);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("username", (username) => {
    socket.username = username;
    console.log("username is" + username);
    io.emit("user joined", username);
  });

  Message.find({})
    .then((messages) => {
      // Emit all messages to the new client
      socket.emit("load messages", messages);
    })
    .catch((err) => {
      console.error(err);
    });

  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    const message = new Message({
      author: msg.author,
      content: msg.content,
      image: msg.image,
    });
    message
      .save()
      .then(() => {
        io.emit("chat message", msg);
      })
      .catch((err) => console.log(err));
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    io.emit("user left", socket.username);
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
