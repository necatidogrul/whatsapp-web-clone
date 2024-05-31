class Message {
  constructor(message, currentUser, app) {
    this.message = message;
    this.currentUser = currentUser;
    this.app = app;
  }

  render() {
    const messageElement = this.app.createElement("div", ["message"]);
    messageElement.dataset.id = this.message.id;
    if (this.message.sender === this.currentUser) {
      messageElement.classList.add("current-user");

      const messageContent = this.app.createElement(
        "span",
        ["message-content"],
        [],
        this.message.message
      );
      const optionsIcon = this.app.createElement(
        "span",
        ["options-icon"],
        [],
        "⋮"
      );
      optionsIcon.dataset.id = this.message.id;
      const optionsMenu = this.app.createElement("div", ["options-menu"]);
      optionsMenu.dataset.id = this.message.id;

      const editButton = this.app.createElement(
        "button",
        ["edit-button"],
        [],
        "Edit"
      );
      editButton.dataset.id = this.message.id;
      const deleteButton = this.app.createElement(
        "button",
        ["delete-button"],
        [],
        "Delete"
      );
      deleteButton.dataset.id = this.message.id;

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
        const editInput = this.app.createElement("input", ["edit-input"]);
        editInput.value = originalMessage;
        editInput.dataset.id = this.message.id;

        const saveEditButton = this.app.createElement(
          "button",
          ["save-edit-button"],
          [],
          "Save"
        );
        saveEditButton.dataset.id = this.message.id;

        const cancelEditButton = this.app.createElement(
          "button",
          ["cancel-edit-button"],
          [],
          "Cancel"
        );
        cancelEditButton.dataset.id = this.message.id;

        this.app.removeAllChildNodes(messageElement);
        messageElement.appendChild(editInput);
        messageElement.appendChild(saveEditButton);
        messageElement.appendChild(cancelEditButton);

        saveEditButton.addEventListener("click", () => {
          const newMessageContent = editInput.value.trim();
          if (newMessageContent !== "") {
            this.app.editMessage(this.message.id, newMessageContent);
          } else {
            alert("Message content cannot be empty.");
          }
        });

        cancelEditButton.addEventListener("click", () => {
          this.app.removeAllChildNodes(messageElement);
          messageElement.appendChild(messageContent);
          messageElement.appendChild(optionsIcon);
          messageElement.appendChild(optionsMenu);
        });
      });

      deleteButton.addEventListener("click", () => {
        this.app.deleteMessage(this.message.id);
      });
    } else {
      messageElement.classList.add("other-user");
      messageElement.textContent = this.message.message;
    }

    return messageElement;
  }
}
