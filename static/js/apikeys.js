async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = "";

        // Helper function to sanitize data for XSS prevention
        const sanitizeInput = (input) => {
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        apiKeys.forEach(key => {
            const label = sanitizeInput(key.label || "N/A");
            const provider = sanitizeInput(key.provider || "N/A");
            const priority = sanitizeInput(key.priority || "-");
            const status = sanitizeInput(key.status || "Unknown");

            const row = `
                <tr>
                    <td>${label}</td>
                    <td>${provider}</td>
                    <td>${priority}</td>
                    <td>${status}</td>
                    <td>
                        <button onclick="editApiKey('${key.id}')">Edit</button>
                        <button onclick="deleteApiKey('${key.id}')">Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load API keys:", error);
        const table = document.getElementById("api-keys-table");
        table.innerHTML = `<tr><td colspan="5">Failed to load data. Please try again later.</td></tr>`;
    }
}

// Example placeholders for Edit and Delete actions
function editApiKey(id) {
    console.log(`Edit API Key with ID: ${id}`);
    // Implement the edit functionality here, including authorization
}

function deleteApiKey(id) {
    console.log(`Delete API Key with ID: ${id}`);
    // Implement the delete functionality here, ensuring authorization checks
}