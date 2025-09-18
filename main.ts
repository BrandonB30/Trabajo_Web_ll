// ===== Tipos =====
type Filter = "all" | "active" | "done";

interface Task {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
}

interface AppState {
  tasks: Task[];
  filter: Filter;
}

interface UserSession {
  isAuthenticated: boolean;
  username: string;
  email: string;
  loginTime: number;
}

// ===== Estado =====
const state: AppState = { tasks: [], filter: "all" };
const uid = (): string => Math.random().toString(36).slice(2, 10);

// ===== Persistencia con localStorage =====
const STORAGE_KEY = "todo-app-tasks";

function saveTasks(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch {
    // Ignorar errores de cuota/permiso
  }
}

function loadTasks(): Task[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Task[]) : [];
  } catch {
    return [];
  }
}

function clearAllStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // no-op
  }
}

// ===== Autenticación =====
const SESSION_KEY = "todo-app-session";

function checkAuthentication(): boolean {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return false;
    
    const session: UserSession = JSON.parse(sessionData);
    
    // Verificar si la sesión no ha expirado (24 horas)
    const now = Date.now();
    const sessionAge = now - session.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    
    if (sessionAge > maxAge) {
      clearSession();
      return false;
    }
    
    return session.isAuthenticated;
  } catch {
    return false;
  }
}

function getCurrentUser(): UserSession | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch {
    return null;
  }
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // no-op
  }
}

function redirectToLogin(): void {
  window.location.href = "Login.html";
}
//Exportar e importar tareas
function exportTasks(): void {
  const dataStr = JSON.stringify(state.tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tareas.json";
  a.click();

  URL.revokeObjectURL(url);
}

function importTasks(file: File): void {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result as string) as Task[];

      // Validación básica para evitar errores
      if (!Array.isArray(imported)) throw new Error("Formato inválido");
      for (const t of imported) {
        if (typeof t.id !== "string" ||
            typeof t.title !== "string" ||
            typeof t.done !== "boolean" ||
            typeof t.createdAt !== "number") {
          throw new Error("Formato inválido");
        }
      }

      state.tasks = imported;
      render();
      alert("Tareas importadas correctamente.");
    } catch (error) {
      alert("El archivo no es válido o está corrupto.");
    }
  };

  reader.readAsText(file);
}

// ===== DOM =====
const $input = document.getElementById("task-input") as HTMLInputElement;
const $addBtn = document.getElementById("add-btn") as HTMLButtonElement;
const $list = document.getElementById("list") as HTMLElement; // grid (row)
const $counter = document.getElementById("counter") as HTMLSpanElement;
const $empty = document.getElementById("empty") as HTMLDivElement;
const $clearDone = document.getElementById("clear-done") as HTMLButtonElement;
const $filterButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('button[data-filter]')
);

//Exportar e importar
const $exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
const $importBtn = document.getElementById("import-btn") as HTMLButtonElement;
const $importFile = document.getElementById("import-file") as HTMLInputElement;

// Función para agregar botón de logout
function addLogoutButton(): void {
  const existing = document.getElementById("logout-btn") as HTMLButtonElement | null;
  if (existing) return;

  const user = getCurrentUser();
  if (!user) return;

  // Buscar el contenedor de botones en la barra superior
  const buttonContainer = document.querySelector('.d-flex.gap-2');
  if (!buttonContainer) return;

  const logoutBtn = document.createElement("button");
  logoutBtn.id = "logout-btn";
  logoutBtn.className = "btn btn-outline-danger btn-sm";
  logoutBtn.innerHTML = `<i class="bi bi-box-arrow-right me-1"></i>Cerrar sesión (${user.username})`;
  logoutBtn.addEventListener("click", () => {
    if (confirm(`¿Estás seguro de que quieres cerrar sesión, ${user.username}?`)) {
      clearSession();
      redirectToLogin();
    }
  });

  buttonContainer.appendChild(logoutBtn);
}

// Stats (opcionales)
const $statActive = document.getElementById("stat-active") as HTMLElement | null;
const $statDone = document.getElementById("stat-done") as HTMLElement | null;
const $statTotal = document.getElementById("stat-total") as HTMLElement | null;

// ===== CRUD =====
function addTask(title: string): void {
  const trimmed = (title ?? "").trim();
  if (!trimmed) return;
  state.tasks.unshift({ id: uid(), title: trimmed, done: false, createdAt: Date.now() });
  render();
  $input.value = "";
  $input.focus();
}

function toggleTask(id: string): void {
  state.tasks = state.tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  render();
}

function removeTask(id: string): void {
  state.tasks = state.tasks.filter(t => t.id !== id);
  render();
}


function clearDone(): void {
  state.tasks = state.tasks.filter(t => !t.done);
  render();
}

function setFilter(f: Filter): void {
  state.filter = f;
  render();
}

function viewTask(id: string): void {
  const t = state.tasks.find(x => x.id === id);
  if (!t) {
    alert("No se encontró la tarea.");
    return;
  }
  const created = new Date(t.createdAt).toLocaleString();
  alert(
    `📄 Detalle de la tarea\n\n` +
    `ID: ${t.id}\n` +
    `Título: ${t.title}\n` +
    `Estado: ${t.done ? "Completada" : "Activa"}\n` +
    `Creada: ${created}`
  );
}

function editTaskTitle(id: string): void {
  const t = state.tasks.find(x => x.id === id);
  if (!t) {
    alert("No se encontró la tarea.");
    return;
  }
  const nuevo = prompt("Nuevo título para la tarea:", t.title);
  if (nuevo === null) return; // cancelado
  const trimmed = nuevo.trim();
  if (!trimmed) {
    alert("El título no puede estar vacío.");
    return;
  }
  state.tasks = state.tasks.map(x => (x.id === id ? { ...x, title: trimmed } : x));
  render();
}

// ===== Reset total =====
function resetAll(): void {
  const ok = confirm("¿Seguro que quieres borrar TODAS las tareas? Esta acción no se puede deshacer.");
  if (!ok) return;
  state.tasks = [];
  clearAllStorage();
  render();
}

// ===== Helpers =====
function visibleTasks(): Task[] {
  switch (state.filter) {
    case "active": return state.tasks.filter(t => !t.done);
    case "done":   return state.tasks.filter(t =>  t.done);
    default:       return state.tasks;
  }
}

// Crea e inserta el botón "Resetear lista" junto a "Eliminar completadas"
function ensureResetButton(): void {
  const existing = document.getElementById("reset-all") as HTMLButtonElement | null;
  if (existing) return;

  // Intentar ubicarlo al lado del botón #clear-done
  const container = $clearDone?.parentElement ?? document.body;
  const btn = document.createElement("button");
  btn.id = "reset-all";
  btn.type = "button";
  btn.className = "btn btn-outline-warning btn-sm";
  btn.innerHTML = '<i class="bi bi-x-circle me-1"></i> Resetear lista';
  btn.addEventListener("click", resetAll);

  // Agregar pequeña separación
  const spacer = document.createElement("span");
  spacer.className = "d-inline-block";
  spacer.style.width = "6px";

  container.append(spacer, btn);
}

// ===== Render =====
function render(): void {
  const tasks = visibleTasks();

  // Vacío
  $empty.classList.toggle("d-none", tasks.length !== 0);

  // Limpiar grid
  $list.innerHTML = "";

  // Pintar cada task como Card
  for (const t of tasks) {
    const col = document.createElement("div");
    col.className = "col";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";
    if (t.done) card.classList.add("border-success", "opacity-75");

    // Header (checkbox + título)
    const header = document.createElement("div");
    header.className = "card-header bg-transparent d-flex align-items-center gap-2";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = t.done;
    checkbox.title = "Marcar como completada / activa";
    checkbox.addEventListener("change", () => toggleTask(t.id));

    const title = document.createElement("div");
    title.className = "ms-1 fw-semibold task-title";
    title.textContent = t.title;
    if (t.done) title.classList.add("text-decoration-line-through");

    header.append(checkbox, title);

    // Body (meta)
    const body = document.createElement("div");
    body.className = "card-body py-2";
    const meta = document.createElement("div");
    meta.className = "text-secondary small";
    meta.textContent = "Creada: " + new Date(t.createdAt).toLocaleString();
    body.appendChild(meta);

    // Footer (acciones)
    const footer = document.createElement("div");
    footer.className = "card-footer bg-transparent d-flex justify-content-end gap-2";

    const viewBtn = document.createElement("button");
    viewBtn.className = "btn btn-sm btn-outline-secondary";
    viewBtn.innerHTML = '<i class="bi bi-eye me-1"></i>Ver';
    viewBtn.addEventListener("click", () => viewTask(t.id));

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-outline-primary";
    editBtn.innerHTML = '<i class="bi bi-pencil-square me-1"></i>Editar';
    editBtn.addEventListener("click", () => editTaskTitle(t.id));

    const removeBtn = document.createElement("button");
    removeBtn.className = "btn btn-sm btn-outline-danger";
    removeBtn.innerHTML = '<i class="bi bi-trash3 me-1"></i>Eliminar';
    removeBtn.addEventListener("click", () => removeTask(t.id));

    footer.append(viewBtn, editBtn, removeBtn);

    card.append(header, body, footer);
    col.appendChild(card);
    $list.appendChild(col);
  }
  // Crear el botón para el video de YouTube
  const videoBtn = document.createElement("button");
  videoBtn.type = "button";
  videoBtn.className = "btn btn-sm btn-success";
  videoBtn.innerHTML = '<i class="bi bi-play-circle me-1"></i>Ver video sobre cronograma de actividades';
  videoBtn.addEventListener("click", () => {
  window.open("https://www.youtube.com/watch?v=P-NBpBTXL4c&pp=ygUlQ1JFQUNJT04gREUgQ1JPTk9HUkFNQSBERSBBQ1RJVklEQURFU9IHCQnKCQGHKiGM7w%3D%3Dvideo", "_blank");
});

  // Contador y stats
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  const active = total - done;

  $counter.textContent = `${total} tareas • ${done} completadas`;
  if ($statActive) $statActive.textContent = String(active);
  if ($statDone)   $statDone.textContent = String(done);
  if ($statTotal)  $statTotal.textContent = String(total);

  // Filtro activo
  for (const b of $filterButtons) {
    b.classList.toggle("active", b.dataset.filter === state.filter);
  }

  // Asegurar botón Reset en la UI
  ensureResetButton();

  // Asegurar botón de logout en la UI
  addLogoutButton();

  // Guardar después de actualizar la vista/estado
  saveTasks();
}

// ===== Eventos =====
$addBtn.addEventListener("click", () => addTask($input.value));
$input.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Enter") addTask($input.value);
});
$clearDone.addEventListener("click", clearDone);
for (const b of $filterButtons) {
  b.addEventListener("click", () => setFilter((b.dataset.filter as Filter) ?? "all"));
}

// Atajo de teclado opcional: Ctrl+Shift+R para resetear
document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === "r")) {
    e.preventDefault();
    resetAll();
  }
});
//Exportar e importar
$exportBtn.addEventListener("click", exportTasks);
$importBtn.addEventListener("click", () => $importFile.click());
$importFile.addEventListener("change", () => {
  if ($importFile.files?.length) {
    importTasks($importFile.files[0]);
    $importFile.value = ""; // limpiar para poder importar el mismo archivo otra vez si se quiere
  }
});
// ---------- imágenes ----------
const imageInput = document.getElementById("imageInput") as HTMLInputElement;
const previewContainer = document.getElementById("previewContainer") as HTMLDivElement;

if (imageInput) {
  imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    previewContainer.innerHTML = "";

    if (!file) {
      previewContainer.innerHTML = "<small>No hay imagen seleccionada</small>";
      return;
    }
    if (!file.type.startsWith("image/")) {
      previewContainer.innerHTML = "<small>Selecciona un archivo de imagen válido.</small>";
      return;
    }

    const img = document.createElement("img");
    img.className = "img-fluid rounded shadow-sm mt-2";
    img.style.maxWidth = "300px";

    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target?.result as string;
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// ---------- Comentarios ----------
const chatBox = document.getElementById("chatBox") as HTMLDivElement;
const chatInput = document.getElementById("chatInput") as HTMLInputElement;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement;

function addMessage(text: string) {
  // Si es el primer mensaje, limpia el texto "No hay mensajes"
  if (chatBox.querySelector("small")) chatBox.innerHTML = "";

  const msg = document.createElement("div");
  msg.className = "mb-2 p-2 rounded bg-white shadow-sm";
  msg.textContent = text;
  chatBox.appendChild(msg);

  // Scroll automático al final
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text);
  chatInput.value = "";
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});
// ===== Inicialización =====
// Verificar autenticación antes de cargar la aplicación
if (!checkAuthentication()) {
  redirectToLogin();
} else {
  // Usuario autenticado, cargar la aplicación
  state.tasks = loadTasks();
  if (state.tasks.length === 0) {
    // Semillas de demo si está vacío
    state.tasks = [
      { id: uid(), title: "Revisar TypeScript",          done: true,  createdAt: Date.now() - 60000 },
      { id: uid(), title: "Agregar validación de tipos", done: false, createdAt: Date.now() - 40000 },
      { id: uid(), title: "Probar filtros y cards",      done: false, createdAt: Date.now() - 20000 },
    ];
  }

  render();
}
