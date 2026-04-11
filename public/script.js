// --- redirect to login if not logged in ---
if (!localStorage.getItem("loggedIn")) {
  window.location.href = "/login.html";
}

// --- logout function ---
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "/login.html";
}

const API = "http://localhost:3000/memories";
const preview = document.getElementById("preview");
const imageInput = document.getElementById("image");

// --- Image preview ---
imageInput.addEventListener("change", function() {
  const file = this.files[0];
  if (file) {
    preview.style.display = "block";
    preview.src = URL.createObjectURL(file);
  }
});

// --- Load memories ---
async function loadMemories() {
  const res = await fetch(API);
  const memories = await res.json();
  const timeline = document.getElementById("timeline");
  timeline.innerHTML = "";

  memories.forEach(m => {
    const div = document.createElement("div");
    div.classList.add("memory");
    div.innerHTML = `
      <h3>${m.title}</h3>
    ${m.image ? `<img src="http://localhost:3000${m.image}" width="200">` : ""}
      <p>${m.description}</p>
      <small>${m.date}</small>
      <br>
      <button onclick="editMemory(${m.id}, '${m.title}', '${m.description}', '${m.date}')">Edit</button>
      <button onclick="deleteMemory(${m.id})">Delete</button>
    `;
    timeline.appendChild(div);
  });
}

// --- Add memory ---
async function addMemory() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const date = document.getElementById("date").value;
  const imageFile = imageInput.files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("date", date);
  if (imageFile) formData.append("image", imageFile);

  await fetch(API, { method: "POST", body: formData });

  confetti({
    particleCount: 150,
    spread: 90,
    origin: { y: 0.6 },
    shapes: ["circle"],
    colors: ["#ff69b4", "#ff1493", "#ffc0cb"]
  });

  loadMemories();

  preview.src = "";
  preview.style.display = "none";
  imageInput.value = "";
}

// --- Delete memory ---
async function deleteMemory(id) {
  await fetch(`${API}/${id}`, { method: "DELETE" });
  loadMemories();
}

// --- Edit memory ---
async function editMemory(id, title, description, date) {
  const newTitle = prompt("Edit title", title);
  const newDescription = prompt("Edit description", description);
  const newDate = prompt("Edit date", date);

  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: newTitle, description: newDescription, date: newDate })
  });

  loadMemories();
}

// --- Relationship counter ---
function relationshipCounter() {
  const startDate = new Date("2023-04-23");

  function updateCounter() {
    const now = new Date();
    const diff = now - startDate;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById("counter").innerText =
      `❤️ ${days}d ${hours}h ${minutes}m ${seconds}s together`;
  }

  updateCounter();
  setInterval(updateCounter, 1000);
}
relationshipCounter();
loadMemories();