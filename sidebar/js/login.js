import { showStatus } from "./status-msg.js";
import Globais from "./Globais.js";

export function login() {
  chrome.runtime.sendMessage({ action: "getAuthToken" }, (response) => {
    if (!response) {
      showStatus(chrome.i18n.getMessage("access_denied"), true);
      return;
    }

    if (response.error) {
      showStatus(response.error, true);
      return;
    }

    Globais.currentToken = response.token;
    showStatus(Globais.currentToken);
  });
}

export function logout() {
  chrome.runtime.sendMessage({ action: "revokeAuthToken" }, (response) => {
    if (response.error) {
      showStatus(response.error, true);
      return;
    }

    showStatus(response.message);
  });
}
