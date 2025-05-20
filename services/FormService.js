export default class FormService {
  static async getFormFromActiveTab() {
    const [tab] = await FormService.getActiveTab();
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: "scanForForm" }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ found: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  static async getFieldFromActiveTab(payload) {
    const [tab] = await FormService.getActiveTab();
    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action: "getField", payload }, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ found: false, error: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  static async getActiveTab() {
    return await chrome.tabs.query({ active: true, currentWindow: true });
  }
}
