// Global Custom Commerce Vendor Portal & Meta Products Engine
const state = {
  currentPortalTab: 'my-requests',
  currentMetaSubView: 'metas',
  activeModelId: 'door-001',
  focusSel: null,
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
          id: 'f-paint',
          name: 'Paint',
          kind: 'boolean',
          required: false,
          children: [
            {
              id: 'f-paint-metal',
              name: 'Metal paints',
              kind: 'boolean',
              children: [
                { id: 'f-pm-1', name: 'Mp_Black', kind: 'boolean' },
                { id: 'f-pm-2', name: 'Mp_blue', kind: 'boolean' },
                { id: 'f-pm-3', name: 'Mp_green', kind: 'boolean' }
              ]
            },
            {
              id: 'f-paint-color',
              name: 'Color paints',
              kind: 'boolean',
              children: [
                { id: 'f-pc-1', name: 'Red', kind: 'boolean' },
                { id: 'f-pc-2', name: 'Yellow', kind: 'boolean' },
                { id: 'f-pc-3', name: 'Orange', kind: 'boolean' }
              ]
            },
            {
              id: 'f-paint-stain',
              name: 'Stains',
              kind: 'boolean',
              children: [
                { id: 'f-ps-1', name: 'Stain_Black', kind: 'boolean' },
                { id: 'f-ps-2', name: 'Stain_Brown', kind: 'boolean' },
                { id: 'f-ps-3', name: 'Stain_Grey', kind: 'boolean' }
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
          name: 'Coastal Impact Frame Restriction',
          type: 'rule',
          affectedFeatures: ['HVHZ Coastal Impact Rated', 'Solid Oak'],
          ifFeature: 'HVHZ Coastal Impact Rated',
          ifOperator: 'equals',
          thenAction: 'exclude',
          thenFeature: 'Solid Oak',
          logic: 'IF HVHZ Coastal Impact Rated == Selected THEN Solid Oak CANNOT BE Selected'
        },
        {
          id: 'c2',
          name: 'Solid Oak Metal Paint Restriction',
          type: 'rule',
          affectedFeatures: ['Solid Oak', 'Metal paints'],
          ifFeature: 'Solid Oak',
          ifOperator: 'equals',
          thenAction: 'exclude',
          thenFeature: 'Metal paints',
          logic: 'IF Material == Solid Oak THEN Metal paints CANNOT BE Selected'
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

// Toast notification helper
let toastTimer = null;
function showToast(msg) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

document.addEventListener('DOMContentLoaded', () => {
  initLucideIcons();
  setupPortalNavigation();
  setupMetaSubNavigation();
  renderMetaProductsTable();
  renderFeatureTree();
  renderConstraintsTable();
  setupDrawerEvents();
  setupRuleConstraintModal();
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

// Left Navigation: Switching between My Requests, All Requests, and Meta Products (3rd Tab)
function setupPortalNavigation() {
  const portalNavBtns = document.querySelectorAll('.portal-nav-btn');
  const btnNewRequest = document.getElementById('btn-new-request');
  const btnCreateMeta = document.getElementById('btn-create-meta-header');
  const metaWorkspaceNav = document.getElementById('meta-workspace-nav');

  portalNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-portal-view');
      state.currentPortalTab = view;

      portalNavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.portal-view').forEach(v => v.classList.remove('active'));
      const activeView = document.getElementById(`view-${view}`);
      if (activeView) activeView.classList.add('active');

      if (view === 'meta-products') {
        metaWorkspaceNav.classList.remove('hidden');
        btnNewRequest.classList.add('hidden');
        btnCreateMeta.classList.remove('hidden');
        updatePortalBreadcrumb();
      } else {
        metaWorkspaceNav.classList.add('hidden');
        btnNewRequest.classList.remove('hidden');
        btnCreateMeta.classList.add('hidden');
        document.getElementById('portal-breadcrumb').textContent = btn.querySelector('span').textContent;
      }
    });
  });
}

// Nested Meta Products Sub-Navigation (Feature Hierarchy, Constraints, Testing, Export)
function setupMetaSubNavigation() {
  const subnavBtns = document.querySelectorAll('.meta-subnav-btn');
  subnavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const metaView = btn.getAttribute('data-meta-view');
      state.currentMetaSubView = metaView;

      subnavBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.meta-inner-view').forEach(v => v.classList.remove('active'));
      const target = document.getElementById(`meta-view-${metaView}`);
      if (target) target.classList.add('active');

      updatePortalBreadcrumb();

      if (metaView === 'metas') renderMetaProductsTable();
      if (metaView === 'features') renderFeatureTree();
      if (metaView === 'constraints') renderConstraintsTable();
      if (metaView === 'test') setupTestingEngine();
      if (metaView === 'export') updateExportCode();
    });
  });
}

function updatePortalBreadcrumb() {
  const prod = getActiveProduct();
  const breadcrumb = document.getElementById('portal-breadcrumb');
  const modelLabel = document.getElementById('sidebar-active-model');

  if (modelLabel) modelLabel.textContent = prod.name;

  const viewTitles = {
    metas: 'Product Catalog',
    features: 'Feature Hierarchy',
    constraints: 'Constraints Overview',
    test: 'Model Testing',
    export: 'Export'
  };

  if (state.currentPortalTab === 'meta-products') {
    breadcrumb.innerHTML = `Meta Products / <strong>${prod.name}</strong> / ${viewTitles[state.currentMetaSubView] || ''}`;
  }

  const badgeCount = document.getElementById('badge-constraint-count');
  if (badgeCount) badgeCount.textContent = prod.constraints ? prod.constraints.length : 0;
}

// Render Meta Products Catalog Table
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

  // Switch to Feature Hierarchy child tab
  state.currentMetaSubView = 'features';
  document.querySelectorAll('.meta-subnav-btn').forEach(b => b.classList.remove('active'));
  const featBtn = document.querySelector('.meta-subnav-btn[data-meta-view="features"]');
  if (featBtn) featBtn.classList.add('active');

  document.querySelectorAll('.meta-inner-view').forEach(v => v.classList.remove('active'));
  document.getElementById('meta-view-features').classList.add('active');

  updatePortalBreadcrumb();
  renderFeatureTree();
  renderConstraintsTable();
  setupTestingEngine();
  updateExportCode();
}

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

      const newId = 'prod-' + Date.now();
      const newProduct = {
        id: newId,
        name: name,
        line: line,
        creator: 'Koganti, Sri krishna C',
        lastEditor: 'Koganti, Sri krishna C',
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

  const grip = document.createElement('span');
  grip.className = 'grip';
  grip.innerHTML = `<i data-lucide="grip-vertical" class="icon-sm"></i>`;
  grip.onpointerdown = () => { row.draggable = true; };
  row.appendChild(grip);

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

  const kindIcon = document.createElement('span');
  kindIcon.className = 'kind-icon';
  kindIcon.innerHTML = `<i data-lucide="${hasKids ? 'folder' : 'file-text'}" class="icon-sm"></i>`;
  row.appendChild(kindIcon);

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

  const badges = document.createElement('span');
  badges.className = 'badges';
  if (isSelection) badges.innerHTML += `<span class="tree-tag sel">Selection</span>`;
  if (node.required) badges.innerHTML += `<span class="tree-tag req">Req</span>`;
  row.appendChild(badges);

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

  renderDrawerRelatedConstraints(feature);

  const drawer = document.getElementById('feature-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  drawer.classList.add('open');
  backdrop.classList.add('open');
}

function renderDrawerRelatedConstraints(feature) {
  if (!feature) return;
  const prod = getActiveProduct();
  const chipContainer = document.getElementById('drawer-related-constraints');
  chipContainer.innerHTML = '';

  const related = prod.constraints ? prod.constraints.filter(c => c.affectedFeatures.includes(feature.name)) : [];

  if (related.length === 0) {
    chipContainer.innerHTML = '<span style="color:#64748b; font-size:0.8rem;">No rules directly affect this feature.</span>';
  } else {
    related.forEach(r => {
      const chip = document.createElement('div');
      chip.className = 'tree-tag';
      chip.textContent = `${r.type.toUpperCase()}: ${r.name}`;
      chipContainer.appendChild(chip);
    });
  }
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

  if (!prod.constraints || prod.constraints.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b;">No rules created for this product yet. Click 'Create Constraint Rule' above.</td></tr>`;
    return;
  }

  prod.constraints.forEach((c, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.name}</strong></td>
      <td><span class="tree-tag">${c.type.toUpperCase()}</span></td>
      <td>${c.affectedFeatures.map(f => `<span class="tree-tag">${f}</span>`).join(' ')}</td>
      <td><code>${c.logic}</code></td>
      <td>
        <button class="btn-icon" title="Delete Constraint" onclick="deleteConstraint(${idx})"><i data-lucide="trash-2"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initLucideIcons();
}

function deleteConstraint(index) {
  const prod = getActiveProduct();
  if (prod.constraints && prod.constraints[index]) {
    prod.constraints.splice(index, 1);
    updatePortalBreadcrumb();
    renderConstraintsTable();
    setupTestingEngine();
    updateExportCode();
    showToast('Rule constraint removed.');
  }
}

function getAllFlatFeatures(nodes, result = []) {
  nodes.forEach(n => {
    result.push(n);
    if (n.children && n.children.length > 0) {
      getAllFlatFeatures(n.children, result);
    }
  });
  return result;
}

function setupRuleConstraintModal() {
  const modal = document.getElementById('rule-constraint-modal');
  const btnAddOverview = document.getElementById('btn-add-constraint');
  const btnAddDrawer = document.getElementById('btn-add-rule-from-drawer');
  const btnClose = document.getElementById('btn-close-rule-modal');
  const btnCancel = document.getElementById('btn-cancel-rule-modal');
  const form = document.getElementById('form-rule-constraint');

  const openModal = () => {
    const prod = getActiveProduct();
    const flatList = getAllFlatFeatures(prod.features);

    const ifSelect = document.getElementById('rule-if-feature');
    const thenSelect = document.getElementById('rule-then-feature');

    ifSelect.innerHTML = '';
    thenSelect.innerHTML = '';

    flatList.forEach(f => {
      const opt1 = document.createElement('option');
      opt1.value = f.name;
      opt1.textContent = f.name;
      ifSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = f.name;
      opt2.textContent = f.name;
      thenSelect.appendChild(opt2);
    });

    if (state.selectedFeatureId) {
      const found = findNodeInTree(state.selectedFeatureId, prod.features);
      if (found) {
        ifSelect.value = found.node.name;
      }
    }

    form.reset();
    modal.classList.add('open');
  };

  const closeModal = () => modal.classList.remove('open');

  if (btnAddOverview) btnAddOverview.addEventListener('click', openModal);
  if (btnAddDrawer) btnAddDrawer.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const prod = getActiveProduct();
    const name = document.getElementById('rule-name').value.trim();
    const ifFeature = document.getElementById('rule-if-feature').value;
    const ifOp = document.getElementById('rule-if-operator').value;
    const thenAction = document.getElementById('rule-then-action').value;
    const thenFeature = document.getElementById('rule-then-feature').value;

    const opText = ifOp === 'equals' ? 'Selected' : 'Not Selected';
    const actionText = thenAction === 'exclude' ? 'CANNOT BE Selected' : 'MUST BE Selected';
    const logicSummary = `IF ${ifFeature} == ${opText} THEN ${thenFeature} ${actionText}`;

    const newConstraint = {
      id: 'c-' + Date.now(),
      name,
      type: 'rule',
      affectedFeatures: [ifFeature, thenFeature],
      ifFeature,
      ifOperator: ifOp,
      thenAction,
      thenFeature,
      logic: logicSummary
    };

    if (!prod.constraints) prod.constraints = [];
    prod.constraints.push(newConstraint);

    closeModal();
    updatePortalBreadcrumb();
    renderConstraintsTable();
    setupTestingEngine();
    updateExportCode();

    showToast('Rule constraint created successfully.');
  });
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

// Model Testing Engine with Live Constraint Evaluation & Option Disabling
function setupTestingEngine() {
  const container = document.getElementById('test-form-container');
  if (!container) return;
  container.innerHTML = '';
  const prod = getActiveProduct();

  prod.features.forEach(rootFeature => {
    renderTestingFormInputs(rootFeature, container);
  });

  runTestEngineValidation();
}

function renderTestingFormInputs(node, container) {
  if (node.children && node.children.length > 0) {
    const group = document.createElement('div');
    group.className = 'form-group';
    group.dataset.featureName = node.name;
    group.innerHTML = `<label><strong>${node.name}</strong></label>`;

    const select = document.createElement('select');
    select.className = 'form-control test-select';
    select.dataset.featureName = node.name;

    select.appendChild(new Option('-- Select Option --', ''));

    node.children.forEach(child => {
      const opt = document.createElement('option');
      opt.value = child.name;
      opt.textContent = child.name;
      opt.dataset.nodeName = child.name;
      select.appendChild(opt);

      if (child.children && child.children.length > 0) {
        child.children.forEach(grandChild => {
          const opt2 = document.createElement('option');
          opt2.value = grandChild.name;
          opt2.textContent = `${child.name} ➔ ${grandChild.name}`;
          opt2.dataset.nodeName = grandChild.name;
          opt2.dataset.parentName = child.name;
          select.appendChild(opt2);
        });
      }
    });

    select.addEventListener('change', runTestEngineValidation);
    group.appendChild(select);
    container.appendChild(group);
  }
}

function runTestEngineValidation() {
  const log = document.getElementById('rule-log');
  if (!log) return;
  log.innerHTML = '';
  const prod = getActiveProduct();

  const selects = Array.from(document.querySelectorAll('.test-select'));
  const selectedValues = selects.map(s => s.value).filter(Boolean);

  // Reset disabled options
  selects.forEach(s => {
    Array.from(s.options).forEach(opt => {
      opt.disabled = false;
      opt.classList.remove('disabled-option');
      if (opt.dataset.originalLabel) {
        opt.textContent = opt.dataset.originalLabel;
      }
    });
  });

  let hasConflict = false;

  if (prod.constraints) {
    prod.constraints.forEach(c => {
      const li = document.createElement('li');
      li.style.marginBottom = '6px';
      li.style.fontSize = '0.8rem';

      const ifMatched = selectedValues.includes(c.ifFeature);

      if (c.ifOperator === 'equals' && ifMatched) {
        selects.forEach(s => {
          Array.from(s.options).forEach(opt => {
            const isTargetFeature = opt.dataset.nodeName === c.thenFeature || 
                                    opt.dataset.parentName === c.thenFeature || 
                                    opt.value === c.thenFeature;
            if (isTargetFeature) {
              opt.disabled = true;
              opt.classList.add('disabled-option');
              if (!opt.dataset.originalLabel) opt.dataset.originalLabel = opt.textContent;
              opt.textContent = `${opt.dataset.originalLabel} [DISABLED BY RULE]`;

              if (s.value === opt.value) {
                s.value = '';
                hasConflict = true;
              }
            }
          });
        });

        li.style.color = '#ef4444';
        li.textContent = `🚫 Rule Enforced [${c.name}]: ${c.thenFeature} options disabled because ${c.ifFeature} is selected.`;
      } else {
        li.style.color = '#10b981';
        li.textContent = `✔ Rule Active [${c.name}]`;
      }
      log.appendChild(li);
    });
  }

  const statusEl = document.getElementById('eval-status');
  if (statusEl) {
    if (hasConflict) {
      statusEl.innerHTML = '<span style="color:#ef4444; font-weight:bold;">⚠️ Selection Conflict Resolved (Rule Enforced)</span>';
    } else {
      statusEl.innerHTML = '<span style="color:#10b981; font-weight:bold;">✔ Valid Configuration</span>';
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