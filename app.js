/* ================================
   CONFIG
================================ */
const API = "https://script.google.com/macros/s/AKfycbxck_curiwztnaMrGdsWpks9wx1ViwNztcYAG6r68ZS_8cKOOgpVF6iN5dIeCr8B6VLSw/exec";

/* ================================
   LOGIN FUNCTION
================================ */
function login() {
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const msgEl  = document.getElementById("msg");

  if (!userEl || !passEl || !msgEl) {
    alert("Login elements not found");
    return;
  }

  const username = userEl.value.trim();
  const password = passEl.value.trim();

  if (!username || !password) {
    msgEl.innerText = "Please enter username and password";
    return;
  }

  msgEl.innerText = "Checking...";

  fetch(
    API +
      "?action=login" +
      "&username=" + encodeURIComponent(username) +
      "&password=" + encodeURIComponent(password)
  )
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        /* ✅ REQUIRED UPDATE (ONLY THIS PART ADDED) */
        localStorage.setItem("username", username);
        localStorage.setItem("loggedIn", "true");

        window.location.href = "home.html";
      } else {
        msgEl.innerText = "Invalid username or password";
      }
    })
    .catch(err => {
      console.error("LOGIN ERROR:", err);
      msgEl.innerText = "Server error. Try again.";
    });
}

/* ================================
   DOM READY BINDING (IMPORTANT)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }
});
