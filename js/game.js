// Main game logic
console.log("Game initialized");

let potatoCount = 0;
let rawPotatoesPerSecond = 0;
let processedPotatoesPerSecond = 0;
let water = 100;
let soilNutrients = 100;
let oxygen = 100;

let waterEfficiency = 1;
let soilEfficiency = 1;
let oxygenEfficiency = 1;
let processingLevel = 0;

let plantingDelay = 2000; // 2 seconds
let lastPlantTime = 0;
let potatoesPerClick = 1;

const achievements = {
    firstPotato: false,
    // Add more achievements here as needed
};

function calculatePotatoesPerSecond() {
    return rawPotatoesPerSecond;
}

function consumeResources(amount = 1) {
    if (water >= amount && soilNutrients >= amount && oxygen >= amount) {
        water -= amount / waterEfficiency;
        soilNutrients -= amount / soilEfficiency;
        oxygen -= amount / oxygenEfficiency;
        return true;
    }
    return false;
}

function updateResources() {
    water = Math.max(0, water);
    soilNutrients = Math.max(0, soilNutrients);
    oxygen = Math.max(0, oxygen);
    potatoCount = Math.floor(potatoCount);

    updateDisplay();
    updateUpgradeButtons();
    checkAndRestartAutoplanters();
}

// Add these new variables at the beginning of the file
const MAX_FIELD_SIZE = 8;
const GROWTH_TIME = 8000; // 8 seconds in milliseconds
let potatoField = [];

// Modify the plantPotato function
function plantPotato() {
    const currentTime = Date.now();
    if (currentTime - lastPlantTime < plantingDelay) {
        return;
    }

    if (potatoField.length >= MAX_FIELD_SIZE) {
        alert("No more room in the field! Harvest some potatoes first.");
        return;
    }

    if (consumeResources()) {
        potatoField.push({
            plantedAt: currentTime,
            growthStage: 0
        });
        lastPlantTime = currentTime;
        updateDisplay();
        updateUpgradeButtons();
    } else {
        alert("Not enough resources to plant a potato! Explore Mars to find more resources.");
    }
    updatePlantButton();
}

// Add a new function to handle potato growth
function updatePotatoGrowth() {
    const currentTime = Date.now();
    potatoField = potatoField.map(potato => {
        const growthTime = currentTime - potato.plantedAt;
        potato.growthStage = Math.min(100, Math.floor((growthTime / GROWTH_TIME) * 100));
        return potato;
    });
    updateDisplay();
}

// Add a new function to harvest potatoes
function harvestPotatoes() {
    let harvestedCount = 0;
    potatoField = potatoField.filter(potato => {
        if (potato.growthStage >= 100) {
            harvestedCount++;
            return false;
        }
        return true;
    });
    potatoCount += harvestedCount;
    updateDisplay();
    checkAchievements();
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
    const updateElement = (id, text) => {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    };

    updateElement('potato-count', `Potatoes: ${potatoCount.toFixed(1)}`);
    updateElement('potatoes-per-second', `Potatoes per second: ${rawPotatoesPerSecond.toFixed(1)}`);
    updateElement('planting-level', `Planting Level: ${upgrades.planting[currentPlantingUpgrade].name}`);
    
    const autoplantersElement = document.getElementById('automated-planters');
    if (autoplantersElement) {
        if (autoplanters.length > 0) {
            autoplantersElement.style.display = 'block';
            autoplantersElement.textContent = `Automated Planters: ${autoplanters.length}`;
        } else {
            autoplantersElement.style.display = 'none';
        }
    }

    updateElement('water-count', `Water: ${Math.floor(water)}`);
    updateElement('soil-nutrients', `Soil Nutrients: ${Math.floor(soilNutrients)}`);
    updateElement('oxygen-level', `Oxygen: ${Math.floor(oxygen)}`);
    updateElement('exploration-rate', `Exploration Rate: ${totalExplorationRate.toFixed(1)} per second`);
    updateElement('purchased-upgrades', `Purchased Upgrades: ${purchasedUpgrades.map(u => u.name).join(', ')}`);

    const exploreButton = document.getElementById('explore-button');
    const currentTime = Date.now();
    const timeLeft = Math.max(0, exploreDelay - (currentTime - lastExploreTime));
    if (timeLeft > 0) {
        exploreButton.disabled = true;
        exploreButton.textContent = `Explore Mars Surface (${(timeLeft / 1000).toFixed(1)}s)`;
    } else {
        exploreButton.disabled = false;
        exploreButton.textContent = 'Explore Mars Surface';
    }

    // Add this line
    updateExplorationUpgradeButton();

    // Modify the updateDisplay function to show the potato field
    const fieldContainer = document.getElementById('potato-field');
    fieldContainer.innerHTML = '';
    potatoField.forEach((potato, index) => {
        const potatoElement = document.createElement('div');
        potatoElement.className = 'potato';
        potatoElement.style.backgroundSize = `${potato.growthStage}% 100%`;
        potatoElement.textContent = `${potato.growthStage}%`;
        fieldContainer.appendChild(potatoElement);
    });
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
    displayExplorationUpgrades();

    // Start the main game loop
    setInterval(updatePlantButton, 100);
    setInterval(updateResources, 100);
    setInterval(updatePotatoGrowth, 1000); // Update growth every second

    const fieldContainer = document.getElementById('potato-field');
    fieldContainer.addEventListener('click', harvestPotatoes);
});