import AuthService from "./AuthService.js";

export default class SheetService {
  static async fetchSheetData(spreadsheetId, range) {
    const token = AuthService.getToken();
    if (!token) throw new Error(chrome.i18n.getMessage("not_auth"));

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    const payload = { action: "fetchSheetData", token, url };

    const response = await chrome.runtime.sendMessage(payload);

    if (response?.error) throw new Error(response.error);

    return response?.data?.values || [];
  }

}
