// static/admin/user-management/UserManagement.js (Final Merge)

const USERS_API = '/api/users/';
const PERMISSIONS_API = '/api/users/tabs';

// 🛠️ DOM Elements
const userTableBody = document.querySelector('#userTable tbody');
const userForm = document.getElementById('userForm');
const accessCheckboxes = document.getElementById('accessCheckboxes');
const confirmBox = document.getElementById('user-confirm');

const commitBar = document.getElementById('user-commit-bar');
const commitBtn = document.getElementById('user-commit-btn');

// 🔄 State
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

    if (!Array.isArray(users)) {
      console.error("Expected user array but got:", users);
      userTableBody.innerHTML = `<tr><td colspan="6">Invalid user data received.</td></tr>`;
      return;
    }

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
        <td>${Array.isArray(user.access) ? user.access.map(a => sanitizeInput(a)).join(', ') : '—'}</td>
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

    if (!accessCheckboxes) {
      console.warn("accessCheckboxes element not found.");
      return;
    }

    accessCheckboxes.innerHTML = '';

   tabs.forEach(tab => {
     const span = document.createElement('span');
     span.classList.add('access-tab-label');
     span.textContent = tab;
     accessCheckboxes.appendChild(span);
});

  } catch (err) {
    console.error('Error loading tabs:', err);
  }
}

// ✅ Row + Action Logic
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

      updateUserConfirmBox();
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

      if (selectedUserRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">Please select one or more rows. Then select an action button.</div>`;
        return;
      }

      const selectedIndexes = Array.from(document.querySelectorAll('tr.selected-row')).map(row => row.dataset.index);
      confirmBox.innerHTML = `
        <div class="confirm-box info">
          <strong>Action:</strong> ${action.toUpperCase()}<br>
          <strong>Selected Rows:</strong> ${selectedIndexes.join(', ')}<br>
          <button class="confirm-btn yellow" onclick="confirmUserAction()">Confirm ${action}</button>
        </div>
      `;
    });
  });
}

// 🔘 Confirm Action Handler
function confirmUserAction() {
  if (!activeUserAction || selectedUserRows.size === 0) {
    confirmBox.innerHTML = `<div class="confirm-box warn">No action or rows selected.</div>`;
    return;
  }

  console.log(`✅ Confirmed [${activeUserAction}] for:`, Array.from(selectedUserRows));

  confirmBox.innerHTML = `
    <div class="confirm-box success">✅ ${capitalize(activeUserAction)} Confirmed!</div>
  `;

  activeUserAction = null;
  selectedUserRows.clear();
  document.querySelectorAll('.user-select-checkbox').forEach(box => (box.checked = false));
  document.querySelectorAll('tr.selected-row').forEach(row => row.classList.remove('selected-row'));
  document.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('active'));
  updateUserConfirmBox();
}

// 🔁 Confirm Text Feedback
function updateUserConfirmBox() {
  if (selectedUserRows.size === 0) {
    confirmBox.innerHTML = '';
    return;
  }

  confirmBox.innerHTML = `<div class="confirm-box info">${selectedUserRows.size} row(s) selected.</div>`;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function sanitizeInput(input) {
  return typeof input === 'string'
    ? input.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    : input;
}