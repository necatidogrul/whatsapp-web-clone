document.addEventListener("DOMContentLoaded", () => {
  const currentUser = "1";
  const chatList = document.getElementById("chat-list");
  const chatHeader = document.getElementById("chat-header");
  const chatMessages = document.getElementById("chat-messages");
  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");
  const chatWindow = document.getElementById("chat-window");
  const welcomeScreen = document.getElementById("welcome-screen");
  const searchInput = document.getElementById("search-input");

  let selectedChat = null;
  let chats = [];
  let allMessages = [];
  let users = {};

  function createElement(tag, classNames = [], appendChilds = [], textContent) {
    const element = document.createElement(tag);
    if (textContent) {
      element.textContent = textContent;
    }
    classNames.forEach((className) => element.classList.add(className));
    appendChilds.forEach((appendChild) => element.appendChild(appendChild));
    return element;
  }

  function removeAllChildNodes(parent) {
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }

    // parent.forEach(() => {
    //   parent.removeChild(parent.firstChild);
    // });
  }

  async function loadUsers() {
    try {
      const response = await fetch("http://localhost:3000/users");
      const usersData = await response.json();

      usersData.forEach((user) => {
        users[user.id] = user;
      });
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  function loadChatList(filteredChats = chats) {
    removeAllChildNodes(chatList);
    filteredChats.forEach((chat) => {
      const chatItem = createElement("div", ["chat-item"]);
      chatItem.dataset.chat = chat.id;

      const chatIcon = createElement("img", ["chat-icon"]);
      chatIcon.src = users[chat.id].profile_picture;

      const chatDetails = createElement("div", ["chat-details"]);
      const chatName = createElement(
        "span",
        ["chat-name"],
        [],
        users[chat.id].name
      );

      const lastMessage = getLastMessage(chat.id);
      const chatLastMessage = createElement(
        "span",
        ["chat-last-message"],
        [],
        lastMessage
      );

      chatDetails.appendChild(chatName);
      chatDetails.appendChild(chatLastMessage);

      chatItem.appendChild(chatIcon);
      chatItem.appendChild(chatDetails);

      chatItem.addEventListener("click", () => selectChat(chat));
      chatList.appendChild(chatItem);
    });
  }

  function getLastMessage(chatId) {
    const messages = allMessages.filter(
      (message) =>
        (message.sender === currentUser && message.receiver === chatId) ||
        (message.sender === chatId && message.receiver === currentUser)
    );
    if (messages.length === 0) return "";
    const lastMessage = messages[messages.length - 1].message;
    return lastMessage;
  }

  function filterChats() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredChats = chats.filter((chat) =>
      users[chat.id].name.toLowerCase().includes(searchTerm)
    );
    loadChatList(filteredChats);
  }

  function selectChat(chat) {
    selectedChat = chat;
    chatHeader.innerHTML = "";
    const chatHeaderIcon = createElement("img", ["chat-header-icon"]);
    chatHeaderIcon.src = users[chat.id].profile_picture;
    const chatHeaderName = createElement("span", [], [], users[chat.id].name);

    chatHeader.appendChild(chatHeaderIcon);
    chatHeader.appendChild(chatHeaderName);

    removeAllChildNodes(chatMessages);
    displayMessages();
    chatWindow.style.display = "flex";
    welcomeScreen.style.display = "none";
  }

  function loadMessages() {
    fetch("http://localhost:3000/messages")
      .then((response) => response.json())
      .then((messages) => {
        allMessages = messages;
        updateChats();
        if (selectedChat) {
          displayMessages();
        }
        loadChatList();
      })
      .catch((error) => console.error("Error loading messages:", error));
  }

  function updateChats() {
    const uniqueChats = new Set();
    allMessages.forEach((message) => {
      if (message.sender === currentUser) {
        uniqueChats.add(message.receiver);
      } else if (message.receiver === currentUser) {
        uniqueChats.add(message.sender);
      }
    });

    chats = Array.from(uniqueChats).map((chatId) => {
      const chat = {
        id: chatId,
        name: users[chatId].name,
        messages: allMessages.filter(
          (message) =>
            (message.sender === currentUser && message.receiver === chatId) ||
            (message.sender === chatId && message.receiver === currentUser)
        ),
      };
      return chat;
    });

    chats.sort((a, b) => {
      const aLastMessage = new Date(
        a.messages[a.messages.length - 1].timestamp
      ).getTime();
      const bLastMessage = new Date(
        b.messages[b.messages.length - 1].timestamp
      ).getTime();
      return bLastMessage - aLastMessage;
    });
  }

  function displayMessages() {
    removeAllChildNodes(chatMessages);
    const messagesToShow = selectedChat.messages;
    messagesToShow.forEach((message) => {
      const messageElement = createElement("div", ["message"]);
      messageElement.dataset.id = message.id;
      if (message.sender === currentUser) {
        messageElement.classList.add("current-user");

        const messageContent = createElement(
          "span",
          ["message-content"],
          [],
          message.message
        );
        const optionsIcon = createElement("span", ["options-icon"], [], "⋮");
        optionsIcon.dataset.id = message.id;
        const optionsMenu = createElement("div", ["options-menu"]);
        optionsMenu.dataset.id = message.id;

        const editButton = createElement("button", ["edit-button"], [], "Edit");
        editButton.dataset.id = message.id;
        const deleteButton = createElement(
          "button",
          ["delete-button"],
          [],
          "Delete"
        );
        deleteButton.dataset.id = message.id;

        optionsMenu.appendChild(editButton);
        optionsMenu.appendChild(deleteButton);

        messageElement.appendChild(messageContent);
        messageElement.appendChild(optionsIcon);
        messageElement.appendChild(optionsMenu);

        optionsIcon.addEventListener("click", () => {
          optionsMenu.style.display = "block";
        });

        editButton.addEventListener("click", () => {
          const originalMessage = messageContent.textContent.trim();
          const editInput = createElement("input", ["edit-input"]);
          editInput.value = originalMessage;
          editInput.dataset.id = message.id;

          const saveCancel = createElement("div", ["save-cancel"], [], "");

          const saveEditButton = createElement(
            "button",
            ["save-edit-button"],
            [],
            "Save"
          );
          saveEditButton.dataset.id = message.id;

          const cancelEditButton = createElement(
            "button",
            ["cancel-edit-button"],
            [],
            "Cancel"
          );
          cancelEditButton.dataset.id = message.id;

          removeAllChildNodes(messageElement);
          messageElement.appendChild(editInput);
          saveCancel.appendChild(saveEditButton);
          saveCancel.appendChild(cancelEditButton);
          messageElement.appendChild(saveCancel);

          saveEditButton.addEventListener("click", () => {
            const newMessageContent = editInput.value.trim();
            if (newMessageContent !== "") {
              editMessage(message.id, newMessageContent);
            } else {
              alert("Message content cannot be empty.");
            }
          });

          cancelEditButton.addEventListener("click", () => {
            removeAllChildNodes(messageElement);
            messageElement.appendChild(messageContent);
            messageElement.appendChild(optionsIcon);
            messageElement.appendChild(optionsMenu);
          });
        });

        deleteButton.addEventListener("click", () => {
          deleteMessage(message.id);
        });
      } else {
        messageElement.classList.add("other-user");
        messageElement.textContent = message.message;
      }
      chatMessages.appendChild(messageElement);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function sendMessage() {
    if (messageInput.value.trim() === "") return;

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
      .then((message) => {
        allMessages.push(message);
        updateChats();
        messageInput.value = "";
        if (selectedChat.id === message.receiver) {
          selectedChat.messages.push(message);
          displayMessages();
        }
        loadChatList();
      })
      .catch((error) => console.error("Error sending message:", error));
  }

  function deleteMessage(messageId) {
    fetch(`http://localhost:3000/messages/${messageId}`, {
      method: "DELETE",
    })
      .then(() => {
        allMessages = allMessages.filter((message) => message.id !== messageId);
        updateChats();
        if (selectedChat) {
          selectedChat.messages = selectedChat.messages.filter(
            (message) => message.id !== messageId
          );
          displayMessages();
        }
        loadChatList();
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
        const messageIndex = allMessages.find(
          (message) => message.id === messageId
        );
        allMessages[messageIndex].message = newMessageContent;
        updateChats();
        if (selectedChat) {
          const selectedMessageIndex = selectedChat.messages.find(
            (message) => message.id === messageId
          );
          selectedChat.messages[selectedMessageIndex].message =
            newMessageContent;
          displayMessages();
        }
        loadChatList();
      })
      .catch((error) => console.error("Error editing message:", error));
  }

  loadUsers().then(() => {
    loadMessages();
  });

  sendButton.addEventListener("click", () => sendMessage());
  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
  searchInput.addEventListener("input", () => filterChats());

  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("options-icon")) {
      const optionsMenus = document.querySelectorAll(".options-menu");
      optionsMenus.forEach((menu) => {
        menu.style.display = "none";
      });
    }
  });
});
