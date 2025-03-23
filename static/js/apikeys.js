async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = "";

        apiKeys.forEach(key => {
            const row = `
                <tr>
                    <td>${key.api_name}</td>
                    <td>${key.provider}</td>
                    <td>${key.priority}</td>
                    <td>${key.status}</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load API keys:", error);
        const table = document.getElementById("api-keys-table");
        if (table) {
            table.innerHTML = `<tr><td colspan="5">Error loading API keys</td></tr>`;
        }
    }
}