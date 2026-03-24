const API = "http://localhost:3000/memories";

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
      ${m.image ? `<img src="http://localhost:3000/uploads/${m.image}" width="200">` : ""}
      
      <p>${m.description}</p>
      <small>${m.date}</small>
      <br>
      <button onclick="editMemory(${m.id}, '${m.title}', '${m.description}', '${m.date}')">Edit</button>
<button onclick="deleteMemory(${m.id})">Delete</button>
    `;
    timeline.appendChild(div);
  });
}

async function addMemory() {

const title = document.getElementById("title").value;
const description = document.getElementById("description").value;
const date = document.getElementById("date").value;

const formData = new FormData();

formData.append("title", title);
formData.append("description", description);
formData.append("date", date);

const imageFile = document.getElementById("image").files[0];

if (imageFile) {
    formData.append("image", imageFile);
}

await fetch(API, {
    method: "POST",
    body: formData
});

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
document.getElementById("image").value = "";

}
async function deleteMemory(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE"
  });

  loadMemories();
}

async function editMemory(id, title, description, date){

  const newTitle = prompt("Edit title", title);
  const newDescription = prompt("Edit description", description);
  const newDate = prompt("Edit date", date);

  await fetch(`${API}/${id}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json"},
    body: JSON.stringify({
      title:newTitle,
      description:newDescription,
      date:newDate
    })
  });

  loadMemories();
}
loadMemories();

function relationshipCounter(){

const startDate = new Date("2023-04-23"); // change this later
const today = new Date();

const diffTime = today - startDate;

const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));

document.getElementById("counter").innerText =
"❤️ Together for " + days + " days";

}

relationshipCounter();

const imageInput = document.getElementById("image");
const preview = document.getElementById("preview");

imageInput.addEventListener("change", function(){

const file = this.files[0];

if(file){

preview.style.display = "block";
preview.src = URL.createObjectURL(file);

}

});