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

let plantingDelay = 2000; // 2 seconds
let lastPlantTime = 0;

function plantPotato() {
    const currentTime = Date.now();
    if (currentTime - lastPlantTime < plantingDelay) {
        return;
    }

    if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
        potatoCount += potatoesPerClick;
        water -= 1 / waterEfficiency;
        soilNutrients -= 1 / soilEfficiency;
        oxygen -= 1 / oxygenEfficiency;
        lastPlantTime = currentTime;
        updateDisplay();
        updateUpgradeButtons();
        checkAchievements();
    } else {
        alert("Not enough resources to plant a potato! Explore Mars to find more resources.");
    }
    updatePlantButton();
}

function updatePlantButton() {
    const plantButton = document.getElementById('plant-button');
    const currentTime = Date.now();
    const timeLeft = Math.max(0, plantingDelay - (currentTime - lastPlantTime));
    
    if (timeLeft > 0) {
        plantButton.disabled = true;
        plantButton.textContent = `Plant Potato (${(timeLeft / 1000).toFixed(1)}s)`;
    } else {
        plantButton.disabled = false;
        plantButton.textContent = 'Plant Potato';
    }
}

function checkAchievements() {
    if (potatoCount >= 1 && !achievements.firstPotato) {
        achievements.firstPotato = true;
        alert("Achievement Unlocked: One Small Step for Spud!");
    }
    // Add more achievements here
}

function updateDisplay() {
    document.getElementById('potato-count').textContent = `Potatoes: ${potatoCount.toFixed(2)}`;
    document.getElementById('water-count').textContent = `Water: ${water.toFixed(2)}`;
    document.getElementById('soil-nutrients').textContent = `Soil Nutrients: ${soilNutrients.toFixed(2)}`;
    document.getElementById('oxygen-level').textContent = `Oxygen: ${oxygen.toFixed(2)}`;
    document.getElementById('exploration-level').textContent = `Exploration Level: ${explorationLevel}`;
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

    // Start the main game loop
    setInterval(updatePlantButton, 100);
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