// This file contains the core game logic for the Martian Potato game
// It manages game state, resource handling, potato planting and harvesting, and UI updates

// Game Constants
let MAX_FIELD_SIZE = 8;
const GROWTH_TIME = 8000; // 8 seconds in milliseconds
const UPDATE_INTERVAL = 1000; // Update every second
const FRAME_RATE = 30; // 30 fps
const FRAME_DELAY = 1000 / FRAME_RATE;
const CLICKS_PER_WATER = 5;

// System Variables
let lastUpdateTime = 0;
let lastFrameTime = 0;
let debugMode = false;
let lastSaveTime = 0;

// Resource Variables
let potatoCount = 0;
let water = 100;
let nutrients = 100;
let ice = 100;

// Production Variables
let rawPotatoesPerSecond = 0;
let processedPotatoesPerSecond = 0;
let processingLevel = 0;

// Planting Variables
let plantingDelay = 5000;
let lastPlantTime = 0;
let potatoesPerClick = 1;

// Resource Efficiency Multipliers
let waterEfficiency = 1;
let soilEfficiency = 1;
let iceEfficiency = 1;

// Ice Melting Variables
let waterMeltingClicks = 0;
let isManualIceMeltingUnlocked = false;

// Ice Melting Basin Variables
let isIceMeltingBasinUnlocked = false;
let iceMeltingBasinTimer = 0;
let iceMeltingBasinActive = false;

// Nuclear Ice Melter Variables
let isNuclearIceMelterUnlocked = false;
let isNuclearIceMelterActive = false;
let nuclearIceMelterInterval = null;

// Large Data Structures
let potatoField = new Array(MAX_FIELD_SIZE).fill(null);

// Achievement Tracking
let achievements = {
    firstPotato: false,
    potatoCentury: false,
    iceMeltingBasinMaster: false,
    nuclearIceMelterMaster: false,
};

// Debug Variables
let fpsValues = [];
let lastDebugUpdateTime = 0;
let lastResourceValues = { water: 0, nutrients: 0, ice: 0 };
let lastAction = "None";

// Calculate the rate of potato production
function calculatePotatoesPerSecond() {
    return autoplanters.length / (GROWTH_TIME / 1000);
}

// Consume resources for potato growth, applying efficiency multipliers
function consumeResources(amount = 1) {
    if (water >= amount && nutrients >= amount && ice >= amount) {
        water -= amount / waterEfficiency;
        nutrients -= amount / soilEfficiency;
        ice -= amount / iceEfficiency;
        return true;
    }
    return false;
}

// Update game resources and ensure they don't go below zero
function updateResources(currentTime) {
    if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
        water = Math.max(0, water);
        nutrients = Math.max(0, nutrients);
        ice = Math.max(0, ice);
        potatoCount = Math.floor(potatoCount);

        if (iceMeltingBasinActive) {
            water++;
            iceMeltingBasinTimer--;
            if (iceMeltingBasinTimer <= 0) {
                iceMeltingBasinActive = false;
            }
            updateIceMeltingBasinButton();
        }

        lastUpdateTime = currentTime;
        return true;
    }
    return false;
}

// Plant a potato in an empty field slot
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
        // Generate random potato appearance properties
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

// Update the growth stage of all planted potatoes
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

// Harvest a fully grown potato at the specified index
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

// Update the plant button state and cooldown display
function updatePlantButton() {
    const plantButton = document.getElementById('plant-button');
    const currentTime = Date.now();
    const timeLeft = Math.max(0, plantingDelay - (currentTime - lastPlantTime));
    
    if (timeLeft > 0) {
        plantButton.disabled = true;
        plantButton.textContent = `${(timeLeft / 1000).toFixed(1)}s`;
    } else {
        plantButton.disabled = false;
        plantButton.textContent = 'Plant Potato';
    }
}

// Check and update game achievements
function checkAchievements() {
    if (potatoCount >= 1 && !achievements.firstPotato) {
        achievements.firstPotato = true;
        queueAchievement(
            "First Potato",
            "You've harvested your first Martian potato!",
            "This marks the beginning of your journey to colonize Mars with potatoes.",
            "🥔" // Use the potato emoji instead of an image file
        );
    }
    if (potatoCount >= 100 && !achievements.potatoCentury) {
        achievements.potatoCentury = true;
        queueAchievement(
            "Potato Century",
            "You've harvested 100 Martian potatoes!",
            "Your potato farm is starting to take shape. The future of Mars is looking delicious!",
            "potato_century.webp"
        );
    }
    if (!achievements.iceMeltingBasinMaster && iceMeltingBasinTimer === 1) {
        achievements.iceMeltingBasinMaster = true;
        queueAchievement(
            "Ice Melting Basin Master",
            "You've mastered the art of efficient ice melting!",
            "Efficiency is key on Mars. You're turning ice into a steady stream of water.",
            "ice_melting_basin_master.webp"
        );
    }
    if (!achievements.nuclearIceMelterMaster && isNuclearIceMelterActive) {
        achievements.nuclearIceMelterMaster = true;
        queueAchievement(
            "Nuclear Ice Melter Master",
            "You've harnessed the power of the atom to melt Martian ice!",
            "High-energy solutions bring high rewards. You're now operating at an industrial scale.",
            "nuclear_ice_melter_master.webp"
        );
    }
    // Add more achievement checks here as needed
}

// Initialize the visual representation of the potato field
function initializePotatoField() {
    const fieldContainer = document.getElementById('potato-field');
    fieldContainer.innerHTML = ''; // Clear existing slots
    for (let i = 0; i < MAX_FIELD_SIZE; i++) {
        const slotElement = document.createElement('div');
        slotElement.className = 'potato-slot';
        slotElement.setAttribute('data-index', i);
        fieldContainer.appendChild(slotElement);
    }
}

// Update the game display with current resource counts and rates
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
    updateElementIfChanged('nutrients', `Nutrients: ${Math.floor(nutrients)}`);
    updateElementIfChanged('ice-level', `Ice: ${Math.floor(ice)}`);
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

    const nuclearIceMelterToggle = document.getElementById('nuclear-ice-melter-toggle');
    if (nuclearIceMelterToggle) {
        nuclearIceMelterToggle.checked = isNuclearIceMelterActive;
    }

    updateExploreButton();
    updatePotatoField();
    updateTechTree();
    updateIceMeltingProgress();
    updateIceMeltingBasinButton();
}

// Update the explore button state and cooldown display
function updateExploreButton() {
    const exploreCard = document.getElementById('exploration-container');
    const cooldownElement = document.getElementById('exploration-cooldown');
    
    if (!exploreCard || !cooldownElement) return;

    const currentTime = Date.now();
    const timeLeft = Math.max(0, window.exploreDelay - (currentTime - window.lastExploreTime));
    
    if (timeLeft > 0) {
        exploreCard.setAttribute('disabled', 'true');
        cooldownElement.textContent = `(${(timeLeft / 1000).toFixed(1)}s)`;
    } else {
        exploreCard.removeAttribute('disabled');
        cooldownElement.textContent = 'Ready';
    }
}

// Update the visual representation of the potato field
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

// Update the visual representation of a single potato
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

// Main game loop function
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
        
        // Auto-save every minute
        if (currentTime - lastSaveTime >= 60000) {
            saveGame();
            lastSaveTime = currentTime;
        }
        
        if (debugMode) {
            const updateTime = performance.now() - startTime;
            updateDebugInfo(currentTime, updateTime);
        }
        
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

// Update non-critical elements during idle time
function updateNonCriticalElements() {
    requestIdleCallback(() => {
        displayExplorationUpgrades();
    });
}

// Toggle debug mode on/off
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

// Update debug information display
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
            nutrients: ((nutrients - lastResourceValues.nutrients) * 1000 / (currentTime - lastDebugUpdateTime)).toFixed(2),
            potatoes: ((potatoCount - lastResourceValues.potatoes) * 1000 / (currentTime - lastDebugUpdateTime)).toFixed(2)
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
        updateElement('resource-usage', `Resource Usage: Water (${water.toFixed(2)}), Nutrients (${nutrients.toFixed(2)}), Potatoes (${potatoCount.toFixed(2)})`);
        updateElement('resource-generation', `Resource Generation: Water (${resourceGeneration.water}/s), Nutrients (${resourceGeneration.nutrients}/s), Potatoes (${resourceGeneration.potatoes}/s)`);
        updateElement('last-action', `Last Action: ${lastAction}`);
        updateElement('planting-delay', `Planting Delay: ${plantingDelay}ms`);
        
        lastDebugUpdateTime = currentTime;
        lastResourceValues = { water, nutrients, potatoes: potatoCount };
    } catch (error) {
        console.error('Error updating debug info:', error);
    }
}

// Update the last action for debugging purposes
function updateLastAction(action) {
    lastAction = action;
    if (debugMode) {
        document.getElementById('last-action').textContent = `Last Action: ${lastAction}`;
    }
}

// Display a toast notification to the user
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

// Initialize the game when the DOM is fully loaded
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

    createTechTree(); // Create the tech tree

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

    const exploreCard = document.getElementById('exploration-container');
    exploreCard.addEventListener('click', () => {
        if (!exploreCard.hasAttribute('disabled')) {
            exploreMarsSurface(); // Use the function from exploration.js
        }
    });

    // Add this near the end of the file, inside the DOMContentLoaded event listener
    const subsurfaceAquiferTapperToggle = document.getElementById('subsurface-aquifer-tapper-toggle');
    if (subsurfaceAquiferTapperToggle) {
        subsurfaceAquiferTapperToggle.addEventListener('change', toggleSubsurfaceAquiferTapper);
    }

    const bucketWheelExcavatorToggle = document.getElementById('bucket-wheel-excavator-toggle');
    if (bucketWheelExcavatorToggle) {
        bucketWheelExcavatorToggle.addEventListener('change', toggleBucketWheelExcavator);
    }

    const iceMeltingBasinContainer = document.getElementById('ice-melting-basin-container');
    if (iceMeltingBasinContainer) {
        iceMeltingBasinContainer.addEventListener('click', () => {
            if (!iceMeltingBasinContainer.hasAttribute('disabled')) {
                fillIceMeltingBasin();
            }
        });
    }

    const nuclearIceMelterToggle = document.getElementById('nuclear-ice-melter-toggle');
    if (nuclearIceMelterToggle) {
        console.log("Nuclear Ice Melter toggle found in game.js");
        // Remove all existing event listeners
        nuclearIceMelterToggle.removeEventListener('change', toggleNuclearIceMelter);
        nuclearIceMelterToggle.removeEventListener('click', handleNuclearIceMelterClick);
        // Add a new click event listener
        nuclearIceMelterToggle.addEventListener('click', handleNuclearIceMelterClick);
    }

    const saveButton = document.getElementById('save-button');
    saveButton.addEventListener('click', saveGame);

    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', resetGame);
});

// New function to handle the click event
function handleNuclearIceMelterClick(event) {
    event.preventDefault(); // Prevent the default toggle behavior
    event.stopPropagation();
    toggleNuclearIceMelter();
}

// Modify the toggleNuclearIceMelter function
function toggleNuclearIceMelter() {
    console.log("Toggling Nuclear Ice Melter");
    console.log("Current state - isNuclearIceMelterActive:", isNuclearIceMelterActive, "potatoCount:", potatoCount);

    if (!isNuclearIceMelterUnlocked) {
        console.log("Nuclear Ice Melter is not unlocked");
        return;
    }

    const toggleSwitch = document.getElementById('nuclear-ice-melter-toggle');

    if (!isNuclearIceMelterActive) {
        if (potatoCount >= 100) {
            console.log("Activating Nuclear Ice Melter");
            potatoCount -= 100; 
            isNuclearIceMelterActive = true;
            startNuclearIceMelter();
            if (toggleSwitch) toggleSwitch.checked = true;
        } else {
            console.log("Not enough potatoes to activate Nuclear Ice Melter");
            showToast("Not Enough Potatoes", "You need 100 potatoes to activate the Nuclear Ice Melter!", 'setback');
            if (toggleSwitch) toggleSwitch.checked = false;
            return;
        }
    } else {
        console.log("Deactivating Nuclear Ice Melter");
        isNuclearIceMelterActive = false;
        stopNuclearIceMelter();
        if (toggleSwitch) toggleSwitch.checked = false;
    }

    console.log("After toggle - isNuclearIceMelterActive:", isNuclearIceMelterActive, "potatoCount:", potatoCount);
    updateDisplay();
}

// Handle manual ice melting process
function meltIce(event) {
    if (event && event.stopPropagation) {
        event.stopPropagation(); // Prevent event bubbling only if event exists
    }
    
    if (!isManualIceMeltingUnlocked) return;
    
    if (ice >= 1) {  // Check if there's enough ice
        waterMeltingClicks++;
        updateIceMeltingProgress();
        
        if (waterMeltingClicks >= CLICKS_PER_WATER) {
            ice--;  // Consume 1 ice
            water++;
            waterMeltingClicks = 0;
            showToast("Water Collected", "You've melted ice and collected 1 unit of water!", 'achievement');
        }
        updateDisplay();
        updateLastAction("Melted ice");
    } else {
        showToast("Not Enough Ice", "You need at least 1 ice to melt!", 'setback');
    }
}

// Unlock the manual ice melting feature
function unlockManualIceMelting() {
    isManualIceMeltingUnlocked = true;
    const iceMeltingContainer = document.getElementById('ice-melting-container');
    if (iceMeltingContainer) {
        iceMeltingContainer.style.display = 'flex';
    }
    updateIceMeltingProgress();
}

// Update the visual progress of ice melting
function updateIceMeltingProgress() {
    const progressElement = document.getElementById('ice-melting-progress');
    if (progressElement) {
        progressElement.textContent = `Clicks: ${waterMeltingClicks} / ${CLICKS_PER_WATER}`;
    }
}

// Unlock the Ice Melting Basin
function unlockIceMeltingBasin() {
    isIceMeltingBasinUnlocked = true;
    const basinContainer = document.getElementById('ice-melting-basin-container');
    if (basinContainer) {
        basinContainer.style.display = 'block';
    }
    updateIceMeltingBasinButton();
}

// Handle filling the Ice Melting Basin
function fillIceMeltingBasin() {
    if (!isIceMeltingBasinUnlocked || iceMeltingBasinActive) return;
    
    if (ice >= 8) {
        ice -= 8;
        iceMeltingBasinActive = true;
        iceMeltingBasinTimer = 8;
        updateDisplay();
        updateIceMeltingBasinButton();
    } else {
        showToast("Not Enough Ice", "You need at least 8 ice to fill the basin!", 'setback');
    }
}

// Update the Ice Melting Basin button
function updateIceMeltingBasinButton() {
    const basinContainer = document.getElementById('ice-melting-basin-container');
    const cooldownElement = document.getElementById('basin-cooldown');
    if (basinContainer && cooldownElement) {
        if (iceMeltingBasinActive) {
            basinContainer.setAttribute('disabled', 'true');
            cooldownElement.textContent = `Melting (${iceMeltingBasinTimer}s)`;
        } else {
            basinContainer.removeAttribute('disabled');
            cooldownElement.textContent = 'Ready';
        }
    }
}

// Unlock the Nuclear Ice Melter
function unlockNuclearIceMelter() {
    console.log("Unlocking Nuclear Ice Melter");
    isNuclearIceMelterUnlocked = true;
    const melterContainer = document.getElementById('nuclear-ice-melter-container');
    if (melterContainer) {
        melterContainer.style.display = 'block';
    }
}

// Start the Nuclear Ice Melter
function startNuclearIceMelter() {
    console.log("Starting Nuclear Ice Melter");
    nuclearIceMelterInterval = setInterval(() => {
        console.log("Nuclear Ice Melter tick - ice:", ice, "water:", water);
        if (ice >= 5) {
            ice -= 5;
            water += 5;
            updateDisplay();
        } else {
            console.log("Not enough ice to run Nuclear Ice Melter");
            showToast("Resource Shortage", "Not enough ice to run the Nuclear Ice Melter!", 'setback');
            toggleNuclearIceMelter(); // Turn off if resources are insufficient
        }
    }, 1000); // Run every second
}

// Stop the Nuclear Ice Melter
function stopNuclearIceMelter() {
    console.log("Stopping Nuclear Ice Melter");
    clearInterval(nuclearIceMelterInterval);
    nuclearIceMelterInterval = null;
}

// Add this function to update the field size
function updateFieldSize(newSize) {
    MAX_FIELD_SIZE = newSize;
    potatoField = potatoField.concat(new Array(newSize - potatoField.length).fill(null));
    initializePotatoField();
    updateDisplay();
}

// Function to save the game state
function saveGame() {
    const gameState = {
        potatoCount,
        water,
        nutrients,
        ice,
        rawPotatoesPerSecond,
        processedPotatoesPerSecond,
        processingLevel,
        plantingDelay,
        lastPlantTime,
        potatoesPerClick,
        waterEfficiency,
        soilEfficiency,
        iceEfficiency,
        waterMeltingClicks,
        isManualIceMeltingUnlocked,
        isIceMeltingBasinUnlocked,
        iceMeltingBasinTimer,
        iceMeltingBasinActive,
        isNuclearIceMelterUnlocked,
        isNuclearIceMelterActive,
        potatoField,
        achievements,
        autoplanters,
        autoHarvesters,
        MAX_FIELD_SIZE,
        upgrades: upgrades.map(upgrade => ({
            name: upgrade.name,
            purchased: upgrade.purchased,
            count: upgrade.count || 0
        }))
    };
    localStorage.setItem('martianPotatoSave', JSON.stringify(gameState));
    showToast('Game saved successfully!', 'Your progress has been saved.', 'success');
}

// Function to load the game state
function loadGame() {
    try {
        const savedState = localStorage.getItem('martianPotatoSave');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            
            // Restore game variables with default values if not present
            potatoCount = gameState.potatoCount || 0;
            water = gameState.water || 100;
            nutrients = gameState.nutrients || 100;
            ice = gameState.ice || 100;
            rawPotatoesPerSecond = gameState.rawPotatoesPerSecond || 0;
            processedPotatoesPerSecond = gameState.processedPotatoesPerSecond || 0;
            processingLevel = gameState.processingLevel || 0;
            plantingDelay = gameState.plantingDelay || 5000;
            lastPlantTime = gameState.lastPlantTime || 0;
            potatoesPerClick = gameState.potatoesPerClick || 1;
            waterEfficiency = gameState.waterEfficiency || 1;
            soilEfficiency = gameState.soilEfficiency || 1;
            iceEfficiency = gameState.iceEfficiency || 1;
            waterMeltingClicks = gameState.waterMeltingClicks || 0;
            isManualIceMeltingUnlocked = gameState.isManualIceMeltingUnlocked || false;
            isIceMeltingBasinUnlocked = gameState.isIceMeltingBasinUnlocked || false;
            iceMeltingBasinTimer = gameState.iceMeltingBasinTimer || 0;
            iceMeltingBasinActive = gameState.iceMeltingBasinActive || false;
            isNuclearIceMelterUnlocked = gameState.isNuclearIceMelterUnlocked || false;
            isNuclearIceMelterActive = gameState.isNuclearIceMelterActive || false;
            potatoField = gameState.potatoField || [];
            achievements = gameState.achievements || {};
            autoplanters = gameState.autoplanters || [];
            autoHarvesters = gameState.autoHarvesters || [];
            MAX_FIELD_SIZE = gameState.MAX_FIELD_SIZE || 8;

            // Restore upgrades
            if (gameState.upgrades && Array.isArray(gameState.upgrades)) {
                gameState.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.find(u => u.name === savedUpgrade.name);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased || false;
                        upgrade.count = savedUpgrade.count || 0;
                    }
                });
            }

            // Reinitialize game elements
            initializePotatoField();
            createTechTree();
            updateDisplay();
            updateIceMeltingProgress();
            updateIceMeltingBasinButton();

            // Restart autoplanters and auto harvesters
            autoplanters.forEach(startAutoplanter);
            autoHarvesters.forEach(startAutoHarvester);

            // Restart Nuclear Ice Melter if it was active
            if (isNuclearIceMelterActive) {
                startNuclearIceMelter();
            }

            showToast('Game loaded successfully!', 'Your progress has been restored.', 'success');
        } else {
            showToast('No saved game found', 'Starting a new game.', 'info');
        }
    } catch (error) {
        console.error('Error loading game:', error);
        showToast('Error loading game', 'There was an error loading your saved game. Starting a new game.', 'error');
    }
}

// Function to reset the game state
function resetGame() {
    if (confirm('Are you sure you want to reset the game? This will erase all your progress.')) {
        localStorage.removeItem('martianPotatoSave');
        location.reload();
    }
}

// Function to load the game state
function loadGame() {
    try {
        const savedState = localStorage.getItem('martianPotatoSave');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            
            // Restore game variables with default values if not present
            potatoCount = gameState.potatoCount || 0;
            water = gameState.water || 100;
            nutrients = gameState.nutrients || 100;
            ice = gameState.ice || 100;
            rawPotatoesPerSecond = gameState.rawPotatoesPerSecond || 0;
            processedPotatoesPerSecond = gameState.processedPotatoesPerSecond || 0;
            processingLevel = gameState.processingLevel || 0;
            plantingDelay = gameState.plantingDelay || 5000;
            lastPlantTime = gameState.lastPlantTime || 0;
            potatoesPerClick = gameState.potatoesPerClick || 1;
            waterEfficiency = gameState.waterEfficiency || 1;
            soilEfficiency = gameState.soilEfficiency || 1;
            iceEfficiency = gameState.iceEfficiency || 1;
            waterMeltingClicks = gameState.waterMeltingClicks || 0;
            isManualIceMeltingUnlocked = gameState.isManualIceMeltingUnlocked || false;
            isIceMeltingBasinUnlocked = gameState.isIceMeltingBasinUnlocked || false;
            iceMeltingBasinTimer = gameState.iceMeltingBasinTimer || 0;
            iceMeltingBasinActive = gameState.iceMeltingBasinActive || false;
            isNuclearIceMelterUnlocked = gameState.isNuclearIceMelterUnlocked || false;
            isNuclearIceMelterActive = gameState.isNuclearIceMelterActive || false;
            potatoField = gameState.potatoField || [];
            achievements = gameState.achievements || {};
            autoplanters = gameState.autoplanters || [];
            autoHarvesters = gameState.autoHarvesters || [];
            MAX_FIELD_SIZE = gameState.MAX_FIELD_SIZE || 8;

            // Restore upgrades
            if (gameState.upgrades && Array.isArray(gameState.upgrades)) {
                gameState.upgrades.forEach(savedUpgrade => {
                    const upgrade = upgrades.find(u => u.name === savedUpgrade.name);
                    if (upgrade) {
                        upgrade.purchased = savedUpgrade.purchased || false;
                        upgrade.count = savedUpgrade.count || 0;
                    }
                });
            }

            // Reinitialize game elements
            initializePotatoField();
            createTechTree();
            updateDisplay();
            updateIceMeltingProgress();
            updateIceMeltingBasinButton();

            // Restart autoplanters and auto harvesters
            autoplanters.forEach(startAutoplanter);
            autoHarvesters.forEach(startAutoHarvester);

            // Restart Nuclear Ice Melter if it was active
            if (isNuclearIceMelterActive) {
                startNuclearIceMelter();
            }

            showToast('Game loaded successfully!', 'Your progress has been restored.', 'success');
        } else {
            showToast('No saved game found', 'Starting a new game.', 'info');
        }
    } catch (error) {
        console.error('Error loading game:', error);
        showToast('Error loading game', 'There was an error loading your saved game. Starting a new game.', 'error');
    }
}

// Function to reset the game state
function resetGame() {
    if (confirm('Are you sure you want to reset the game? This will erase all your progress.')) {
        localStorage.removeItem('martianPotatoSave');
        location.reload();
    }
}

// Initialize the game
function initGame() {
    loadGame();
    requestAnimationFrame(gameLoop);
}

// Call initGame when the window loads
window.addEventListener('load', initGame);