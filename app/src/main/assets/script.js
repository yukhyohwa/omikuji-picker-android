document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------------------------------------------------------- */
    /*                               State Management                             */
    /* -------------------------------------------------------------------------- */
    let lots = [];
    const defaultCount = 10;

    // Theme State
    let currentTheme = localStorage.getItem('omikuji-theme') || 'system';

    // Initialize default lots
    function initDefaultLots() {
        const stored = localStorage.getItem('omikuji-lots-v2');
        if (stored) {
            lots = JSON.parse(stored);
        } else {
            lots = Array.from({ length: defaultCount }, (_, i) => {
                const num = i + 1;
                return {
                    id: num,
                    content: num % 2 === 0 ? `No.${num} (Even)` : `No.${num} (Odd)`
                };
            });
        }
    }

    initDefaultLots();

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
    const lotCountRange = document.getElementById('lot-count');
    const countDisplay = document.getElementById('count-display');
    const lotInputsContainer = document.getElementById('lot-inputs');
    const saveConfigBtn = document.getElementById('save-config');
    const themeOptions = document.querySelectorAll('.theme-opt');


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
        switch(faceValue) {
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
            // If already showing front, flip back first then draw new?
            // Or just reset immediately.
            resetCard();
            setTimeout(drawCard, 300); // Wait for reset
            return;
        }

        isFlipping = true;

        // 1. Generate Random Card
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        const randomValue = values[Math.floor(Math.random() * values.length)];

        // 2. Update UI (while hidden or before flipping)
        updateCardUI(randomSuit, randomValue);

        // 3. Flip Animation
        // Add class to flip
        cardContainer.classList.add('flipped');

        setTimeout(() => {
            showResult("Card Drawn", `${randomValue} of ${randomSuit.name}`);
            // Keep the card flipped until user clicks draw again or closes?
            // Let's reset the flag so they can draw again
             isFlipping = false;
        }, 800);
    }

    function resetCard() {
        cardContainer.classList.remove('flipped');
    }

    function updateCardUI(suit, value) {
        const frontFace = cardContainer.querySelector('.card-front');

        // Clear existing classes (suit colors)
        frontFace.className = 'card-face card-front ' + suit.color;

        // Update corners
        const corners = frontFace.querySelectorAll('.card-corner');
        corners.forEach(corner => {
            corner.querySelector('.card-value').textContent = value;
            corner.querySelector('.card-suit').textContent = suit.char;
        });

        // Update center
        frontFace.querySelector('.card-suit-large').textContent = suit.char;
    }

    if (drawCardBtn) {
        drawCardBtn.addEventListener('click', () => {
             if (cardContainer.classList.contains('flipped')) {
                 resetCard();
                 setTimeout(drawCard, 600); // Wait for flip back
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

        // Adjust font size based on length
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
    function renderConfigInputs(count) {
        lotInputsContainer.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const lot = lots[i] || { id: i + 1, content: `No.${i + 1}` };

            const div = document.createElement('div');
            div.className = 'lot-input-wrapper';
            div.innerHTML = `
                <span>${i + 1}</span>
                <input type="text" value="${lot.content}" data-index="${i}" maxlength="10">
            `;
            lotInputsContainer.appendChild(div);
        }
    }

    configToggle.addEventListener('click', () => {
        lotCountRange.value = lots.length;
        countDisplay.textContent = lots.length;
        renderConfigInputs(lots.length);
        configPanel.classList.remove('hidden');
    });

    configClose.addEventListener('click', () => {
        configPanel.classList.add('hidden');
    });

    lotCountRange.addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        countDisplay.textContent = count;
        renderConfigInputs(count);
    });

    saveConfigBtn.addEventListener('click', () => {
        // Save Lots
        const inputs = lotInputsContainer.querySelectorAll('input');
        const newLots = [];

        inputs.forEach((input, i) => {
            newLots.push({
                id: i + 1,
                content: input.value || `No.${i + 1}`
            });
        });

        lots = newLots;
        localStorage.setItem('omikuji-lots-v2', JSON.stringify(lots));

        // Theme is already saved on click

        configPanel.classList.add('hidden');
    });
});
