async function loadMarketHolidays() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/holidays/all");
        if (!response.ok) throw new Error("Failed to fetch market holidays");

        const holidays = await response.json();
        const table = document.getElementById("holidays-table");
        table.innerHTML = "";

        holidays.forEach(holiday => {
            const row = `
                <tr>
                    <td>${holiday.name}</td>
                    <td>${holiday.date}</td>
                    <td>${holiday.status}</td>
                    <td>
                        <button>Edit</button>
                        <button>Delete</button>
                    </td>
                </tr>
            `;
            table.innerHTML += row;
        });
    } catch (error) {
        console.error("Failed to load holidays:", error);
        const table = document.getElementById("holidays-table");
        if (table) {
            table.innerHTML = `<tr><td colspan="4">Error loading holidays</td></tr>`;
        }
    }
}