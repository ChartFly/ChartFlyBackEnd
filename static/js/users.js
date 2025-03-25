async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        // Sanitize helper
        const sanitizeInput = (input) => {
            if (typeof input !== "string") return input;
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        users.forEach(user => {
            const fullName = sanitizeInput(user.name);
            const email = sanitizeInput(user.email || "—");
            const username = sanitizeInput(user.username || "—");
            const accessTabs = Array.isArray(user.access)
                ? user.access.map(sanitizeInput).join(", ")
                : "None";

            const row = `
                <tr>
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${username}</td>
                    <td>${accessTabs}</td>
                    <td>
                        <button onclick="editUser('${user.id}')">Edit</button>
                        <button onclick="deleteUser('${user.id}')">Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });

    } catch (error) {
        console.error("Failed to load users