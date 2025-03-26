async function loadMarketHolidays() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/holidays/year/2025");
        if (!response.ok) throw new Error("Failed to fetch market holidays");

        const holidays = await response.json();
        const table = document.getElementById("holidays-table");
        table.innerHTML = "";

        const sanitizeInput = (input) =>
            typeof input === "string"
                ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
                : input;

        holidays.forEach(holiday => {
            const name = sanitizeInput(holiday.name || "N/A");
            const date = sanitizeInput(holiday.date || "N/A");
            const status = sanitizeInput(holiday.status || "Unknown");

            const row = `
                <tr>
                    <td class="col-actions">
                        <div class="action-buttons">
                            <button onclick="editHoliday('${holiday.id}')">Edit</button>
                            <button onclick="deleteHoliday('${holiday.id}')">Delete</button>
                        </div>
                    </td>
                    <td class="col-wide">${name}</td>
                    <td class="col-medium">${date}</td>
                    <td class="col-short">${status}</td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load holidays:", error);
        const table = document.getElementById("holidays-table");
        table.innerHTML = `<tr><td colspan="4">Failed to load holidays. Please try again later.</td></tr>`;
    }
}

// 🔧 Placeholder action functions
function editHoliday(id) {
    console.log(`Edit holiday with ID: ${id}`);
}

function deleteHoliday(id) {
    console.log(`Delete holiday with ID: ${id}`);
}