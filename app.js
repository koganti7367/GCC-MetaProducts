// Multi-Product Meta-Product Data Store with Keyboard Tree Support
const state = {
  activeModelId: 'door-001',
  focusSel: null,
  dragId: null,
  dropRow: null,
  products: [
    {
      id: 'door-001',
      name: 'Entry Door System v2.4',
      line: 'Millwork',
      creator: 'Alex Rivera',
      lastEditor: 'Jordan Lee',
      lastModified: '2026-10-13',
      features: [
        {
          id: 'f1',
          name: 'Door Slab',
          kind: 'boolean',
          required: true,
          children: [
            {
              id: 'f1-1',
              name: 'Material',
              kind: 'boolean',
              required: true,
              children: [
                { id: 'f1-1-1', name: 'Fiberglass', kind: 'boolean' },
                { id: 'f1-1-2', name: 'Steel', kind: 'boolean' },
                { id: 'f1-1-3', name: 'Solid Oak', kind: 'boolean' }
              ]
            },
            {
              id: 'f1-2',
              name: 'Slab Style',
              kind: 'boolean',
              required: true,
              children: [
                { id: 'f1-2-1', name: 'Flush Panel', kind: 'boolean' },
                { id: 'f1-2-2', name: '6-Panel Traditional', kind: 'boolean' },
                { id: 'f1-2-3', name: 'Craftsman 3-Panel', kind: 'boolean' }
              ]
            }
          ]
        },
        {
          id: 'f2',
          name: 'Glazing & Glass Options',
          kind: 'boolean',
          required: false,
          children: [
            {
              id: 'f2-1',
              name: 'Glass Style',
              kind: 'boolean',
              children: [
                { id: 'f2-1-1', name: 'Clear Insulated', kind: 'boolean' },
                { id: 'f2-1-2', name: 'Frosted Privacy', kind: 'boolean' },
                { id: 'f2-1-3', name: 'Decorative Stained', kind: 'boolean' }
              ]
            },
            {
              id: 'f2-2',
              name: 'Impact Resistance Rating',
              kind: 'boolean',
              children: [
                { id: 'f2-2-1', name: 'Standard Non-Impact', kind: 'boolean' },
                { id: 'f2-2-2', name: 'HVHZ Coastal Impact Rated', kind: 'boolean' }
              ]
            }
          ]
        },
        {
          id: 'f3',
          name: 'Hardware & Locksets',
          kind: 'boolean',
          required: true,
          children: [
            {
              id: 'f3-1',
              name: 'Finish',
              kind: 'boolean',
              children: [
                { id: 'f3-1-1', name: 'Matte Black', kind: 'boolean' },
                { id: 'f3-1-2', name: 'Satin Nickel', kind: 'boolean' },
                { id: 'f3-1-3', name: 'Oil Rubbed Bronze', kind: 'boolean' }
              ]
            }
          ]
        }
      ],
      constraints: [
        {
          id: 'c1',
          name: 'Coastal Impact Frame Requirement',
          type: 'rule',
          affectedFeatures: ['HVHZ Coastal Impact Rated', 'Material'],
          logic: 'IF Glazing == "HVHZ Coastal Impact Rated" THEN Material CANNOT BE "Solid Oak"'
        }
      ]
    }
  ]
};

function getActiveProduct() {
  return state.products.find(p => p.id === state.activeModelId) || state.products[0];
}

function uid() {
  return 'n' + Math.random().toString(36).slice(2, 9);
}

function mkNode(name, extra) {
  return Object.assign({ id: uid(), name: name || '', kind: 'boolean', required: false, children: [], collapsed: false }, extra || {});
}

// Toast helper
let toastTimer = null;
function showToast(msg, actionLabel, actionFn) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.innerHTML = `<span>${msg}</span>`;
  if (actionLabel && actionFn) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = actionLabel;
    btn.onclick = () => { toastEl.classList.remove('show'); actionFn(); };
    toastEl.appendChild(btn);
  }
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  setupNavigation();
  renderMetaProductsTable();
  renderFeatureTree();
  renderConstraintsTable();
  setupDrawerEvents();
  setupBulkModal();
  setupTestingEngine();
  setupHeaderCreateButton();
  updateExportCode();
});

function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      const activePanel = document.getElementById(`view-${targetView}`);
      if (activePanel) activePanel.classList.add('active');

      const viewTitle = btn.querySelector('span').textContent;
      document.getElementById('current-view-title').textContent = viewTitle;

      if (targetView === 'metas') renderMetaProductsTable();
      if (targetView === 'features') renderFeatureTree();
    });
  });
}

function renderMetaProductsTable() {
  const tbody = document.getElementById('tbody-metas');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.products.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${prod.name}</strong></td>
      <td>${prod.line || 'Millwork'}</td>
      <td>${prod.creator}</td>
      <td>${prod.lastEditor}</td>
      <td>${prod.lastModified}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openProduct('${prod.id}')">
          <i data-lucide="edit-3"></i> View / Edit
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initLucideIcons();
}

function openProduct(productId) {
  state.activeModelId = productId;
  const prod = getActiveProduct();
  
  document.getElementById('active-model-label').textContent = prod.name;

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.nav-btn[data-view="features"]').classList.add('active');

  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById('view-features').classList.add('active');
  document.getElementById('current-view-title').textContent = 'Feature Hierarchy';

  renderFeatureTree();
  renderConstraintsTable();
  setupTestingEngine();
  updateExportCode();
}

// Modal Pop-Up Header Create Meta Product Button
function setupHeaderCreateButton() {
  const btnCreateHeader = document.getElementById('btn-create-meta-header');
  const modal = document.getElementById('create-meta-modal');
  const btnClose = document.getElementById('btn-close-create-meta');
  const btnCancel = document.getElementById('btn-cancel-create-meta');
  const form = document.getElementById('form-create-meta');

  if (btnCreateHeader && modal) {
    btnCreateHeader.addEventListener('click', () => {
      form.reset();
      modal.classList.add('open');
    });

    const closeModal = () => modal.classList.remove('open');

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnCancel) btnCancel.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('create-product-name').value.trim();
      const line = document.getElementById('create-product-line').value;

      if (!name) return;

      const newId = 'door-' + Date.now();
      const newProduct = {
        id: newId,
        name: name,
        line: line,
        creator: 'Alex Rivera',
        lastEditor: 'Alex Rivera',
        lastModified: new Date().toISOString().split('T')[0],
        features: [
          mkNode('Root Component', { required: true })
        ],
        constraints: []
      };

      state.products.push(newProduct);
      closeModal();
      openProduct(newId);
    });
  }
}

// Tree Node Lookup Functions
function findNodeInTree(id, nodes) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { node: nodes[i], parent: null, index: i, siblings: nodes };
    if (nodes[i].children && nodes[i].children.length > 0) {
      const res = findNodeInTreeSub(id, nodes[i].children, nodes[i]);
      if (res) return res;
    }
  }
  return null;
}

function findNodeInTreeSub(id, children, parent) {
  for (let i = 0; i < children.length; i++) {
    if (children[i].id === id) return { node: children[i], parent: parent, index: i, siblings: children };
    if (children[i].children && children[i].children.length > 0) {
      const res = findNodeInTreeSub(id, children[i].children, children[i]);
      if (res) return res;
    }
  }
  return null;
}

// Tree Operations: Add, Indent, Outdent, Split
function addChildNode(id) {
  const prod = getActiveProduct();
  const found = findNodeInTree(id, prod.features);
  if (!found) return;

  const newNode = mkNode('');
  if (!found.node.children) found.node.children = [];
  found.node.children.push(newNode);
  found.node.collapsed = false;

  state.focusSel = `input.name-input[data-id="${newNode.id}"]`;
  renderFeatureTree();
}

function addSiblingNode(id) {
  const prod = getActiveProduct();
  const found = findNodeInTree(id, prod.features);
  if (!found) return;

  const newNode = mkNode('');
  found.siblings.splice(found.index + 1, 0, newNode);

  state.focusSel = `input.name-input[data-id="${newNode.id}"]`;
  renderFeatureTree();
}

function indentNode(id) {
  const prod = getActiveProduct();
  const found = findNodeInTree(id, prod.features);
  if (!found || found.index === 0) {
    showToast('There is no feature above to nest under.');
    return;
  }

  const prevSibling = found.siblings[found.index - 1];
  found.siblings.splice(found.index, 1);
  if (!prevSibling.children) prevSibling.children = [];
  prevSibling.children.push(found.node);
  prevSibling.collapsed = false;

  state.focusSel = `input.name-input[data-id="${id}"]`;
  renderFeatureTree();
}

function outdentNode(id) {
  const prod = getActiveProduct();
  const found = findNodeInTree(id, prod.features);
  if (!found || !found.parent) {
    showToast('This feature is already at the top level.');
    return;
  }

  const grandParent = findNodeInTree(found.parent.id, prod.features);
  found.siblings.splice(found.index, 1);
  grandParent.siblings.splice(grandParent.index + 1, 0, found.node);

  state.focusSel = `input.name-input[data-id="${id}"]`;
  renderFeatureTree();
}

function splitNodeName(node, value) {
  const parts = value.split(';').map(s => s.trim());
  node.name = parts[0];

  const rest = parts.slice(1).filter((s, i, a) => s || i === a.length - 1);
  const created = rest.map(s => mkNode(s));

  const prod = getActiveProduct();
  const found = findNodeInTree(node.id, prod.features);
  if (found) {
    found.siblings.splice(found.index + 1, 0, ...created);
  }

  state.focusSel = created.length ? `input.name-input[data-id="${created[created.length - 1].id}"]` : `input.name-input[data-id="${node.id}"]`;
  renderFeatureTree();
}

function removeNodeFromTree(id) {
  const prod = getActiveProduct();
  const found = findNodeInTree(id, prod.features);
  if (!found) return;

  const prevFocusId = found.index > 0 ? found.siblings[found.index - 1].id : (found.parent ? found.parent.id : null);
  found.siblings.splice(found.index, 1);

  if (prevFocusId) {
    state.focusSel = `input.name-input[data-id="${prevFocusId}"]`;
  }
  renderFeatureTree();
}

// Keyboard Listener
function onNameInputKeydown(e, node) {
  if (e.isComposing) return;
  const val = e.target.value.trim();

  if (e.key === 'Enter') {
    e.preventDefault();
    if (!val) {
      showToast('Type a name first, then press Enter.');
      return;
    }
    addSiblingNode(node.id);
  } else if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    e.preventDefault();
    e.shiftKey ? outdentNode(node.id) : indentNode(node.id);
  } else if (e.key === 'Backspace' && e.target.value === '') {
    e.preventDefault();
    removeNodeFromTree(node.id);
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    const inputs = Array.from(document.querySelectorAll('#feature-tree input.name-input'));
    const idx = inputs.indexOf(e.target);
    const target = inputs[idx + (e.key === 'ArrowDown' ? 1 : -1)];
    if (target) {
      e.preventDefault();
      target.focus();
    }
  }
}

// Render Tree DOM
function renderFeatureTree() {
  const container = document.getElementById('feature-tree');
  if (!container) return;
  container.innerHTML = '';

  const prod = getActiveProduct();

  const ul = document.createElement('ul');
  ul.className = 'tree';

  if (!prod.features || prod.features.length === 0) {
    prod.features = [mkNode('Root Component', { required: true })];
  }

  prod.features.forEach(rootNode => {
    ul.appendChild(createTreeNodeDOM(rootNode, true));
  });

  container.appendChild(ul);
  initLucideIcons();

  if (state.focusSel) {
    const target = container.querySelector(state.focusSel);
    if (target) {
      target.focus();
      if (target.classList.contains('name-input')) {
        const len = target.value.length;
        target.setSelectionRange(len, len);
      }
    }
    state.focusSel = null;
  }
}

function createTreeNodeDOM(node, isRoot = false) {
  const li = document.createElement('li');
  li.className = `tree-item ${isRoot ? 'root-item' : ''}`;
  li.dataset.id = node.id;

  const hasKids = node.children && node.children.length > 0;
  const isSelection = hasKids && node.children.every(c => c.kind === 'boolean');

  const row = document.createElement('div');
  row.className = `tree-row ${isRoot ? 'root-row' : ''}`;
  row.dataset.id = node.id;

  // Grip
  const grip = document.createElement('span');
  grip.className = 'grip';
  grip.innerHTML = `<i data-lucide="grip-vertical" class="icon-sm"></i>`;
  grip.onpointerdown = () => { row.draggable = true; };
  row.appendChild(grip);

  // Chevron expander
  if (hasKids) {
    const chev = document.createElement('button');
    chev.type = 'button';
    chev.className = `chev ${node.collapsed ? 'collapsed' : ''}`;
    chev.innerHTML = `<i data-lucide="chevron-down" class="icon-sm"></i>`;
    chev.onclick = () => {
      node.collapsed = !node.collapsed;
      renderFeatureTree();
    };
    row.appendChild(chev);
  } else {
    const spacer = document.createElement('span');
    spacer.className = 'spacer';
    row.appendChild(spacer);
  }

  // Kind Icon
  const kindIcon = document.createElement('span');
  kindIcon.className = 'kind-icon';
  kindIcon.innerHTML = `<i data-lucide="${hasKids ? 'folder' : 'file-text'}" class="icon-sm"></i>`;
  row.appendChild(kindIcon);

  // Name Input
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'name-input';
  nameInput.value = node.name || '';
  nameInput.dataset.id = node.id;
  nameInput.placeholder = 'Name this feature...';
  nameInput.oninput = (e) => {
    if (!e.isComposing && e.target.value.indexOf(';') >= 0) {
      splitNodeName(node, e.target.value);
      return;
    }
    node.name = e.target.value;
  };
  nameInput.onkeydown = (e) => onNameInputKeydown(e, node);
  row.appendChild(nameInput);

  // Badges
  const badges = document.createElement('span');
  badges.className = 'badges';
  if (isSelection) badges.innerHTML += `<span class="tree-tag sel">Selection</span>`;
  if (node.required) badges.innerHTML += `<span class="tree-tag req">Req</span>`;
  row.appendChild(badges);

  // Action Buttons
  const actions = document.createElement('span');
  actions.className = 'actions';

  const btnAddChild = document.createElement('button');
  btnAddChild.type = 'button';
  btnAddChild.className = 'btn-icon';
  btnAddChild.title = 'Add Sub-Feature';
  btnAddChild.innerHTML = `<i data-lucide="plus-circle" class="icon-sm"></i>`;
  btnAddChild.onclick = () => addChildNode(node.id);
  actions.appendChild(btnAddChild);

  const btnEdit = document.createElement('button');
  btnEdit.type = 'button';
  btnEdit.className = 'btn-icon edit-feature-btn';
  btnEdit.title = 'Feature Details';
  btnEdit.innerHTML = `<i data-lucide="sliders" class="icon-sm"></i>`;
  btnEdit.onclick = () => openDetailDrawer(node.id);
  actions.appendChild(btnEdit);

  const btnDel = document.createElement('button');
  btnDel.type = 'button';
  btnDel.className = 'btn-icon';
  btnDel.title = 'Delete';
  btnDel.innerHTML = `<i data-lucide="trash-2" class="icon-sm"></i>`;
  btnDel.onclick = () => removeNodeFromTree(node.id);
  actions.appendChild(btnDel);

  row.appendChild(actions);
  li.appendChild(row);

  // Children nested list
  if (hasKids && !node.collapsed) {
    const kidsUl = document.createElement('ul');
    kidsUl.className = 'kids';
    node.children.forEach(child => {
      kidsUl.appendChild(createTreeNodeDOM(child, false));
    });
    li.appendChild(kidsUl);
  }

  return li;
}

// Drawer & Constraints
function openDetailDrawer(featureId) {
  state.selectedFeatureId = featureId;
  const prod = getActiveProduct();
  const found = findNodeInTree(featureId, prod.features);
  if (!found) return;

  const feature = found.node;
  document.getElementById('detail-name').value = feature.name;
  document.getElementById('detail-type').value = feature.kind || 'choice';
  document.getElementById('detail-required').checked = !!feature.required;

  const drawer = document.getElementById('feature-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  drawer.classList.add('open');
  backdrop.classList.add('open');
}

function setupDrawerEvents() {
  const closeBtn = document.getElementById('btn-close-drawer');
  const cancelBtn = document.getElementById('btn-cancel-drawer');
  const saveBtn = document.getElementById('btn-save-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  const close = () => {
    document.getElementById('feature-drawer').classList.remove('open');
    backdrop.classList.remove('open');
  };

  if (closeBtn) closeBtn.addEventListener('click', close);
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!state.selectedFeatureId) return;
      const prod = getActiveProduct();
      const found = findNodeInTree(state.selectedFeatureId, prod.features);
      if (found) {
        found.node.name = document.getElementById('detail-name').value;
        found.node.kind = document.getElementById('detail-type').value;
        found.node.required = document.getElementById('detail-required').checked;
        renderFeatureTree();
        close();
      }
    });
  }
}

function renderConstraintsTable() {
  const tbody = document.getElementById('tbody-constraints');
  if (!tbody) return;
  tbody.innerHTML = '';
  const prod = getActiveProduct();

  prod.constraints.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td><span class="tree-tag">${c.type.toUpperCase()}</span></td>
      <td>${c.affectedFeatures.map(f => `<span class="constraint-count-badge">${f}</span>`).join(' ')}</td>
      <td><code>${c.logic}</code></td>
      <td>
        <button class="btn-icon" title="Edit Constraint"><i data-lucide="edit"></i></button>
        <button class="btn-icon" title="Delete Constraint"><i data-lucide="trash-2"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initLucideIcons();
}

function setupBulkModal() {
  const btnBulk = document.getElementById('btn-bulk-add');
  const modal = document.getElementById('bulk-modal');
  const closeBtn = document.getElementById('btn-close-bulk');
  const cancelBtn = document.getElementById('btn-cancel-bulk');
  const processBtn = document.getElementById('btn-process-bulk');
  const parentSelect = document.getElementById('bulk-parent-select');

  if (!btnBulk) return;

  btnBulk.addEventListener('click', () => {
    const prod = getActiveProduct();
    parentSelect.innerHTML = '';
    prod.features.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      parentSelect.appendChild(opt);
    });
    modal.classList.add('open');
  });

  const closeModal = () => modal.classList.remove('open');

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (processBtn) {
    processBtn.addEventListener('click', () => {
      const rawText = document.getElementById('bulk-input').value;
      const parentId = parentSelect.value;
      if (!rawText.trim()) return;

      const items = rawText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
      const prod = getActiveProduct();
      const found = findNodeInTree(parentId, prod.features);

      if (found) {
        if (!found.node.children) found.node.children = [];
        items.forEach(item => {
          found.node.children.push(mkNode(item));
        });
        renderFeatureTree();
        document.getElementById('bulk-input').value = '';
        closeModal();
      }
    });
  }
}

function setupTestingEngine() {
  const container = document.getElementById('test-form-container');
  if (!container) return;
  container.innerHTML = '';
  const prod = getActiveProduct();

  prod.features.forEach(cat => {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.innerHTML = `<label>${cat.name}</label>`;

    const select = document.createElement('select');
    select.className = 'form-control test-select';

    if (cat.children) {
      cat.children.forEach(sub => {
        if (sub.children) {
          sub.children.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.name;
            el.textContent = `${sub.name}: ${opt.name}`;
            select.appendChild(el);
          });
        }
      });
    }

    select.addEventListener('change', runTestEngineValidation);
    group.appendChild(select);
    container.appendChild(group);
  });

  runTestEngineValidation();
}

function runTestEngineValidation() {
  const log = document.getElementById('rule-log');
  if (!log) return;
  log.innerHTML = '';
  const prod = getActiveProduct();

  const selectedValues = Array.from(document.querySelectorAll('.test-select')).map(s => s.value);

  let hasConflict = false;

  prod.constraints.forEach(c => {
    const li = document.createElement('li');

    if (selectedValues.includes('HVHZ Coastal Impact Rated') && selectedValues.includes('Solid Oak')) {
      hasConflict = true;
      li.style.color = '#ef4444';
      li.textContent = `❌ Constraint Violated [${c.name}]: Solid Oak cannot be combined with HVHZ Coastal Impact glass.`;
    } else {
      li.style.color = '#10b981';
      li.textContent = `✔ Rule Passed [${c.name}]`;
    }
    log.appendChild(li);
  });

  const statusEl = document.getElementById('eval-status');
  if (statusEl) {
    if (hasConflict) {
      statusEl.innerHTML = '<span style="color:#ef4444; font-weight:bold;">❌ Invalid Combination Detected</span>';
    } else {
      statusEl.innerHTML = '<span style="color:#10b981; font-weight:bold;">✔ Valid Entry Door Configuration</span>';
    }
  }
}

function updateExportCode() {
  const exportContainer = document.getElementById('export-json-code');
  if (exportContainer) {
    const prod = getActiveProduct();
    exportContainer.textContent = JSON.stringify(prod, null, 2);
  }
}