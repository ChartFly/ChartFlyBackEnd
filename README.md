<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Halted Stocks Tracker</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

.header {
    width: 100%;
    background: #007a8a; /* Dark Turquoise */
    padding: 15px 0 35px; /* Increased bottom padding for scrolling text */
    display: flex;
    flex-direction: column; /* Allows stacking */
    align-items: center;
    position: relative;
}

.header-container {
    width: 100%;
    max-width: 1200px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    padding: 0 20px;
}

.market-status-text {
    font-size: 14px;
    font-weight: bold;
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
}

.holiday-title {
    font-weight: bold;
    margin-right: 10px;
}

.holiday-container {
    text-align: center;
}

.logo {
    width: 1.5in;
    height: auto;
    object-fit: contain;
    margin-left: 20px; /* Moves logo to the left */
}

.header-text {
    position: absolute;
    left: 50%;
    transform: translateX(-50%); /* Centers the text */
    text-align: center;
}

.header-text h1 {
    margin: 0;
    font-size: 38px;
}

.header-text p {
    margin: 0;
    font-size: 24px;
    color: #ddd;
}

        .container {
            max-width: 1200px;
            margin: auto;
            background: white;
            padding: 20px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            width: 100%; /* Ensuring full width alignment */
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
			background-color: #005662; /* Market Closed Blue-Gray */
			color: White;
		}

        .stock-input {
            margin-bottom: 10px;
            padding: 5px;
            width: calc(100% - 12px);
            display: block;
        }
        .holiday-schedule {
            width: 100%; /* Matches the halted stocks tracker width */
            margin-top: 20px;
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            margin-bottom: 50px; /* Adds about 1 inch of space below the holidays table */
        }
    </style>
</head>
<body>

<header class="header">
    <div class="header-container">
        <img src="https://raw.githubusercontent.com/ChartFly/ChartFly-Halted-Stocks/main/Chartfly-logo.png"
             alt="ChartFly Logo" class="logo">
        <div class="header-text">
            <h1 style="margin-bottom: 10px;">ChartFly</h1>
            <p style="margin-top: 12px; margin-bottom: 10px;">Trading Tools and Scripts for My Personal Use Only</p>
        </div>
        <span id="market-status-text" class="market-status-text">Checking market status...</span>
    </div>
 <div class="holiday-container">
    <span class="holiday-title">2025 Market Holidays:</span>
    <br>
    <span class="holiday-text" style="font-size: 10px;">
        <!-- Holiday data will populate here dynamically -->
    </span>
</div>

</header>

<style>

.market-status-title {
    font-size: 18px;
    font-weight: bold;
}

/* Market status color styles */
.market-open {
    background-color: green;
}

.market-closed {
    background-color: red;
}

.market-prepost {
    background-color: gold;
    color: black;
}

/* Make the holidays table the same width as the Halted Stocks Tracker */
.holiday-schedule {
    width: 100%;
    max-width: 1200px;
    background: white;
    padding: 15px;
    border: 1px solid #ddd;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    margin-bottom: 50px;
    text-align: center;
}

.holiday-schedule th {
    background-color: #B2DFDB; /* Light Turquoise */
    color: #004D40; /* Dark Greenish-Blue for contrast */
}

.holiday-schedule td {
    text-align: center;
    padding: 10px;
}

#watchlistTable th {
    background-color: #0097A7; /* Market Pre/Post Turquoise */
    color: black;
}

#stock-metrics th {
    background-color: #80CBC4; /* Medium Turquoise */
    color: black;
}

#newsTable th {
    background-color: #E0F2F1; /* Soft Blue Tint */
    color: black;
}

.deleteTicker {
    white-space: nowrap; /* Prevents text from wrapping */
    font-size: 10px; /* Adjust font size for better fit */
    padding: 4px 6px; /* Adjusts padding for better fit */
    min-width: 80px; /* Ensures button is wide enough */
    max-width: 100px; /* Prevents unnecessary stretching */
    text-align: center; /* Keeps text centered */
    display: inline-block; /* Ensures proper button formatting */
}

</style>

</section>

<script>
    function updateMarketStatus() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentDate = now.toISOString().split("T")[0];
        const marketStatusElement = document.getElementById("market-status-text");

        // List of official market holidays
        const marketHolidays = ["2025-01-01", "2025-02-19", "2025-03-29", "2025-05-27", "2025-07-04", "2025-09-02", "2025-11-28", "2025-12-25"];

        // Determine if today is a holiday
        const isHoliday = marketHolidays.includes(currentDate);

            // Determine if today is a weekend (Saturday or Sunday)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

        // Determine market status
        let marketStatus = isHoliday ? "Market Closed (Holiday)" :
            isWeekend ? "Market Closed (Weekend)" :
            hours < 4 ? "Market Closed" :
            hours < 9.5 ? "Pre-Market Trading" :
            hours < 16 ? "Market Open" :
            hours < 20 ? "After-Market Trading" :
            "Market Closed";

        // Apply correct class for color styling
        marketStatusElement.textContent = marketStatus;
        marketStatusElement.className = market-status-text ${isHoliday || marketStatus.includes("Closed") ? "market-closed" : marketStatus.includes("Open") ? "market-open" : "market-prepost"};
    }

    // Run update when the page loads
    updateMarketStatus();
</script>

  <div class="container" style="font-size: 12px;">
        <h2 style="font-size: 12px;">Halted Stocks Tracker</h2>
        <table>
            <thead>
                <tr>
                    <th>Halt Date</th>
                    <th>Halt Time</th>
                    <th>Issue Symbol</th>
                    <th>Issue Name</th>
                    <th>Market</th>
                    <th>Reason Code</th>
                    <th>Definition</th>
                    <th>Halt Price</th>
                    <th>Res Date</th>
                    <th>Res Time</th>
                </tr>
            </thead>
            <tbody id="halted-stocks">
                <tr><td colspan="10">Loading halted stocks...</td></tr>
            </tbody>
        </table>
    </div>

<script>
const haltReasons = {
    "T1": "News Pending",
    "T2": "News Released",
    "H10": "Volatility Trading Pause",
    "H4": "Non-compliance",
    "H9": "SEC Suspension",
    "D": "Other"
};

const NASDAQ_API_KEY = "1p8f1Jzx8f3qZfnnbeJA"; // Replace with your actual Nasdaq API key

async function fetchHaltedStocks() {
    try {
        const response = await fetch(https://chartflybackend.onrender.com/api/haltdetails);
        if (!response.ok) throw new Error("Network response was not ok");

        const haltedStocks = await response.json();
        let tableBody = document.getElementById("halted-stocks");
        tableBody.innerHTML = "";

        if (!haltedStocks || haltedStocks.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='10'>No halted stocks found.</td></tr>";
            return;
        }

        haltedStocks.forEach(stock => {
            let reasonDefinition = haltReasons[stock.reasonCode] || "Definition not available";
            let row = <tr>
                <td>${stock.haltDate || ""}</td>
                <td>${stock.haltTime || ""}</td>
                <td>${stock.symbol || ""}</td>
                <td>${stock.issueName || ""}</td>
                <td>${stock.market || ""}</td>
                <td>${stock.reasonCode || ""}</td>
                <td>${reasonDefinition}</td>
                <td>${stock.haltPrice || "N/A"}</td>
                <td>${stock.resDate || "N/A"}</td>
                <td>${stock.resTime || "N/A"}</td>
            </tr>;
            tableBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Error fetching halted stocks:", error);
        document.getElementById("halted-stocks").innerHTML = "<tr><td colspan='10'>Failed to load data.</td></tr>";
    }
}


fetchHaltedStocks();

    // ✅ Helper functions for date formatting
    function getTodayDate() {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    }

    function getPastDate(days) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - days);
        return pastDate.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    }
</script>

<!-- ✅ Make sure these sections are OUTSIDE of <script> -->
<!-- START: New Watchlist, Stock Metrics, and News Sections -->
<div class="container" style="width: 100%; max-width: 1200px; font-size: 12px;">

    <!-- Build Stock Watchlist Section -->
    <h2 style="display: inline;">Build Stock Watchlist</h2>
    <input type="text" id="tickerInput" placeholder="Enter Ticker Symbol" style="font-size: 12px; padding: 5px; margin-left: 10px;">
    <button id="addToWatchlist" style="font-size: 12px; padding: 5px; margin-left: 5px;">Add To Watchlist</button>
  <button id="fetchMetrics" style="font-size: 12px; padding: 5px; margin-left: 5px;">Fetch Watchlist Data</button>
  <button id="clearWatchlist" style="font-size: 12px; padding: 5px; margin-left: 5px;">Delete Watchlist</button>

    <!-- Watchlist Table -->
    <table id="watchlistTable" style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px;">
        <thead>
            <tr>
                <th colspan="10">Watchlist</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <!-- Watchlist Slots (Max 10) -->
                <td id="slot1"></td>
                <td id="slot2"></td>
                <td id="slot3"></td>
                <td id="slot4"></td>
                <td id="slot5"></td>
                <td id="slot6"></td>
                <td id="slot7"></td>
                <td id="slot8"></td>
                <td id="slot9"></td>
                <td id="slot10"></td>
            </tr>
            <tr>
    <td><button class="deleteTicker" data-slot="1">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="2">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="3">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="4">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="5">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="6">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="7">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="8">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="9">Delete Ticker</button></td>
<td><button class="deleteTicker" data-slot="10">Delete Ticker</button></td>

            </tr>
        </tbody>
    </table>
</div>

<!-- Stock Metrics Section -->
<div class="container" style="width: 100%; max-width: 1200px; font-size: 12px;">
    <h2 style="display: inline;">Stock Metrics</h2>

    <table id="stock-metrics" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
        <thead>
            <tr>
                <th>Symbol</th>
                <th>Current Price</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Prev Close</th>
                <th>Market Cap</th>
                <th>Shares Out</th>
                <th>P/E Ratio</th>
                <th>EPS</th>
                <th>52W High</th>
                <th>52W Low</th>
                <th>Shares Outstanding</th>
                <th>Short Interest</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<!-- News Section -->
<div class="container" style="width: 100%; max-width: 1200px; font-size: 12px;">
    <h2>Latest News</h2>
    <table id="newsTable" style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px;">
        <thead>
            <tr>
                <th style="width: 10%;">Symbol</th>
                <th style="width: 90%;">News Headlines</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>
<!-- END: New Watchlist, Stock Metrics, and News Sections -->

<!-- ✅ Now JavaScript starts BELOW the content -->
<script>
const watchlist = [];
const maxTickers = 10;

// Function to add a ticker to the watchlist
function addTicker() {
    const tickerInput = document.getElementById("tickerInput");
    const ticker = tickerInput.value.trim().toUpperCase();
    if (ticker && !watchlist.includes(ticker) && watchlist.length < maxTickers) {
        watchlist.push(ticker);
        updateWatchlistDisplay();
        tickerInput.value = "";
    }
    if (watchlist.length >= maxTickers) {
        document.getElementById("addToWatchlist").innerText = "Watchlist Full";
        document.getElementById("addToWatchlist").disabled = true;
    }
}

// Function to update watchlist display
function updateWatchlistDisplay() {
    for (let i = 0; i < maxTickers; i++) {
        document.getElementById(slot${i + 1}).innerText = watchlist[i] || "";
    }
}

/// Function to delete a specific ticker and its corresponding data
function deleteTicker(slot) {
    if (slot < watchlist.length) {
        const ticker = watchlist[slot];

        // Remove from watchlist
        watchlist.splice(slot, 1);
        updateWatchlistDisplay();

        // Remove all occurrences of the ticker from Stock Metrics table
        document.querySelectorAll("#stock-metrics tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker.toUpperCase()) {
                row.remove();
            }
        });

        // Remove all occurrences of the ticker from News table
        document.querySelectorAll("#newsTable tbody tr").forEach(row => {
            if (row.cells[0].textContent.trim().toUpperCase() === ticker.toUpperCase()) {
                row.remove();
            }
        });

        // Remove ticker's data from memory (optional if stored elsewhere)
        delete stockData[ticker];
        delete newsData[ticker];

        // Re-enable "Add To Watchlist" button if space is available
        document.getElementById("addToWatchlist").innerText = "Add To Watchlist";
        document.getElementById("addToWatchlist").disabled = false;
    }
}


// Function to clear entire watchlist and its corresponding data
function clearWatchlist() {
    watchlist.length = 0;
    updateWatchlistDisplay();

    // Remove all rows from Stock Metrics table
    document.querySelector("#stock-metrics tbody").innerHTML = "";

    // Remove all rows from News table
    document.querySelector("#newsTable tbody").innerHTML = "";

    // Re-enable "Add To Watchlist" button
    document.getElementById("addToWatchlist").innerText = "Add To Watchlist";
    document.getElementById("addToWatchlist").disabled = false;
}

// Event listeners for buttons
document.getElementById("addToWatchlist").addEventListener("click", addTicker);
document.getElementById("tickerInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        addTicker();
    }
});

document.getElementById("clearWatchlist").addEventListener("click", clearWatchlist);

const deleteButtons = document.querySelectorAll(".deleteTicker");
deleteButtons.forEach((button, index) => {
    button.addEventListener("click", () => deleteTicker(index));
});

// Function to fetch metrics for watchlist with 1-second delay per call
async function fetchBatchStockData() {
    let delay = 1000; // 1-second delay per ticker
    watchlist.forEach((ticker, index) => {
        setTimeout(() => {
            fetchStockData(ticker);
        }, index * delay);
    });
}

document.getElementById("fetchMetrics").addEventListener("click", fetchBatchStockData);

// Function to fetch stock data
async function fetchStockData(ticker) {
    const FINNHUB_API_KEY = "cv4gk8pr01qn2gaa2bfgcv4gk8pr01qn2gaa2bg0";
    const STOCK_API_URL = https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${FINNHUB_API_KEY};
    const METRIC_API_URL = https://finnhub.io/api/v1/stock/metric?symbol=${ticker}&metric=all&token=${FINNHUB_API_KEY};
    const NEWS_API_URL = https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${getPastDate(30)}&to=${getTodayDate()}&token=${FINNHUB_API_KEY};

    try {
        const [quoteRes, metricRes, newsRes] = await Promise.all([
            fetch(STOCK_API_URL),
            fetch(METRIC_API_URL),
            fetch(NEWS_API_URL)
        ]);

        if (!quoteRes.ok || !metricRes.ok || !newsRes.ok) {
            throw new Error("One or more API requests failed");
        }

        let quoteData = await quoteRes.json();
        let metricData = await metricRes.json();
        let newsData = await newsRes.json();

        updateMetrics(ticker, quoteData, metricData, newsData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
    }
}

// Function to update metrics table
function updateMetrics(ticker, quote, metric, news) {
    const tableBody = document.querySelector("#stock-metrics tbody");
    const row = <tr>
        <td>${ticker}</td>
        <td>${quote?.c ? $${quote.c.toFixed(2)} : "N/A"}</td>
        <td>${quote?.o ? $${quote.o.toFixed(2)} : "N/A"}</td>
        <td>${quote?.h ? $${quote.h.toFixed(2)} : "N/A"}</td>
        <td>${quote?.l ? $${quote.l.toFixed(2)} : "N/A"}</td>
        <td>${quote?.pc ? $${quote.pc.toFixed(2)} : "N/A"}</td>
        <td>${metric?.metric?.marketCapitalization ? $${metric.metric.marketCapitalization.toFixed(2)}B : "N/A"}</td>
        <td>${metric?.metric?.shareOutstanding ? ${metric.metric.shareOutstanding.toFixed(2)}M : "N/A"}</td>
        <td>${metric?.metric?.peRatio ? metric.metric.peRatio.toFixed(2) : "N/A"}</td>
        <td>${metric?.metric?.eps ? $${metric.metric.eps.toFixed(2)} : "N/A"}</td>
        <td>${metric?.metric?.["52WeekHigh"] ? $${metric.metric["52WeekHigh"].toFixed(2)} : "N/A"}</td>
        <td>${metric?.metric?.["52WeekLow"] ? $${metric.metric["52WeekLow"].toFixed(2)} : "N/A"}</td>
      	<td>${metric?.metric?.shareOutstanding ? ${metric.metric.shareOutstanding.toFixed(2)}M : "N/A"}</td>
     	<td>${metric?.metric?.shortInterest ? ${metric.metric.shortInterest.toFixed(2)}M : "N/A"}</td>
    </tr>;
    tableBody.innerHTML += row;
    updateNewsTable(ticker, news);
}

// Function to update news table
function updateNewsTable(ticker, news) {
    const tableBody = document.querySelector("#newsTable tbody");
    const newsHeadlines = news.slice(0, 4).map(item => <li>${item.headline}</li>).join(" ");
    const row = <tr>
        <td>${ticker}</td>
        <td><ul>${newsHeadlines || "No recent news"}</ul></td>
    </tr>;
    tableBody.innerHTML += row;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function getPastDate(days) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    return pastDate.toISOString().split("T")[0];
}

async function fetchMarketHolidays(year) {
    try {
        const response = await fetch(https://chartflybackend.onrender.com/api/holidays/year/${year});
        const holidays = await response.json();
        let holidaysDisplay = holidays.map(h => {
            const dateFormatted = new Date(h.holiday_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
            return ${dateFormatted} - ${h.holiday_name};
        }).join('&nbsp;&nbsp;|&nbsp;&nbsp;');

        document.querySelector(".holiday-text").innerHTML = holidaysDisplay || "No holidays available.";
    } catch (error) {
        console.error("Error fetching holidays:", error);
        document.querySelector(".holiday-text").innerHTML = "Failed to load holidays.";
    }
}

// Load holidays automatically on page load
document.addEventListener("DOMContentLoaded", () => {
    fetchHolidays(2025); // <-- Adjust year as needed
});

async function fetchHolidays(year) {
    try {
        const response = await fetch(https://chartflybackend.onrender.com/api/holidays/year/${year});
        if (!response.ok) throw new Error("Network error loading holidays.");

        const holidays = await response.json();
        let holidaysDisplay = holidays.map(h => {
            const dateFormatted = new Date(h.holiday_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
            return ${dateFormatted} - ${h.holiday_name};
        }).join('&nbsp;&nbsp;|&nbsp;&nbsp;');

        document.querySelector(".holiday-text").innerHTML = holidaysDisplay || "No holidays available.";
    } catch (error) {
        console.error("Error fetching holidays:", error);
        document.querySelector(".holiday-text").innerHTML = "Failed to load holidays.";
    }
}

// Run function on page load
document.addEventListener("DOMContentLoaded", function () {
    fetchHolidays(2025);
});

</script>
</body>
</html>