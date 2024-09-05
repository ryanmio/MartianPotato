// Main game logic
console.log("Game initialized");

let potatoCount = 0;
let rawPotatoesPerSecond = 0;
let processedPotatoesPerSecond = 0;
let water = 100;
let soilNutrients = 100;
let oxygen = 100;

let processingLevel = 0;

let plantingDelay = 4000; // 4 seconds, matching the initial "Hand Trowel" upgrade
let lastPlantTime = 0;
let potatoesPerClick = 1;

const achievements = {
    firstPotato: false,
    // Add more achievements here as needed
};

function calculatePotatoesPerSecond() {
    return autoplanters.length / (GROWTH_TIME / 1000);
}

// Keep these variables
let waterEfficiency = 1;
let soilEfficiency = 1;
let oxygenEfficiency = 1;

// Modify the consumeResources function to use the efficiency multipliers
function consumeResources(amount = 1) {
    if (water >= amount && soilNutrients >= amount && oxygen >= amount) {
        water -= amount / waterEfficiency;
        soilNutrients -= amount / soilEfficiency;
        oxygen -= amount / oxygenEfficiency;
        return true;
    }
    return false;
}

let lastUpdateTime = 0;
const UPDATE_INTERVAL = 1000; // Update every second

function updateResources(currentTime) {
    if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
        water = Math.max(0, water);
        soilNutrients = Math.max(0, soilNutrients);
        oxygen = Math.max(0, oxygen);
        potatoCount = Math.floor(potatoCount);

        lastUpdateTime = currentTime;
        return true;
    }
    return false;
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
        showToast("No Room", "No more room in the field! Harvest some potatoes first.", 'setback');
        return;
    }

    if (consumeResources()) {
        const scaleX = 0.95 + Math.random() * 0.1;
        const scaleY = 0.95 + Math.random() * 0.1;
        const borderRadius = `${45 + Math.random() * 10}% ${55 + Math.random() * 10}% ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% / ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% ${55 + Math.random() * 10}% ${45 + Math.random() * 10}%`;
        const textureClass = `potato-texture-${Math.floor(Math.random() * 8) + 1}`;
        
        potatoField[emptySlotIndex] = {
            plantedAt: currentTime,
            growthStage: 0,
            scaleX,
            scaleY,
            borderRadius,
            textureClass
        };
        lastPlantTime = currentTime;
        updateDisplay();
        updateLastAction("Planted Potato");
    } else {
        showToast("Not Enough Resources", "Not enough resources to plant a potato! Explore Mars to find more resources.", 'setback');
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
    updateDisplay();
}

// Modify the harvestPotatoes function
function harvestPotatoAtIndex(index) {
    updateLastAction(`Attempting to harvest potato at index ${index}`);
    if (potatoField[index] && potatoField[index].growthStage >= 100) {
        potatoCount = Math.floor(potatoCount + 1);
        potatoField[index] = null; // Replace with empty slot instead of removing
        updateLastAction(`Harvested potato at index ${index}`);
        updateDisplay();
        checkAchievements();
    } else {
        updateLastAction(`Potato at index ${index} is not ready for harvesting`);
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
        showToast("Achievement Unlocked", "One Small Step for Spud!");
    }
    // Add more achievements here
}

// Add this function to initialize the potato field
function initializePotatoField() {
    const fieldContainer = document.getElementById('potato-field');
    for (let i = 0; i < MAX_FIELD_SIZE; i++) {
        const slotElement = document.createElement('div');
        slotElement.className = 'potato-slot';
        slotElement.setAttribute('data-index', i);
        fieldContainer.appendChild(slotElement);
    }
}

function updateDisplay() {
    const updateElementIfChanged = (id, newText) => {
        const element = document.getElementById(id);
        if (element && element.textContent !== newText) {
            element.textContent = newText;
        }
    };

    updateElementIfChanged('potato-count', `Potatoes: ${Math.floor(potatoCount)}`);
    updateElementIfChanged('potatoes-per-second', `Potatoes per second: ${rawPotatoesPerSecond.toFixed(1)}`);
    updateElementIfChanged('water-count', `Water: ${Math.floor(water)}`);
    updateElementIfChanged('soil-nutrients', `Soil Nutrients: ${Math.floor(soilNutrients)}`);
    updateElementIfChanged('oxygen-level', `Oxygen: ${Math.floor(oxygen)}`);
    updateElementIfChanged('exploration-rate', `Exploration Rate: ${Math.floor(window.totalExplorationRate * 60)} per minute`);
    updateElementIfChanged('purchased-upgrades', `Purchased Upgrades: ${(window.purchasedUpgrades || []).map(u => u.name).join(', ')}`);
    updateElementIfChanged('auto-harvesters', `Auto Harvesters: ${autoHarvesters.length}`);

    const autoplantersElement = document.getElementById('automated-planters');
    if (autoplantersElement) {
        const newText = `Automated Planters: ${autoplanters.length}`;
        if (autoplantersElement.textContent !== newText) {
            autoplantersElement.textContent = newText;
            autoplantersElement.style.display = autoplanters.length > 0 ? 'block' : 'none';
        }
    }

    updateExploreButton();
    updatePotatoField();
    updateTechTree(); // Changed from createTechTree()
    updateIceMeltingProgress();
}

function updateExploreButton() {
    const exploreButton = document.getElementById('explore-button');
    const cooldownElement = document.getElementById('exploration-cooldown');
    
    if (!exploreButton || !cooldownElement) return;

    const currentTime = Date.now();
    const timeLeft = Math.max(0, window.exploreDelay - (currentTime - window.lastExploreTime));
    
    exploreButton.disabled = timeLeft > 0;
    
    if (timeLeft > 0) {
        cooldownElement.textContent = `(${(timeLeft / 1000).toFixed(1)}s)`;
    } else {
        cooldownElement.textContent = 'Ready';
    }
}

function updatePotatoField() {
    const fieldContainer = document.getElementById('potato-field');
    potatoField.forEach((potato, index) => {
        let slotElement = fieldContainer.querySelector(`.potato-slot[data-index="${index}"]`);
        if (!slotElement) {
            slotElement = document.createElement('div');
            slotElement.className = 'potato-slot';
            slotElement.setAttribute('data-index', index);
            fieldContainer.appendChild(slotElement);
        }

        if (potato === null) {
            if (slotElement.firstChild) slotElement.innerHTML = '';
        } else {
            updatePotatoElement(slotElement, potato);
        }
    });
}

function updatePotatoElement(slotElement, potato) {
    let potatoElement = slotElement.querySelector('.potato');
    if (!potatoElement) {
        potatoElement = document.createElement('div');
        potatoElement.className = 'potato';
        potatoElement.innerHTML = `
            <div class="growth-indicator"></div>
            <div class="growth-text-container">
                <span class="growth-text"></span>
            </div>
        `;
        slotElement.appendChild(potatoElement);
    }

    const growthStage = potato.growthStage;
    const harvestableClass = growthStage >= 100 ? 'harvestable' : '';
    const growthColor = growthStage < 33 ? 'rgba(139, 195, 74, 0.4)' : growthStage < 66 ? 'rgba(76, 175, 80, 0.4)' : 'rgba(56, 142, 60, 0.4)';

    if (potatoElement.className !== `potato ${harvestableClass} ${potato.textureClass}`) {
        potatoElement.className = `potato ${harvestableClass} ${potato.textureClass}`;
    }
    if (potatoElement.style.transform !== `scale(${potato.scaleX}, ${potato.scaleY})`) {
        potatoElement.style.transform = `scale(${potato.scaleX}, ${potato.scaleY})`;
    }
    if (potatoElement.style.borderRadius !== potato.borderRadius) {
        potatoElement.style.borderRadius = potato.borderRadius;
    }
    
    let growthIndicator = potatoElement.querySelector('.growth-indicator');
    if (growthIndicator.style.height !== `${growthStage}%` || growthIndicator.style.backgroundColor !== growthColor) {
        growthIndicator.style.height = `${growthStage}%`;
        growthIndicator.style.backgroundColor = growthColor;
    }
    
    let growthText = potatoElement.querySelector('.growth-text');
    if (growthText.textContent !== `${growthStage}%`) {
        growthText.textContent = `${growthStage}%`;
    }
}

const FRAME_RATE = 30; // 30 fps
const FRAME_DELAY = 1000 / FRAME_RATE;
let lastFrameTime = 0;

function gameLoop(currentTime) {
    if (currentTime - lastFrameTime >= FRAME_DELAY) {
        updatePlantButton();
        if (updateResources(currentTime)) {
            updateDisplay();
            checkAndRestartAutoplanters();
        }
        updatePotatoGrowth();
        updateTechTree();
        updateExploreButton();
        
        if (debugMode) {
            const updateTime = performance.now() - startTime;
            updateDebugInfo(currentTime, updateTime);
        }
        
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

function updateNonCriticalElements() {
    requestIdleCallback(() => {
        displayExplorationUpgrades();
    });
}

// Add these variables at the top of the file
let debugMode = false;
let fpsValues = [];
let lastDebugUpdateTime = 0;
let lastResourceValues = { water: 0, soilNutrients: 0, oxygen: 0 };
let lastAction = "None";

// Add this function to toggle debug mode
function toggleDebugMode() {
    debugMode = !debugMode;
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.style.display = debugMode ? 'block' : 'none';
        if (debugMode) {
            // Initialize debug info when first enabled
            updateDebugInfo(performance.now(), 0);
            // Add 1,000,000 potatoes when debug mode is enabled
            potatoCount += 1000000;
            updateDisplay();
            showToast("Debug Mode", "Added 1,000,000 potatoes for testing", 'debug');
        }
    }
}

// Add this function to update debug information
function updateDebugInfo(currentTime, updateTime) {
    const debugInfoContainer = document.getElementById('debug-info');
    if (!debugInfoContainer || debugInfoContainer.style.display === 'none') {
        return; // Exit if debug info is not visible
    }

    try {
        const fps = 1000 / (currentTime - lastDebugUpdateTime);
        fpsValues.push(fps);
        if (fpsValues.length > 60) fpsValues.shift();
        const averageFps = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
        
        const memoryUsage = performance.memory ? (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A';
        const activePotatoes = potatoField.filter(potato => potato !== null).length;
        
        const resourceGeneration = {
            water: ((water - lastResourceValues.water) * 1000 / (currentTime - lastDebugUpdateTime)).toFixed(2),
            soilNutrients: ((soilNutrients - lastResourceValues.soilNutrients) * 1000 / (currentTime - lastDebugUpdateTime)).toFixed(2),
            oxygen: ((oxygen - lastResourceValues.oxygen) * 1000 / (currentTime - lastDebugUpdateTime)).toFixed(2)
        };
        
        const updateElement = (id, text) => {
            const element = debugInfoContainer.querySelector(`#${id}`);
            if (element) element.textContent = text;
        };

        updateElement('fps', `FPS: ${averageFps.toFixed(2)}`);
        updateElement('update-time', `Last Update Time: ${updateTime.toFixed(2)}ms`);
        updateElement('memory-usage', `Memory Usage: ${memoryUsage} MB`);
        updateElement('potato-count-debug', `Potato Count: ${potatoCount.toFixed(2)}`);
        updateElement('active-potatoes', `Active Potatoes: ${activePotatoes}`);
        updateElement('resource-usage', `Resource Usage: Water (${water.toFixed(2)}), Soil (${soilNutrients.toFixed(2)}), Oxygen (${oxygen.toFixed(2)})`);
        updateElement('resource-generation', `Resource Generation: Water (${resourceGeneration.water}/s), Soil (${resourceGeneration.soilNutrients}/s), Oxygen (${resourceGeneration.oxygen}/s)`);
        updateElement('last-action', `Last Action: ${lastAction}`);
        updateElement('planting-delay', `Planting Delay: ${plantingDelay}ms`);
        
        lastDebugUpdateTime = currentTime;
        lastResourceValues = { water, soilNutrients, oxygen };
    } catch (error) {
        console.error('Error updating debug info:', error);
    }
}

// Add this function to update the last action
function updateLastAction(action) {
    lastAction = action;
    if (debugMode) {
        document.getElementById('last-action').textContent = `Last Action: ${lastAction}`;
    }
}

// Add this function near the top of the file
window.showToast = function(title, message, type = 'achievement') {
    console.log("Showing toast:", title, message, type);
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
    `;
    toastContainer.appendChild(toast);

    // Trigger reflow to enable transition
    toast.offsetHeight;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    const plantButton = document.getElementById('plant-button');
    plantButton.addEventListener('click', plantPotato);

    initializePotatoField();

    document.getElementById('potato-field').addEventListener('click', (event) => {
        const slotElement = event.target.closest('.potato-slot');
        if (slotElement) {
            const index = parseInt(slotElement.getAttribute('data-index'), 10);
            if (potatoField[index] && potatoField[index].growthStage >= 100) {
                harvestPotatoAtIndex(index);
            }
        }
    });

    createTechTree(); // Add this line to create the tech tree once

    requestAnimationFrame(gameLoop);

    const debugHarvestButton = document.getElementById('debug-harvest');
    debugHarvestButton.addEventListener('click', () => {
        updateLastAction("Debug: Attempting to harvest all ready potatoes");
        potatoField.forEach((potato, index) => {
            if (potato && potato.growthStage >= 100) {
                harvestPotatoAtIndex(index);
            }
        });
        updateDisplay();
    });

    const toggleDebugModeButton = document.getElementById('toggle-debug-mode');
    toggleDebugModeButton.addEventListener('click', toggleDebugMode);

    const minimizeDebugButton = document.getElementById('minimize-debug');
    const debugInfo = document.getElementById('debug-info');

    minimizeDebugButton.addEventListener('click', () => {
        debugInfo.classList.toggle('minimized');
        minimizeDebugButton.setAttribute('data-text', 
            debugInfo.classList.contains('minimized') ? 'Maximize' : 'Minimize');
    });

    const iceCube = document.getElementById('ice-cube');
    iceCube.addEventListener('click', meltIce);
    updateIceMeltingProgress();
});

let waterMeltingClicks = 0;
const CLICKS_PER_WATER = 5;
let isManualIceMeltingUnlocked = false;

function meltIce() {
    if (!isManualIceMeltingUnlocked) return;
    
    waterMeltingClicks++;
    if (waterMeltingClicks >= CLICKS_PER_WATER) {
        water++;
        waterMeltingClicks = 0;
        showToast("Water Collected", "You've melted ice and collected 1 unit of water!", 'achievement');
    }
    updateIceMeltingProgress();
    updateDisplay();
    updateLastAction("Melted ice");
}

function unlockManualIceMelting() {
    isManualIceMeltingUnlocked = true;
    const iceMeltingContainer = document.getElementById('ice-melting-container');
    if (iceMeltingContainer) {
        iceMeltingContainer.style.display = 'block';
    }
}

function updateIceMeltingProgress() {
    const progressElement = document.getElementById('ice-melting-progress');
    const progress = (waterMeltingClicks / CLICKS_PER_WATER) * 100;
    progressElement.style.setProperty('--progress', progress);
    progressElement.textContent = `${waterMeltingClicks} / ${CLICKS_PER_WATER}`;
}