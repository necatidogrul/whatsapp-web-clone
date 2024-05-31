//currentuser'a mesaj atmayı denemek icin yazdım

document.addEventListener("DOMContentLoaded", () => {
  const chatList = document.getElementById("chat-list");
  const chatHeader = document.getElementById("chat-header");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const chatWindow = document.getElementById("chat-window");
  let currentUser = "user2";
  let selectedChat = null;

  const chats = [{ id: "user1", name: "User 1", messages: [] }];

  function loadChatList() {
    chatList.textContent = "";
    chats.forEach((chat) => {
      const chatItem = document.createElement("div");
      chatItem.classList.add("chat-item");
      chatItem.textContent = chat.name;
      chatItem.dataset.chat = chat.id;
      chatItem.addEventListener("click", () => selectChat(chat));
      chatList.appendChild(chatItem);
    });
  }

  function selectChat(chat) {
    selectedChat = chat;
    chatHeader.textContent = chat.name;
    chatMessages.innerHTML = "";
    loadMessages();
    chatWindow.style.display = "flex";
  }

  function loadMessages() {
    fetch("http://localhost:3000/messages")
      .then((response) => response.json())
      .then((messages) => {
        selectedChat.messages = messages.filter(
          (message) =>
            (message.sender === currentUser &&
              message.receiver === selectedChat.id) ||
            (message.sender === selectedChat.id &&
              message.receiver === currentUser)
        );
        chatMessages.innerHTML = "";
        selectedChat.messages.forEach((message) => {
          const messageElement = document.createElement("div");
          messageElement.classList.add("message");
          messageElement.dataset.id = message.id;
          if (message.sender === currentUser) {
            messageElement.classList.add("current-user");
            messageElement.innerHTML = `
                            <span class="message-content">${message.message}</span>
                            <span class="options-icon" data-id="${message.id}">&#x22EE;</span>
                            <div class="options-menu" data-id="${message.id}">
                                <button class="edit-button" data-id="${message.id}">Edit</button>
                                <button class="delete-button" data-id="${message.id}">Delete</button>
                            </div>`;
          } else {
            messageElement.classList.add("other-user");
            messageElement.textContent = message.message;
          }
          chatMessages.appendChild(messageElement);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
        addOptionsMenuEventListeners();
      })
      .catch((error) => console.error("Error loading messages:", error));
  }

  function sendMessage() {
    if (messageInput.value.trim() === "" || !selectedChat) return;

    const newMessage = {
      sender: currentUser,
      receiver: selectedChat.id,
      message: messageInput.value,
      timestamp: new Date().toISOString(),
    };

    fetch("http://localhost:3000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessage),
    })
      .then((response) => response.json())
      .then(() => {
        messageInput.value = "";
        loadMessages();
      })
      .catch((error) => console.error("Error sending message:", error));
  }

  function deleteMessage(messageId) {
    fetch(`http://localhost:3000/messages/${messageId}`, {
      method: "DELETE",
    })
      .then(() => {
        loadMessages();
      })
      .catch((error) => console.error("Error deleting message:", error));
  }

  function editMessage(messageId, newMessageContent) {
    fetch(`http://localhost:3000/messages/${messageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: newMessageContent }),
    })
      .then(() => {
        loadMessages();
      })
      .catch((error) => console.error("Error editing message:", error));
  }

  function addOptionsMenuEventListeners() {
    const optionsIcons = document.querySelectorAll(".options-icon");
    optionsIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        const messageId = icon.dataset.id;
        const optionsMenu = document.querySelector(
          `.options-menu[data-id="${messageId}"]`
        );
        optionsMenu.style.display = "block";
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const messageId = button.dataset.id;
        deleteMessage(messageId);
      });
    });

    const editButtons = document.querySelectorAll(".edit-button");
    editButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const messageId = button.dataset.id;
        const messageElement = document.querySelector(
          `.message[data-id="${messageId}"]`
        );
        const originalMessage = messageElement
          .querySelector(".message-content")
          .textContent.trim();
        messageElement.innerHTML = `
                    <input type="text" class="edit-input" value="${originalMessage}" data-id="${messageId}">
                    <button class="save-edit-button" data-id="${messageId}">Save</button>
                    <button class="cancel-edit-button" data-id="${messageId}">Cancel</button>`;

        addEditInputEventListeners(messageId, originalMessage);
      });
    });
  }

  function addEditInputEventListeners(messageId, originalMessage) {
    const saveEditButton = document.querySelector(
      `.save-edit-button[data-id="${messageId}"]`
    );
    const cancelEditButton = document.querySelector(
      `.cancel-edit-button[data-id="${messageId}"]`
    );
    const editInput = document.querySelector(
      `.edit-input[data-id="${messageId}"]`
    );

    saveEditButton.addEventListener("click", () => {
      const newMessageContent = editInput.value.trim();
      if (newMessageContent !== "") {
        editMessage(messageId, newMessageContent);
      } else {
        alert("Message content cannot be empty.");
      }
    });

    cancelEditButton.addEventListener("click", () => {
      const messageElement = document.querySelector(
        `.message[data-id="${messageId}"]`
      );
      messageElement.innerHTML = `
                <span class="message-content">${originalMessage}</span>
                <span class="options-icon" data-id="${messageId}">&#x22EE;</span> 
                <div class="options-menu" data-id="${messageId}">
                    <button class="edit-button" data-id="${messageId}">Edit</button>
                    <button class="delete-button" data-id="${messageId}">Delete</button>
                </div>`;
      addOptionsMenuEventListeners();
    });
  }

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("options-icon")) {
      const optionsMenus = document.querySelectorAll(".options-menu");
      optionsMenus.forEach((menu) => {
        menu.style.display = "none";
      });
    }
  });

  loadChatList();
});
