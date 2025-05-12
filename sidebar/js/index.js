import { showStatus } from "./status-msg.js";
import { login, logout } from "./login.js";
import { fetchSheetData } from "./fetch-sheet.js";
import Globais from "./Globais.js";

const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");

loginButton.addEventListener("click", () => login());

logoutButton.addEventListener("click", () => logout());

document
  .getElementById("token")
  .addEventListener("click", () => showStatus(Globais.currentToken));

document.getElementById("fetch").addEventListener("click", () => {
  var spreadsheetId = "1spgtksmmLXk8ZZXPPqCv1JmOBCqCfZPfeAil3dHf-xM";
  fetchSheetData(spreadsheetId, "A1:Z");
});
