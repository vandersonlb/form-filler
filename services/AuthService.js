export default class AuthService {
  static token = null;

  static async login() {
    const response = await chrome.runtime.sendMessage({ action: "getAuthToken" });

    if (response?.error) throw new Error(response.error);
    if (!response?.token) throw new Error("Token não retornado.");

    this.token = response.token;
    return this.token;
  }

  static async logout() {
    const response = await chrome.runtime.sendMessage({ action: "revokeAuthToken" });

    if (response?.error) throw new Error(response.error);

    this.token = null;
    return response.message;
  }

  static getToken() {
    return this.token;
  }
}
