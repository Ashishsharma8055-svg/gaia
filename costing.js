/* ================================
   COSTING PAGE SCRIPT (FINAL LOCKED UX)
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

  unitNo  = data.unit;
  area    = Number(data.area) || 0;
  plcRate = Number(data.plc) || 0;

  document.getElementById("unitNo").innerText = unitNo;
  document.getElementById("size").innerText  = area.toLocaleString();

  /* 🔒 HARD FORCE HIDE (DOM LEVEL) */
  const editBox = document.getElementById("editBox");
  if (editBox) {
    editBox.style.display = "none";
    editBox.classList.add("hidden");
  }

  calculateAll();
});

/* ================================
   CALCULATION
================================ */
function calculateAll(){

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

  calculateSchedule(subTotal, total);
}

/* ================================
   PAYMENT SCHEDULE
================================ */
function calculateSchedule(subTotal, total){

  set("booking", BOOKING_AMOUNT);

  const ten = subTotal * 0.10;
  const within30 = (ten + (ten * GST_RATE)) - BOOKING_AMOUNT;

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
   EDIT FLOW (MASKED PASSWORD)
================================ */
function editCosting(){
  showPasswordModal();
}

function applyEdit(){
  const r = Number(newRate.value);
  const p = Number(newPlc.value);

  if (r > 0) rate = r;
  if (p >= 0) plcRate = p;

  calculateAll();
  hideEditBox();
}

/* ================================
   EDIT BOX CONTROL
================================ */
function hideEditBox(){
  const box = document.getElementById("editBox");
  if (box) {
    box.style.display = "none";
    box.classList.add("hidden");
  }
}

function showEditBox(){
  const box = document.getElementById("editBox");
  if (box) {
    box.style.display = "flex";
    box.classList.remove("hidden");
  }
}

/* ================================
   MASKED PASSWORD MODAL (SECURE)
================================ */
function showPasswordModal(){

  if (document.getElementById("pwdOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "pwdOverlay";
  overlay.style = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,0.5);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:9999;
  `;

  overlay.innerHTML = `
    <div style="
      background:#fff;
      padding:20px;
      border-radius:10px;
      min-width:260px;
      text-align:center;
      box-shadow:0 10px 30px rgba(0,0,0,.3)
    ">
      <h3 style="margin:0 0 10px">Enter Password</h3>
      <input id="pwdInput" type="password"
        style="width:100%;padding:10px;margin-bottom:10px"
        placeholder="••••">
      <div style="display:flex;gap:10px;justify-content:center">
        <button onclick="validatePassword()">Submit</button>
        <button onclick="closePasswordModal()">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById("pwdInput").focus();
}

function validatePassword(){
  const val = document.getElementById("pwdInput").value;
  if (val !== EDIT_PASSWORD){
    alert("Invalid Password");
    return;
  }
  closePasswordModal();
  showEditBox();
}

function closePasswordModal(){
  const o = document.getElementById("pwdOverlay");
  if (o) o.remove();
}

/* ================================
   PDF / PRINT
================================ */
function beforeExport(){
  document.body.classList.add("pdf-mode");
}

function afterExport(){
  document.body.classList.remove("pdf-mode");
}

function printCosting(){
  beforeExport();
  window.print();
  setTimeout(afterExport, 800);
}

function downloadPDF(){

  beforeExport();

  const el = document.getElementById("costingSheet");

  const opt = {
    margin:0,
    filename:`Costing_${unitNo}.pdf`,
    image:{ type:"jpeg", quality:1 },
    html2canvas:{ scale:3, useCORS:true },
    jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" },
    pagebreak:{ mode:["avoid-all"] }
  };

  html2pdf().set(opt).from(el).save().then(afterExport);
}

/* ================================
   UTIL
================================ */
function set(id,val){
  document.getElementById(id).innerText =
    "₹ " + Math.round(val).toLocaleString();
}
