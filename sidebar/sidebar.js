import UIController from "../controllers/UIController.js";
import AuthService from "../services/AuthService.js";
import SheetService from "../services/SheetService.js";
import FormService from "../services/FormService.js";

const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const getTokenButton = document.getElementById("token");
const getSheetDataButton = document.getElementById("fetch");
const scanTabFormButton = document.getElementById("scan");
const showMappingUIButton = document.getElementById("show_mapping_ui");
const showMappingButton = document.getElementById("show_mapping");
const mappingDiv = document.getElementById("fields");

loginButton.addEventListener("click", async () => {
  try {
    const token = await AuthService.login();
    UIController.showStatus(`Token: ${token}`);
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    await AuthService.logout();
    UIController.showStatus(chrome.i18n.getMessage("logout_success"));
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

getTokenButton.addEventListener("click", () => {
  const token = AuthService.getToken();
  UIController.showStatus(token || chrome.i18n.getMessage("not_auth"), !token ?? true);
});

getSheetDataButton.addEventListener("click", async () => {
  const spreadsheetId = "1tiQxklA6YGHtLkrHssPRNMn3VnruidSQFF4FK3-RHwE";
  try {
    const values = await SheetService.fetchSheetData(spreadsheetId, "A1:Z");
    UIController.showStatus(`Dados recebidos: ${JSON.stringify(values)}`);
  } catch (err) {
    UIController.showStatus(err.message, true);  // Colocar msg mais explicativa para o usuário.
  }
});

var formInputs;
const columns = ["nome", "sobrenome", "email"];

scanTabFormButton.addEventListener("click", async () => {
  const result = await FormService.getFormFromActiveTab();
  if (result.found) {
    formInputs = result.fields;
    chrome.runtime.sendMessage({ action: "log", payload: formInputs})
  } else {
    UIController.showStatus("Nenhum formulário encontrado.", true);
  }
});


/*********************************************************************************************************/

// Constroe a interface para o usuário fazer o mapeamento
showMappingUIButton.addEventListener("click", () => {
  // UIController.showStatus(666)
  formInputs.forEach((input) => {
    let mappingComponent = createMapNode(input.uniqueId, input.label, columns);
    mappingDiv.appendChild(mappingComponent);
  });
});

// Constroe o elemento de seleção
function createSelect(id, options) {
  let select = document.createElement("select");
  select.id = id;

  let defaultOpt = document.createElement("option");
  defaultOpt.disabled = true;
  defaultOpt.selected = true;
  defaultOpt.value = "default";
  defaultOpt.textContent = "Selecione uma opção";
  select.appendChild(defaultOpt);

  options.forEach((h) => {
    let option = document.createElement("option");
    option.textContent = h.charAt(0).toUpperCase() + h.slice(1);
    option.value = h;
    select.appendChild(option);
  });

  return select;
}

// Cria o elemento de mapeamento, de um lado, qual é o input do formulário, do outro, o usuário escolhe
// qual vai ser a columa correspondente àquele input.
function createMapNode(inputId, labelTxt, options) {
  let div = document.createElement("div");
  let label = document.createElement("label");
  label.htmlFor = inputId;
  label.innerText = labelTxt;

  div.appendChild(label);
  div.appendChild(createSelect(inputId, options));

  return div;
}

// Lógica para exibir o mapeamento.
showMappingButton.addEventListener("click", () => {
  let selects = mappingDiv.getElementsByTagName("select");
  UIController.showStatus();
  chrome.runtime.sendMessage({ action: "log", payload: getMapping(selects)})
});

// Captura e constroe um objeto do mapeamento.
function getMapping(list) {
  return [...list]
    .filter(item => item.value !== "default")
    .map(item => ({ formInput: item.id, sheetColumn: item.value }));
}