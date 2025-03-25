async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        // Helper function to sanitize user input for XSS prevention
        const sanitizeInput = (input) => {
            return (input || "").toString().replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        users.forEach(user => {
            const name = sanitizeInput(user.name);
            const username = sanitizeInput(user.username);
            const access = sanitizeInput(user.access.join(", "));

            const row = `
                <tr>
                    <td>${name}</td>
                    <td>${username}</td>
                    <td>${access}</td>
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

function editUser(userId) {
    console.log(`Edit user with ID: ${userId}`);
    // TODO: Implement edit modal or form
}

function deleteUser(userId) {
    console.log(`Delete user with ID: ${userId}`);
    // TODO: Confirm then call delete endpoint
}