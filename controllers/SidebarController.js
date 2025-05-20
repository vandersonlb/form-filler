import UIController from "./UIController.js";
import AuthService from "../services/AuthService.js";
import SheetService from "../services/SheetService.js";
import FormService from "../services/FormService.js";

export default class SidebarController {
  constructor({
    // loginButton,
    // logoutButton,
    // getTokenButton,
    // getSheetDataButton,
    scanTabFormButton,
    // showMappingUIButton,
    // showMappingButton,
    mappingDiv,
    // formatSheetData,
    // testeButton
  }) {
    // this.loginButton = loginButton;
    // this.logoutButton = logoutButton;
    // this.getTokenButton = getTokenButton;
    // this.getSheetDataButton = getSheetDataButton;
    this.scanTabFormButton = scanTabFormButton;
    // this.showMappingUIButton = showMappingUIButton;
    // this.showMappingButton = showMappingButton;s
    this.mappingDiv = mappingDiv;
    // this.formatSheetData = formatSheetData;
    // this.testeButton = testeButton;

    // this.tabInputs = [];
    // this.mapped = [];
    // this.columns = ["nome", "sobrenome", "email"];
    // this.sheetData = [
    //   ["nome", "sobrenome", "email", "telefone"],
    //   ["Vanderson Luis", "Bonacuore", "vandersonlb@hotmail.com", "1234"],
    //   ["Michele Almeida", "Bonacuore", "michele.ads@hotmail.com", "5678"],
    //   ["Thomas Almeida", "Bonacuore", "thomasbonacuore@hotmail.com", "3131"],
    // ];
  }

  init() {
    // this.loginButton.addEventListener("click", this.handleLogin.bind(this));
    // this.logoutButton.addEventListener("click", this.handleLogout.bind(this));
    // this.getTokenButton.addEventListener("click", this.handleGetToken.bind(this));
    // this.getSheetDataButton.addEventListener("click", this.handleGetSheetData.bind(this));
    this.scanTabFormButton.addEventListener("click", this.handleShowFields.bind(this));
    // this.showMappingUIButton.addEventListener("click", this.handleShowMappingUI.bind(this));
    // this.showMappingButton.addEventListener("click", this.handleShowMapping.bind(this));
    // this.formatSheetData.addEventListener("click", this.handleFormatSheetData.bind(this));
    // this.testeButton.addEventListener("click", this.handleShowFormattedData.bind(this));
  }

  async handleLogin() {
    try {
      const token = await AuthService.login();
      UIController.showStatus(`Token: ${token}`);
    } catch (err) {
      UIController.showStatus(err.message, true);
    }
  }

  async handleLogout() {
    try {
      await AuthService.logout();
      UIController.showStatus(chrome.i18n.getMessage("logout_success"));
    } catch (err) {
      UIController.showStatus(err.message, true);
    }
  }

  handleGetToken() {
    const token = AuthService.getToken();
    UIController.showStatus(token || chrome.i18n.getMessage("not_auth"), !token ?? true);
  }

  async handleGetSheetData() {
    const spreadsheetId = "1tiQxklA6YGHtLkrHssPRNMn3VnruidSQFF4FK3-RHwE";
    try {
      const sheetData = await SheetService.fetchSheetData(spreadsheetId, "A1:Z");
      return sheetData;
    } catch (err) {
      UIController.showStatus(err.message, true);
    }
  }

  static async scanTabForm() {
    let result;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url.split(/[?#]/)[0];
    const storageKey = `scan_${url}`;

    try {
      const stored = await chrome.storage.local.get([storageKey]);
      if (stored?.[storageKey]?.fields) {
        result = { found: true, fields: JSON.parse(stored[storageKey].fields) };
        chrome.runtime.sendMessage({ action: "log", payload: result.fields });
        return result;
      }
    } catch (e) {
      chrome.runtime.sendMessage({ action: "log", payload: "Erro ao recuperar dados do storage:" + (e && e.message ? e.message : String(e)) });
      UIController.showStatus("Erro ao recuperar dados do storage: " + (e && e.message ? e.message : String(e)), true);
    }

    result = await FormService.getFormFromActiveTab();

    if (result.found) {
      UIController.showStatus("Encontrado", result.fields);
      chrome.runtime.sendMessage({ action: "log", payload: result.fields });
      SidebarController.saveScanLocalStage(storageKey, url, result.fields);
      return result;
    }

    UIController.showStatus("Nenhum formulário encontrado.", true);
    chrome.runtime.sendMessage({ action: "log", payload: "Nenhum formulário encontrado." });
  }

  static async saveScanLocalStage(storageKey, url, fields) {
    try {
      if (!Array.isArray(fields)) throw new Error("Campos inválidos");
      fields = JSON.stringify(fields);
      await chrome.storage.local.set({ [storageKey]: { url, fields } });
      UIController.showStatus("Dados salvos com sucesso! " + storageKey);
      chrome.runtime.sendMessage({ action: "log", payload: "Dados salvos com sucesso! " + storageKey });
    } catch (e) {
      // console.error("Erro ao salvar dados:", e);
      chrome.runtime.sendMessage({ action: "log", payload: "Erro ao recuperar dados do storage:" + JSON.parse(e) });
      UIController.showStatus("Erro ao salvar no localStorage", true);
    }
  }

  async handleShowFields() {
    let result = await SidebarController.scanTabForm();
    this.mappingDiv.innerHTML = JSON.stringify(result.fields);
  }

  handleShowMappingUI() {
    if (!this.tabInputs || this.tabInputs.length === 0) {
      UIController.showStatus("Nenhum formulário encontrado.", true);
      return;
    }
    this.mappingDiv.innerHTML = "";
    this.tabInputs.forEach((input) => {
      let mappingComponent = SidebarController.createMappingComponent(input, this.columns);
      this.mappingDiv.appendChild(mappingComponent);
    });
  }

  handleShowMapping() {
    var selects = this.mappingDiv.getElementsByTagName("select");
    this.mapped = SidebarController.setMapping(selects);
    chrome.runtime.sendMessage({ action: "log", payload: this.mapped });
  }

  // handleFormatSheetData() {
  //   var data = SidebarController.getFormattedSheetData(this.sheetData);
  //   chrome.runtime.sendMessage({ action: "log", payload: Object.keys(data[0]) });
  //   chrome.runtime.sendMessage({ action: "log", payload: data });
  // }

  // handleShowFormattedData() {
  //   this.mappingDiv.innerHTML = "666";
  // }

  async handleTeste__() {
    const results = [];
    for (const item of this.mapped) {
      const result = await FormService.getFieldFromActiveTab(item);
      if (result.found) {
        // chrome.runtime.sendMessage({ action: "log", payload: result });
        results.push(result);
      } else {
        UIController.showStatus("Nenhum formulário encontrado.", true);
        results.push({ found: false, item });
      }
    }
    return results;
  }

  // Utilitários estáticos
  static createMappingComponent(input, options) {
    let div = document.createElement("div");
    let label = document.createElement("label");
    label.htmlFor = input.originalId;
    label.innerText = input.label;
    div.appendChild(label);
    div.appendChild(SidebarController.createSelectComponent(input, options));
    return div;
  }

  static createSelectComponent(input, options) {
    let select = document.createElement("select");
    select.id = input.uniqueId;
    select.setAttribute("data-original-id", input.originalId);
    select.setAttribute("data-original-name", input.label);
    select.setAttribute("data-input-type", input.type);
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

  static setMapping(list) {
    return [...list]
      .filter((item) => item.value !== "default")
      .map((item) => ({
        originalId: item.dataset.originalId,
        originalName: item.dataset.originalName,
        inputType: item.dataset.inputType,
        sheetColumn: item.value,
      }));
  }

  static getFormattedSheetData(sheetData) {
    const headers = sheetData[0];
    const data = sheetData.slice(1).map((row) => {
      return headers.reduce((obj, key, i) => {
        obj[key] = row[i];
        return obj;
      }, {});
    });
    return data;
  }
}
