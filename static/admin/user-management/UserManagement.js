// static/admin/user-management/UserManagement.js

// 🌐 API Endpoints (customize as needed)
const USERS_API = '/admin/users';
const PERMISSIONS_API = '/admin/tabs'; // e.g., returns ["Market Holidays", "API Keys", "User Management"]

// 🛠️ DOM Elements
const userTableBody = document.querySelector('#userTable tbody');
const addUserBtn = document.getElementById('addUserBtn');
const modal = document.getElementById('userModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const userForm = document.getElementById('userForm');
const modalTitle = document.getElementById('modalTitle');
const accessCheckboxes = document.getElementById('accessCheckboxes');

// 🔄 State
let editMode = false;
let editingUserId = null;

// 🚀 Initialize
window.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  loadTabAccess();
});

// 📥 Load Users into Table
async function loadUsers() {
  try {
    const response = await fetch(USERS_API);
    const users = await response.json();

    userTableBody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.username}</td>
        <td>${user.phone || ''}</td>
        <td>${(user.access || []).join(', ')}</td>
        <td>
          <button onclick="editUser('${user.id}')">Edit</button>
          <button onclick="deleteUser('${user.id}')">Delete</button>
        </td>
      `;

      userTableBody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

// 📦 Load Access Tab Options
async function loadTabAccess() {
  try {
    const response = await fetch(PERMISSIONS_API);
    const tabs = await response.json();

    accessCheckboxes.innerHTML = '';
    tabs.forEach(tab => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="checkbox" value="${tab}" name="access" />
        ${tab}
      `;
      accessCheckboxes.appendChild(label);
    });
  } catch (err) {
    console.error('Error loading tabs:', err);
  }
}

// ➕ Add New User
addUserBtn.addEventListener('click', () => {
  openModal('create');
});

// ❌ Cancel or Close Modal
cancelBtn.addEventListener('click', closeModal);
closeModalBtn.addEventListener('click', closeModal);

function closeModal() {
  modal.classList.add('hidden');
  userForm.reset();
  editingUserId = null;
  editMode = false;
  modalTitle.textContent = 'Create New User';
}

// ✏️ Edit User
function editUser(userId) {
  fetch(`${USERS_API}/${userId}`)
    .then(res => res.json())
    .then(user => {
      editingUserId = userId;
      editMode = true;
      modalTitle.textContent = 'Edit User';

      // Populate form
      userForm.name.value = user.name;
      userForm.email.value = user.email;
      userForm.phone.value = user.phone || '';
      userForm.address.value = user.address || '';
      userForm.username.value = user.username;

      // Clear password fields for editing
      userForm.password.value = '';
      userForm.confirmPassword.value = '';

      // Set access checkboxes
      document.querySelectorAll('#accessCheckboxes input').forEach(input => {
        input.checked = user.access.includes(input.value);
      });

      modal.classList.remove('hidden');
    })
    .catch(err => console.error('Failed to load user for editing:', err));
}

// 🗑️ Delete User
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;

  fetch(`${USERS_API}/${userId}`, {
    method: 'DELETE'
  })
    .then(() => loadUsers())
    .catch(err => console.error('Failed to delete user:', err));
}

// 💾 Save/Create User
userForm.addEventListener('submit', event => {
  event.preventDefault();

  const data = {
    name: userForm.name.value.trim(),
    email: userForm.email.value.trim(),
    phone: userForm.phone.value.trim(),
    address: userForm.address.value.trim(),
    username: userForm.username.value.trim(),
    password: userForm.password.value.trim(),
    confirmPassword: userForm.confirmPassword.value.trim(),
    access: Array.from(document.querySelectorAll('#accessCheckboxes input:checked')).map(cb => cb.value)
  };

  const method = editMode ? 'PUT' : 'POST';
  const url = editMode ? `${USERS_API}/${editingUserId}` : USERS_API;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save user');
      closeModal();
      loadUsers();
    })
    .catch(err => console.error('Error saving user:', err));
});