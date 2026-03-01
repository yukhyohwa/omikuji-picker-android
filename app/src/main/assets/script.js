document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration & Constants ---
    const PRESETS = {
        'restaurant': {
            name: '🍱 餐厅选择',
            type: 'omikuji',
            items: ['拉面', '寿司', '披萨', '汉堡', '麻辣烫', '烤肉', '火锅', '沙拉']
        },
        'food': {
            name: '🥤 奶茶咖啡',
            type: 'omikuji',
            items: ['拿铁', '美式', '珍珠奶茶', '柠檬茶', '杨枝甘露', '卡布奇诺', '燕麦拿铁']
        },
        'yesno': {
            name: '✔️ 是/否决策',
            type: 'cards',
            items: ['确定', '不行', '可以尝试', '绝对不要', '再想想', '就是现在']
        },
        'dice': {
            name: '🎲 掷骰子 (1-6)',
            type: 'dice',
            items: ['1', '2', '3', '4', '5', '6']
        },
        'cards': {
            name: '🃏 扑克抽牌',
            type: 'cards',
            items: ['黑桃A', '红桃K', '梅花Q', '方块J', '大王', '小王', '黑桃10', '红桃7']
        },
        'lucky_color': {
            name: '🎨 幸运色',
            type: 'cards',
            items: ['热情红', '深海蓝', '活力橙', '森林绿', '神秘紫', '明亮黄', '纯净白']
        },
        'standard': {
            name: '🧧 传统抽签',
            type: 'omikuji',
            items: ['大吉 (Great Blessing)', '中吉 (Middle Blessing)', '小吉 (Small Blessing)', '吉 (Blessing)', '末吉 (Future Blessing)', '凶 (Curse)', '大凶 (Great Curse)']
        }
    };

    // --- State Management ---
    let state = {
        selectedGroupId: 'default',
        groups: {
            'default': {
                id: 'default',
                name: 'Standard',
                type: 'omikuji',
                items: PRESETS.standard.items.map((item, i) => ({ id: i, content: item }))
            }
        },
        history: []
    };

    const STORAGE_KEY = 'decision_master_v1';

    // --- DOM Elements ---
    const elements = {
        omikujiView: document.getElementById('omikuji-view'),
        diceView: document.getElementById('dice-view'),
        cardsView: document.getElementById('cards-view'),

        omikujiBox: document.getElementById('omikuji-box'),
        dice: document.getElementById('dice'),
        cardDeck: document.getElementById('card-deck'),

        drawBtn: document.getElementById('draw-btn'),
        stick: document.getElementById('stick'),
        stickLabel: document.querySelector('.stick-label'),
        currentGroupBadge: document.getElementById('current-group-badge'),

        // Modals
        resultModal: document.getElementById('result-modal'),
        historyModal: document.getElementById('history-modal'),
        configModal: document.getElementById('config-modal'),

        // Modal Toggles
        historyToggle: document.getElementById('history-toggle'),
        configToggle: document.getElementById('config-toggle'),

        // Modal Closes
        closeResult: document.getElementById('close-result'),
        historyClose: document.getElementById('history-close'),
        configClose: document.getElementById('config-close'),

        // Result Content
        resultContent: document.getElementById('result-content'),

        // Config Elements
        presetSelect: document.getElementById('preset-select'),
        groupSelect: document.getElementById('group-select'),
        lotInputs: document.getElementById('lot-inputs'),
        addItemBtn: document.getElementById('add-item-btn'),
        addGroupBtn: document.getElementById('add-group-btn'),
        deleteGroupBtn: document.getElementById('delete-group-btn'),
        saveConfig: document.getElementById('save-config'),

        // History Elements
        historyList: document.getElementById('history-list'),
        clearHistory: document.getElementById('clear-history')
    };

    // --- Core Functions ---

    function init() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                state = { ...state, ...parsed };
            } catch (e) {
                console.error("Failed to parse storage", e);
            }
        }
        updateUI();
        setupEventListeners();
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function updateUI() {
        const currentGroup = state.groups[state.selectedGroupId] || state.groups['default'];
        elements.currentGroupBadge.textContent = currentGroup.name;

        // Update Tabs
        const type = currentGroup.type || 'omikuji';
        document.querySelectorAll('.mode-tab').forEach(tab => {
            if (tab.dataset.mode === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Reset Views
        elements.omikujiView.classList.add('hidden');
        elements.diceView.classList.add('hidden');
        elements.cardsView.classList.add('hidden');

        if (type === 'omikuji') {
            elements.omikujiView.classList.remove('hidden');
            elements.drawBtn.classList.remove('hidden');
            elements.drawBtn.textContent = "开始抽签";
        } else if (type === 'dice') {
            elements.diceView.classList.remove('hidden');
            elements.drawBtn.classList.remove('hidden');
            elements.drawBtn.textContent = "掷骰子";
        } else if (type === 'cards') {
            elements.cardsView.classList.remove('hidden');
            elements.drawBtn.classList.add('hidden');
            renderCardDeck();
        }
    }

    // --- Modal Logic ---

    function toggleModal(modal, show) {
        if (show) {
            modal.classList.add('active');
        } else {
            modal.classList.remove('active');
        }
    }

    // --- Handling Drawing based on Type ---

    function handleDraw() {
        const currentGroup = state.groups[state.selectedGroupId] || state.groups['default'];
        const type = currentGroup.type || 'omikuji';

        if (type === 'omikuji') {
            drawOmikuji();
        } else if (type === 'dice') {
            rollDice();
        }
    }

    // --- Drawing Logic: Omikuji ---

    let isDrawing = false;
    function drawOmikuji() {
        if (isDrawing) return;

        const currentGroup = state.groups[state.selectedGroupId] || state.groups['default'];
        if (!currentGroup.items || currentGroup.items.length === 0) {
            alert("This collection is empty! Add some items in Settings.");
            return;
        }

        isDrawing = true;
        elements.stick.classList.remove('pop');
        elements.omikujiBox.classList.add('shaking');

        // Initial heavy vibration
        vibrate(60);

        let shakeInterval = setInterval(() => vibrate(30), 150);

        // Shaking sound effect simulation via delay
        setTimeout(() => {
            clearInterval(shakeInterval);
            elements.omikujiBox.classList.remove('shaking');

            const randomIndex = Math.floor(Math.random() * currentGroup.items.length);
            const selected = currentGroup.items[randomIndex];

            // Set label on the physical stick
            elements.stickLabel.textContent = selected.content.length > 8 ? selected.content.substring(0, 6) + '..' : selected.content;
            elements.stick.classList.add('pop');

            // Subtle "pop" vibration
            vibrate(40);

            setTimeout(() => {
                // Show final result
                showResult(selected.content, currentGroup.name);
                isDrawing = false;
            }, 800);

        }, 1200);
    }

    // --- Drawing Logic: Dice ---

    function rollDice() {
        if (isDrawing) return;
        isDrawing = true;

        elements.dice.classList.add('rolling');
        vibrate(100);

        // Dice rotation coordinates for results 1-6
        const rotations = {
            '1': 'rotateX(0deg) rotateY(0deg)',
            '2': 'rotateX(-90deg) rotateY(0deg)',
            '3': 'rotateX(0deg) rotateY(-90deg)',
            '4': 'rotateX(0deg) rotateY(90deg)',
            '5': 'rotateX(90deg) rotateY(0deg)',
            '6': 'rotateX(180deg) rotateY(0deg)'
        };

        // Standard 1-6 dice roll logic
        const resultValue = Math.floor(Math.random() * 6) + 1;
        const face = resultValue.toString();

        setTimeout(() => {
            elements.dice.classList.remove('rolling');
            elements.dice.style.transform = rotations[face];
            vibrate(60);

            setTimeout(() => {
                showResult(`🎲 掷得：${resultValue}点`, "掷骰子模式");
                isDrawing = false;
            }, 1000);
        }, 1200);
    }

    // --- Drawing Logic: Cards ---

    function renderCardDeck() {
        const currentGroup = state.groups[state.selectedGroupId];
        elements.cardDeck.innerHTML = '';

        // Limit to 12 cards for visual sanity
        const itemsToShow = currentGroup.items.slice(0, 12);

        itemsToShow.forEach((item, i) => {
            const card = document.createElement('div');
            card.className = 'card-item';
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">?</div>
                    <div class="card-front">${item.content}</div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (isDrawing || card.classList.contains('flipped')) return;
                isDrawing = true;
                vibrate(40);
                card.classList.add('flipped');

                setTimeout(() => {
                    showResult(item.content, currentGroup.name);
                    isDrawing = false;
                    // Reset deck on modal close usually, or let user click others?
                    // For now, simple re-render on modal close.
                }, 800);
            });

            elements.cardDeck.appendChild(card);
        });
    }

    // --- Helper Utilities ---

    function vibrate(ms) {
        if (window.Android && window.Android.vibrate) {
            window.Android.vibrate(ms);
        } else if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    }

    function showResult(val, group) {
        elements.resultContent.textContent = val;
        toggleModal(elements.resultModal, true);
        addToHistory(val, group);
    }

    // --- History Logic ---

    function addToHistory(value, groupName) {
        const item = {
            value,
            group: groupName,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        state.history.unshift(item);
        if (state.history.length > 50) state.history.pop();
        save();
        renderHistory();
    }

    function renderHistory() {
        elements.historyList.innerHTML = '';
        if (state.history.length === 0) {
            elements.historyList.innerHTML = '<div style="text-align:center; color:var(--text-muted); margin-top:2rem">No history yet</div>';
            return;
        }

        state.history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div>
                    <div class="val">${item.value}</div>
                    <div style="font-size:0.6rem; color:var(--text-muted)">${item.group}</div>
                </div>
                <div class="time">${item.time}</div>
            `;
            elements.historyList.appendChild(div);
        });
    }

    // --- Settings & Config Logic ---

    function renderConfig() {
        // Update Group Dropdown
        elements.groupSelect.innerHTML = '';
        Object.values(state.groups).forEach(group => {
            const opt = document.createElement('option');
            opt.value = group.id;
            opt.textContent = group.name;
            opt.selected = group.id === state.selectedGroupId;
            elements.groupSelect.appendChild(opt);
        });

        // Update Lots List
        const currentGroup = state.groups[state.selectedGroupId] || state.groups['default'];
        elements.lotInputs.innerHTML = '';
        currentGroup.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'lot-row';

            const input = document.createElement('input');
            input.type = 'text';
            input.value = item.content;
            input.placeholder = 'Item name...';
            input.addEventListener('input', (e) => {
                item.content = e.target.value;
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'small-icon-btn';
            delBtn.innerHTML = '&times;';
            delBtn.addEventListener('click', () => {
                currentGroup.items.splice(index, 1);
                renderConfig();
            });

            div.appendChild(input);
            div.appendChild(delBtn);
            elements.lotInputs.appendChild(div);
        });
    }

    function setupEventListeners() {
        // Mode Tabs on Home Screen
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const mode = tab.dataset.mode;
                const currentGroup = state.groups[state.selectedGroupId];
                currentGroup.type = mode; // Switch mode for current group
                save();
                updateUI();
            });
        });

        // Main Actions
        elements.drawBtn.addEventListener('click', handleDraw);
        elements.closeResult.addEventListener('click', () => {
            toggleModal(elements.resultModal, false);
            elements.stick.classList.remove('pop');
        });

        // History
        elements.historyToggle.addEventListener('click', () => {
            renderHistory();
            toggleModal(elements.historyModal, true);
        });
        elements.historyClose.addEventListener('click', () => toggleModal(elements.historyModal, false));
        elements.clearHistory.addEventListener('click', () => {
            if (confirm("Clear all history?")) {
                state.history = [];
                save();
                renderHistory();
            }
        });

        // Config Modal
        elements.configToggle.addEventListener('click', () => {
            renderConfig();
            toggleModal(elements.configModal, true);
        });
        elements.configClose.addEventListener('click', () => toggleModal(elements.configModal, false));

        // Preset Listener
        elements.presetSelect.addEventListener('change', (e) => {
            const presetKey = e.target.value;
            if (PRESETS[presetKey]) {
                const preset = PRESETS[presetKey];
                const newId = 'group_' + Date.now();
                state.groups[newId] = {
                    id: newId,
                    name: preset.name,
                    items: preset.items.map((it, i) => ({ id: i, content: it }))
                };
                state.selectedGroupId = newId;
                renderConfig();
                elements.presetSelect.value = ''; // Reset select
            }
        });

        // Group Management
        elements.groupSelect.addEventListener('change', (e) => {
            state.selectedGroupId = e.target.value;
            renderConfig();
        });

        elements.addGroupBtn.addEventListener('click', () => {
            const name = prompt("Collection Name?");
            if (name) {
                const id = 'group_' + Date.now();
                state.groups[id] = { id, name, items: [] };
                state.selectedGroupId = id;
                renderConfig();
            }
        });

        elements.deleteGroupBtn.addEventListener('click', () => {
            if (state.selectedGroupId === 'default') return alert("Cannot delete standard collection");
            if (confirm("Delete this entire collection?")) {
                delete state.groups[state.selectedGroupId];
                state.selectedGroupId = 'default';
                renderConfig();
            }
        });

        // Items Management
        elements.addItemBtn.addEventListener('click', () => {
            const group = state.groups[state.selectedGroupId];
            group.items.push({ id: Date.now(), content: '' });
            renderConfig();

            // Focus last input
            setTimeout(() => {
                const inputs = elements.lotInputs.querySelectorAll('input');
                if (inputs.length > 0) inputs[inputs.length - 1].focus();
            }, 100);
        });

        elements.saveConfig.addEventListener('click', () => {
            save();
            updateUI();
            toggleModal(elements.configModal, false);
        });
    }

    // --- Entry Point ---
    init();
});