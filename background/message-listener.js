chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request.action);

  if (request.action === "getAuthToken") {
    getAuthToken()
      .then((res) => sendResponse({ error: null, token: res }))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }

  if (request.action === "revokeAuthToken") {
    revokeAuthToken()
      .then((res) => sendResponse({ error: null, message: res }))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }

  if (request.action === "fetchSheetData") {
    fetchSheetData(request.token, request.url)
      .then(res => sendResponse({ error: null, data: res }))
      .catch(err => sendResponse({ error: String(err) }))
    return true;
  }
});

function getAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      }

      resolve(token);
    });
  });
}

function revokeAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        reject(chrome.runtime.lastError.message);
        return;
      }

      await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);

      chrome.identity.removeCachedAuthToken({ token }, () => {
        resolve("User successfully logged out!");
      });
    });
  });
}

function fetchSheetData(token, url) {
  return new Promise((resolve, reject) => {
    let response = fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    response
      .then(res => res.json())
      .then(json => {
        if (json.error) reject(json.error.code + ": " + json.error.message);
        resolve(json);
      })
  });
}
