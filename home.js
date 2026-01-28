const API = "https://script.google.com/macros/s/AKfycbwnF8m8kH2Nleb4fqvVAE0hYKpRIze-x71EDJPvrJiRtCZlVUXCBwhqetgMaMZJcX3eOg/exec";

/* ================================
   HOME PAGE SCRIPT (FINAL & STABLE)
================================ */

/* ================================
   SESSION GUARD
================================ */
if (!localStorage.getItem("loggedIn")) {
  window.location.replace("index.html");
}

/* ================================
   FETCH INVENTORY
================================ */
function fetchData() {
  const loader = document.getElementById("loader");
  const table = document.getElementById("table");

  const towerEl = document.getElementById("tower");
  const fromEl = document.getElementById("from");
  const toEl = document.getElementById("to");

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
      from: Number(fromEl.value),
      to: Number(toEl.value)
    })
  })
    .then(res => res.json())
    .then(d => {
      loader.classList.add("hidden");

      if (!d.success || !Array.isArray(d.data) || d.data.length === 0) {
        table.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center">
              No matching available units found
            </td>
          </tr>`;
        return;
      }

      /* TABLE HEADER (PLC HIDDEN) */
      table.innerHTML = `
        <tr>
          <th>Floor</th>
          <th>Unit No</th>
          <th>Area</th>
          <th>Unit Type</th>
          <th style="display:none">Total PLC</th>
          <th>Action</th>
        </tr>`;

      d.data.forEach(r => {
        table.innerHTML += `
          <tr>
            <td>${r[4]}</td>
            <td>${r[0]}</td>
            <td>${r[6]}</td>
            <td>${r[7]}</td>
            <td style="display:none">${Number(r[r.length - 1]) || 0}</td>
            <td>
              <button onclick='openCosting(${JSON.stringify(r)})'>
                Costing
              </button>
            </td>
          </tr>`;
      });
    })
    .catch(err => {
      console.error("FETCH ERROR:", err);
      loader.classList.add("hidden");
      table.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center">
            Error loading data
          </td>
        </tr>`;
    });
}

/* ================================
   COSTING REDIRECT
================================ */
function openCosting(r) {
  localStorage.setItem(
    "costing",
    JSON.stringify({
      unit: r[0],
      area: Number(r[6]) || 0,
      plc: Number(r[r.length - 1]) || 0 // ✅ GUARANTEED PLC
    })
  );

  window.location.href = "costing.html";
}

/* ================================
   LOGOUT
================================ */
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

/* ================================
   DOM READY BINDINGS (CRITICAL)
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("searchBtn")
    .addEventListener("click", fetchData);

  document
    .getElementById("logoutBtn")
    .addEventListener("click", logout);

  // Floor range live update
  const fromEl = document.getElementById("from");
  const toEl = document.getElementById("to");
  const fVal = document.getElementById("fVal");
  const tVal = document.getElementById("tVal");

  fromEl.addEventListener("input", () => (fVal.innerText = fromEl.value));
  toEl.addEventListener("input", () => (tVal.innerText = toEl.value));
});
