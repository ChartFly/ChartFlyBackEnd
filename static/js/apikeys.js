async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = ""; // Clear table before populating rows

        const sanitizeInput = (input) => {
            return input?.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "N/A";
        };

        // If no keys, show message
        if (apiKeys.length === 0) {
            table.innerHTML = `<tr><td colspan="12">No API keys found.</td></tr>`;
            return;
        }

        // Create and append header row once
        const headerRow = document.createElement("tr");
        const headers = [
            "Label", "Provider", "Priority", "Status",
            "Sec", "Min", "5 Min", "10 Min", "15 Min", "Hour", "Day", "Actions"
        ];
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Create and append each API key row
        apiKeys.forEach(key => {
            const row = document.createElement("tr");
            row.innerHTML = `
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
            `;
            table.appendChild(row);
        });

    } catch (error) {
        console.error("Failed to load API keys:", error);
        const table = document.getElementById("api-keys-table");
        table.innerHTML = `<tr><td colspan="12">Failed to load data. Please try again later.</td></tr>`;
    }
}

// Placeholder functions for future implementation
function editApiKey(id) {
    console.log(`Edit API Key with ID: ${id}`);
}

function deleteApiKey(id) {
    console.log(`Delete API Key with ID: ${id}`);
}