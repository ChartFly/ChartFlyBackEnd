document.addEventListener("DOMContentLoaded", function () {
    updateMarketStatus();
    fetchHaltedStocks();
    fetchMarketHolidays();
    setupWatchlistControls();
});

/* ✅ Fetch Market Holidays from Backend */
async function fetchMarketHolidays() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/holidays/year/2025");
        if (!response.ok) throw new Error("Failed to fetch");
        const holidays = await response.json();
        const holidaySection = document.getElementById("market-holidays");

        if (!holidaySection) {
            console.error("Market Holidays section missing in HTML");
            return;
        }

        holidaySection.innerText = holidays.map(h => `${h.date}: ${h.name}`).join(" | ");
    } catch (error) {
        console.error("Error fetching holidays:", error);
        document.getElementById("market-holidays").innerText = "Failed to load holidays.";
    }
}

/* ✅ Fetch Halted Stocks from Backend */
async function fetchHaltedStocks() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/haltdetails");
        const data = await response.json();
        let tableBody = document.getElementById("halted-stocks");
        tableBody.innerHTML = "";

        data.forEach(stock => {
            let row = `<tr>
                <td>${stock.haltDate || ""}</td>
                <td>${stock.haltTime || ""}</td>
                <td>${stock.symbol || ""}</td>
                <td>${stock.issueName || ""}</td>
                <td>${stock.market || ""}</td>
                <td>${stock.reasonCode || ""}</td>
                <td>${stock.definition || ""}</td>
                <td>${stock.haltPrice || "N/A"}</td>
                <td>${stock.resDate || "N/A"}</td>
                <td>${stock.resTime || "N/A"}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error fetching halted stocks:", error);
        document.getElementById("halted-stocks").innerHTML = "<tr><td colspan='10'>Failed to load data.</td></tr>";
    }
}

/* ✅ Market Status Update */
function updateMarketStatus() {
    const now = new Date();
    const hours = now.getHours();
    const dayOfWeek = now.getDay();
    let statusElement = document.getElementById("market-status-text");
    let status = "Market Closed";

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        status = "Market Closed (Weekend)";
    } else if (hours < 9.5) {
        status = "Pre-Market Trading";
        statusElement.className = "market-status-text market-prepost";
    } else if (hours < 16) {
        status = "Market Open";
        statusElement.className = "market-status-text market-open";
    } else {
        status = "After-Market Trading";
        statusElement.className = "market-status-text market-prepost";
    }
    statusElement.innerText = status;
}

/* ✅ Watchlist Functions */
const watchlist = [];
const maxTickers = 10;

function setupWatchlistControls() {
    document.getElementById("addToWatchlist").addEventListener("click", addTicker);
    document.getElementById("clearWatchlist").addEventListener("click", clearWatchlist);
    document.getElementById("tickerInput").addEventListener("keypress", function (event) {
        if (event.key === "Enter") addTicker();
    });

    // ✅ Ensure Delete Buttons Work
    document.querySelectorAll(".deleteTicker").forEach((button, index) => {
        button.addEventListener("click", () => deleteTicker(index));
    });
}

function addTicker() {
    const tickerInput = document.getElementById("tickerInput");
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker && !watchlist.includes(ticker) && watchlist.length < maxTickers) {
        watchlist.push(ticker);
        updateWatchlistDisplay();
        fetchStockData(ticker);
        tickerInput.value = "";
    }
}

function updateWatchlistDisplay() {
    for (let i = 0; i < maxTickers; i++) {
        document.getElementById(`slot${i + 1}`).innerText = watchlist[i] || "";
    }
}

/* ✅ Delete Ticker from Watchlist, Stock Metrics, and News */
function deleteTicker(slot) {
    if (slot < watchlist.length) {
        const ticker = watchlist[slot];
        watchlist.splice(slot, 1);
        updateWatchlistDisplay();

        // Remove from Stock Metrics
        document.querySelectorAll("#stock-metrics tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker) row.remove();
        });

        // Remove from News Table
        document.querySelectorAll("#newsTable tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker) row.remove();
        });
    }
}

function clearWatchlist() {
    watchlist.length = 0;
    updateWatchlistDisplay();
    document.querySelector("#stock-metrics tbody").innerHTML = "";
    document.querySelector("#newsTable tbody").innerHTML = "";
}

/* ✅ Fetch Stock Metrics & News */
async function fetchStockData(ticker) {
    try {
        const apiKey = await getApiKey(); // ✅ Fetch API key dynamically
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`);
        const data = await response.json();
        updateMetrics(ticker, data);
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

/* ✅ Retrieve API Key from Backend */
async function getApiKey() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api_keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");
        const keys = await response.json();
        return keys.length > 0 ? keys[0].api_secret : "YOUR_API_KEY"; // Default key if none found
    } catch (error) {
        console.error("Error fetching API keys:", error);
        return "YOUR_API_KEY"; // Fallback
    }
}

/* ✅ Update Metrics Table */
function updateMetrics(ticker, data) {
    const tableBody = document.querySelector("#stock-metrics tbody");
    const row = `<tr>
        <td>${ticker}</td>
        <td>${data.c ? `$${data.c.toFixed(2)}` : "N/A"}</td>
        <td>${data.o ? `$${data.o.toFixed(2)}` : "N/A"}</td>
        <td>${data.h ? `$${data.h.toFixed(2)}` : "N/A"}</td>
        <td>${data.l ? `$${data.l.toFixed(2)}` : "N/A"}</td>
        <td>${data.pc ? `$${data.pc.toFixed(2)}` : "N/A"}</td>
    </tr>`;
    tableBody.innerHTML += row;
}