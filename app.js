// Multi-Product Meta-Product Data Store
const state = {
  activeModelId: 'door-001',
  products: [
    {
      id: 'door-001',
      name: 'Entry Door System v2.4',
      line: 'ProSeries Exterior',
      creator: 'Alex Rivera',
      lastEditor: 'Jordan Lee',
      lastModified: '2026-10-13',
      features: [
        {
          id: 'f1',
          name: 'Door Slab',
          type: 'category',
          required: true,
          children: [
            { id: 'f1-1', name: 'Material', type: 'choice', required: true, children: [
              { id: 'f1-1-1', name: 'Fiberglass', type: 'choice' },
              { id: 'f1-1-2', name: 'Steel', type: 'choice' },
              { id: 'f1-1-3', name: 'Solid Oak', type: 'choice' }
            ]},
            { id: 'f1-2', name: 'Slab Style', type: 'choice', required: true, children: [
              { id: 'f1-2-1', name: 'Flush Panel', type: 'choice' },
              { id: 'f1-2-2', name: '6-Panel Traditional', type: 'choice' },
              { id: 'f1-2-3', name: 'Craftsman 3-Panel', type: 'choice' }
            ]}
          ]
        },
        {
          id: 'f2',
          name: 'Glazing & Glass Options',
          type: 'category',
          required: false,
          children: [
            { id: 'f2-1', name: 'Glass Style', type: 'choice', children: [
              { id: 'f2-1-1', name: 'Clear Insulated', type: 'choice' },
              { id: 'f2-1-2', name: 'Frosted Privacy', type: 'choice' },
              { id: 'f2-1-3', name: 'Decorative Stained', type: 'choice' }
            ]},
            { id: 'f2-2', name: 'Impact Resistance Rating', type: 'choice', children: [
              { id: 'f2-2-1', name: 'Standard Non-Impact', type: 'choice' },
              { id: 'f2-2-2', name: 'HVHZ Coastal Impact Rated', type: 'choice' }
            ]}
          ]
        },
        {
          id: 'f3',
          name: 'Hardware & Locksets',
          type: 'category',
          required: true,
          children: [
            { id: 'f3-1', name: 'Finish', type: 'choice', children: [
              { id: 'f3-1-1', name: 'Matte Black', type: 'choice' },
              { id: 'f3-1-2', name: 'Satin Nickel', type: 'choice' },
              { id: 'f3-1-3', name: 'Oil Rubbed Bronze', type: 'choice' }
            ]}
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
    },
    {
      id: 'door-002',
      name: 'Sliding Patio Glass System',
      line: 'VistaView Series',
      creator: 'Samantha Chen',
      lastEditor: 'Alex Rivera',
      lastModified: '2026-10-11',
      features: [
        {
          id: 'p2-f1',
          name: 'Panel Configuration',
          type: 'category',
          required: true,
          children: [
            { id: 'p2-f1-1', name: 'Number of Panels', type: 'choice', children: [
              { id: 'p2-f1-1-1', name: '2-Panel Slider', type: 'choice' },
              { id: 'p2-f1-1-2', name: '3-Panel Multi-Slide', type: 'choice' }
            ]}
          ]
        }
      ],
      constraints: []
    }
  ]
};

// Helper to get active product
function getActiveProduct() {
  return state.products.find(p => p.id === state.activeModelId) || state.products[0];
}

// Initialize Application
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

// Navigation Handler
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

      if (targetView === 'metas') {
        renderMetaProductsTable();
      }
    });
  });
}

// Render Meta Products Tabular List
function renderMetaProductsTable() {
  const tbody = document.getElementById('tbody-metas');
  tbody.innerHTML = '';

  state.products.forEach(prod => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${prod.name}</strong></td>
      <td>${prod.line || 'Standard'}</td>
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

  // Switch view to Feature Hierarchy
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

// Header Create Meta Product Button
function setupHeaderCreateButton() {
  const btnCreate = document.getElementById('btn-create-meta-header');
  if (btnCreate) {
    btnCreate.addEventListener('click', () => {
      const newId = 'door-' + Date.now();
      const newProduct = {
        id: newId,
        name: 'New Custom Meta Product',
        line: 'Custom Series',
        creator: 'Alex Rivera',
        lastEditor: 'Alex Rivera',
        lastModified: new Date().toISOString().split('T')[0],
        features: [
          {
            id: newId + '-f1',
            name: 'Root Feature Component',
            type: 'category',
            required: true,
            children: [
              { id: newId + '-f1-1', name: 'Default Choice Option', type: 'choice' }
            ]
          }
        ],
        constraints: []
      };

      state.products.push(newProduct);
      openProduct(newId);
    });
  }
}

// Render Feature Tree
function renderFeatureTree() {
  const container = document.getElementById('feature-tree');
  container.innerHTML = '';
  const prod = getActiveProduct();

  function createNodeElement(node, isRoot = false) {
    const wrapper = document.createElement('div');
    wrapper.className = `tree-node ${isRoot ? 'root-node' : ''}`;

    const content = document.createElement('div');
    content.className = 'tree-node-content';

    const countRef = getConstraintRefCount(node.name);

    content.innerHTML = `
      <i data-lucide="${node.children ? 'folder' : 'file-text'}" class="icon-sm"></i>
      <span class="tree-node-title">${node.name}</span>
      <span class="tree-tag">${node.type || 'choice'}</span>
      ${countRef > 0 ? `<span class="constraint-count-badge">${countRef} constraint(s)</span>` : ''}
      <button class="btn-icon edit-feature-btn" data-id="${node.id}">
        <i data-lucide="edit-2"></i>
      </button>
    `;

    wrapper.appendChild(content);

    if (node.children && node.children.length > 0) {
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-children';
      node.children.forEach(child => {
        childrenContainer.appendChild(createNodeElement(child));
      });
      wrapper.appendChild(childrenContainer);
    }

    return wrapper;
  }

  prod.features.forEach(rootFeature => {
    container.appendChild(createNodeElement(rootFeature, true));
  });

  initLucideIcons();
  attachTreeEventListeners();
}

function getConstraintRefCount(featureName) {
  const prod = getActiveProduct();
  return prod.constraints.filter(c => c.affectedFeatures.includes(featureName)).length;
}

function attachTreeEventListeners() {
  document.querySelectorAll('.edit-feature-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openDetailDrawer(id);
    });
  });
}

// Feature Detail Drawer
function openDetailDrawer(featureId) {
  state.selectedFeatureId = featureId;
  const prod = getActiveProduct();
  const feature = findFeatureById(prod.features, featureId);
  if (!feature) return;

  document.getElementById('detail-name').value = feature.name;
  document.getElementById('detail-type').value = feature.type || 'choice';
  document.getElementById('detail-required').checked = !!feature.required;

  const drawer = document.getElementById('feature-drawer');
  const backdrop = document.getElementById('drawer-backdrop');

  drawer.classList.add('open');
  backdrop.classList.add('open');

  // Load related constraints
  const chipContainer = document.getElementById('drawer-related-constraints');
  chipContainer.innerHTML = '';
  const related = prod.constraints.filter(c => c.affectedFeatures.includes(feature.name));

  if (related.length === 0) {
    chipContainer.innerHTML = '<span class="text-muted" style="color:var(--text-muted); font-size:0.85rem;">No rules directly affect this feature.</span>';
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

  closeBtn.addEventListener('click', close);
  cancelBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);

  saveBtn.addEventListener('click', () => {
    if (!state.selectedFeatureId) return;
    const prod = getActiveProduct();
    const feature = findFeatureById(prod.features, state.selectedFeatureId);
    if (feature) {
      feature.name = document.getElementById('detail-name').value;
      feature.type = document.getElementById('detail-type').value;
      feature.required = document.getElementById('detail-required').checked;
      prod.lastModified = new Date().toISOString().split('T')[0];
      renderFeatureTree();
      updateExportCode();
      close();
    }
  });
}

function findFeatureById(nodes, id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const res = findFeatureById(node.children, id);
      if (res) return res;
    }
  }
  return null;
}

// Constraints Overview Table
function renderConstraintsTable() {
  const tbody = document.getElementById('tbody-constraints');
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

// Bulk Add Modal
function setupBulkModal() {
  const btnBulk = document.getElementById('btn-bulk-add');
  const modal = document.getElementById('bulk-modal');
  const closeBtn = document.getElementById('btn-close-bulk');
  const cancelBtn = document.getElementById('btn-cancel-bulk');
  const processBtn = document.getElementById('btn-process-bulk');
  const parentSelect = document.getElementById('bulk-parent-select');

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

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  processBtn.addEventListener('click', () => {
    const rawText = document.getElementById('bulk-input').value;
    const parentId = parentSelect.value;
    if (!rawText.trim()) return;

    const items = rawText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    const prod = getActiveProduct();
    const parent = findFeatureById(prod.features, parentId);

    if (parent) {
      if (!parent.children) parent.children = [];
      items.forEach((item, idx) => {
        parent.children.push({
          id: `${parent.id}-bulk-${Date.now()}-${idx}`,
          name: item,
          type: 'choice'
        });
      });
      prod.lastModified = new Date().toISOString().split('T')[0];
      renderFeatureTree();
      updateExportCode();
      document.getElementById('bulk-input').value = '';
      closeModal();
    }
  });
}

// Interactive Test Engine Simulation
function setupTestingEngine() {
  const container = document.getElementById('test-form-container');
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
  if (hasConflict) {
    statusEl.innerHTML = '<span style="color:#ef4444; font-weight:bold;">❌ Invalid Combination Detected</span>';
  } else {
    statusEl.innerHTML = '<span style="color:#10b981; font-weight:bold;">✔ Valid Entry Door Configuration</span>';
  }
}

// Export Code Generator
function updateExportCode() {
  const exportContainer = document.getElementById('export-json-code');
  if (exportContainer) {
    const prod = getActiveProduct();
    exportContainer.textContent = JSON.stringify(prod, null, 2);
  }
}