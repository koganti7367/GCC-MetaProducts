// Hierarchical Door Meta-Products Seed Data matching the screenshot structure
const initialDoorMetaList = [
  {
    id: "door-001",
    name: "Koganti's Test POroduct",
    line: "ProSeries Exterior",
    creator: "Alex Rivera",
    lastEditor: "Jordan Lee",
    lastModified: "2026-10-13",
    children: [
      {
        id: "node-1",
        title: "Feature1",
        isSelection: true,
        isRequired: false,
        children: [
          {
            id: "node-1-1",
            title: "Feature 1.1",
            isSelection: true,
            isRequired: true,
            children: [
              { id: "node-1-3", title: "FFeature 1.3", isOption: true },
              { id: "node-1-placeholder", title: "Name this feature", isPlaceholder: true }
            ]
          }
        ]
      },
      {
        id: "node-cert",
        title: "Certification",
        isSelection: true,
        isRequired: true,
        children: [
          {
            id: "node-cert-yes",
            title: "Yes",
            isSelection: true,
            children: [
              {
                id: "node-cert-energy",
                title: "Energy Star",
                isSelection: true,
                children: [
                  { id: "node-cert-no", title: "No", isOption: true },
                  { id: "node-cert-yes2", title: "Yes", isSelection: true, isRequired: true }
                ]
              }
            ]
          },
          {
            id: "node-cert-no-root",
            title: "No",
            isSelection: true,
            children: [
              { id: "node-cert-placeholder", title: "Name this feature", isPlaceholder: true }
            ]
          }
        ]
      },
      {
        id: "node-door",
        title: "Door",
        isSelection: true,
        children: [
          { id: "node-inswing", title: "IN swing", isOption: true },
          { id: "node-outswing", title: "Out swing", isOption: true },
          { id: "node-colors", title: "red;blue;green;orange;whatever", isOption: true }
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
});

function loadDoorList() {
  const saved = localStorage.getItem("door_meta_list_v3");
  return saved ? JSON.parse(saved) : initialDoorMetaList;
}

function saveDoorList() {
  localStorage.setItem("door_meta_list_v3", JSON.stringify(doorList));
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
      <td>${door.children ? door.children.length : 0} Top Features</td>
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

  renderTreeEditor(door);
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

function renderTreeEditor(door) {
  const wrapper = document.getElementById("tree-root-wrapper");
  wrapper.innerHTML = "";

  // 1. Root Header
  const rootHeader = document.createElement("div");
  rootHeader.className = "tree-root-header";
  rootHeader.innerHTML = `
    <span class="caret-icon">&#9660;</span>
    <span class="root-icon">&#129691;</span>
    <span>${door.name}</span>
    <button class="icon-action-btn" title="Add Feature" onclick="addNode('${door.id}', null)">&#10555;</button>
  `;
  wrapper.appendChild(rootHeader);

  // 2. Render Children List
  const childrenContainer = document.createElement("div");
  childrenContainer.className = "tree-children";

  if (door.children && door.children.length > 0) {
    door.children.forEach(child => {
      childrenContainer.appendChild(renderTreeNode(child, door));
    });
  }

  wrapper.appendChild(childrenContainer);
}

function renderTreeNode(node, door) {
  const nodeContainer = document.createElement("div");
  nodeContainer.className = "tree-node-item";

  const hasChildren = node.children && node.children.length > 0;

  // Row Markup
  const row = document.createElement("div");
  row.className = "tree-node-row";

  // Title class check
  const titleClass = node.isPlaceholder ? "node-title-placeholder" : "node-title-text";
  const iconType = node.isOption ? "&#11046;" : "&#9776;";

  row.innerHTML = `
    <div class="tree-node-left">
      <span class="drag-handle">::</span>
      <span class="caret-icon ${hasChildren ? "" : "hidden"}">&#9660;</span>
      <span class="type-icon">${iconType}</span>
      <span class="${titleClass}" onclick="renameNodePrompt('${door.id}', '${node.id}')">${node.title}</span>
    </div>
    <div class="tree-node-right">
      ${node.isSelection ? `<span class="badge-tag badge-selection">Selection</span>` : ""}
      ${node.isRequired ? `<span class="badge-tag badge-required">Required</span>` : ""}
      <div class="node-actions">
        <button class="icon-action-btn" title="Add Child Feature" onclick="addNode('${door.id}', '${node.id}')">&#10555;</button>
        <button class="icon-action-btn" title="Settings">&#9881;</button>
        <button class="icon-action-btn" title="Link/Reference">&#128279;</button>
        <button class="icon-action-btn" title="Delete" onclick="deleteNode('${door.id}', '${node.id}')">&times;</button>
      </div>
    </div>
  `;

  nodeContainer.appendChild(row);

  // Render Children recursively
  if (hasChildren) {
    const childWrapper = document.createElement("div");
    childWrapper.className = "tree-children";
    node.children.forEach(child => {
      childWrapper.appendChild(renderTreeNode(child, door));
    });
    nodeContainer.appendChild(childWrapper);

    // Toggle collapse
    const caret = row.querySelector(".caret-icon");
    if (caret) {
      caret.addEventListener("click", () => {
        caret.classList.toggle("collapsed");
        childWrapper.classList.toggle("hidden");
      });
    }
  }

  return nodeContainer;
}

function findAndOperate(nodes, targetId, callback) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === targetId) {
      callback(nodes, i);
      return true;
    }
    if (nodes[i].children && findAndOperate(nodes[i].children, targetId, callback)) {
      return true;
    }
  }
  return false;
}

function addNode(doorId, parentNodeId) {
  const door = doorList.find(d => d.id === doorId);
  if (!door) return;

  const title = prompt("Enter Feature/Option Name:", "Name this feature");
  if (!title) return;

  const newNode = {
    id: "node-" + Date.now(),
    title: title,
    isSelection: true,
    children: []
  };

  if (!parentNodeId) {
    if (!door.children) door.children = [];
    door.children.push(newNode);
  } else {
    findAndOperate(door.children, parentNodeId, (arr, idx) => {
      if (!arr[idx].children) arr[idx].children = [];
      arr[idx].children.push(newNode);
    });
  }

  saveDoorList();
  renderTreeEditor(door);
}

function renameNodePrompt(doorId, nodeId) {
  const door = doorList.find(d => d.id === doorId);
  if (!door) return;

  findAndOperate(door.children, nodeId, (arr, idx) => {
    const currentTitle = arr[idx].title;
    const newTitle = prompt("Rename Feature/Option:", currentTitle);
    if (newTitle) {
      arr[idx].title = newTitle;
      arr[idx].isPlaceholder = false;
    }
  });

  saveDoorList();
  renderTreeEditor(door);
}

function deleteNode(doorId, nodeId) {
  const door = doorList.find(d => d.id === doorId);
  if (!door) return;

  if (confirm("Delete this feature and its sub-features?")) {
    findAndOperate(door.children, nodeId, (arr, idx) => {
      arr.splice(idx, 1);
    });
    saveDoorList();
    renderTreeEditor(door);
  }
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
        children: [
          { id: "node-init", title: "Main Feature", isSelection: true, children: [] }
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