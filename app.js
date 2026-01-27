/* ================================
   CONFIG
================================ */
const API = "https://script.google.com/macros/s/AKfycbypriTeEPQ10mDXTAfXxiFb6RziM5h2WQemN1P1yAQOdcVykHhO2Dz_G_9f1odIswlH/exec";

/* ================================
   LOGIN (GET – STABLE)
================================ */
function login() {
  const userEl = document.getElementById("user");
  const passEl = document.getElementById("pass");
  const msgEl  = document.getElementById("msg");

  if (!userEl || !passEl || !msgEl) {
    alert("Login elements not found on page");
    return;
  }

  const username = userEl.value.trim();
  const password = passEl.value.trim();

  if (!username || !password) {
    msgEl.innerText = "Please enter username and password";
    return;
  }

  msgEl.innerText = "Checking...";

  const url =
    API +
    "?action=login" +
    "&username=" + encodeURIComponent(username) +
    "&password=" + encodeURIComponent(password);

  fetch(url)
    .then(res => res.text())   // read raw first (safer)
    .then(txt => {
      console.log("LOGIN RAW RESPONSE:", txt);
      const data = JSON.parse(txt);

      if (data.success) {
        window.location.href = "home.html";
      } else {
        msgEl.innerText = "Invalid username or password";
      }
    })
    .catch(err => {
      console.error("LOGIN ERROR:", err);
      msgEl.innerText = "Server Error. Check console.";
    });
}

/* ================================
   FETCH INVENTORY
================================ */
function fetchData() {
  const loader = document.getElementById("loader");
  const table  = document.getElementById("table");

  const towerEl = document.getElementById("tower");
  const fromEl  = document.getElementById("from");
  const toEl    = document.getElementById("to");

  if (!loader || !table || !towerEl || !fromEl || !toEl) {
    alert("Home page elements not found");
    return;
  }

  loader.classList.remove("hidden");
  table.innerHTML = "";

  const units = Array.from(
    document.querySelectorAll(".unitChk:checked")
  ).map(u => u.value);

  fetch(API + "?action=fetch", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tower: towerEl.value || "",
      units: units,
      from: fromEl.value ? Number(fromEl.value) : null,
      to: toEl.value ? Number(toEl.value) : null
    })
  })
  .then(res => res.text())   // raw first for safety
  .then(txt => {
    console.log("FETCH RAW RESPONSE:", txt);
    const d = JSON.parse(txt);

    loader.classList.add("hidden");

    if (!d.success || !Array.isArray(d.data) || d.data.length === 0) {
      table.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center">
            No matching available units found
          </td>
        </tr>`;
      return;
    }

    table.innerHTML = `
      <tr>
        <th>Floor</th>
    <th>Unit No</th>
    <th>Area</th>
    <th>Unit Type</th>
    <th>Action</th>
      </tr>`;

    let html = "";
    d.data.forEach(r => {
      html += `
        <tr>
         <td>${r[4]}</td>   <!-- Floor -->
      <td>${r[0]}</td>   <!-- Unit No -->
      <td>${r[6]}</td>   <!-- Saleable Area -->
      <td>${r[7]}</td>   <!-- Unit Type -->
      <td>
        <button onclick='cost(${JSON.stringify(r)})'>
          Costing
        </button>
          </td>
        </tr>`;
    });

    table.innerHTML += html;
  })
  .catch(err => {
    loader.classList.add("hidden");
    console.error("FETCH ERROR:", err);
    table.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">
          Error loading data
        </td>
      </tr>`;
  });
}

/* ================================
   COSTING
================================ */
function cost(r) {
  localStorage.setItem("costing", JSON.stringify({
    unit: r[0],
    area: r[6],
    plc: r[13]
  }));
  window.location.href = "costing.html";
}

/* ================================
   LOGOUT
================================ */
function logout() {
  window.location.href = "index.html";
}

/* ================================
   DOM READY BINDINGS
================================ */
document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", fetchData);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Floor range live update
  const fromEl = document.getElementById("from");
  const toEl = document.getElementById("to");
  const fVal = document.getElementById("fVal");
  const tVal = document.getElementById("tVal");

  if (fromEl && fVal) {
    fromEl.addEventListener("input", () => fVal.innerText = fromEl.value);
  }
  if (toEl && tVal) {
    toEl.addEventListener("input", () => tVal.innerText = toEl.value);
  }

});