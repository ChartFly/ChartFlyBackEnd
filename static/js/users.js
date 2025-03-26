let selectedUserRows = new Set();
let activeUserAction = null;

async function loadUsers() {
    try {
        const response = await fetch("https://chartflybackend.onrender.com/api/users");
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();
        const table = document.getElementById("user-table");
        table.innerHTML = "";

        const sanitizeInput = (input) => {
            if (typeof input !== "string") return input;
            return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        users.forEach((user, index) => {
            const fullName = sanitizeInput(user.name || "—");
            const email = sanitizeInput(user.email || "—");
            const username = sanitizeInput(user.username || "—");
            const accessTabs = Array.isArray(user.access)
                ? user.access.map(sanitizeInput).join(", ")
                : "None";

            const row = `
                <tr data-id="${user.id}" data-index="${index + 1}">
                    <td><input type="checkbox" class="user-select-checkbox" data-id="${user.id}"></td>
                    <td>${fullName}</td>
                    <td>${email}</td>
                    <td>${username}</td>
                    <td>${accessTabs}</td>
                </tr>
            `;
            table.innerHTML += row;
        });

        setupUserToolbar();

    } catch (error) {
        console.error("❌ Failed to load users:", error);
        const table = document.getElementById("user-table");
        table.innerHTML = `<tr><td colspan="5">Unable to load users at the moment. Please try again later.</td></tr>`;
    }
}

function setupUserToolbar() {
    const checkboxes = document.querySelectorAll(".user-select-checkbox");
    const confirmBox = document.getElementById("user-confirm");
    const rowTracker = [];

    checkboxes.forEach(box => {
        box.addEventListener("change", () => {
            const row = box.closest("tr");
            const id = box.dataset.id;

            if (box.checked) {
                selectedUserRows.add(id);
                row.classList.add("selected-row");
            } else {
                selectedUserRows.delete(id);
                row.classList.remove("selected-row");
            }

            updateUserConfirmBox();
        });
    });

    const actions = ["edit", "copy", "paste", "add", "delete", "save"];
    actions.forEach(action => {
        const btn = document.getElementById(`user-${action}-btn`);
        if (!btn) return;

        btn.addEventListener("click", () => {
            activeUserAction = action;

            // Highlight clicked button
            actions.forEach(a => {
                const otherBtn = document.getElementById(`user-${a}-btn`);
                if (otherBtn) otherBtn.classList.remove("active");
            });
            btn.classList.add("active");

            if (selectedUserRows.size === 0) {
                confirmBox.innerHTML = `<div class="confirm-box warn">Please select at least one row first.</div>`;
                return;
            }

            const selectedIndexes = Array.from(document.querySelectorAll("tr.selected-row"))
                .map(row => row.dataset.index);

            confirmBox.innerHTML = `
                <div class="confirm-box info">
                    <strong>Action:</strong> ${action.toUpperCase()}<br>
                    <strong>Selected Rows:</strong> ${selectedIndexes.join(", ")}<br>
                    <button class="confirm-btn turquoise" onclick="confirmUserAction()">Confirm ${action}</button>
                </div>
            `;
        });
    });
}

function confirmUserAction() {
    const confirmBox = document.getElementById("user-confirm");

    if (!activeUserAction || selectedUserRows.size === 0) {
        confirmBox.innerHTML = `<div class="confirm-box warn">No action or rows selected.</div>`;
        return;
    }

    // Perform your backend calls here for the action
    console.log(`✅ Confirmed [${activeUserAction}] for:`, Array.from(selectedUserRows));

    confirmBox.innerHTML = `
        <div class="confirm-box success">✅ ${capitalize(activeUserAction)} Confirmed!</div>
    `;

    // Reset all
    activeUserAction = null;
    selectedUserRows.clear();
    document.querySelectorAll(".user-select-checkbox").forEach(box => (box.checked = false));
    document.querySelectorAll("tr.selected-row").forEach(row => row.classList.remove("selected-row"));
    document.querySelectorAll(".action-btn").forEach(btn => btn.classList.remove("active"));
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}