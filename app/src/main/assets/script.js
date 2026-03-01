document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------------------------------------------------------- */
    /*                               State Management                             */
    /* -------------------------------------------------------------------------- */
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

    // Theme State
    let currentTheme = localStorage.getItem('omikuji-theme') || 'system';

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
    }

    initState();

    function saveState() {
        localStorage.setItem('omikuji-data-v3', JSON.stringify(appState));
    }

    function getCurrentGroup() {
        return appState.groups[appState.selectedGroupId] || appState.groups['default'];
    }

    /* -------------------------------------------------------------------------- */
    /*                               DOM Elements                                 */
    /* -------------------------------------------------------------------------- */
    // Tabs
    const tabContents = document.querySelectorAll('.tab-content');
    const navItems = document.querySelectorAll('.nav-item');

    // Omikuji
    const omikujiBox = document.getElementById('omikuji-box');
    const drawBtn = document.getElementById('draw-btn');
    const stick = document.getElementById('stick');
    const stickLabel = stick.querySelector('.stick-label');

    // Result Overlay
    const resultOverlay = document.getElementById('result-overlay');
    const resultHeader = document.querySelector('.result-header');
    const resultContent = document.getElementById('result-content');
    const closeResult = document.getElementById('close-result');

    // Config Panel
    const configToggle = document.getElementById('config-toggle');
    const configPanel = document.getElementById('config-panel');
    const configClose = document.getElementById('config-close');
    const lotInputsContainer = document.getElementById('lot-inputs');
    const saveConfigBtn = document.getElementById('save-config');
    const themeOptions = document.querySelectorAll('.theme-opt');
    const groupSelect = document.getElementById('group-select');
    const addGroupBtn = document.getElementById('add-group-btn');
    const deleteGroupBtn = document.getElementById('delete-group-btn');
    const addItemBtn = document.getElementById('add-item-btn');


    /* -------------------------------------------------------------------------- */
    /*                               Theme Logic                                  */
    /* -------------------------------------------------------------------------- */
    function applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');

        if (theme === 'system') {
            // No class needed, CSS media query handles it
        } else {
            document.body.classList.add(`theme-${theme}`);
        }

        // Update UI
        themeOptions.forEach(opt => {
            if (opt.dataset.theme === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });

        localStorage.setItem('omikuji-theme', theme);
        currentTheme = theme;
    }

    // Initialize Theme
    applyTheme(currentTheme);

    // Theme Switcher Event Listeners
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            applyTheme(opt.dataset.theme);
        });
    });


    /* -------------------------------------------------------------------------- */
    /*                               Tab Navigation                               */
    /* -------------------------------------------------------------------------- */
    function switchTab(targetId) {
        // Update Content
        tabContents.forEach(tab => {
            if (tab.id === targetId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Update Nav
        navItems.forEach(item => {
            if (item.dataset.target === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchTab(item.dataset.target);
        });
    });


    /* -------------------------------------------------------------------------- */
    /*                               Omikuji Logic                                */
    /* -------------------------------------------------------------------------- */
    let isDrawing = false;

    function drawOmikuji() {
        if (isDrawing) return;

        const currentGroup = getCurrentGroup();
        if (!currentGroup.items || currentGroup.items.length === 0) {
            alert("This collection is empty! Add some items in Settings.");
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

            // Show stick (cap text length for small stick)
            const displayContent = selectedLot.content || "Empty";
            stickLabel.textContent = displayContent.length > 8 ? displayContent.substring(0, 6) + '..' : displayContent;
            stick.classList.add('pop');

            // Show result after stick pops
            setTimeout(() => {
                showResult("Omikuji Result", selectedLot.content);
                isDrawing = false;
            }, 1000);

        }, 1500);
    }

    if (drawBtn) {
        drawBtn.addEventListener('click', drawOmikuji);
    }


    /* -------------------------------------------------------------------------- */
    /*                               Dice Logic                                   */
    /* -------------------------------------------------------------------------- */
    const diceCube = document.getElementById('dice');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    let isRolling = false;

    function getRotationForFace(faceValue) {
        let x = 0, y = 0;
        switch (faceValue) {
            case 1: x = 0; y = 0; break;
            case 6: x = 180; y = 0; break;
            case 2: x = -90; y = 0; break;
            case 5: x = 90; y = 0; break;
            case 3: x = 0; y = -90; break;
            case 4: x = 0; y = 90; break;
        }
        return { x, y };
    }

    function rollDice() {
        if (isRolling) return;
        isRolling = true;

        diceCube.classList.add('rolling');

        // Wait for roll animation cycle
        setTimeout(() => {
            diceCube.classList.remove('rolling');

            const result = Math.floor(Math.random() * 6) + 1;
            const base = getRotationForFace(result);

            // Set final rotation
            diceCube.style.transform = `translateZ(-50px) rotateX(${base.x}deg) rotateY(${base.y}deg)`;

            setTimeout(() => {
                showResult("Dice Result", result.toString());
                isRolling = false;
            }, 600);

        }, 600);
    }

    if (rollDiceBtn) {
        rollDiceBtn.addEventListener('click', rollDice);
    }


    /* -------------------------------------------------------------------------- */
    /*                               Cards Logic                                  */
    /* -------------------------------------------------------------------------- */
    const cardContainer = document.getElementById('card');
    const drawCardBtn = document.getElementById('draw-card-btn');
    let isFlipping = false;

    // Card Data
    const suits = [
        { char: '♠', name: 'Spades', color: 'suit-black' },
        { char: '♥', name: 'Hearts', color: 'suit-red' },
        { char: '♣', name: 'Clubs', color: 'suit-black' },
        { char: '♦', name: 'Diamonds', color: 'suit-red' }
    ];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    function drawCard() {
        if (isFlipping) {
            resetCard();
            setTimeout(drawCard, 300);
            return;
        }

        isFlipping = true;

        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        const randomValue = values[Math.floor(Math.random() * values.length)];

        updateCardUI(randomSuit, randomValue);

        cardContainer.classList.add('flipped');

        setTimeout(() => {
            showResult("Card Drawn", `${randomValue} of ${randomSuit.name}`);
            isFlipping = false;
        }, 800);
    }

    function resetCard() {
        cardContainer.classList.remove('flipped');
    }

    function updateCardUI(suit, value) {
        const frontFace = cardContainer.querySelector('.card-front');
        frontFace.className = 'card-face card-front ' + suit.color;

        const corners = frontFace.querySelectorAll('.card-corner');
        corners.forEach(corner => {
            corner.querySelector('.card-value').textContent = value;
            corner.querySelector('.card-suit').textContent = suit.char;
        });

        frontFace.querySelector('.card-suit-large').textContent = suit.char;
    }

    if (drawCardBtn) {
        drawCardBtn.addEventListener('click', () => {
            if (cardContainer.classList.contains('flipped')) {
                resetCard();
                setTimeout(drawCard, 600);
            } else {
                drawCard();
            }
        });
    }


    /* -------------------------------------------------------------------------- */
    /*                               Result Overlay                               */
    /* -------------------------------------------------------------------------- */
    function showResult(title, content) {
        resultHeader.textContent = title;
        resultContent.textContent = content;

        if (content.length > 5) {
            resultContent.style.fontSize = "2rem";
        } else {
            resultContent.style.fontSize = "3rem";
        }

        resultOverlay.classList.remove('hidden');
    }

    closeResult.addEventListener('click', () => {
        resultOverlay.classList.add('hidden');
        if (stick) stick.classList.remove('pop');
    });


    /* -------------------------------------------------------------------------- */
    /*                               Config Panel                                 */
    /* -------------------------------------------------------------------------- */
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

                const span = document.createElement('span');
                span.textContent = index + 1;

                const input = document.createElement('input');
                input.type = "text";
                input.value = item.content;
                input.dataset.index = index;
                input.maxLength = 20;

                input.addEventListener('input', (e) => {
                    currentGroup.items[index].content = e.target.value;
                });

                div.appendChild(span);
                div.appendChild(input);
                lotInputsContainer.appendChild(div);
            });
        }
    }

    configToggle.addEventListener('click', () => {
        renderConfig();
        configPanel.classList.remove('hidden');
    });

    configClose.addEventListener('click', () => {
        configPanel.classList.add('hidden');
    });

    groupSelect.addEventListener('change', (e) => {
        appState.selectedGroupId = e.target.value;
        saveState();
        renderConfig();
    });

    addGroupBtn.addEventListener('click', () => {
        const name = prompt("Enter new collection name:");
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
        }
    });

    deleteGroupBtn.addEventListener('click', () => {
        const group = getCurrentGroup();
        if (group.id === 'default') {
            alert("Standard collection cannot be deleted.");
            return;
        }
        if (confirm(`Delete entire collection "${group.name}"?`)) {
            delete appState.groups[group.id];
            appState.selectedGroupId = 'default';
            saveState();
            renderConfig();
        }
    });

    addItemBtn.addEventListener('click', () => {
        const group = getCurrentGroup();
        if (group.items.length >= 24) {
            alert("Maximum 24 items per collection.");
            return;
        }
        group.items.push({ id: Date.now(), content: '' });
        renderConfig();

        // Focus the new input
        const lastInput = lotInputsContainer.querySelector('div:last-child input');
        if (lastInput) lastInput.focus();
    });

    saveConfigBtn.addEventListener('click', () => {
        saveState();
        configPanel.classList.add('hidden');
    });
});
