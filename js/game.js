// Main game logic
console.log("Game initialized");

let potatoCount = 0;
let potatoesPerClick = 1;
let water = 100;
let soilNutrients = 100;
let oxygen = 100;

let waterEfficiency = 1;
let soilEfficiency = 1;
let oxygenEfficiency = 1;

function plantPotato() {
    if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
        potatoCount += potatoesPerClick;
        water -= 1 / waterEfficiency;
        soilNutrients -= 1 / soilEfficiency;
        oxygen -= 1 / oxygenEfficiency;
        updateDisplay();
        updateUpgradeButtons();
    } else {
        alert("Not enough resources to plant a potato!");
    }
}

function updateDisplay() {
    document.getElementById('potato-count').textContent = `Potatoes: ${potatoCount.toFixed(2)}`;
    document.getElementById('water-count').textContent = `Water: ${water.toFixed(2)}`;
    document.getElementById('soil-nutrients').textContent = `Soil Nutrients: ${soilNutrients.toFixed(2)}`;
    document.getElementById('oxygen-level').textContent = `Oxygen: ${oxygen.toFixed(2)}`;
}

function research(type) {
    switch(type) {
        case 'water':
            if (potatoCount >= 50) {
                potatoCount -= 50;
                waterEfficiency *= 1.5;
                alert("Water collection efficiency improved!");
            }
            break;
        case 'soil':
            if (potatoCount >= 50) {
                potatoCount -= 50;
                soilEfficiency *= 1.5;
                alert("Soil enrichment efficiency improved!");
            }
            break;
        case 'oxygen':
            if (potatoCount >= 50) {
                potatoCount -= 50;
                oxygenEfficiency *= 1.5;
                alert("Oxygen production efficiency improved!");
            }
            break;
    }
    updateDisplay();
    updateUpgradeButtons();
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    const plantButton = document.getElementById('plant-button');
    plantButton.addEventListener('click', plantPotato);

    const researchWaterButton = document.getElementById('research-water');
    researchWaterButton.addEventListener('click', () => research('water'));

    const researchSoilButton = document.getElementById('research-soil');
    researchSoilButton.addEventListener('click', () => research('soil'));

    const researchOxygenButton = document.getElementById('research-oxygen');
    researchOxygenButton.addEventListener('click', () => research('oxygen'));

    updateDisplay();
    displayUpgrades();
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