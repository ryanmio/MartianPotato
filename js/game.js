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

function plantPotato() {
    const currentTime = Date.now();
    if (currentTime - lastPlantTime < plantingDelay) {
        return;
    }

    if (consumeResources()) {
        potatoCount++;
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
    setInterval(updateResources, 100);
});