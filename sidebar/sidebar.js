import UIController from "../controllers/UIController.js";
import AuthService from "../services/AuthService.js";
import SheetService from "../services/SheetService.js";
import FormService from "../services/FormService.js";

document.getElementById("login").addEventListener("click", async () => {
  try {
    const token = await AuthService.login();
    UIController.showStatus(`Token: ${token}`);
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

document.getElementById("logout").addEventListener("click", async () => {
  try {
    await AuthService.logout();
    UIController.showStatus(chrome.i18n.getMessage("logout_success"));
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

document.getElementById("token").addEventListener("click", () => {
  const token = AuthService.getToken();
  UIController.showStatus(token || chrome.i18n.getMessage("not_auth"));
});

document.getElementById("fetch").addEventListener("click", async () => {
  const spreadsheetId = "1spgtksmmLXk8ZZXPPqCv1JmOBCqCfZPfeAil3dHf-xM";
  try {
    const values = await SheetService.fetchSheetData(spreadsheetId, "A1:Z");
    UIController.showStatus(`Dados recebidos: ${JSON.stringify(values)}`);
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

document.getElementById("fetch-form").addEventListener("click", async () => {
  const result = await FormService.getFormFromActiveTab();
  if (result.found) {
    UIController.showStatus(`${JSON.stringify(result.fields)}`);
    teste(result.fields);
  } else {
    UIController.showStatus(result.error || "Nenhum formulário encontrado.", true);
  }
});
