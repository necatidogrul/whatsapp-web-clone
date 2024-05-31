class Chat {
  constructor(id, allMessages, currentUser, app) {
    this.id = id;
    this.name = app.users[id].name;
    this.messages = allMessages.filter(
      (message) =>
        (message.sender === currentUser && message.receiver === id) ||
        (message.sender === id && message.receiver === currentUser)
    );
    this.app = app;
  }

  getLastMessage() {
    if (this.messages.length === 0) return "";
    return this.messages[this.messages.length - 1].message;
  }

  getLastMessageTimestamp() {
    if (this.messages.length === 0) return 0;
    return new Date(
      this.messages[this.messages.length - 1].timestamp
    ).getTime();
  }
}
