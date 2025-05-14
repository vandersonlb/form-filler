export default class UIController {
  static showStatus(message, isError = false, targetId = "status") {
    const el = document.getElementById(targetId);
    if (!el) return;

    el.style.display = "block";

    const error = "status-messages--error";
    const success = "status-messages--success";
    const mode = isError ? error : success;

    el.classList.remove(error, success);
    el.classList.add(mode);
    el.textContent = message;
    setTimeout(() => (el.style.display = "none"), 3500);
  }
}
