class Request {
  static async get(url) {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error getting data:", error);
    }
  }

  static async post(url, data) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  }

  static async delete(url) {
    try {
      await fetch(url, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }

  static async patch(url, data) {
    try {
      await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Error patching data:", error);
    }
  }
}

export default Request;
