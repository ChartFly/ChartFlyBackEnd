async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = "";

        const sanitizeInput = (input) =>
            input?.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "N/A";

        if (apiKeys.length === 0) {
            table.innerHTML = `<tr><td colspan="12">No API keys found.</td></tr>`;
            return;
        }

        apiKeys.forEach(key => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td class="col-actions">
                    <div class="action-buttons">
                        <button onclick="editApiKey('${key.id}')">Edit</button>
                        <button onclick="deleteApiKey('${key.id}')">Delete</button>
                    </div>
                </td>
                <td class="col-medium">${sanitizeInput(key.key_label)}</td>
                <td class="col-medium">${sanitizeInput(key.provider)}</td>
                <td class="col-short">${sanitizeInput(key.priority_order)}</td>
                <td class="col-short">${sanitizeInput(key.status)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_sec)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_min)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_5min)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_10min)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_15min)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_hour)}</td>
                <td class="col-short">${sanitizeInput(key.usage_limit_day)}</td>
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Failed to load API keys:", error);
        const table = document.getElementById("api-keys-table");
        table.innerHTML = `<tr><td colspan="12">Failed to load data. Please try again later.</td></tr>`;
    }
}

function editApiKey(id) {
    console.log(`Edit API Key with ID: ${id}`);
}

function deleteApiKey(id) {
    console.log(`Delete API Key with ID: ${id}`);
}