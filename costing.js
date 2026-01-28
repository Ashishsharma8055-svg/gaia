/* ================================
   COSTING PAGE SCRIPT (FINAL UX)
================================ */

if (!localStorage.getItem("loggedIn")) {
  window.location.replace("index.html");
}

/* CONSTANTS */
const BASE_RATE_DEFAULT = 20200;
const GST_RATE = 0.05;
const BOOKING_AMOUNT = 2100000;
const EDIT_PASSWORD = "112";

/* STATE */
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
    alert("Costing data not found. Please open from Home page.");
    return;
  }

  const data = JSON.parse(saved);

  unitNo = data.unit;
  area = Number(data.area) || 0;
  plcRate = Number(data.plc) || 0;

  document.getElementById("unitNo").innerText = unitNo;
  document.getElementById("size").innerText = area.toLocaleString();

  // 🔒 HIDE EDIT BOX ON LOAD
  hideEditBox();

  calculateAll();
});

/* ================================
   MASTER CALCULATION
================================ */
function calculateAll() {

  const baseValue = rate * area;
  const plcValue  = plcRate * area;
  const subTotal  = baseValue + plcValue;
  const gstValue  = subTotal * GST_RATE;
  const total     = subTotal + gstValue;

  set("rateSqft", rate);
  set("rateValue", baseValue);

  set("plcSqft", plcRate);
  set("plcValue", plcValue);

  set("gstValue", gstValue);
  set("grandTotal", total);

  calculateSchedule(subTotal, gstValue, total);
}

/* ================================
   PAYMENT SCHEDULE
================================ */
function calculateSchedule(subTotal, gst, total) {

  set("booking", BOOKING_AMOUNT);

  const tenPercent = subTotal * 0.10;
  const within30 = (tenPercent + (tenPercent * GST_RATE)) - BOOKING_AMOUNT;

  set("within30", within30);
  set("within60", total * 0.10);
  set("days120", total * 0.10);
  set("slab10", total * 0.10);
  set("superStr", total * 0.20);
  set("appOC", total * 0.25);
  set("recOC", total * 0.10);
  set("possession", total * 0.05);
  set("finalTotal", total);
}

/* ================================
   EDIT FLOW (FIXED UX)
================================ */
function editCosting() {
  const pwd = prompt("Enter Password");
  if (pwd !== EDIT_PASSWORD) {
    alert("Access Denied");
    return;
  }
  showEditBox();
}

function applyEdit() {
  const newRate = Number(document.getElementById("newRate").value);
  const newPlc  = Number(document.getElementById("newPlc").value);

  if (newRate > 0) rate = newRate;
  if (newPlc >= 0) plcRate = newPlc;

  calculateAll();
  hideEditBox(); // 🔒 AUTO-HIDE AFTER APPLY
}

/* ================================
   EDIT BOX VISIBILITY
================================ */
function hideEditBox() {
  const box = document.getElementById("editBox");
  if (box) box.classList.add("hidden");
}

function showEditBox() {
  const box = document.getElementById("editBox");
  if (box) box.classList.remove("hidden");
}

/* ================================
   PRINT / PDF SAFETY
================================ */
function beforeExport() {
  document.querySelector(".actions").style.display = "none";
  hideEditBox();
}

function afterExport() {
  document.querySelector(".actions").style.display = "flex";
}

function printCosting() {
  beforeExport();
  window.print();
  setTimeout(afterExport, 500);
}

/* ================================
   UTIL
================================ */
function set(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = "₹ " + Math.round(value).toLocaleString();
}
