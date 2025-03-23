async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.username}</td>
                    <td>${user.role || "Admin"}</td>
                    <td>${new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load users:", error);
        const table = document.getElementById("user-table");
        table.innerHTML = `<tr><td colspan="4">Error loading users</td></tr>`;
    }
}