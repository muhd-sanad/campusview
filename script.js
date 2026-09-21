const STORAGE_KEY = "campusVoiceFeedbacks";
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";
let selectedRating = 0;
let selectedImage = "";

function getFeedbacks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}
function saveFeedbacks(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo(0,0);
  if (id === "adminPage") refreshAdmin();
}
function scrollToSection(id) {
  showPage("homePage");
  setTimeout(() => document.getElementById(id)?.scrollIntoView({behavior:"smooth"}), 50);
}
function showToast(message, type="success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast show " + type;
  setTimeout(() => toast.className = "toast", 2800);
}

document.addEventListener("DOMContentLoaded", () => {
  seedDemoData();
  updateHomeStats();

  document.getElementById("ratingPicker").addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    selectedRating = Number(btn.dataset.rating);
    document.getElementById("rating").value = selectedRating;
    document.querySelectorAll("#ratingPicker button").forEach((b,i) => b.classList.toggle("selected", i < selectedRating));
  });

  document.getElementById("message").addEventListener("input", e => {
    document.getElementById("charCount").textContent = e.target.value.length;
  });

  document.getElementById("imageInput").addEventListener("change", handleImage);

  document.getElementById("feedbackForm").addEventListener("submit", submitFeedback);
  document.getElementById("loginForm").addEventListener("submit", login);

  const savedTheme = localStorage.getItem("cvTheme");
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
});

function seedDemoData() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  const now = new Date();
  const demo = [
    {id:crypto.randomUUID(),name:"Afsana",studentClass:"Plus Two Commerce",category:"Academics",rating:5,message:"The new classroom facilities are really useful. The learning environment has improved a lot.",image:"",date:now.toISOString()},
    {id:crypto.randomUUID(),name:"Rahul",studentClass:"Class 11 Science",category:"Teaching",rating:4,message:"Teachers explain concepts clearly. More practical activities would be helpful.",image:"",date:new Date(now-86400000).toISOString()},
    {id:crypto.randomUUID(),name:"Fathima",studentClass:"Plus One Humanities",category:"Events",rating:5,message:"The recent college programme was well organised and enjoyable.",image:"",date:new Date(now-172800000).toISOString()},
    {id:crypto.randomUUID(),name:"Arjun",studentClass:"Class 12",category:"Facilities",rating:3,message:"The library is useful, but adding more updated reference books would be great.",image:"",date:new Date(now-259200000).toISOString()}
  ];
  saveFeedbacks(demo);
}

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) {
    showToast("Please select a JPG, PNG or WEBP image.", "error");
    e.target.value = ""; return;
  }
  if (file.size > 2 * 1024 * 1024) {
    showToast("Image must be smaller than 2 MB.", "error");
    e.target.value = ""; return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    selectedImage = reader.result;
    document.getElementById("imagePreview").src = selectedImage;
    document.getElementById("imagePreviewWrap").classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}
function removeImage() {
  selectedImage = "";
  document.getElementById("imageInput").value = "";
  document.getElementById("imagePreviewWrap").classList.add("hidden");
}

function submitFeedback(e) {
  e.preventDefault();
  if (selectedRating < 1) {
    showToast("Please select a rating.", "error"); return;
  }
  const item = {
    id: crypto.randomUUID(),
    name: document.getElementById("studentName").value.trim(),
    studentClass: document.getElementById("studentClass").value.trim(),
    category: document.getElementById("category").value,
    rating: selectedRating,
    message: document.getElementById("message").value.trim(),
    image: selectedImage,
    date: new Date().toISOString()
  };
  const data = getFeedbacks();
  data.unshift(item);
  saveFeedbacks(data);
  updateHomeStats();
  document.getElementById("feedbackForm").reset();
  selectedRating = 0; selectedImage = "";
  document.querySelectorAll("#ratingPicker button").forEach(b => b.classList.remove("selected"));
  document.getElementById("charCount").textContent = "0";
  document.getElementById("imagePreviewWrap").classList.add("hidden");
  showToast("Feedback submitted successfully! Thank you.");
  setTimeout(() => showPage("homePage"), 700);
}

function login(e) {
  e.preventDefault();
  const user = document.getElementById("adminUsername").value.trim();
  const pass = document.getElementById("adminPassword").value;
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    document.getElementById("loginError").classList.add("hidden");
    e.target.reset();
    showPage("adminPage");
  } else {
    document.getElementById("loginError").classList.remove("hidden");
  }
}
function togglePassword() {
  const input = document.getElementById("adminPassword");
  input.type = input.type === "password" ? "text" : "password";
}
function logout() { showPage("homePage"); showToast("Logged out successfully."); }

function refreshAdmin() {
  const data = getFeedbacks();
  const today = new Date().toDateString();
  const todayCount = data.filter(x => new Date(x.date).toDateString() === today).length;
  const avg = data.length ? (data.reduce((a,b)=>a+b.rating,0)/data.length) : 0;
  const positive = data.length ? Math.round(data.filter(x=>x.rating>=4).length/data.length*100) : 0;

  document.getElementById("metricTotal").textContent = data.length;
  document.getElementById("metricToday").textContent = todayCount;
  document.getElementById("metricRating").textContent = avg.toFixed(1);
  document.getElementById("metricPositive").textContent = positive + "%";
  document.getElementById("sideCount").textContent = data.length;
  document.getElementById("homeTotal").textContent = data.length;
  document.getElementById("homePositive").textContent = positive + "%";

  renderRecent(data);
  renderCategoryCharts(data);
  renderFeedbacks();
  renderRatingChart(data);
}
function updateHomeStats() {
  const data = getFeedbacks();
  const positive = data.length ? Math.round(data.filter(x=>x.rating>=4).length/data.length*100) : 0;
  document.getElementById("homeTotal").textContent = data.length;
  document.getElementById("homePositive").textContent = positive + "%";
}

function initials(name) {
  return name.split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
}
function stars(n) { return "★".repeat(n) + "☆".repeat(5-n); }
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function renderRecent(data) {
  const box = document.getElementById("recentFeedback");
  if (!data.length) { box.innerHTML = `<div class="empty-state">No feedback yet.</div>`; return; }
  box.innerHTML = data.slice(0,5).map(x => `
    <div class="recent-item">
      <div class="recent-avatar">${initials(x.name)}</div>
      <div class="recent-main"><strong>${escapeHTML(x.name)}</strong><p>${escapeHTML(x.message)}</p></div>
      <span class="recent-rating">${stars(x.rating)}</span>
    </div>`).join("");
}

function categoryCounts(data) {
  const counts = {};
  data.forEach(x => counts[x.category] = (counts[x.category]||0)+1);
  return counts;
}
function renderCategoryCharts(data) {
  const counts = categoryCounts(data);
  const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
  const total = data.length || 1;
  const html = entries.length ? entries.map(([cat,count]) => `
    <div class="category-row"><div class="cat-head"><span>${escapeHTML(cat)}</span><strong>${count}</strong></div>
    <div class="progress"><i style="width:${Math.round(count/total*100)}%"></i></div></div>`).join("")
    : `<div class="empty-state">No category data yet.</div>`;
  document.getElementById("categoryChart").innerHTML = html;
  document.getElementById("analyticsCategories").innerHTML = html;
}
function renderRatingChart(data) {
  const total = data.length || 1;
  document.getElementById("ratingChart").innerHTML = [5,4,3,2,1].map(r => {
    const count = data.filter(x=>x.rating===r).length;
    return `<div class="rating-row"><span>${r} star</span><div class="rating-bar"><i style="width:${Math.round(count/total*100)}%"></i></div><span class="rating-num">${count}</span></div>`;
  }).join("");
}

function renderFeedbacks() {
  const data = getFeedbacks();
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const cat = document.getElementById("filterCategory")?.value || "All";
  const rating = document.getElementById("filterRating")?.value || "All";
  const filtered = data.filter(x => {
    const hay = `${x.name} ${x.studentClass} ${x.message} ${x.category}`.toLowerCase();
    return (!search || hay.includes(search)) && (cat==="All" || x.category===cat) && (rating==="All" || String(x.rating)===rating);
  });
  const box = document.getElementById("feedbackList");
  if (!filtered.length) {
    box.innerHTML = `<div class="empty-state"><strong>No feedback found</strong>Try changing your search or filter.</div>`;
    return;
  }
  box.innerHTML = filtered.map(x => `
    <article class="feedback-card">
      <div class="feedback-card-top">
        <div class="avatar">${initials(x.name)}</div>
        <div><strong>${escapeHTML(x.name)}</strong><small>${escapeHTML(x.studentClass)} · ${formatDate(x.date)}</small></div>
        <span class="card-category">${escapeHTML(x.category)}</span>
      </div>
      <div class="card-stars">${stars(x.rating)}</div>
      <p>${escapeHTML(x.message)}</p>
      ${x.image ? `<img class="feedback-image" src="${x.image}" alt="Feedback attachment">` : ""}
      <div class="card-actions">
        <button onclick="viewFeedback('${x.id}')">👁 View</button>
        <button onclick="editFeedback('${x.id}')">✎ Edit</button>
        <button class="delete" onclick="deleteFeedback('${x.id}')">🗑 Delete</button>
      </div>
    </article>`).join("");
}

function viewFeedback(id) {
  const x = getFeedbacks().find(a=>a.id===id); if(!x) return;
  document.getElementById("modalContent").innerHTML = `
    <div class="section-label">FEEDBACK DETAILS</div><h2>${escapeHTML(x.name)}</h2>
    <div class="modal-meta">${escapeHTML(x.studentClass)} · ${escapeHTML(x.category)} · ${formatDate(x.date)}</div>
    <div class="big-stars">${stars(x.rating)}</div><div class="modal-message">${escapeHTML(x.message)}</div>
    ${x.image ? `<img src="${x.image}" alt="Attached image">` : ""}`;
  document.getElementById("viewModal").classList.remove("hidden");
}
function closeModal(){ document.getElementById("viewModal").classList.add("hidden"); }

function editFeedback(id) {
  const data = getFeedbacks();
  const x = data.find(a=>a.id===id); if(!x) return;
  const newMessage = prompt("Edit feedback message:", x.message);
  if (newMessage === null) return;
  const trimmed = newMessage.trim();
  if (!trimmed) { showToast("Message cannot be empty.", "error"); return; }
  x.message = trimmed;
  saveFeedbacks(data);
  refreshAdmin();
  showToast("Feedback updated.");
}
function deleteFeedback(id) {
  const x = getFeedbacks().find(a=>a.id===id); if(!x) return;
  if (!confirm(`Delete feedback from ${x.name}?`)) return;
  saveFeedbacks(getFeedbacks().filter(a=>a.id!==id));
  refreshAdmin();
  showToast("Feedback deleted.");
}
function exportFeedback() {
  const blob = new Blob([JSON.stringify(getFeedbacks(),null,2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="campus-voice-feedback.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Feedback exported as JSON.");
}
function switchAdminTab(id, button) {
  document.querySelectorAll(".admin-tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".side-nav button").forEach(b=>b.classList.remove("active"));
  if(button) button.classList.add("active");
  const titles = {dashboardTab:"Dashboard",feedbackTab:"Feedback",analyticsTab:"Analytics"};
  document.getElementById("adminTitle").textContent = titles[id];
  if (id==="feedbackTab") renderFeedbacks();
  if (id==="analyticsTab") { renderCategoryCharts(getFeedbacks()); renderRatingChart(getFeedbacks()); }
  document.getElementById("sidebar").classList.remove("open");
}
function toggleSidebar(){ document.getElementById("sidebar").classList.toggle("open"); }
function toggleTheme(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("cvTheme", document.body.classList.contains("dark-mode") ? "dark":"light");
}
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
}
