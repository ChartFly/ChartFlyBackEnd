// static/admin/user-management/UserManagement.js (Merged)

// 🌐 API Endpoints
const USERS_API = '/admin/users';
const PERMISSIONS_API = '/admin/tabs';

// 🛠️ DOM Elements
const userTableBody = document.querySelector('#userTable tbody');
const addUserBtn = document.getElementById('addUserBtn');
const modal = document.getElementById('userModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const userForm = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const accessCheckboxes = document.getElementById('accessCheckboxes');
const commitBar = document.getElementById('user-commit-bar');
const commitBtn = document.getElementById('user-commit-btn');
const confirmBox = document.getElementById('user-confirm');

// 🔄 State
let editMode = false;
let editingUserId = null;
let selectedUserRows = new Set();
let activeUserAction = null;

// 🚀 Init
window.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadTabAccess();
});

// 📥 Load Users
async function loadUsers() {
  try {
    const res = await fetch(USERS_API);
    const users = await res.json();
    userTableBody.innerHTML = '';

    users.forEach((user, index) => {
      const row = document.createElement('tr');
      row.dataset.id = user.id;
      row.dataset.index = index + 1;

      row.innerHTML = `
        <td class="col-select">
          <input type="checkbox" class="user-select-checkbox" data-id="${user.id}" />
        </td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.username}</td>
        <td>${user.phone || ''}</td>
        <td>${(user.access || []).join(', ')}</td>
      `;

      userTableBody.appendChild(row);
    });

    setupUserToolbar();
  } catch (err) {
    console.error('Error loading users:', err);
    userTableBody.innerHTML = `<tr><td colspan="6">Unable to load users.</td></tr>`;
  }
}

// 📦 Load Tab Access
async function loadTabAccess() {
  try {
    const res = await fetch(PERMISSIONS_API);
    const tabs = await res.json();
    accessCheckboxes.innerHTML = '';

    tabs.forEach(tab => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" value="${tab}" name="access" /> ${tab}
      `;
      accessCheckboxes.appendChild(label);
    });
  } catch (err) {
    console.error('Error loading tabs:', err);
  }
}

// ✅ Row Selection Handling
function setupUserToolbar() {
  document.querySelectorAll('.user-select-checkbox').forEach(box => {
    box.addEventListener('change', () => {
      const row = box.closest('tr');
      const id = box.dataset.id;

      if (box.checked) {
        selectedUserRows.add(id);
        row.classList.add('selected-row');
      } else {
        selectedUserRows.delete(id);
        row.classList.remove('selected-row');
      }

      updateUserCommitBar();
    });
  });

  const actions = ['edit', 'copy', 'paste', 'add', 'delete', 'save'];
  actions.forEach(action => {
    const btn = document.getElementById(`user-${action}-btn`);
    if (!btn) return;

    btn.addEventListener('click', () => {
      activeUserAction = action;

      actions.forEach(a => {
        const other = document.getElementById(`user-${a}-btn`);
        if (other) other.classList.remove('active');
      });

      btn.classList.add('active');
      updateUserCommitBar();
    });
  });
}

// 🔁 Update Commit Bar
function updateUserCommitBar() {
  const indexes = Array.from(document.querySelectorAll('tr.selected-row')).map(row => row.dataset.index);

  if (activeUserAction && indexes.length > 0) {
    commitBar.style.display = 'flex';
    commitBtn.textContent = `Commit ${activeUserAction.toUpperCase()} for Rows: ${indexes.join(', ')}`;
    commitBtn.classList.add('turquoise');
  } else {
    commitBar.style.display = 'none';
    commitBtn.classList.remove('turquoise');
    commitBtn.textContent = 'Commit';
  }
}

// ✅ Commit Button Action
commitBtn.addEventListener('click', () => {
  if (!activeUserAction || selectedUserRows.size === 0) return;

  if (!confirm(`Are you sure you want to ${activeUserAction.toUpperCase()} selected rows?`)) return;

  console.log(`✅ Confirmed [${activeUserAction}] for:`, Array.from(selectedUserRows));
  confirmBox.innerHTML = `<div class="confirm-box success">✅ ${capitalize(activeUserAction)} Confirmed!</div>`;

  // Reset all
  activeUserAction = null;
  selectedUserRows.clear();
  document.querySelectorAll('.user-select-checkbox').forEach(box => (box.checked = false));
  document.querySelectorAll('tr.selected-row').forEach(row => row.classList.remove('selected-row'));
  document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
  updateUserCommitBar();
});

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}