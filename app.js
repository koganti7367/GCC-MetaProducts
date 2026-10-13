// Seed Data for Door Meta-Products
const initialDoorMetaList = [
  {
    id: "door-001",
    name: "Architectural Entry Door",
    line: "ProSeries Exterior",
    creator: "Alex Rivera",
    lastEditor: "Jordan Lee",
    lastModified: "2026-10-13",
    categories: [
      {
        id: "frame",
        name: "Frame Material & Core",
        type: "select",
        options: [
          { id: "oak-solid", name: "Solid Natural Oak", desc: "Heavyweight hardwood core frame." },
          { id: "aluminum-thermal", name: "Thermal Break Aluminum", desc: "Modern insulated aluminum frame." },
          { id: "fiberglass", name: "Composite Fiberglass", desc: "High weather-resistance core." }
        ],
        selected: "oak-solid"
      },
      {
        id: "glass",
        name: "Glass Panel Options",
        type: "select",
        options: [
          { id: "frosted-triple", name: "Triple-Pane Frosted", desc: "Privacy glass with max insulation." },
          { id: "clear-double", name: "Double-Pane Clear", desc: "High visibility tempered glass." },
          { id: "no-glass", name: "Solid Wood (No Glass)", desc: "Full solid panel construction." }
        ],
        selected: "frosted-triple"
      },
      {
        id: "finish",
        name: "Exterior Finish",
        type: "select",
        options: [
          { id: "walnut-stain", name: "Dark Walnut Stain", desc: "Protective UV clear coat varnish." },
          { id: "matte-black", name: "Matte Black Powdercoat", desc: "Durable architectural paint coating." }
        ],
        selected: "walnut-stain"
      },
      {
        id: "hardware",
        name: "Hardware & Accessories",
        type: "checkbox",
        options: [
          { id: "smart-lock", name: "Keyless Smart Lock", desc: "Fingerprint & keypad entry deadbolt.", active: true },
          { id: "pull-handle-60in", name: "60-inch Vertical Pull Bar", desc: "Brushed stainless steel handle.", active: true }
        ]
      }
    ]
  },
  {
    id: "door-002",
    name: "Sliding Patio Glass System",
    line: "VistaView Series",
    creator: "Samantha Chen",
    lastEditor: "Alex Rivera",
    lastModified: "2026-10-11",
    categories: [
      {
        id: "frame",
        name: "Frame Material & Core",
        type: "select",
        options: [
          { id: "aluminum-thermal", name: "Thermal Break Aluminum", desc: "Slim profile aluminum frame." },
          { id: "vinyl-composite", name: "Vinyl Composite Frame", desc: "Weatherproof UV-stabilized frame." }
        ],
        selected: "aluminum-thermal"
      },
      {
        id: "glass",
        name: "Glass Panel Options",
        type: "select",
        options: [
          { id: "low-e-double", name: "Low-E Argon Double Pane", desc: "Energy efficient solar heat gain glass." },
          { id: "tinted-privacy", name: "Bronze Tinted Privacy Glass", desc: "Reduced glare and interior visibility." }
        ],
        selected: "low-e-double"
      },
      {
        id: "hardware",
        name: "Hardware & Accessories",
        type: "checkbox",
        options: [
          { id: "flush-latch", name: "Flush Interior Mortise Lock", desc: "Sleek low-profile locking mechanism.", active: true },
          { id: "retractable-screen", name: "Integrated Retractable Screen", desc: "Concealed insect mesh screen.", active: true }
        ]
      }
    ]
  }
];

// App State
let doorList = loadDoorList();
let activeDoorId = null;

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  renderTable();

  window.addEventListener("resize", () => {
    if (activeDoorId) drawConnectors();
  });
});

function loadDoorList() {
  const saved = localStorage.getItem("door_meta_list");
  return saved ? JSON.parse(saved) : initialDoorMetaList;
}

function saveDoorList() {
  localStorage.setItem("door_meta_list", JSON.stringify(doorList));
}

function countActiveSpecs(door) {
  let count = 0;
  door.categories.forEach(cat => {
    if (cat.type === "checkbox") {
      count += cat.options.filter(o => o.active).length;
    } else if (cat.selected && cat.selected !== "no-glass") {
      count += 1;
    }
  });
  return count;
}

function renderTable() {
  const tbody = document.getElementById("table-body");
  tbody.innerHTML = "";

  doorList.forEach(door => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="table-title">${door.name}</td>
      <td>${door.line || "N/A"}</td>
      <td>${door.creator}</td>
      <td>${door.lastEditor}</td>
      <td>${door.lastModified}</td>
      <td>${countActiveSpecs(door)} specs active</td>
      <td class="action-cell">
        <button class="btn btn-primary btn-sm" onclick="openConfigurator('${door.id}')">Configure Door</button>
        <button class="btn btn-secondary btn-sm" onclick="openEditModal('${door.id}')">Edit Info</button>
        <button class="btn btn-danger btn-sm" onclick="deleteDoor('${door.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openConfigurator(doorId) {
  activeDoorId = doorId;
  const door = doorList.find(d => d.id === doorId);
  if (!door) return;

  document.getElementById("view-table").classList.add("hidden");
  document.getElementById("view-configurator").classList.remove("hidden");
  document.getElementById("btn-back-to-list").classList.remove("hidden");
  document.getElementById("btn-create-meta").classList.add("hidden");
  document.getElementById("header-title").innerText = `Configurator: ${door.name}`;

  updateConfiguratorSummary(door);
  renderSidebarControls(door);
  renderCanvas(door);
}

function backToTable() {
  activeDoorId = null;
  document.getElementById("view-configurator").classList.add("hidden");
  document.getElementById("view-table").classList.remove("hidden");
  document.getElementById("btn-back-to-list").classList.add("hidden");
  document.getElementById("btn-create-meta").classList.remove("hidden");
  document.getElementById("header-title").innerText = "Door Meta-Product Manager";
  renderTable();
}

function updateConfiguratorSummary(door) {
  document.getElementById("summary-name").innerText = door.name;
  document.getElementById("summary-line").innerText = door.line || "N/A";
  document.getElementById("summary-creator").innerText = door.creator;
  document.getElementById("summary-editor").innerText = door.lastEditor;
  document.getElementById("summary-date").innerText = door.lastModified;
  document.getElementById("summary-count").innerText = countActiveSpecs(door);
}

function renderSidebarControls(door) {
  const container = document.getElementById("controls-container");
  container.innerHTML = "";

  door.categories.forEach(cat => {
    const group = document.createElement("div");
    group.className = "control-group";

    const label = document.createElement("label");
    label.className = "group-label";
    label.innerText = cat.name;
    group.appendChild(label);

    if (cat.type === "checkbox") {
      const list = document.createElement("div");
      list.className = "checkbox-list";

      cat.options.forEach(opt => {
        const item = document.createElement("label");
        item.className = "checkbox-item";
        item.innerHTML = `
          <input type="checkbox" ${opt.active ? "checked" : ""} data-cat="${cat.id}" data-opt="${opt.id}">
          <span>${opt.name}</span>
        `;
        item.querySelector("input").addEventListener("change", (e) => {
          opt.active = e.target.checked;
          door.lastEditor = "Alex Rivera";
          door.lastModified = new Date().toISOString().split("T")[0];
          saveDoorList();
          updateConfiguratorSummary(door);
          renderCanvas(door);
        });
        list.appendChild(item);
      });
      group.appendChild(list);
    } else {
      const select = document.createElement("select");
      cat.options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.id;
        option.innerText = opt.name;
        if (opt.id === cat.selected) option.selected = true;
        select.appendChild(option);
      });

      select.addEventListener("change", (e) => {
        cat.selected = e.target.value;
        door.lastEditor = "Alex Rivera";
        door.lastModified = new Date().toISOString().split("T")[0];
        saveDoorList();
        updateConfiguratorSummary(door);
        renderCanvas(door);
      });
      group.appendChild(select);
    }

    container.appendChild(group);
  });
}

function renderCanvas(door) {
  const canvas = document.getElementById("tree-canvas");
  canvas.innerHTML = "";

  // 1. Root Node
  const root = document.createElement("div");
  root.id = "root-node";
  root.className = "node-root";
  root.innerText = door.name;
  canvas.appendChild(root);

  // 2. Node Grid
  const grid = document.createElement("div");
  grid.className = "node-grid";

  door.categories.forEach(cat => {
    if (cat.type === "checkbox") {
      cat.options.filter(o => o.active).forEach(opt => {
        grid.appendChild(createNodeCard(opt.id, opt.name, opt.desc));
      });
    } else {
      const selectedOpt = cat.options.find(o => o.id === cat.selected);
      if (selectedOpt && selectedOpt.id !== "no-glass") {
        grid.appendChild(createNodeCard(selectedOpt.id, selectedOpt.name, selectedOpt.desc));
      }
    }
  });

  canvas.appendChild(grid);
  setTimeout(drawConnectors, 50);
}

function createNodeCard(id, title, description) {
  const card = document.createElement("div");
  card.className = "node-card child-node";
  card.dataset.id = id;
  card.innerHTML = `
    <h4>${title}</h4>
    <p>${description}</p>
  `;
  return card;
}

function drawConnectors() {
  const svg = document.getElementById("svg-connectors");
  const viewport = document.getElementById("viewport");
  const rootNode = document.getElementById("root-node");
  const childNodes = document.querySelectorAll(".child-node");

  if (!svg || !viewport || !rootNode) return;

  svg.innerHTML = "";

  const viewportRect = viewport.getBoundingClientRect();
  const rootRect = rootNode.getBoundingClientRect();

  const startX = rootRect.left + rootRect.width / 2 - viewportRect.left + viewport.scrollLeft;
  const startY = rootRect.bottom - viewportRect.top + viewport.scrollTop;

  childNodes.forEach(child => {
    const childRect = child.getBoundingClientRect();
    const endX = childRect.left + childRect.width / 2 - viewportRect.left + viewport.scrollLeft;
    const endY = childRect.top - viewportRect.top + viewport.scrollTop;

    const controlY = startY + (endY - startY) / 2;
    const pathD = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathD);
    path.setAttribute("stroke", "#0d6efd");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-dasharray", "4,4");
    path.setAttribute("opacity", "0.6");

    svg.appendChild(path);
  });
}

function setupEventListeners() {
  const modal = document.getElementById("modal-create");
  const btnCreate = document.getElementById("btn-create-meta");
  const btnBack = document.getElementById("btn-back-to-list");
  const btnClose = document.getElementById("btn-close-modal");
  const btnCancel = document.getElementById("btn-cancel-modal");
  const formCreate = document.getElementById("form-create-meta");

  btnCreate.addEventListener("click", () => {
    document.getElementById("modal-title").innerText = "Create New Door Model";
    document.getElementById("input-id").value = "";
    formCreate.reset();
    document.getElementById("input-creator").value = "Alex Rivera";
    modal.classList.remove("hidden");
  });

  btnBack.addEventListener("click", backToTable);
  btnClose.addEventListener("click", () => modal.classList.add("hidden"));
  btnCancel.addEventListener("click", () => modal.classList.add("hidden"));

  formCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("input-id").value;
    const name = document.getElementById("input-name").value.trim();
    const line = document.getElementById("input-line").value.trim();
    const creator = document.getElementById("input-creator").value.trim() || "Alex Rivera";
    const today = new Date().toISOString().split("T")[0];

    if (id) {
      // Edit existing door
      const door = doorList.find(d => d.id === id);
      if (door) {
        door.name = name;
        door.line = line;
        door.lastEditor = creator;
        door.lastModified = today;
      }
    } else {
      // Create new door model
      const newDoor = {
        id: "door-" + Date.now(),
        name,
        line,
        creator,
        lastEditor: creator,
        lastModified: today,
        categories: [
          {
            id: "frame",
            name: "Frame Material & Core",
            type: "select",
            options: [
              { id: "oak-solid", name: "Solid Natural Oak", desc: "Heavyweight hardwood core frame." },
              { id: "aluminum-thermal", name: "Thermal Break Aluminum", desc: "Modern insulated aluminum frame." }
            ],
            selected: "oak-solid"
          },
          {
            id: "hardware",
            name: "Hardware & Accessories",
            type: "checkbox",
            options: [
              { id: "smart-lock", name: "Keyless Smart Lock", desc: "Fingerprint & keypad entry deadbolt.", active: true }
            ]
          }
        ]
      };
      doorList.push(newDoor);
    }

    saveDoorList();
    renderTable();
    modal.classList.add("hidden");
  });
}

function openEditModal(doorId) {
  const door = doorList.find(d => d.id === doorId);
  if (!door) return;

  document.getElementById("modal-title").innerText = "Edit Door Details";
  document.getElementById("input-id").value = door.id;
  document.getElementById("input-name").value = door.name;
  document.getElementById("input-line").value = door.line || "";
  document.getElementById("input-creator").value = door.lastEditor;

  document.getElementById("modal-create").classList.remove("hidden");
}

function deleteDoor(doorId) {
  if (confirm("Are you sure you want to delete this door model?")) {
    doorList = doorList.filter(d => d.id !== doorId);
    saveDoorList();
    renderTable();
  }
}