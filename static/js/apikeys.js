let selectedApiRows = new Set();
let activeApiAction = null;

async function loadApiKeys() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/api-keys");
        if (!response.ok) throw new Error("Failed to fetch API keys");

        const apiKeys = await response.json();
        const table = document.getElementById("api-keys-table");
        table.innerHTML = "";

        const sanitizeInput = (input) =>
            input?.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;") || "N/A";

        if (apiKeys.length === 0) {
            table.innerHTML = `<tr><td colspan="12">No API keys found.</td></tr>`;
            return;
        }

        apiKeys.forEach((key, index) => {
            const row = `
    <tr data-id="${key.id}" data-index="${index + 1}">
        <td class="col-select"><input type="checkbox" class="api-select-checkbox" data-id="${key.id}"></td>
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
                </tr>
            `;
            table.innerHTML += row;
        });

        setupApiToolbar();

    } catch (error) {
        console.error("❌ Failed to load API keys:", error);
        const table = document.getElementById("api-keys-table");
        table.innerHTML = `<tr><td colspan="12">Failed to load data. Please try again later.</td></tr>`;
    }
}

function setupApiToolbar() {
    const checkboxes = document.querySelectorAll(".api-select-checkbox");
    const confirmBox = document.getElementById("api-confirm");

    checkboxes.forEach(box => {
        box.addEventListener("change", () => {
            const row = box.closest("tr");
            const id = box.dataset.id;

            if (box.checked) {
                selectedApiRows.add(id);
                row.classList.add("selected-row");
            } else {
                selectedApiRows.delete(id);
                row.classList.remove("selected-row");
            }

            updateApiConfirmBox();
        });
    });

    const actions = ["edit", "copy", "paste", "add", "delete", "save"];
    actions.forEach(action => {
        const btn = document.getElementById(`api-${action}-btn`);
        if (!btn) return;

        btn.addEventListener("click", () => {
            activeApiAction = action;

            // Reset all button highlights
            actions.forEach(a => {
                const otherBtn = document.getElementById(`api-${a}-btn`);
                if (otherBtn) otherBtn.classList.remove("active");
            });
            btn.classList.add("active");

            if (selectedApiRows.size === 0) {
                confirmBox.innerHTML = `<div class="confirm-box warn">Please select at least one row first.</div>`;
                return;
            }

            const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
                .map(row => row.dataset.index);

            confirmBox.innerHTML = `
                <div class="confirm-box info">
                    <strong>Action:</strong> ${action.toUpperCase()}<br>
                    <strong>Selected Rows:</strong> ${selectedIndexes.join(", ")}<br>
                    <button class="confirm-btn turquoise" onclick="confirmApiAction()">Confirm ${action}</button>
                </div>
            `;
        });
    });
}

function confirmApiAction() {
    const confirmBox = document.getElementById("api-confirm");

    if (!activeApiAction || selectedApiRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">No action or rows selected.</div>`;
        return;
    }

    // Perform backend work here
    console.log(`✅ Confirmed [${activeApiAction}] for:`, Array.from(selectedApiRows));

    confirmBox.innerHTML = `
        <div class="confirm-box success">✅ ${capitalize(activeApiAction)} Confirmed!</div>
    `;

    // Reset all
    activeApiAction = null;
    selectedApiRows.clear();
    document.querySelectorAll(".api-select-checkbox").forEach(box => (box.checked = false));
    document.querySelectorAll("tr.selected-row").forEach(row => row.classList.remove("selected-row"));
    document.querySelectorAll(".action-btn").forEach(btn => btn.classList.remove("active"));
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}