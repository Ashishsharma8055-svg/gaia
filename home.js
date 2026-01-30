const API =
  "https://script.google.com/macros/s/AKfycbxck_curiwztnaMrGdsWpks9wx1ViwNztcYAG6r68ZS_8cKOOgpVF6iN5dIeCr8B6VLSw/exec";

if (!localStorage.getItem("loggedIn")) {
  window.location.replace("index.html");
}

/* ================================
   STATE
================================ */
let inventoryData = [];
let filteredData = [];
let sortState = { col: null, asc: true };

/* ================================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ELEMENTS */
  const loader = document.getElementById("loader");
  const table = document.getElementById("table");
  const tower = document.getElementById("tower");
  const minFloor = document.getElementById("minFloor");
  const maxFloor = document.getElementById("maxFloor");
  const minVal = document.getElementById("minVal");
  const maxVal = document.getElementById("maxVal");
  const unitSearch = document.getElementById("unitSearch");
  const searchBtn = document.getElementById("searchBtn");
  const pwdModal = document.getElementById("pwdModal");

 /* userName.innerText = localStorage.getItem("username");*/
  userName.innerText = (localStorage.getItem("username") || "").toUpperCase();

  /* ================================
     UNIT PILLS (FIXED)
  ================================ */
  document.querySelectorAll(".unit-pills label").forEach(label => {
    const chk = label.querySelector("input");
    label.addEventListener("click", e => {
      e.preventDefault();
      chk.checked = !chk.checked;
      label.classList.toggle("active", chk.checked);
    });
  });

  /* ================================
     FLOOR RANGE
  ================================ */
  function updateRange() {
    if (+minFloor.value > +maxFloor.value)
      minFloor.value = maxFloor.value;

    if (+maxFloor.value < +minFloor.value)
      maxFloor.value = minFloor.value;

    minVal.innerText = minFloor.value;
    maxVal.innerText = maxFloor.value;
  }

  minFloor.addEventListener("input", updateRange);
  maxFloor.addEventListener("input", updateRange);
  updateRange();

  /* ================================
     SEARCH
  ================================ */
  searchBtn.addEventListener("click", fetchData);

  unitSearch.addEventListener("input", () => {
    filteredData = inventoryData.filter(r =>
      String(r[0]).toLowerCase().includes(unitSearch.value.toLowerCase())
    );
    renderTable(filteredData);
  });

  /* ================================
     PASSWORD MODAL
  ================================ */
  window.openPasswordModal = () => pwdModal.classList.remove("hidden");
  window.closePasswordModal = () => pwdModal.classList.add("hidden");

  window.submitPasswordChange = () => {
    fetch(API + "?action=changePassword", {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        username: localStorage.getItem("username"),
        oldPassword: oldPwd.value,
        newPassword: newPwd.value
      })
    })
    .then(r => r.json())
    .then(d => {
      alert(d.success ? "Password updated successfully" : d.message);
      if (d.success) closePasswordModal();
    });
  };

  window.logout = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };
});

/* ================================
   FETCH INVENTORY
================================ */
function fetchData() {

  loader.classList.remove("hidden");
  table.innerHTML = "";

  const units =
    [...document.querySelectorAll(".unitChk:checked")].map(x => x.value);

  fetch(API + "?action=fetch", {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      tower: tower.value || "",
      units: units,
      from: Number(minFloor.value),
      to: Number(maxFloor.value)
    })
  })
  .then(r => r.json())
  .then(d => {

    loader.classList.add("hidden");

    if (!d.success) {
      showMessage("⚠️ Error loading data. Please retry.");
      return;
    }

    if (!Array.isArray(d.data) || d.data.length === 0) {
      showMessage("No data available for selected filters.");
      return;
    }

    inventoryData = d.data;
    filteredData = d.data;
    renderTable(filteredData);
  })
  .catch(err => {
    console.error(err);
    loader.classList.add("hidden");
    showMessage("⚠️ Server error. Please refresh.");
  });
}

/* ================================
   TABLE + SORTING
================================ */
function renderTable(data) {

  table.innerHTML = `
    <tr>
      <th onclick="sortBy(4)">Floor ⬍</th>
      <th onclick="sortBy(0)">Unit ⬍</th>
      <th onclick="sortBy(6)">Area ⬍</th>
      <th onclick="sortBy(7)">Type ⬍</th>
      <th>Action</th>
    </tr>
  `;

  data.forEach(r => {
    table.innerHTML += `
      <tr>
        <td>${r[4]}</td>
        <td>${r[0]}</td>
        <td>${r[6]}</td>
        <td>${r[7]}</td>
        <td>
          <button onclick='openCosting(${JSON.stringify(r)})'>
            Costing
          </button>
        </td>
      </tr>
    `;
  });
}

function sortBy(col) {
  sortState.asc = sortState.col === col ? !sortState.asc : true;
  sortState.col = col;

  filteredData.sort((a, b) => {
    const x = a[col], y = b[col];
    const nx = Number(x), ny = Number(y);

    if (!isNaN(nx) && !isNaN(ny))
      return sortState.asc ? nx - ny : ny - nx;

    return sortState.asc
      ? String(x).localeCompare(String(y))
      : String(y).localeCompare(String(x));
  });

  renderTable(filteredData);
}

/* ================================
   MESSAGE
================================ */
function showMessage(msg) {
  table.innerHTML = `
    <tr>
      <td colspan="5" style="
        padding:24px;
        text-align:center;
        font-weight:500;
        color:#6b7280;
      ">
        ${msg}
      </td>
    </tr>
  `;
}

/* ================================
   COSTING REDIRECT
================================ */
function openCosting(r) {
  localStorage.setItem("costing", JSON.stringify({
    unit: r[0],
    area: Number(r[6]) || 0,
    plc: Number(r[r.length - 1]) || 0
  }));
  window.location.href = "costing.html";
}
