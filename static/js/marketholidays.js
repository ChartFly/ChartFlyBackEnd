async function loadMarketHolidays() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/holidays/year/2025");
        if (!response.ok) throw new Error("Failed to fetch market holidays");

        const holidays = await response.json();
        const table = document.getElementById("holidays-table");
        table.innerHTML = "";

        // Helper function to sanitize data for XSS prevention
        const sanitizeInput = (input) => {
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        holidays.forEach(holiday => {
            const name = sanitizeInput(holiday.name || "N/A");
            const date = sanitizeInput(holiday.date || "N/A");
            const status = sanitizeInput(holiday.status || "Unknown");

            const row = `
                <tr>
                    <td>${name}</td>
                    <td>${date}</td>
                    <td>${status}</td>
                    <td>
                        <button onclick="editHoliday('${holiday.id}')">Edit</button>
                        <button onclick="deleteHoliday('${holiday.id}')">Delete</button>
                    </td>
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

// Example function placeholders for Edit and Delete
function editHoliday(id) {
    console.log(`Edit holiday with ID: ${id}`);
    // Implement the edit functionality here, including authorization
}

function deleteHoliday(id) {
    console.log(`Delete holiday with ID: ${id}`);
    // Implement the delete functionality here, ensuring authorization checks
}