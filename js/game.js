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
    return autoplanters.length / (GROWTH_TIME / 1000);
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
let potatoField = new Array(MAX_FIELD_SIZE).fill(null);

// Modify the plantPotato function
function plantPotato() {
    const currentTime = Date.now();
    if (currentTime - lastPlantTime < plantingDelay) {
        return;
    }

    const emptySlotIndex = potatoField.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
        alert("No more room in the field! Harvest some potatoes first.");
        return;
    }

    if (consumeResources()) {
        const rotation = Math.floor(Math.random() * 10) - 5;
        const scaleX = 0.95 + Math.random() * 0.1;
        const scaleY = 0.95 + Math.random() * 0.1;
        const borderRadius = `${45 + Math.random() * 10}% ${55 + Math.random() * 10}% ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% / ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% ${55 + Math.random() * 10}% ${45 + Math.random() * 10}%`;
        
        potatoField[emptySlotIndex] = {
            plantedAt: currentTime,
            growthStage: 0,
            rotation,
            scaleX,
            scaleY,
            borderRadius
        };
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
        if (potato !== null) {
            const growthTime = currentTime - potato.plantedAt;
            potato.growthStage = Math.min(100, Math.floor((growthTime / GROWTH_TIME) * 100));
        }
        return potato;
    });
    autoHarvesters.forEach(autoHarvester => {
        if (!autoHarvester.interval) {
            startAutoHarvester(autoHarvester);
        }
    });
    updateDisplay();
}

// Modify the harvestPotatoes function
function harvestPotatoAtIndex(index) {
    console.log(`Attempting to harvest potato at index ${index}`);
    if (potatoField[index] && potatoField[index].growthStage >= 100) {
        potatoCount++;
        potatoField[index] = null; // Replace with empty slot instead of removing
        console.log(`Harvested potato at index ${index}`);
        updateDisplay();
        checkAchievements();
    } else {
        console.log(`Potato at index ${index} is not ready for harvesting`);
    }
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

    // Update potato field display only if there are changes
    const fieldContainer = document.getElementById('potato-field');
    const currentPotatoFieldHTML = potatoField.map((potato, index) => {
        if (potato === null) {
            return `<div class="potato-slot"></div>`;
        }
        const growthStage = potato.growthStage;
        const harvestableClass = growthStage >= 100 ? 'harvestable' : '';
        const growthColor = growthStage < 33 ? 'rgba(139, 195, 74, 0.4)' : growthStage < 66 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(56, 142, 60, 0.4)';
        
        return `
            <div class="potato-slot">
                <div class="potato ${harvestableClass}" data-index="${index}" style="transform: rotate(${potato.rotation}deg) scale(${potato.scaleX}, ${potato.scaleY}); border-radius: ${potato.borderRadius};">
                    <div class="growth-indicator" style="height: ${growthStage}%; background-color: ${growthColor};"></div>
                    <span class="growth-text">${growthStage}%</span>
                </div>
            </div>
        `;
    }).join('');

    if (fieldContainer.innerHTML !== currentPotatoFieldHTML) {
        fieldContainer.innerHTML = currentPotatoFieldHTML;

        // Attach event listeners to the new potato elements
        document.querySelectorAll('.potato').forEach(potatoElement => {
            potatoElement.addEventListener('click', () => {
                const index = parseInt(potatoElement.getAttribute('data-index'), 10);
                console.log(`Clicked on potato at index ${index}`);
                if (potatoField[index].growthStage >= 100) {
                    harvestPotatoAtIndex(index);
                } else {
                    console.log(`Potato at index ${index} is not ready for harvesting`);
                }
            });
        });
    }

    updateExplorationUpgradeButton();
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
    updateUpgradeButtons();

    // Start the main game loop
    setInterval(updatePlantButton, 100);
    setInterval(updateResources, 100);
    setInterval(updatePotatoGrowth, 1000); // Update growth every second
    setInterval(checkAndRestartAutoplanters, 5000); // Check autoplanters every 5 seconds

    const debugHarvestButton = document.getElementById('debug-harvest');
    debugHarvestButton.addEventListener('click', () => {
        console.log("Debug: Attempting to harvest all ready potatoes");
        potatoField.forEach((potato, index) => {
            if (potato && potato.growthStage >= 100) {
                harvestPotatoAtIndex(index);
            }
        });
        updateDisplay();
    });
});