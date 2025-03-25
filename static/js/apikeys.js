async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = "";

        // Add table headers with new usage limits
        const headers = `
            <tr>
                <th>Label</th>
                <th>Provider</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Sec</th>
                <th>Min</th>
                <th>5 Min</th>
                <th>10 Min</th>
                <th>15 Min</th>
                <th>Hour</th>
                <th>Day</th>
                <th>Actions</th>
            </tr>
        `;
        table.innerHTML += headers;

        const sanitizeInput = (input) => {
            return input?.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "N/A";
        };

        apiKeys.forEach(key => {
            const row = `
                <tr>
                    <td>${sanitizeInput(key.key_label)}</td>
                    <td>${sanitizeInput(key.provider)}</td>
                    <td>${sanitizeInput(key.priority_order)}</td>
                    <td>${sanitizeInput(key.status)}</td>
                    <td>${sanitizeInput(key.usage_limit_sec)}</td>
                    <td>${sanitizeInput(key.usage_limit_min)}</td>
                    <td>${sanitizeInput(key.usage_limit_5min)}</td>
                    <td>${sanitizeInput(key.usage_limit_10min)}</td>
                    <td>${sanitizeInput(key.usage_limit_15min)}</td>
                    <td>${sanitizeInput(key.usage_limit_hour)}</td>
                    <td>${sanitizeInput(key.usage_limit_day)}</td>
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
        table.innerHTML = `<tr><td colspan="12">Failed to load data. Please try again later.</td></tr>`;
    }
}

function editApiKey(id) {
    console.log(`Edit API Key with ID: ${id}`);
    // Implement the edit functionality here
}

function deleteApiKey(id) {
    console.log(`Delete API Key with ID: ${id}`);
    // Implement the delete functionality here
}