document.addEventListener('DOMContentLoaded', () => {
    // State management
    let lots = [];
    const defaultCount = 10;

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
        configPanel.classList.add('hidden');
    });
});
