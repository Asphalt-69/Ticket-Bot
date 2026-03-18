const socket = io();

async function fetchPanels() {
  const res = await fetch('/api/panels');
  const panels = await res.json();
  const list = document.getElementById('panels-list');
  if (!list) return;
  list.innerHTML = '';
  panels.forEach(p => {
    const li = document.createElement('li');
    li.textContent = `${p.name} [${p.type}] [${p.uiType}] Category:${p.categoryId} Roles:${(p.roles || []).join(', ')} MergedGroup:${p.mergedGroup || '-'} ID:${p._id}`;
    list.appendChild(li);
  });
}

async function createPanel(e) {
  e.preventDefault();
  const form = e.target;
  const body = {
    name: form.panelName.value,
    categoryId: form.categoryId.value,
    roles: form.roles.value.split(',').map(r => r.trim()).filter(Boolean),
    uiType: form.uiType.value,
    type: form.panelType.value,
    embedTitle: form.embedTitle.value,
    embedDescription: form.embedDescription.value,
    embedColor: form.embedColor.value,
    mergedGroup: form.mergedGroup.value,
  };
  const res = await fetch('/api/panels', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (res.ok) {
    form.reset();
    fetchPanels();
  }
}

if (document.getElementById('panel-form')) {
  document.getElementById('panel-form').addEventListener('submit', createPanel);
}

socket.on('panel_created', fetchPanels);
socket.on('panel_updated', fetchPanels);
socket.on('panel_deleted', fetchPanels);

fetchPanels();
