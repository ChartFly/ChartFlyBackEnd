async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        const sanitizeInput = (input) => {
            if (typeof input !== "string") return input;
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        users.forEach(user => {
            console.log("🔍 User record:", user);

            const fullName = sanitizeInput(user.name || "—");
            const email = sanitizeInput(user.email || "—");
            const username = sanitizeInput(user.username || "—");
            const accessTabs = Array.isArray(user.access)
                ? user.access.map(sanitizeInput).join(", ")
                : "None";

            const row = `
                <tr>
                    <td class="col-actions">
                        <div class="action-buttons">
                            <button onclick="editUser('${user.id}')">Edit</button>
                            <button onclick="deleteUser('${user.id}')">Delete</button>
                        </div>
                    </td>
                    <td class="col-medium">${fullName}</td>
                    <td class="col-wide">${email}</td>
                    <td class="col-medium">${username}</td>
                    <td class="col-wide">${accessTabs}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

    } catch (error) {
        console.error("❌ Failed to load users:", error);
        const table = document.getElementById("user-table");
        table.innerHTML = `<tr><td colspan="5">Unable to load users at the moment. Please try again later.</td></tr>`;
    }
}

// ✅ Placeholder actions (for future)
function editUser(userId) {
    console.log(`📝 Edit user with ID: ${userId}`);
    // TODO: Open edit modal or form
}

function deleteUser(userId) {
    console.log(`🗑️ Delete user with ID: ${userId}`);
    // TODO: Show confirm and delete request
}