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

        if (holidaySection) {
            holidaySection.innerText = holidays.map(h => `${sanitizeInput(h.date)}: ${sanitizeInput(h.name)}`).join(" | ");
        } else {
            console.error("Market Holidays section missing in HTML");
        }
    } catch (error) {
        console.error("Error fetching holidays:", error);
        const holidaySection = document.getElementById("market-holidays");
        if (holidaySection) holidaySection.innerText = "Failed to load holidays.";
    }
}

/* ✅ Fetch Halted Stocks from Backend */
async function fetchHaltedStocks() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/haltdetails");
        const data = await response.json();
        let tableBody = document.getElementById("halted-stocks");

        if (tableBody) {
            tableBody.innerHTML = "";
            data.forEach(stock => {
                let row = `<tr>
                    <td>${sanitizeInput(stock.haltDate) || ""}</td>
                    <td>${sanitizeInput(stock.haltTime) || ""}</td>
                    <td>${sanitizeInput(stock.symbol) || ""}</td>
                    <td>${sanitizeInput(stock.issueName) || ""}</td>
                    <td>${sanitizeInput(stock.market) || ""}</td>
                    <td>${sanitizeInput(stock.reasonCode) || ""}</td>
                    <td>${sanitizeInput(stock.definition) || ""}</td>
                    <td>${sanitizeInput(stock.haltPrice) || "N/A"}</td>
                    <td>${sanitizeInput(stock.resDate) || "N/A"}</td>
                    <td>${sanitizeInput(stock.resTime) || "N/A"}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        } else {
            console.error("Halted stocks table missing in HTML");
        }
    } catch (error) {
        console.error("Error fetching halted stocks:", error);
        let tableBody = document.getElementById("halted-stocks");
        if (tableBody) tableBody.innerHTML = "<tr><td colspan='10'>Failed to load data.</td></tr>";
    }
}

/* ✅ Market Status Update */
function updateMarketStatus() {
    const now = new Date();
    const hours = now.getHours();
    const dayOfWeek = now.getDay();
    let statusElement = document.getElementById("market-status-text");

    if (!statusElement) {
        console.error("Market status element missing in HTML");
        return;
    }

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

/* ✅ Watchlist Setup */
const watchlist = [];
const maxTickers = 10;

function setupWatchlistControls() {
    const addToWatchlistBtn = document.getElementById("addToWatchlist");
    const clearWatchlistBtn = document.getElementById("clearWatchlist");
    const tickerInput = document.getElementById("tickerInput");

    if (addToWatchlistBtn) addToWatchlistBtn.addEventListener("click", addTicker);
    if (clearWatchlistBtn) clearWatchlistBtn.addEventListener("click", clearWatchlist);
    if (tickerInput) {
        tickerInput.addEventListener("keypress", function (event) {
            if (event.key === "Enter") addTicker();
        });
    }

    document.querySelectorAll(".deleteTicker").forEach((button, index) => {
        button.addEventListener("click", () => deleteTicker(index));
    });
}

function addTicker() {
    const tickerInput = document.getElementById("tickerInput");
    if (!tickerInput) return;

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
        let slot = document.getElementById(`slot${i + 1}`);
        if (slot) slot.innerText = watchlist[i] || "";
    }
}

function deleteTicker(slot) {
    if (slot < watchlist.length) {
        const ticker = watchlist[slot];
        watchlist.splice(slot, 1);
        updateWatchlistDisplay();

        document.querySelectorAll("#stock-metrics tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker) row.remove();
        });

        document.querySelectorAll("#newsTable tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker) row.remove();
        });
    }
}

function clearWatchlist() {
    watchlist.length = 0;
    updateWatchlistDisplay();
    const stockMetricsTable = document.querySelector("#stock-metrics tbody");
    const newsTable = document.querySelector("#newsTable tbody");

    if (stockMetricsTable) stockMetricsTable.innerHTML = "";
    if (newsTable) newsTable.innerHTML = "";
}

/* ✅ Stock Data API */
async function fetchStockData(ticker) {
    try {
        const apiKey = await getApiKey();
        const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`);
        const data = await response.json();
        updateMetrics(ticker, data);
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

async function getApiKey() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api_keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");
        const keys = await response.json();
        return keys.length > 0 ? keys[0].api_secret : "YOUR_API_KEY";
    } catch (error) {
        console.error("Error fetching API keys:", error);
        return "YOUR_API_KEY";
    }
}

function updateMetrics(ticker, data) {
    const tableBody = document.querySelector("#stock-metrics tbody");
    if (!tableBody) {
        console.error("Stock metrics table missing in HTML");
        return;
    }

    const row = `<tr>
        <td>${sanitizeInput(ticker)}</td>
        <td>${data.c ? `$${data.c.toFixed(2)}` : "N/A"}</td>
        <td>${data.o ? `$${data.o.toFixed(2)}` : "N/A"}</td>
        <td>${data.h ? `$${data.h.toFixed(2)}` : "N/A"}</td>
        <td>${data.l ? `$${data.l.toFixed(2)}` : "N/A"}</td>
        <td>${data.pc ? `$${data.pc.toFixed(2)}` : "N/A"}</td>
    </tr>`;
    tableBody.innerHTML += row;
}

function sanitizeInput(input) {
    return typeof input === "string"
        ? input.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : input;
}

/* ✅ Tab Logic */
let currentlyVisibleSection = null;

document.querySelectorAll(".tab-button").forEach(button => {
    button.addEventListener("click", () => {
        const sectionMap = {
            "market-holidays-tab": "market-holidays-section",
            "api-keys-tab": "api-keys-section",
            "user-management-tab": "user-management-section"
        };

        const sectionId = sectionMap[button.id];
        const sectionEl = document.getElementById(sectionId);

        const isAlreadyVisible = currentlyVisibleSection === sectionId;

        document.querySelectorAll(".tab-button").forEach(btn => btn.classList.remove("active"));
        Object.values(sectionMap).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        });

        if (!isAlreadyVisible) {
            button.classList.add("active");
            sectionEl.style.display = "block";
            currentlyVisibleSection = sectionId;

            if (sectionId === "market-holidays-section" && typeof loadMarketHolidays === "function") loadMarketHolidays();
            if (sectionId === "api-keys-section" && typeof loadApiKeys === "function") loadApiKeys();
            if (sectionId === "user-management-section" && typeof loadUsers === "function") loadUsers();
        } else {
            currentlyVisibleSection = null;
        }
    });
});