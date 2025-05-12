chrome.runtime.onInstalled.addListener(() => {
  console.log("Form Filler from Sheets extension installed.");

  chrome.contextMenus.create({
    id: "openSidePanel",
    title: chrome.i18n.getMessage("cxt_menu_title"),
    contexts: ["all"],
  });
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.log("Error setting side panel behavior:", error));
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openSidePanel") {
    if (tab && tab.id) {
      chrome.sidePanel.open({ tabId: tab.id });
    }
  }
});
