// ===============================================
// 📁 FILE: thinkscripts-api.js
// 🎯 PURPOSE: API helpers for ThinkScripts store
// 👥 Author: Captain & Chatman
// ===============================================

export async function fetchThinkScripts() {
  const response = await fetch("/api/stores/thinkscripts");
  if (!response.ok) {
    throw new Error("❌ Failed to fetch ThinkScripts.");
  }
  return await response.json();
}

export async function createThinkScript(data) {
  const response = await fetch("/api/stores/thinkscripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("❌ Failed to create ThinkScript.");
  }
  return await response.json();
}

export async function updateThinkScript(id, data) {
  const response = await fetch(`/api/stores/thinkscripts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("❌ Failed to update ThinkScript.");
  }
  return await response.json();
}

export async function deleteThinkScript(id) {
  const response = await fetch(`/api/stores/thinkscripts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("❌ Failed to delete ThinkScript.");
  }
  return await response.json();
}
