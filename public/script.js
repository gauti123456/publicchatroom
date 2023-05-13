const socket = io();

let username;

if (localStorage.getItem("username")) {
  username = localStorage.getItem("username");
  socket.emit("username", username);
} else {
  // Get the username from the local storage if it exists
  //let username = localStorage.getItem("username");
  // If the username is not found, ask the user to enter it

  Swal.fire({
    title: "Enter your username",
    input: "text",
    inputLabel: "Username",
    inputPlaceholder: "Enter your username",
    allowOutsideClick: false,
    inputValidator: (value) => {
      if (!value) {
        return "You need to enter a username!";
      }
    },
    confirmButtonText: "Enter Chat",
    showLoaderOnConfirm: true,
    preConfirm: (username) => {},
  }).then((result) => {
    console.log(result);
    username = result.value;
    socket.emit("username", username);
    localStorage.setItem("username", username);
  });
}

function scrollToBottom() {
  const messageList = document.getElementById("messages");
  console.log(
    `scrollTop: ${messageList.scrollTop}, scrollHeight: ${messageList.scrollHeight}`
  );
  messageList.scrollTop = messageList.scrollHeight;
  console.log(
    `new scrollTop: ${messageList.scrollTop}, scrollHeight: ${messageList.scrollHeight}`
  );
}

socket.on("user joined", (username) => {
  console.log(username);
  const item = document.createElement("li");
  item.classList.add("chat-message");
  item.innerHTML = `<span class="chat-username">${username}</span> : has joined the chat`;
  messages.appendChild(item);
  scrollToBottom();
});

socket.on("user left", (data) => {
  console.log(data);
  console.log("user left " + data);
  const item = document.createElement("li");
  item.classList.add("chat-message");
  item.innerHTML = `<span class="chat-username">${data}</span> : has left the chat`;
  messages.appendChild(item);
  scrollToBottom();
});

const form = document.getElementById("chat-form");
const input = form.querySelector('input[type="text"]');
const fileInput = form.querySelector('input[type="file"]');
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const reader = new FileReader();
  const file = fileInput.files[0];

  if (!file && !input.value) {
    alert("Please enter the message");
    return;
  }

  if (file) {
    reader.readAsDataURL(file);
    reader.onload = () => {
      socket.emit("chat message", {
        author: username,
        content: input.value,
        image: reader.result,
      });
      input.value = "";
      fileInput.value = "";
    };
  } else {
    socket.emit("chat message", {
      author: username,
      content: input.value,
      image: null,
    });
    input.value = "";
  }
});

socket.on("chat message", (msg) => {
  const item = document.createElement("li");
  item.classList.add("chat-message");
  item.innerHTML = `<span class="chat-username">${msg.author}</span> : ${msg.content}`;
  //item.innerText = msg.author + ": " + msg.content;
  if (msg.image) {
    const img = document.createElement("img");
    img.src = msg.image;
    img.classList.add("image");
    item.appendChild(img);
  }
  messages.appendChild(item);
  scrollToBottom();
});

socket.on("load messages", (messages) => {
  const messageList = document.getElementById("messages");
  messages.forEach((msg) => {
    const item = document.createElement("li");
    item.classList.add("chat-message");
    item.innerHTML = `<span class="chat-username">${msg.author}</span> : ${msg.content}`;
    //item.innerText = msg.author + ": " + msg.content;
    if (msg.image) {
      const img = document.createElement("img");
      img.src = msg.image;
      img.classList.add("image");
      item.appendChild(img);
    }
    messageList.appendChild(item);
  });
  scrollToBottom();
});