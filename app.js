// Hierarchical Door Meta-Products Seed Data
const initialDoorMetaList = [
  {
    id: "door-001",
    name: "Architectural Entry Door",
    line: "ProSeries Exterior",
    creator: "Alex Rivera",
    lastEditor: "Jordan Lee",
    lastModified: "2026-10-13",
    features: [
      {
        id: "feat-frame",
        name: "Frame Material & Core",
        subfeatures: [
          { id: "sub-oak", name: "Solid Natural Oak", desc: "Heavyweight hardwood core frame", active: true },
          { id: "sub-aluminum", name: "Thermal Break Aluminum", desc: "Insulated aluminum frame", active: false }
        ]
      },
      {
        id: "feat-glass",
        name: "Glazing & Glass Specs",
        subfeatures: [
          { id: "sub-frosted", name: "Triple-Pane Frosted Glass", desc: "Max privacy & high thermal performance", active: true },
          { id: "sub-lowe", name: "Low-E Argon Double Pane", desc: "Solar heat gain reduction glass", active: false }
        ]
      },
      {
        id: "feat-hardware",
        name: "Locking & Hardware",
        subfeatures: [
          { id: "sub-smartlock", name: "Keyless Smart Deadbolt", desc: "Fingerprint & keypad entry", active: true },
          { id: "sub-barhandle", name: "60-inch Vertical Pull Bar", desc: "Brushed stainless steel handle", active: true },
          { id: "sub-multipoint", name: "Multi-Point Security Latch", desc: "3-point perimeter locking", active: true }
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
  const saved = localStorage.getItem("door_meta_list_v2");
  return saved ? JSON.parse(saved) : initialDoorMetaList;
}

function saveDoorList() {
  localStorage.setItem("door_meta_list_v2", JSON.stringify(doorList));
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
      <td>${door.features ? door.features.length : 0} Features</td>
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
  renderSidebarFeatures(door);
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
  document.getElementById("summary-count").innerText = door.features ? door.features.length : 0;
}

function renderSidebarFeatures(door) {
  const container = document.getElementById("controls-container");
  container.innerHTML = "";

  if (!door.features || door.features.length === 0) {
    container.innerHTML = `<p style="color: #6c757d; font-size: 0.85rem;">No features added yet. Click <strong>+ Add Top Feature</strong> above to start.</p>`;
    return;
  }

  door.features.forEach(feat => {
    const card = document.createElement("div");
    card.className = "feature-card";

    const header = document.createElement("div");
    header.className = "feature-header";
    header.innerHTML = `
      <span class="feature-title">${feat.name}</span>
      <button class="btn btn-secondary btn-sm" onclick="promptAddSubFeature('${feat.id}')">+ Add Choice</button>
    `;
    card.appendChild(header);

    const subList = document.createElement("div");
    subList.className = "subfeature-list";

    if (feat.subfeatures && feat.subfeatures.length > 0) {
      feat.subfeatures.forEach(sub => {
        const item = document.createElement("div");
        item.className = "subfeature-item";
        item.innerHTML = `
          <div class="subfeature-left">
            <input type="checkbox" ${sub.active ? "checked" : ""} id="check-${sub.id}">
            <label for="check-${sub.id}" style="cursor:pointer;">${sub.name}</label>
          </div>
          <button class="btn-link" onclick="deleteSubFeature('${feat.id}', '${sub.id}')">&times;</button>
        `;

        item.querySelector("input").addEventListener("change", (e) => {
          sub.active = e.target.checked;
          door.lastEditor = "Alex Rivera";
          door.lastModified = new Date().toISOString().split("T")[0];
          saveDoorList();
          renderCanvas(door);
        });

        subList.appendChild(item);
      });
    } else {
      subList.innerHTML = `<span style="font-size:0.75rem; color:#adb5bd;">No choices under this feature.</span>`;
    }

    card.appendChild(subList);
    container.appendChild(card);
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

  // 2. Feature & Subfeature Hierarchy Grid
  const row = document.createElement("div");
  row.className = "feature-nodes-row";

  if (door.features) {
    door.features.forEach(feat => {
      const activeSubs = feat.subfeatures ? feat.subfeatures.filter(s => s.active) : [];
      if (activeSubs.length > 0) {
        const col = document.createElement("div");
        col.className = "feature-group-column";

        const featNode = document.createElement("div");
        featNode.className = "node-feature feat-node";
        featNode.dataset.id = feat.id;
        featNode.innerText = feat.name;
        col.appendChild(featNode);

        const subGrid = document.createElement("div");
        subGrid.className = "node-subgrid";

        activeSubs.forEach(sub => {
          const card = document.createElement("div");
          card.className = "node-card sub-card";
          card.dataset.subid = sub.id;
          card.innerHTML = `
            <h4>${sub.name}</h4>
            <p>${sub.desc || ""}</p>
          `;
          subGrid.appendChild(card);
        });

        col.appendChild(subGrid);
        row.appendChild(col);
      }
    });
  }

  canvas.appendChild(row);
  setTimeout(drawConnectors, 50);
}

function drawConnectors() {
  const svg = document.getElementById("svg-connectors");
  const viewport = document.getElementById("viewport");
  const rootNode = document.getElementById("root-node");
  const featNodes = document.querySelectorAll(".feat-node");

  if (!svg || !viewport || !rootNode) return;

  svg.innerHTML = "";

  const viewportRect = viewport.getBoundingClientRect();
  const rootRect = rootNode.getBoundingClientRect();

  const startX = rootRect.left + rootRect.width / 2 - viewportRect.left + viewport.scrollLeft;
  const startY = rootRect.bottom - viewportRect.top + viewport.scrollTop;

  featNodes.forEach(feat => {
    const featRect = feat.getBoundingClientRect();
    const endX = featRect.left + featRect.width / 2 - viewportRect.left + viewport.scrollLeft;
    const endY = featRect.top - viewportRect.top + viewport.scrollTop;

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
  const subModal = document.getElementById("modal-subfeature");
  const btnCreate = document.getElementById("btn-create-meta");
  const btnBack = document.getElementById("btn-back-to-list");
  const btnClose = document.getElementById("btn-close-modal");
  const btnCancel = document.getElementById("btn-cancel-modal");
  const formCreate = document.getElementById("form-create-meta");
  const btnAddFeature = document.getElementById("btn-add-feature");

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

  document.getElementById("btn-close-submodal").addEventListener("click", () => subModal.classList.add("hidden"));
  document.getElementById("btn-cancel-submodal").addEventListener("click", () => subModal.classList.add("hidden"));

  // Add Top Feature
  btnAddFeature.addEventListener("click", () => {
    if (!activeDoorId) return;
    const name = prompt("Enter New Top-Level Feature Name (e.g. Fire-Rating & Seals):");
    if (name) {
      const door = doorList.find(d => d.id === activeDoorId);
      if (door) {
        if (!door.features) door.features = [];
        door.features.push({
          id: "feat-" + Date.now(),
          name,
          subfeatures: []
        });
        saveDoorList();
        updateConfiguratorSummary(door);
        renderSidebarFeatures(door);
        renderCanvas(door);
      }
    }
  });

  // Submit Sub-Feature Modal
  document.getElementById("form-add-subfeature").addEventListener("submit", (e) => {
    e.preventDefault();
    const featId = document.getElementById("subfeature-feature-id").value;
    const name = document.getElementById("input-sub-name").value.trim();
    const desc = document.getElementById("input-sub-desc").value.trim();

    const door = doorList.find(d => d.id === activeDoorId);
    if (door && featId) {
      const feat = door.features.find(f => f.id === featId);
      if (feat) {
        if (!feat.subfeatures) feat.subfeatures = [];
        feat.subfeatures.push({
          id: "sub-" + Date.now(),
          name,
          desc,
          active: true
        });
        saveDoorList();
        renderSidebarFeatures(door);
        renderCanvas(door);
      }
    }

    subModal.classList.add("hidden");
    document.getElementById("form-add-subfeature").reset();
  });

  formCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("input-id").value;
    const name = document.getElementById("input-name").value.trim();
    const line = document.getElementById("input-line").value.trim();
    const creator = document.getElementById("input-creator").value.trim() || "Alex Rivera";
    const today = new Date().toISOString().split("T")[0];

    if (id) {
      const door = doorList.find(d => d.id === id);
      if (door) {
        door.name = name;
        door.line = line;
        door.lastEditor = creator;
        door.lastModified = today;
      }
    } else {
      const newDoor = {
        id: "door-" + Date.now(),
        name,
        line,
        creator,
        lastEditor: creator,
        lastModified: today,
        features: [
          {
            id: "feat-frame",
            name: "Frame Material & Core",
            subfeatures: [
              { id: "sub-oak", name: "Solid Natural Oak", desc: "Heavyweight hardwood core frame", active: true }
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

function promptAddSubFeature(featId) {
  document.getElementById("subfeature-feature-id").value = featId;
  document.getElementById("form-add-subfeature").reset();
  document.getElementById("modal-subfeature").classList.remove("hidden");
}

function deleteSubFeature(featId, subId) {
  const door = doorList.find(d => d.id === activeDoorId);
  if (!door) return;

  const feat = door.features.find(f => f.id === featId);
  if (feat) {
    feat.subfeatures = feat.subfeatures.filter(s => s.id !== subId);
    saveDoorList();
    renderSidebarFeatures(door);
    renderCanvas(door);
  }
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