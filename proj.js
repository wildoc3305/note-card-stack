const addNoteBtn    = document.getElementById("add-note");
const formContainer = document.getElementById("formContainer");
const closeFormBtn  = document.getElementById("closeForm");
const formTitle     = document.getElementById("formTitle");
const submitBtn     = document.getElementById("submitBtn");
const overlay       = document.getElementById("overlay");
const stack         = document.getElementById("stack");
const upBtn         = document.getElementById("upBtn");
const downBtn       = document.getElementById("downBtn");
const deleteBtn     = document.getElementById("deleteBtn");
const noteForm      = document.getElementById("noteForm");
const cardCounter   = document.getElementById("cardCounter");

const imageUrlInput  = document.getElementById("imageUrlInput");
const fullNameInput  = document.getElementById("fullNameInput");
const phoneInput     = document.getElementById("phoneInput");
const homeTownInput  = document.getElementById("homeTownInput");
const purposeInput   = document.getElementById("purposeInput");
const editIndexInput = document.getElementById("editIndex");
const categoryRadios = noteForm.querySelectorAll("input[name='category']");

function getTasks() {
  try { return JSON.parse(localStorage.getItem("tasks")) || []; }
  catch { return []; }
}
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function openForm() {
  formTitle.textContent = "New Note";
  submitBtn.textContent = "Create Note";
  editIndexInput.value  = "-1";
  noteForm.reset();
  formContainer.classList.add("active");
  overlay.classList.add("active");
  imageUrlInput.focus();
}

function openEditForm(index) {
  const tasks = getTasks();
  const task  = tasks[index];
  if (!task) return;

  formTitle.textContent = "Edit Note";
  submitBtn.textContent = "Save Changes";
  editIndexInput.value  = index;

  imageUrlInput.value = task.imageUrl || "";
  fullNameInput.value = task.fullName || "";
  phoneInput.value    = task.phone    || "";
  homeTownInput.value = task.homeTown || "";
  purposeInput.value  = task.purpose  || "";

  categoryRadios.forEach(r => { r.checked = (r.value === task.selected); });

  formContainer.classList.add("active");
  overlay.classList.add("active");
  fullNameInput.focus();
}

function closeForm() {
  formContainer.classList.remove("active");
  overlay.classList.remove("active");
  noteForm.reset();
  editIndexInput.value = "-1";
}

addNoteBtn.addEventListener("click", openForm);
closeFormBtn.addEventListener("click", closeForm);
overlay.addEventListener("click", closeForm);

noteForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const imageUrl = imageUrlInput.value.trim();
  const fullName = fullNameInput.value.trim();
  const phone    = phoneInput.value.trim();
  const homeTown = homeTownInput.value.trim();
  const purpose  = purposeInput.value.trim();
  const index    = parseInt(editIndexInput.value);
  let selected   = null;

  categoryRadios.forEach(r => { if (r.checked) selected = r.value; });

  if (!imageUrl) return shake(imageUrlInput, "Please enter an image URL.");
  if (!fullName) return shake(fullNameInput, "Please enter a full name.");
  if (!phone)    return shake(phoneInput,    "Please enter a phone number.");
  if (!homeTown) return shake(homeTownInput, "Please enter a home town.");
  if (!purpose)  return shake(purposeInput,  "Please enter a purpose.");
  if (!selected) return alert("Please select a category.");

  const tasks = getTasks();

  if (index === -1) {
    tasks.push({ imageUrl, fullName, phone, homeTown, purpose, selected, contacted: false });
  } else {
    tasks[index] = { ...tasks[index], imageUrl, fullName, phone, homeTown, purpose, selected };
  }

  saveTasks(tasks);
  closeForm();
  showCards();
});

function shake(el, msg) {
  el.style.borderColor = "#f87171";
  el.style.boxShadow   = "0 0 0 3px rgba(248,113,113,0.25)";
  setTimeout(() => { el.style.borderColor = ""; el.style.boxShadow = ""; }, 1800);
  el.focus();
  alert(msg);
}

function buildCard(task, index) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.dataset.index = index;
  if (task.contacted) card.classList.add("contacted");

  const cardTop = document.createElement("div");
  cardTop.classList.add("card-top");

  const avatar = document.createElement("img");
  avatar.src = task.imageUrl;
  avatar.alt = task.fullName;
  avatar.classList.add("avatar");
  avatar.onerror = () => {
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(task.fullName)}&background=e8e8e8&color=555&size=80`;
  };

  const titleWrap = document.createElement("div");
  titleWrap.classList.add("card-title-wrap");

  const name = document.createElement("h2");
  name.textContent = task.fullName;

  const badge = document.createElement("span");
  badge.classList.add("category-badge");
  const icons = { emergency:"🚨", important:"⭐", urgent:"⚡", "no-rush":"🌿" };
  badge.textContent = `${icons[task.selected] || ""} ${task.selected}`;

  titleWrap.appendChild(name);
  titleWrap.appendChild(badge);
  cardTop.appendChild(avatar);
  cardTop.appendChild(titleWrap);
  card.appendChild(cardTop);

  [["Home town", task.homeTown], ["Purpose", task.purpose]].forEach(([label, value]) => {
    const row = document.createElement("div");
    row.classList.add("info");
    const l = document.createElement("span"); l.textContent = label;
    const v = document.createElement("span"); v.textContent = value;
    row.appendChild(l); row.appendChild(v);
    card.appendChild(row);
  });

  const buttonsDiv = document.createElement("div");
  buttonsDiv.classList.add("buttons");

  const callBtn = document.createElement("button");
  callBtn.classList.add("call");
  callBtn.innerHTML = '<i class="ri-phone-line"></i> Call';
  callBtn.addEventListener("click", () => {
    window.location.href = `tel:${task.phone.replace(/\s+/g, "")}`;
  });

  const msgBtn = document.createElement("button");
  msgBtn.classList.add("msg");
  msgBtn.innerHTML = '<i class="ri-chat-1-line"></i> Message';
  msgBtn.addEventListener("click", () => {
    window.location.href = `sms:${task.phone.replace(/\s+/g, "")}`;
  });

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.innerHTML = '<i class="ri-edit-line"></i> Edit';
  editBtn.addEventListener("click", () => openEditForm(index));

  const contactedBtn = document.createElement("button");
  contactedBtn.classList.add("contacted-btn");
  contactedBtn.innerHTML = task.contacted
    ? '<i class="ri-checkbox-circle-line"></i> Contacted'
    : '<i class="ri-checkbox-blank-circle-line"></i> Contacted';
  if (task.contacted) contactedBtn.classList.add("is-contacted");
  contactedBtn.addEventListener("click", () => toggleContacted(index));

  buttonsDiv.appendChild(callBtn);
  buttonsDiv.appendChild(msgBtn);
  buttonsDiv.appendChild(editBtn);
  buttonsDiv.appendChild(contactedBtn);
  card.appendChild(buttonsDiv);

  return card;
}

function toggleContacted(index) {
  const tasks = getTasks();
  if (!tasks[index]) return;
  tasks[index].contacted = !tasks[index].contacted;
  saveTasks(tasks);
  showCards();
}

function showCards() {
  stack.innerHTML = "";
  const tasks = getTasks();

  if (tasks.length === 0) {
    const empty = document.createElement("div");
    empty.classList.add("empty-state");
    empty.innerHTML = `
      <i class="ri-sticky-note-line"></i>
      <strong>No notes yet</strong>
      Hit the <strong>+</strong> button to add your first card
    `;
    stack.appendChild(empty);
    cardCounter.textContent = "";
    return;
  }

  [...tasks].reverse().forEach((task, reversedI) => {
    const realIndex = tasks.length - 1 - reversedI;
    stack.insertBefore(buildCard(task, realIndex), stack.firstElementChild);
  });

  updateStack();
  updateCounter();
  attachSwipe();
}

function updateStack() {
  stack.querySelectorAll(".card").forEach((card, i) => {
    card.className = card.className.replace(/\bpos-\d\b/g, "").trim();
    card.classList.add(`pos-${Math.min(i, 3)}`);
  });
}

function updateCounter() {
  const count = getTasks().length;
  cardCounter.textContent = count === 1 ? "1 card" : `${count} cards`;
}

upBtn.addEventListener("click", () => {
  if (stack.querySelectorAll(".card").length <= 1) return;
  stack.insertBefore(stack.lastElementChild, stack.firstElementChild);
  updateStack();
});

downBtn.addEventListener("click", () => {
  if (stack.querySelectorAll(".card").length <= 1) return;
  stack.appendChild(stack.firstElementChild);
  updateStack();
});

deleteBtn.addEventListener("click", () => {
  const tasks = getTasks();
  if (!tasks.length) return;
  const topCard = stack.firstElementChild;
  if (!topCard || topCard.classList.contains("empty-state")) return;
  topCard.classList.add("removing");
  topCard.addEventListener("animationend", () => {
    tasks.shift();
    saveTasks(tasks);
    showCards();
  }, { once: true });
});

function attachSwipe() {
  const topCard = stack.firstElementChild;
  if (!topCard || topCard.classList.contains("empty-state")) return;

  let startX = null;
  let currentX = null;
  const THRESHOLD = 60;

  function onStart(e) {
    startX = currentX = e.touches ? e.touches[0].clientX : e.clientX;
    topCard.classList.add("swiping");
  }

  function onMove(e) {
    if (startX === null) return;
    currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const deltaX = currentX - startX;
    topCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.08}deg)`;
  }

  function onEnd() {
    if (startX === null) return;
    const deltaX = currentX - startX;
    topCard.classList.remove("swiping");
    topCard.style.transform = "";
    startX = null;

    if (Math.abs(deltaX) >= THRESHOLD) {
      topCard.classList.add(deltaX < 0 ? "swipe-left" : "swipe-right");
      topCard.addEventListener("animationend", () => {
        if (deltaX < 0) stack.appendChild(stack.firstElementChild);
        else stack.insertBefore(stack.lastElementChild, stack.firstElementChild);
        updateStack();
        attachSwipe();
      }, { once: true });
    }
  }

  topCard.addEventListener("touchstart", onStart, { passive: true });
  topCard.addEventListener("touchmove",  onMove,  { passive: true });
  topCard.addEventListener("touchend",   onEnd);
  topCard.addEventListener("mousedown",  onStart);
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup",   onEnd);
}

const dots     = document.querySelectorAll(".dot");
const themeMap = { black:"", purple:"theme-purple", orange:"theme-orange", teal:"theme-teal" };

dots.forEach(dot => {
  dot.addEventListener("click", function () {
    document.body.className = themeMap[this.dataset.color] || "";
    dots.forEach(d => d.classList.remove("active"));
    this.classList.add("active");
  });
});
document.querySelector(".dot.black").classList.add("active");

showCards();