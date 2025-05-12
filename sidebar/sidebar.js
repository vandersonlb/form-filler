
document.addEventListener("DOMContentLoaded", () => {
  const statusMessages = document.getElementById("status");
  const loginButton = document.getElementById("login");
  const logoutButton = document.getElementById("logout");

  let currentToken = null;

  function showStatus(message, isError = false) {
    statusMessages.textContent = message;
    // statusMessages.className = isError ? "red-text" : "green-text";
    setTimeout(() => statusMessages.textContent = "", 5000);
  }

  loginButton.addEventListener("click", () => {
    showStatus("Clicado no botão de login");
    login();
  });

  logoutButton.addEventListener("click", () => {
    showStatus("Clicado no botão de logout");
    logout();
  });

  function login() {
    chrome.runtime.sendMessage({ action: "getAuthToken" }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus("Runtime error in login(): " + chrome.runtime.lastError.message, true);
        return;
      }
      if (response) {
        currentToken = response;
        showStatus(currentToken);
        // showStatus("Autenticado com sucesso.", false);
      } else {
        showStatus(response && response.error ? "Falha na autenticação: " + response.error.message : "Necessária autenticação.", true);
      }
    });
  }

  function logout() {
    chrome.runtime.sendMessage({ action: "revokeAuthToken" }, (response) => {
      if (chrome.runtime.lastError) {
        showStatus("Runtime error in logout(): " + chrome.runtime.lastError.message, true);
        return;
      }
    });
  }


  /***************************************************** */

  async function fetchSheetData(spreadsheetId, range) {
    if (!currentToken) {
      showStatus("Não autenticado. Por favor, autentique-se primeiro.", true);
      return null;
    }
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    try {
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao buscar dados da folha: ${response.status} ${response.statusText}. Detalhes: ${errorData.error.message}`);
      }
      const data = await response.json();
      return data.values;
    } catch (error) {
      showStatus(`Erro ao carregar dados da folha: ${error.message}`, true);
      console.error("Erro ao buscar dados da folha:", error);
      if (error.message.includes("401") || error.message.includes("403")) {

        showStatus(error);
        
        // showStatus("Sessão expirada ou token inválido. Tente autenticar novamente.", true);
        // logout();

        // chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
            // currentToken = null;
            // checkAuthStatus(); // Re-check auth, will show auth button
        // });
      }
      return null;
    }
  }

  document.getElementById("teste").addEventListener("click", async () => {

    showStatus("Clicado");

    var spreadsheetId = "1spgtksmmLXk8ZZXPPqCv1JmOBCqCfZPfeAil3dHf-xM";
    const rawData = await fetchSheetData(spreadsheetId, "A1:Z");
    showStatus(rawData);

  })
});
