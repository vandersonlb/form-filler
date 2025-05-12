const statusMessages = document.getElementById("status");

export function showStatus(message, isError = false) {
  statusMessages.style.display = "block";

  let error = "status-messages--error";
  let success = "status-messages--success";
  let mode = isError ? error : success;

  statusMessages.classList.remove(error, success);
  statusMessages.classList.add(mode);

  statusMessages.textContent = message;
  setTimeout(() => (statusMessages.style.display = "none"), 2500);
}
