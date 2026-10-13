// Default Meta-Product Schema
const defaultMetaProduct = {
  id: "meta-001",
  name: "Smart Watch Platform",
  line: "Wearables Series X",
  creator: "Alex Rivera",
  lastEditor: "Jordan Lee",
  lastModified: "2026-10-13",
  categories: [
    {
      id: "chassis",
      name: "Case Material & Size",
      type: "select",
      options: [
        { id: "aluminum-41", name: "Aluminum 41mm", desc: "Lightweight aerospace grade aluminum." },
        { id: "titanium-45", name: "Titanium 45mm", desc: "Rugged finish with high durability." },
        { id: "ceramic-45", name: "Ceramic Edition 45mm", desc: "Premium polished finish." }
      ],
      selected: "aluminum-41"
    },
    {
      id: "display",
      name: "Display Glass",
      type: "select",
      options: [
        { id: "oled", name: "Ion-X Glass OLED", desc: "Standard high brightness OLED panel." },
        { id: "sapphire", name: "Sapphire Crystal OLED", desc: "Ultra scratch-resistant sapphire layer." }
      ],
      selected: "oled"
    },
    {
      id: "modules",
      name: "Internal Modules",
      type: "checkbox",
      options: [
        { id: "gps", name: "GPS Module", desc: "Dual-frequency satellite positioning.", active: true },
        { id: "lte", name: "Cellular LTE", desc: "Standalone connectivity without phone.", active: false },
        { id: "ecg", name: "ECG Sensor", desc: "Electrical heart rate sensor.", active: true },
        { id: "sp02", name: "Blood Oxygen Sensor", desc: "Optical pulse oximeter module.", active: false }
      ]
    }
  ]
};

// Active State
let currentMeta = loadSavedMeta() || defaultMetaProduct;

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateSummaryBar();
  renderSidebar();
  renderCanvas();

  window.addEventListener("resize", drawConnectors);
});

function loadSavedMeta() {
  const saved = localStorage.getItem("active_meta_product");
  return saved ? JSON.parse(saved) : null;
}

function saveMetaState() {
  localStorage.setItem("active_meta_product", JSON.stringify(currentMeta));
}

function updateSummaryBar() {
  document.getElementById("meta-name").innerText = currentMeta.name;
  document.getElementById("meta-line").innerText = currentMeta.line || "N/A";
  document.getElementById("meta-creator").innerText = currentMeta.creator;
  document.getElementById("meta-editor").innerText = currentMeta.lastEditor;
  document.getElementById("meta-date").innerText = currentMeta.lastModified;

  // Calculate active node count
  let count = 0;
  currentMeta.categories.forEach(cat => {
    if (cat.type === "checkbox") {
      count += cat.options.filter(o => o.active).length;
    } else if (cat.selected) {
      count += 1;
    }
  });
  document.getElementById("meta-count").innerText = count;
}

function renderSidebar() {
  const container = document.getElementById("controls-container");
  container.innerHTML = "";

  currentMeta.categories.forEach(cat => {
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
          currentMeta.lastEditor = "Alex Rivera";
          currentMeta.lastModified = new Date().toISOString().split("T")[0];
          saveMetaState();
          updateSummaryBar();
          renderCanvas();
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
        currentMeta.lastEditor = "Alex Rivera";
        currentMeta.lastModified = new Date().toISOString().split("T")[0];
        saveMetaState();
        updateSummaryBar();
        renderCanvas();
      });
      group.appendChild(select);
    }

    container.appendChild(group);
  });
}

function renderCanvas() {
  const canvas = document.getElementById("tree-canvas");
  canvas.innerHTML = "";

  // 1. Root Node
  const root = document.createElement("div");
  root.id = "root-node";
  root.className = "node-root";
  root.innerText = currentMeta.name;
  canvas.appendChild(root);

  // 2. Component Grid
  const grid = document.createElement("div");
  grid.className = "node-grid";

  currentMeta.categories.forEach(cat => {
    if (cat.type === "checkbox") {
      cat.options.filter(o => o.active).forEach(opt => {
        grid.appendChild(createNodeCard(opt.id, opt.name, opt.desc));
      });
    } else {
      const selectedOpt = cat.options.find(o => o.id === cat.selected);
      if (selectedOpt) {
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
  const btnClose = document.getElementById("btn-close-modal");
  const btnCancel = document.getElementById("btn-cancel-modal");
  const formCreate = document.getElementById("form-create-meta");
  const btnEditDetails = document.getElementById("btn-edit-details");

  btnCreate.addEventListener("click", () => modal.classList.remove("hidden"));
  btnClose.addEventListener("click", () => modal.classList.add("hidden"));
  btnCancel.addEventListener("click", () => modal.classList.add("hidden"));

  btnEditDetails.addEventListener("click", () => {
    document.getElementById("input-name").value = currentMeta.name;
    document.getElementById("input-line").value = currentMeta.line || "";
    document.getElementById("input-creator").value = currentMeta.creator;
    modal.classList.remove("hidden");
  });

  formCreate.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("input-name").value.trim();
    const line = document.getElementById("input-line").value.trim();
    const creator = document.getElementById("input-creator").value.trim() || "Anonymous";

    currentMeta.name = name;
    currentMeta.line = line;
    currentMeta.creator = creator;
    currentMeta.lastEditor = creator;
    currentMeta.lastModified = new Date().toISOString().split("T")[0];

    saveMetaState();
    updateSummaryBar();
    renderSidebar();
    renderCanvas();

    modal.classList.add("hidden");
    formCreate.reset();
  });
}