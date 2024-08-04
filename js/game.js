// Main game logic
console.log("Game initialized");

let potatoCount = 0;
let potatoesPerClick = 1;

function plantPotato() {
    potatoCount += potatoesPerClick;
    updateDisplay();
    updateUpgradeButtons();
}

function updateDisplay() {
    document.getElementById('potato-count').textContent = `Potatoes: ${potatoCount}`;
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    const plantButton = document.getElementById('plant-button');
    plantButton.addEventListener('click', plantPotato);
    updateDisplay();
    displayUpgrades(); // Make sure upgrades are displayed initially
});

// Function to update upgrade buttons (to be called after each potato plant)
function updateUpgradeButtons() {
    upgrades.forEach((upgrade, index) => {
        const button = document.getElementById(`upgrade-${index}`);
        if (button) {
            button.disabled = potatoCount < upgrade.cost;
        }
    });
}