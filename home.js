const API = "https://script.google.com/macros/s/AKfycbwnF8m8kH2Nleb4fqvVAE0hYKpRIze-x71EDJPvrJiRtCZlVUXCBwhqetgMaMZJcX3eOg/exec";

/* ================================
   HOME PAGE SCRIPT (FINAL + SORTING)
================================ */

/* ================================
   SESSION GUARD
================================ */
if (!localStorage.getItem("loggedIn")) {
  window.location.replace("index.html");
}

/* ================================
   STATE
================================ */
let inventoryData = [];
let sortState = {
  column: null,
  asc: true
};

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

      inventoryData = d.data;
      sortState = { column: null, asc: true };

      renderTable(inventoryData);
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
   RENDER TABLE
================================ */
function renderTable(data) {
  const table = document.getElementById("table");

  table.innerHTML = `
    <tr>
      <th onclick="sortBy(4)">Floor ⬍</th>
      <th onclick="sortBy(0)">Unit No ⬍</th>
      <th onclick="sortBy(6)">Area ⬍</th>
      <th onclick="sortBy(7)">Unit Type ⬍</th>
      <th style="display:none">Total PLC</th>
      <th>Action</th>
    </tr>`;

  data.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r[4]}</td>
        <td>${r[0]}</td>
        <td>${r[6]}</td>
        <td>${r[7]}</td>

        <!-- Hidden PLC -->
        <td style="display:none">${Number(r[r.length - 1]) || 0}</td>

        <td>
          <button onclick='openCosting(${JSON.stringify(r)})'>
            Costing
          </button>
        </td>
      </tr>`;
  });
}

/* ================================
   SORT FUNCTION
================================ */
function sortBy(colIndex) {
  if (sortState.column === colIndex) {
    sortState.asc = !sortState.asc;
  } else {
    sortState.column = colIndex;
    sortState.asc = true;
  }

  inventoryData.sort((a, b) => {
    let v1 = a[colIndex];
    let v2 = b[colIndex];

    // numeric sort if possible
    const n1 = Number(v1);
    const n2 = Number(v2);

    if (!isNaN(n1) && !isNaN(n2)) {
      return sortState.asc ? n1 - n2 : n2 - n1;
    }

    // string sort
    v1 = String(v1).toLowerCase();
    v2 = String(v2).toLowerCase();

    if (v1 < v2) return sortState.asc ? -1 : 1;
    if (v1 > v2) return sortState.asc ? 1 : -1;
    return 0;
  });

  renderTable(inventoryData);
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
      plc: Number(r[r.length - 1]) || 0
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
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("searchBtn")
    .addEventListener("click", fetchData);

  document.getElementById("logoutBtn")
    .addEventListener("click", logout);

  const fromEl = document.getElementById("from");
  const toEl = document.getElementById("to");
  const fVal = document.getElementById("fVal");
  const tVal = document.getElementById("tVal");

  fromEl.addEventListener("input", () => (fVal.innerText = fromEl.value));
  toEl.addEventListener("input", () => (tVal.innerText = toEl.value));
});
