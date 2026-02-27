document.addEventListener('DOMContentLoaded', () => {
    // State management
    let lots = [];
    let editingLots = [];
    const defaultCount = 10;

    // Presets
    const presets = {
        'custom': [],
        'standard': Array.from({ length: 10 }, (_, i) => ({ id: i + 1, content: (i + 1) % 2 === 0 ? `No.${i + 1} (Even)` : `No.${i + 1} (Odd)` })),
        'yesno': [
            { id: 1, content: 'Yes' },
            { id: 2, content: 'No' },
            { id: 3, content: 'Maybe' }
        ],
        'dice': Array.from({ length: 6 }, (_, i) => ({ id: i + 1, content: `${i + 1}` })),
        'restaurant': [
            { id: 1, content: 'Pizza' },
            { id: 2, content: 'Sushi' },
            { id: 3, content: 'Burger' },
            { id: 4, content: 'Pasta' },
            { id: 5, content: 'Salad' },
            { id: 6, content: 'Chinese' },
            { id: 7, content: 'Tacos' },
            { id: 8, content: 'Steak' },
            { id: 9, content: 'Ramen' },
            { id: 10, content: 'Curry' }
        ]
    };

    // Initialize default lots
    function initDefaultLots() {
        const stored = localStorage.getItem('omikuji-lots-v2');
        if (stored) {
            try {
                lots = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse lots", e);
                lots = [];
            }
        }

        if (!lots || lots.length === 0) {
            lots = JSON.parse(JSON.stringify(presets['standard']));
        }
    }

    initDefaultLots();

    // DOM Elements
    const omikujiBox = document.getElementById('omikuji-box');
    const drawBtn = document.getElementById('draw-btn');
    const stick = document.getElementById('stick');
    const stickLabel = stick.querySelector('.stick-label');
    const resultOverlay = document.getElementById('result-overlay');
    const resultContent = document.getElementById('result-content');
    const closeResult = document.getElementById('close-result');

    const configToggle = document.getElementById('config-toggle');
    const configPanel = document.getElementById('config-panel');
    const configClose = document.getElementById('config-close');
    const lotCountRange = document.getElementById('lot-count');
    const countDisplay = document.getElementById('count-display');
    const lotInputsContainer = document.getElementById('lot-inputs');
    const saveConfigBtn = document.getElementById('save-config');
    const presetSelect = document.getElementById('preset-select');

    const historyToggle = document.getElementById('history-toggle');
    const historyPanel = document.getElementById('history-panel');
    const historyClose = document.getElementById('history-close');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');

    // Populate Presets in UI
    Object.keys(presets).forEach(key => {
        if (key === 'custom') return;
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key.charAt(0).toUpperCase() + key.slice(1);
        presetSelect.appendChild(option);
    });

    // History Management
    let history = [];

    function loadHistory() {
        const stored = localStorage.getItem('omikuji-history');
        if (stored) {
            try {
                history = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse history", e);
                history = [];
            }
        }
    }

    function saveHistory() {
        localStorage.setItem('omikuji-history', JSON.stringify(history));
    }

    function addHistory(lot) {
        const entry = {
            content: lot.content,
            timestamp: new Date().toISOString()
        };
        history.unshift(entry); // Add to beginning
        if (history.length > 50) history.pop(); // Limit history size
        saveHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-history">No history yet.</li>';
            return;
        }

        history.forEach(entry => {
            const li = document.createElement('li');
            const date = new Date(entry.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            li.innerHTML = `
                <span class="history-content">${entry.content}</span>
                <span class="history-time">${timeStr}</span>
            `;
            historyList.appendChild(li);
        });
    }

    loadHistory();

    historyToggle.addEventListener('click', () => {
        renderHistory();
        historyPanel.classList.remove('hidden');
    });

    historyClose.addEventListener('click', () => {
        historyPanel.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm('Clear all history?')) {
            history = [];
            saveHistory();
            renderHistory();
        }
    });

    // Drawing Logic
    let isDrawing = false;

    function draw() {
        if (isDrawing) return;
        isDrawing = true;

        // Reset stick
        stick.classList.remove('pop');

        // Start Shaking
        omikujiBox.classList.add('shaking');

        // Delay for simulation
        setTimeout(() => {
            omikujiBox.classList.remove('shaking');

            // Pick random lot
            const randomIndex = Math.floor(Math.random() * lots.length);
            const selectedLot = lots[randomIndex];

            // Show stick
            stickLabel.textContent = selectedLot.content;
            stick.classList.add('pop');

            // Show result after stick pops
            setTimeout(() => {
                resultContent.textContent = selectedLot.content;
                resultOverlay.classList.remove('hidden');
                addHistory(selectedLot);
                isDrawing = false;
            }, 1000);

        }, 1500);
    }

    drawBtn.addEventListener('click', draw);

    closeResult.addEventListener('click', () => {
        resultOverlay.classList.add('hidden');
        stick.classList.remove('pop');
    });

    // Config Panel Logic
    function renderConfigInputs(count, sourceArray) {
        lotInputsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const lot = (sourceArray && sourceArray[i]) ? sourceArray[i] : { id: i + 1, content: `No.${i + 1}` };

            const div = document.createElement('div');
            div.className = 'lot-input-wrapper';
            div.innerHTML = `
                <span>${i + 1}</span>
                <input type="text" value="${lot.content}" data-index="${i}" maxlength="10">
            `;
            lotInputsContainer.appendChild(div);
        }
    }

    function captureInputs() {
        const inputs = lotInputsContainer.querySelectorAll('input');
        inputs.forEach((input, i) => {
            if (!editingLots[i]) {
                editingLots[i] = { id: i + 1, content: input.value };
            } else {
                editingLots[i].content = input.value;
            }
        });
    }

    configToggle.addEventListener('click', () => {
        editingLots = JSON.parse(JSON.stringify(lots));
        lotCountRange.value = editingLots.length;
        countDisplay.textContent = editingLots.length;
        presetSelect.value = 'custom'; // Default to custom when opening
        renderConfigInputs(editingLots.length, editingLots);
        configPanel.classList.remove('hidden');
    });

    configClose.addEventListener('click', () => {
        configPanel.classList.add('hidden');
    });

    lotCountRange.addEventListener('input', (e) => {
        captureInputs();
        presetSelect.value = 'custom';
        const count = parseInt(e.target.value);
        countDisplay.textContent = count;
        renderConfigInputs(count, editingLots);
    });

    presetSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'custom') return;

        const selectedPreset = presets[val];
        if (selectedPreset) {
            editingLots = JSON.parse(JSON.stringify(selectedPreset));
            lotCountRange.value = editingLots.length;
            countDisplay.textContent = editingLots.length;
            renderConfigInputs(editingLots.length, editingLots);
        }
    });

    saveConfigBtn.addEventListener('click', () => {
        captureInputs();
        const count = parseInt(lotCountRange.value);
        const newLots = [];

        for (let i = 0; i < count; i++) {
            if (editingLots[i]) {
                newLots.push(editingLots[i]);
            } else {
                newLots.push({ id: i + 1, content: `No.${i + 1}` });
            }
        }

        lots = newLots;
        localStorage.setItem('omikuji-lots-v2', JSON.stringify(lots));
        configPanel.classList.add('hidden');
    });
});
