let selectedHolidayRows = new Set();
let activeHolidayAction = null;

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

        holidays.forEach((holiday, index) => {
            const row = `
                <tr data-id="${holiday.id}" data-index="${index + 1}">
                    <td class="col-select"><input type="checkbox" class="holiday-select-checkbox" data-id="${holiday.id}"></td>
                    <td>${sanitizeInput(holiday.name || "N/A")}</td>
                    <td>${sanitizeInput(holiday.date || "N/A")}</td>
                    <td>${sanitizeInput(holiday.status || "Unknown")}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

        setupHolidayToolbar();

    } catch (error) {
        console.error("❌ Failed to load holidays:", error);
        const table = document.getElementById("holidays-table");
        table.innerHTML = `<tr><td colspan="4">Failed to load holidays. Please try again later.</td></tr>`;
    }
}

function setupHolidayToolbar() {
    const checkboxes = document.querySelectorAll(".holiday-select-checkbox");
    const confirmBox = document.getElementById("holiday-confirm");

    checkboxes.forEach(box => {
        box.addEventListener("change", () => {
            const row = box.closest("tr");
            const id = box.dataset.id;

            if (box.checked) {
                selectedHolidayRows.add(id);
                row.classList.add("selected-row");
            } else {
                selectedHolidayRows.delete(id);
                row.classList.remove("selected-row");
            }

            updateHolidayConfirmBox();
        });
    });

    const actions = ["edit", "copy", "paste", "add", "delete", "save"];
    actions.forEach(action => {
        const btn = document.getElementById(`holiday-${action}-btn`);
        if (!btn) return;

        btn.addEventListener("click", () => {
            activeHolidayAction = action;

            actions.forEach(a => {
                const otherBtn = document.getElementById(`holiday-${a}-btn`);
                if (otherBtn) otherBtn.classList.remove("active");
            });
            btn.classList.add("active");

            if (selectedHolidayRows.size === 0) {
                confirmBox.innerHTML = `<div class="confirm-box warn">Please select at least one row first.</div>`;
                return;
            }

            const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
                .map(row => row.dataset.index);

            confirmBox.innerHTML = `
                <div class="confirm-box info">
                    <strong>Action:</strong> ${action.toUpperCase()}<br>
                    <strong>Selected Rows:</strong> ${selectedIndexes.join(", ")}<br>
                    <button class="confirm-btn turquoise" onclick="confirmHolidayAction()">Confirm ${action}</button>
                </div>
            `;
        });
    });
}

function confirmHolidayAction() {
    const confirmBox = document.getElementById("holiday-confirm");

    if (!activeHolidayAction || selectedHolidayRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">No action or rows selected.</div>`;
        return;
    }

    console.log(`✅ Confirmed [${activeHolidayAction}] for:`, Array.from(selectedHolidayRows));

    confirmBox.innerHTML = `
        <div class="confirm-box success">✅ ${capitalize(activeHolidayAction)} Confirmed!</div>
    `;

    activeHolidayAction = null;
    selectedHolidayRows.clear();
    document.querySelectorAll(".holiday-select-checkbox").forEach(box => (box.checked = false));
    document.querySelectorAll("tr.selected-row").forEach(row => row.classList.remove("selected-row"));
    document.querySelectorAll(".action-btn").forEach(btn => btn.classList.remove("active"));
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}