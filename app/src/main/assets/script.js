document.addEventListener('DOMContentLoaded', () => {
    // State management
    let appState = {
        selectedGroupId: 'default',
        groups: {
            'default': {
                id: 'default',
                name: 'Standard',
                items: []
            }
        }
    };

    // DOM Elements
    const omikujiBox = document.getElementById('omikuji-box');
    const drawBtn = document.getElementById('draw-btn');
    const stick = document.getElementById('stick');
    const stickLabel = stick.querySelector('.stick-label');
    const resultOverlay = document.getElementById('result-overlay');
    const resultContent = document.getElementById('result-content');
    const closeResult = document.getElementById('close-result');
    const currentGroupLabel = document.getElementById('current-group-label');

    const configToggle = document.getElementById('config-toggle');
    const configPanel = document.getElementById('config-panel');
    const configClose = document.getElementById('config-close');

    // Config Elements
    const lotInputsContainer = document.getElementById('lot-inputs');
    const saveConfigBtn = document.getElementById('save-config');
    const groupSelect = document.getElementById('group-select');
    const addGroupBtn = document.getElementById('add-group-btn');
    const deleteGroupBtn = document.getElementById('delete-group-btn');
    const addItemBtn = document.getElementById('add-item-btn');

    // Initialize state and migrate old data if necessary
    function initState() {
        const storedV3 = localStorage.getItem('omikuji-data-v3');

        if (storedV3) {
            appState = JSON.parse(storedV3);
        } else {
            // Check for V2 data to migrate
            const storedV2 = localStorage.getItem('omikuji-lots-v2');
            if (storedV2) {
                const oldLots = JSON.parse(storedV2);
                appState.groups['default'].items = oldLots;
            } else {
                // Initialize fresh default
                const defaultCount = 10;
                appState.groups['default'].items = Array.from({ length: defaultCount }, (_, i) => {
                    const num = i + 1;
                    return {
                        id: num,
                        content: num % 2 === 0 ? `No.${num} (Even)` : `No.${num} (Odd)`
                    };
                });
            }
            saveState();
        }
        updateUI();
    }

    function saveState() {
        localStorage.setItem('omikuji-data-v3', JSON.stringify(appState));
    }

    function getCurrentGroup() {
        return appState.groups[appState.selectedGroupId] || appState.groups['default'];
    }

    // Drawing Logic
    let isDrawing = false;

    function draw() {
        if (isDrawing) return;

        const currentGroup = getCurrentGroup();
        if (!currentGroup.items || currentGroup.items.length === 0) {
            alert("No items in this group! Add some items first.");
            return;
        }

        isDrawing = true;

        // Reset stick
        stick.classList.remove('pop');

        // Start Shaking
        omikujiBox.classList.add('shaking');

        // Delay for simulation
        setTimeout(() => {
            omikujiBox.classList.remove('shaking');

            // Pick random lot
            const randomIndex = Math.floor(Math.random() * currentGroup.items.length);
            const selectedLot = currentGroup.items[randomIndex];

            // Show stick (shortened content for visual)
            stickLabel.textContent = selectedLot.content.length > 10 ? selectedLot.content.substring(0, 8) + '..' : selectedLot.content;
            stick.classList.add('pop');

            // Show result after stick pops
            setTimeout(() => {
                resultContent.textContent = selectedLot.content;
                resultOverlay.classList.remove('hidden');
                isDrawing = false;
            }, 1000);

        }, 1500);
    }

    drawBtn.addEventListener('click', draw);

    closeResult.addEventListener('click', () => {
        resultOverlay.classList.add('hidden');
        stick.classList.remove('pop');
    });

    // --- Configuration Logic ---

    // Render the configuration panel
    function renderConfig() {
        const currentGroup = getCurrentGroup();

        // Update Group Selector
        groupSelect.innerHTML = '';
        Object.values(appState.groups).forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            if (group.id === appState.selectedGroupId) {
                option.selected = true;
            }
            groupSelect.appendChild(option);
        });

        // Render Items
        lotInputsContainer.innerHTML = '';
        if (currentGroup.items) {
            currentGroup.items.forEach((item, index) => {
                const div = document.createElement('div');
                div.className = 'lot-input-wrapper';

                const input = document.createElement('input');
                input.type = "text";
                input.value = item.content;
                input.dataset.index = index;
                input.maxLength = 30;
                input.placeholder = "Item Name";

                const removeBtn = document.createElement('button');
                removeBtn.className = "remove-item-btn";
                removeBtn.dataset.index = index;
                removeBtn.title = "Remove";
                removeBtn.textContent = "×";

                div.appendChild(input);
                div.appendChild(removeBtn);
                lotInputsContainer.appendChild(div);

                // Add event listener to the input for immediate update (UX preference)
                input.addEventListener('input', (e) => {
                   currentGroup.items[index].content = e.target.value;
                   // Ideally we save on blur or close, but keeping state in sync is good
                });
            });
        }

        // Add event listeners to new remove buttons
        document.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                deleteItem(idx);
            });
        });
    }

    // Helper to sync inputs to memory before an action (like add/delete item)
    // Since we re-render, we must capture current input values first
    function syncInputs() {
        const inputs = lotInputsContainer.querySelectorAll('input');
        const currentGroup = getCurrentGroup();
        inputs.forEach((input, i) => {
            if (currentGroup.items[i]) {
                currentGroup.items[i].content = input.value;
            }
        });
    }

    // CRUD Operations

    function deleteItem(index) {
        syncInputs();
        const group = getCurrentGroup();
        group.items.splice(index, 1);
        saveState();
        renderConfig();
    }

    function addItem() {
        syncInputs();
        const group = getCurrentGroup();
        const newId = (group.items.length > 0 ? Math.max(...group.items.map(i => i.id)) : 0) + 1;
        group.items.push({ id: newId, content: '' });
        saveState();
        renderConfig();

        // Focus the last input
        setTimeout(() => {
            const inputs = lotInputsContainer.querySelectorAll('input');
            if(inputs.length > 0) inputs[inputs.length - 1].focus();
        }, 50);
    }

    function addGroup() {
        const name = prompt("Enter new group name:");
        if (name) {
            const id = 'group_' + Date.now();
            appState.groups[id] = {
                id: id,
                name: name,
                items: []
            };
            appState.selectedGroupId = id;
            saveState();
            renderConfig();
            updateUI();
        }
    }

    function deleteGroup() {
        const group = getCurrentGroup();
        if (group.id === 'default') {
            alert("Cannot delete the default group.");
            return;
        }
        if (confirm(`Delete group "${group.name}"?`)) {
            delete appState.groups[group.id];
            appState.selectedGroupId = 'default';
            saveState();
            renderConfig();
            updateUI();
        }
    }

    function switchGroup(id) {
        appState.selectedGroupId = id;
        saveState();
        renderConfig();
        updateUI();
    }

    // UI Updates
    function updateUI() {
        const group = getCurrentGroup();
        if (currentGroupLabel) {
            currentGroupLabel.textContent = `Current: ${group.name}`;
        }
    }

    // Event Listeners for Config Panel
    configToggle.addEventListener('click', () => {
        renderConfig();
        configPanel.classList.remove('hidden');
    });

    configClose.addEventListener('click', () => {
        configPanel.classList.add('hidden');
    });

    saveConfigBtn.addEventListener('click', () => {
        syncInputs();
        // Filter out empty items on save? Optional.
        saveState();
        configPanel.classList.add('hidden');
        updateUI();
    });

    // New Event Listeners
    groupSelect.addEventListener('change', (e) => {
        syncInputs();
        switchGroup(e.target.value);
    });

    addGroupBtn.addEventListener('click', addGroup);
    deleteGroupBtn.addEventListener('click', deleteGroup);
    addItemBtn.addEventListener('click', addItem);

    // Initialize
    initState();
});