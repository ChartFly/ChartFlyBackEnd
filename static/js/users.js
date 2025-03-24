async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        // Helper function to sanitize user input for XSS prevention
        const sanitizeInput = (input) => {
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Escape < and >
        };

        users.forEach(user => {
            const username = sanitizeInput(user.username);
            const role = sanitizeInput(user.role || "Admin");
            const createdAt = new Date(user.created_at).toLocaleDateString();

            const row = `
                <tr>
                    <td>${username}</td>
                    <td>${role}</td>
                    <td>${createdAt}</td>
                    <td>
                        <button onclick="editUser('${user.id}')">Edit</button>
                        <button onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load users:", error);
        const table = document.getElementById("user-table");
        table.innerHTML = `<tr><td colspan="4">Unable to load users at the moment. Please try again later.</td></tr>`;
    }
}

// Example function placeholders for Edit and Delete
function editUser(userId) {
    console.log(`Edit user with ID: ${userId}`);
    // Implement edit functionality here
}

function deleteUser(userId) {
    console.log(`Delete user with ID: ${userId}`);
    // Implement delete functionality here
}