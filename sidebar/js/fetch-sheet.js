import { showStatus } from "./status-msg.js";
import Globais from "./Globais.js";

export function fetchSheetData(spreadsheetId, range) {
  if (Globais.currentToken == null) {
    showStatus("*****Não autenticado. Por favor, autentique-se primeiro.", true);
    return;
  }

  const payload = {
    action: "fetchSheetData",
    token: Globais.currentToken,
    url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
  };

  chrome.runtime.sendMessage(payload, (response) => {
    if (response.error) {
      showStatus(response.error, true);
      return;
    }

    showStatus(response.data);
  });
}
