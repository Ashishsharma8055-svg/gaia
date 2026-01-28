/* ================================
   COSTING PAGE SCRIPT
================================ */

// CONSTANTS
const BASE_RATE_DEFAULT = 20200;   // ₹ per sqft
const GST_RATE = 0.05;
const BOOKING_AMOUNT = 2100000;   // ₹21,00,000
const EDIT_PASSWORD = "112";

// STATE
let rate = BASE_RATE_DEFAULT;
let plcRate = 0;
let area = 0;
let unitNo = "";

/* ================================
   INIT
================================ */
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("costing");
  if (!saved) {
    alert("No costing data found");
    return;
  }

  const data = JSON.parse(saved);

  unitNo = data.unit;
  area = Number(data.area || 0);

  // Set static values
  document.getElementById("unitNo").innerText = unitNo;
  document.getElementById("size").innerText = area.toLocaleString();

  // 🔥 FETCH PLC LIVE FROM GOOGLE SHEET
  fetchPLCFromSheet(unitNo);
});

/* ================================
   FETCH PLC FROM GOOGLE SHEET
================================ */
function fetchPLCFromSheet(unitNo) {
  fetch(API + "?action=getPLC&unit=" + encodeURIComponent(unitNo))
    .then(res => res.text())
    .then(txt => {
      console.log("PLC RAW RESPONSE:", txt);
      const d = JSON.parse(txt);

      if (d.success) {
        plcRate = Number(d.plc || 0);
      } else {
        plcRate = 0;
      }

      calculate(); // calculate AFTER PLC arrives
    })
    .catch(err => {
      console.error("PLC FETCH ERROR:", err);
      plcRate = 0;
      calculate();
    });
}

/* ================================
   MAIN CALCULATION
================================ */
function calculate() {
  const rateValue = rate * area;
  const plcValue  = plcRate * area;
  const subTotal  = rateValue + plcValue;
  const gst       = subTotal * GST_RATE;
  const total     = subTotal + gst;

  // Rate section
  set("rateSqft", rate);
  set("rateValue", rateValue);

  set("plcSqft", plcRate);
  set("plcValue", plcValue);

  set("gstValue", gst);
  set("grandTotal", total);

  // Payment schedule
  calculateSchedule(total);
}

/* ================================
   PAYMENT SCHEDULE
================================ */
function calculateSchedule(total) {

  set("booking", BOOKING_AMOUNT);

  // Within 30 Days
  const within30 = (total * 0.10) - BOOKING_AMOUNT;
  set("within30", within30);

  set("within60", total * 0.10);
  set("days120",  total * 0.10);
  set("slab10",   total * 0.10);
  set("superStr", total * 0.20);
  set("appOC",    total * 0.25);
  set("recOC",    total * 0.10);
  set("possession", total * 0.05);
  set("finalTotal", total);
}

/* ================================
   EDIT FLOW
================================ */
function editCosting() {
  const pass = prompt("Enter password");
  if (pass !== EDIT_PASSWORD) {
    alert("Access Denied");
    return;
  }
  document.getElementById("editBox").classList.remove("hidden");
}

function applyEdit() {
  const newRate = Number(document.getElementById("newRate").value);
  const newPlc  = Number(document.getElementById("newPlc").value);

  if (newRate > 0) rate = newRate;
  if (newPlc >= 0) plcRate = newPlc;

  document.getElementById("editBox").classList.add("hidden");
  calculate();
}

/* ================================
   PRINT / DOWNLOAD SAFETY
================================ */
function beforeExport() {
  document.getElementById("editBox").classList.add("hidden");
}

function printCosting() {
  beforeExport();
  window.print();
}

/* ================================
   UTIL
================================ */
function set(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = "₹ " + Math.round(value).toLocaleString();
}
