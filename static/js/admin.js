document.addEventListener("DOMContentLoaded", function () {
    const holidayTab = document.getElementById("market-holidays-tab");
    const holidaySection = document.getElementById("market-holidays-section");

    // Hide the section initially
   // holidaySection.style.display = "none";

    holidayTab.addEventListener("click", function () {
        // Toggle visibility
        if (holidaySection.style.display === "none") {
            holidaySection.style.display = "block";
            fetchMarketHolidays(); // Fetch holidays when tab is opened
        } else {
            holidaySection.style.display = "none";
        }
    });
});

async function fetchMarketHolidays() {
    try {
        const response = await fetch('https://chartflybackend.onrender.com/api/holidays/2025');
        if (!response.ok) throw new Error("Network response was not ok");
        const holidays = await response.json();
        let tableBody = document.getElementById("holidays-table");
        tableBody.innerHTML = "";

        if (!holidays || holidays.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No holidays found.</td></tr>";
            return;
        }

        holidays.forEach(h => {
            tableBody.innerHTML += `<tr>
                <td>${h.holiday_name || "N/A"}</td>
                <td>${h.holiday_date || "N/A"}</td>
                <td>${h.market_status || "N/A"}</td>
                <td><button onclick="deleteHoliday('${h.id}')">Delete</button></td>
            </tr>`;
        });
    } catch (error) {
        console.error("Error fetching holidays:", error);
        document.getElementById("holidays-table").innerHTML = "<tr><td colspan='4'>Failed to load holidays.</td></tr>";
    }
}

async function deleteHoliday(id) {
    if (confirm("Are you sure you want to delete this holiday?")) {
        try {
            const response = await fetch(`https://chartflybackend.onrender.com/api/holidays/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error("Failed to delete holiday");
            fetchMarketHolidays();
        } catch (error) {
            console.error("Error deleting holiday:", error);
        }
    }
}
