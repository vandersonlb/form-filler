import UIController from "../controllers/UIController.js";
import AuthService from "../services/AuthService.js";
import SheetService from "../services/SheetService.js";
import FormService from "../services/FormService.js";
import SidebarController from "../controllers/SidebarController.js";

const loginButton = document.getElementById("login");
const logoutButton = document.getElementById("logout");
const getTokenButton = document.getElementById("token");
const getSheetDataButton = document.getElementById("fetch");
const scanTabFormButton = document.getElementById("scan");
const showMappingUIButton = document.getElementById("show_mapping_ui");
const showMappingButton = document.getElementById("show_mapping");
const mappingDiv = document.getElementById("fields");
const formatSheetData = document.getElementById("format_sheet");
const testeButton = document.getElementById("teste")

const controller = new SidebarController({
  loginButton,
  logoutButton,
  getTokenButton,
  getSheetDataButton,
  scanTabFormButton,
  showMappingUIButton,
  showMappingButton,
  mappingDiv,
  formatSheetData,
  testeButton
});
controller.init();
