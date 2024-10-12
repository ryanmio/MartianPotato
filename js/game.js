// This file contains the core game logic for the Martian Potato game
// It manages game state, resource handling, potato planting and harvesting, and UI updates

// Game Constants
let MAX_FIELD_SIZE = 8;
const UPDATE_INTERVAL = 1000; // Update every second
const FRAME_RATE = 30; // 30 fps
const FRAME_DELAY = 1000 / FRAME_RATE;
const CLICKS_PER_WATER = 5;

// System Variables
let lastUpdateTime = 0;
let lastFrameTime = 0;
let debugMode = false;
let lastSaveTime = 0;
let MAX_TIER = 5;
let hasSeenInitialGlow = false;
let gameStartTime = Date.now();

// Resource Variables
let potatoCount = 20;
let water = 20;
let nutrients = 20;
let ice = 20;
let waterEfficiency = 1;
let soilEfficiency = 1;
let iceEfficiency = 1;
let areResourcesDepleted = false;

// Planting Variables
let plantingDelay = 3000;
let lastPlantTime = 0;
let potatoesPerClick = 1;
let isFirstPlant = true;
const GROWTH_TIME = 8000; // Base growth time in milliseconds
let growthTimeMultiplier = 1; // Starts at 1, decreases with upgrades
let totalPotatoesHarvested = 0;

// Manual Ice Melting Variables
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
let iceMelterKnob;

// Variable to store the selected percentage
let nuclearIceMelterPercentage = 3; // Default to 3%

// Polar Cap Mining Variables
let isPolarCapMiningUnlocked = false;
let isPolarCapMiningActive = false;
let polarCapMiningInterval = null;

// Cometary Ice Harvester Variables
let isCometaryIceHarvesterUnlocked = false;
let isCometaryIceHarvesterActive = false;
let cometaryIceHarvesterInterval = null;

// Martian Potato Colonizer Variables
let isMartianPotatoColonizerUnlocked = false;
let isMartianPotatoColonizerActive = false;
let colonizerInterval = null;
let colonizerCycle = 0;
const maxColonizerCycles = 20; // 20 cycles
const INITIAL_COLONIZER_CYCLE_DURATION = 60000; // 60 seconds
const MIN_COLONIZER_CYCLE_DURATION = 1000; // 1 second minimum duration

let isSubsurfaceAquiferTapperUnlocked = false;
let isBucketWheelExcavatorUnlocked = false;
let isSubterraneanTuberTunnelerUnlocked = false;
let isSubterraneanTuberTunnelerActive = false;

// Large Data Structures
let potatoField = new Array(MAX_FIELD_SIZE).fill(null);

// Achievement Tracking
const defaultAchievements = {
    firstPotato: false,
    potatoCentury: false,
    // Add other achievements here
};
let achievements = { ...defaultAchievements };
let harvestHistory = [];

// Debug Variables
let fpsValues = [];
let lastDebugUpdateTime = 0;
let lastResourceValues = { water: 0, nutrients: 0, ice: 0 };
let lastAction = "None";

// Quantum Spud Spawner Variables
let isQuantumSpudSpawnerUnlocked = false;
let isQuantumSpudSpawnerActive = false;
let quantumSpudSpawnerInterval = null;

// Add these variables at the top of the file with other game state variables
let lastResourceWarningTime = 0;
const RESOURCE_WARNING_COOLDOWN = 60000; // 1 minute cooldown
let resourceWarningActive = false;

// ==========================================
//            CORE GAME FUNCTIONS
// ==========================================

// Initialize the game
let gameInitialized = false;
function initGame() {
    if (!gameInitialized) {
        loadGame();
        initializePotatoField();
        createTechTree();
        updateActionCards(); // Add this line
        requestAnimationFrame(gameLoop);
        gameInitialized = true;
        initializeNuclearIceMelter();
        
    }
}

// Function to reset the game state
function resetGame() {
    if (confirm('Are you sure you want to reset the game? This will erase all your progress.')) {
        localStorage.removeItem('martianPotatoSave');
        location.reload();
    }
}

// Helper function to add event listeners if the element exists
function addEventListenerIfExists(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// Main game loop function
function gameLoop(currentTime) {
    if (currentTime - lastFrameTime >= FRAME_DELAY) {
        const startTime = performance.now(); // Add this line to define startTime
        updatePlantButton();
        if (updateResources(currentTime)) {
            updateDisplay();
            checkAndRestartAutoplanters();
        }
        updatePotatoGrowth();
        updateTechTree();
        updateExploreButton();
        updateActionCards();
        
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

// Function to update the field size
function updateFieldSize(newSize) {
    MAX_FIELD_SIZE = newSize;
    potatoField = potatoField.concat(new Array(newSize - potatoField.length).fill(null));
    initializePotatoField();
    updateDisplay();
}

// ==========================================
//            RESOURCE MANAGEMENT
// ==========================================

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

        checkResourceLevels(); // Add this line to check resource levels

        lastUpdateTime = currentTime;
        return true;
    }
    return false;
}

// Update non-critical elements during idle time
function updateNonCriticalElements() {
    requestIdleCallback(() => {
        displayExplorationUpgrades();
    });
}

// Consume resources for potato growth, applying efficiency multipliers
function consumeResources(amount = 1) {
    if (water >= amount && nutrients >= amount) {
        water -= amount / waterEfficiency;
        nutrients -= amount / soilEfficiency;
        return true;
    }
    return false;
}

function updateResourceCounts() {
    updateElementIfChanged('potato-count', `Potatoes: ${Math.floor(potatoCount)}`);
    updateElementIfChanged('water-count', `Water: ${Math.floor(water)}`);
    updateElementIfChanged('nutrients', `Nutrients: ${Math.floor(nutrients)}`);
    updateElementIfChanged('ice-level', `Ice: ${Math.floor(ice)}`);
}

function updateDepletedActionCard(actionCardId, isDepleted, message) {
    const card = document.getElementById(actionCardId);
    if (card) {
        const toggleContainer = card.querySelector('.toggle-switch-container');
        const buttonContainer = card.querySelector('.button-container');
        const ledProgressBar = card.querySelector('.led-progress-bar');
        let depletedMessage = card.querySelector('.depleted-message');
        const actionButton = buttonContainer ? buttonContainer.querySelector('.action-button') : null;

        if (isDepleted) {
            // Hide the toggle switch or button
            if (toggleContainer) {
                toggleContainer.style.display = 'none';
            }
            if (actionButton) {
                actionButton.style.display = 'none';
            }
            if (ledProgressBar) {
                ledProgressBar.style.visibility = 'hidden';
            }
            // Display the depleted message
            if (!depletedMessage) {
                depletedMessage = document.createElement('p');
                depletedMessage.classList.add('depleted-message');
                if (buttonContainer) {
                    buttonContainer.appendChild(depletedMessage);
                } else {
                    card.appendChild(depletedMessage);
                }
            }
            depletedMessage.textContent = message;
            depletedMessage.style.display = 'block';
        } else {
            // Show the toggle switch or button
            if (toggleContainer) {
                toggleContainer.style.display = 'block';
            }
            if (actionButton) {
                actionButton.style.display = 'block';
            }
            if (ledProgressBar) {
                ledProgressBar.style.visibility = 'visible';
            }
            // Hide the depleted message
            if (depletedMessage) {
                depletedMessage.style.display = 'none';
            }
        }
    }
}

// Add this function to check resource levels and display warnings
function checkResourceLevels() {
    const currentTime = Date.now();
    if (currentTime - lastResourceWarningTime < RESOURCE_WARNING_COOLDOWN) return;

    let warningMessage = '';

    if (water < 10 && nutrients < 20) {
        warningMessage = "Resources critically low! Explore Mars surface to gather more.";
    } else if (water < 10) {
        warningMessage = "Water supply running low. Consider melting some ice!";
    } else if (ice < 10) {
        warningMessage = "Ice reserves depleting. Time to explore Mars for more!";
    } else if (nutrients < 10) {
        warningMessage = "Nutrient levels are low. Explore Mars to replenish supplies.";
    }

    if (warningMessage && !resourceWarningActive) {
        showToast("Resource Warning", warningMessage, 'warning');
        lastResourceWarningTime = currentTime;
        resourceWarningActive = true;
    } else if (water > 50 && ice > 50 && nutrients > 50) {
        resourceWarningActive = false;
    }
}

// ==========================================
//            PLANTING AND HARVESTING
// ==========================================

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
        potatoField[emptySlotIndex] = createPotato();

        if (!hasSeenInitialGlow) {
            hasSeenInitialGlow = true;
            document.getElementById('plant-button').classList.remove('glow');
        }

        lastPlantTime = currentTime;
        updatePotatoFieldDisplay();
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
            // Only update potatoes that are not fully grown
            if (potato.growthStage < 100) {
                const growthTime = currentTime - potato.plantedAt;
                const actualGrowthTime = GROWTH_TIME * growthTimeMultiplier;
                potato.growthStage = Math.min(100, Math.floor((growthTime / actualGrowthTime) * 100));
            }
        }
        return potato;
    });
    updateDisplay();
}

// Harvest a fully grown potato at the specified index
function harvestPotatoAtIndex(index, isAutomated = false) {
    if (potatoField[index] && potatoField[index].growthStage >= 100) {
        const harvestedPotato = potatoField[index];
        potatoCount++;
        totalPotatoesHarvested++;

        const slotElement = document.querySelector(`.potato-slot[data-index="${index}"]`);
        const potatoElement = slotElement.querySelector('.potato');

        if (potatoElement && harvestedPotato.isQuantumSpawned) {

            // Create the poof element
            const poofElement = document.createElement('div');
            poofElement.className = 'poof-animation-red';

            // Append the poof to the slotElement
            slotElement.appendChild(poofElement);

            // Ensure the poof covers the entire slot
            poofElement.style.position = 'absolute';
            poofElement.style.left = '0';
            poofElement.style.top = '0';
            poofElement.style.width = '100%';
            poofElement.style.height = '100%';
            poofElement.style.zIndex = '10';

            // Hide the potatoElement during the animation
            potatoElement.style.visibility = 'hidden';

            // Remove the poof element after the animation
            poofElement.addEventListener('animationend', () => {
                poofElement.remove();

                // Now remove the potato and update the display
                potatoField[index] = null;
                updatePotatoFieldDisplay();
                updateDisplay();

                // Record the harvest event and update the chart
                harvestHistory.push({
                    timestamp: Date.now(),
                    totalPotatoes: totalPotatoesHarvested
                });
                updateHarvestHistory();
                updateHarvestChart();

                checkAchievements();
            });
        } else {
            // For normal potatoes or if potatoElement not found
            potatoField[index] = null;
            updatePotatoFieldDisplay();
            updateDisplay();

            // Record the harvest event and update the chart
            harvestHistory.push({
                timestamp: Date.now(),
                totalPotatoes: totalPotatoesHarvested
            });
            updateHarvestHistory();
            updateHarvestChart();

            checkAchievements();
        }

        if (!isAutomated) {
            updateLastAction(`Harvested potato at index ${index}`);
        }
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

// Update the updatePotatoFieldDisplay function to handle both manual and automated actions
function updatePotatoFieldDisplay() {
    const fieldContainer = document.getElementById('potato-field');
    if (!fieldContainer) return;

    potatoField.forEach((potato, index) => {
        const slotElement = fieldContainer.children[index];
        if (!slotElement) return;

        // Don't remove existing poof animations
        const existingPoof = slotElement.querySelector('.poof-animation-red');
        if (existingPoof) return;

        if (potato) {
            let potatoElement = slotElement.querySelector('.potato');
            if (!potatoElement) {
                potatoElement = document.createElement('div');
                potatoElement.className = 'potato';
                slotElement.appendChild(potatoElement);
            }

            potatoElement.style.transform = `scale(${potato.scaleX}, ${potato.scaleY})`;
            potatoElement.style.borderRadius = potato.borderRadius;
            potatoElement.className = `potato ${potato.textureClass}`;

            const growthIndicator = potatoElement.querySelector('.growth-indicator') || document.createElement('div');
            growthIndicator.className = 'growth-indicator';
            growthIndicator.style.height = `${potato.growthStage}%`;
            potatoElement.appendChild(growthIndicator);

            const growthText = potatoElement.querySelector('.growth-text') || document.createElement('div');
            growthText.className = 'growth-text';
            growthText.textContent = `${Math.floor(potato.growthStage)}%`;
            potatoElement.appendChild(growthText);

            if (potato.growthStage >= 100) {
                potatoElement.classList.add('harvestable');
            } else {
                potatoElement.classList.remove('harvestable');
            }
        } else {
            // Only clear potato-related elements, not the poof animation
            const potatoElement = slotElement.querySelector('.potato');
            if (potatoElement) {
                potatoElement.remove();
            }
        }
    });
}


// ==========================================
//           SAVE AND LOAD
// ==========================================

// Function to save the game state
function saveGame() {
    const gameState = {
        potatoCount,
        water,
        nutrients,
        ice,
        areResourcesDepleted,
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
        isMartianPotatoColonizerUnlocked,
isMartianPotatoColonizerActive,
colonizerCycle,
        potatoField,
        achievements,
        autoplanters,
        autoHarvesters,
        MAX_FIELD_SIZE,
        unlockedActionCards,
        currentTier, // Save the currentTier
        upgrades: upgrades.map(upgrade => ({
            name: upgrade.name,
            purchased: upgrade.purchased || false,
            count: upgrade.count || 0 // Ensure count is saved even if zero
        })),
        isFirstPlant,
        hasSeenInitialGlow,
        isPolarCapMiningUnlocked,
        isPolarCapMiningActive,
        growthTimeMultiplier,
        totalPotatoesHarvested,
        harvestHistory,         
        gameStartTime,
        isSubsurfaceAquiferTapperUnlocked,
        isBucketWheelExcavatorUnlocked,
        isSubterraneanTuberTunnelerUnlocked,          
        explorationResourceMultiplier: window.explorationResourceMultiplier,
        lastExploreTime: window.lastExploreTime,
        exploreDelay: window.exploreDelay,
        waterExplorationMultiplier: window.waterExplorationMultiplier,
        growthUpgradesApplied,
        nuclearIceMelterPercentage: nuclearIceMelterPercentage,
    };
    console.log('Saving game state. Unlock flags:', {
        isSubsurfaceAquiferTapperUnlocked,
        isBucketWheelExcavatorUnlocked,
        isSubterraneanTuberTunnelerUnlocked
    });
    console.log('Saving unlockedActionCards:', unlockedActionCards);
    localStorage.setItem('martianPotatoSave', JSON.stringify(gameState));
    showToast('Game saved successfully!', 'Your progress has been saved.', 'success');
}

// Function to load the game state
function loadGame() {
    const savedState = localStorage.getItem('martianPotatoSave');
    console.log('Attempting to load saved game state');

    if (savedState) {
        try {
            const gameState = JSON.parse(savedState);
            console.log('Successfully parsed saved game state');

            // Restore game variables, respecting saved values even if they're zero
            gameStartTime = gameState.gameStartTime || Date.now();
            potatoCount = gameState.potatoCount !== undefined ? gameState.potatoCount : 0;
            water = gameState.water !== undefined ? gameState.water : 100;
            nutrients = gameState.nutrients !== undefined ? gameState.nutrients : 100;
            ice = gameState.ice !== undefined ? gameState.ice : 100;
            areResourcesDepleted = gameState.areResourcesDepleted || false;

            // Restore game variables with default values if not present
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
            isPolarCapMiningUnlocked = gameState.isPolarCapMiningUnlocked || false;
            isPolarCapMiningActive = gameState.isPolarCapMiningActive || false;
            potatoField = gameState.potatoField || [];
            achievements = { ...defaultAchievements, ...(gameState.achievements || {}) };
            autoplanters = gameState.autoplanters || [];
            autoHarvesters = gameState.autoHarvesters || [];
            MAX_FIELD_SIZE = gameState.MAX_FIELD_SIZE || 8;
            unlockedActionCards = gameState.unlockedActionCards || ['exploration-container'];
            currentTier = gameState.currentTier || 1;
            hasSeenInitialGlow = gameState.hasSeenInitialGlow || false;
            growthTimeMultiplier = gameState.growthTimeMultiplier || 1;
            totalPotatoesHarvested = gameState.totalPotatoesHarvested || 0;
            harvestHistory = gameState.harvestHistory || [];

            restoreUpgrades(gameState.upgrades);

            // Restore unlocked action cards
            if (gameState.unlockedActionCards) {
                unlockedActionCards = [...new Set([...unlockedActionCards, ...gameState.unlockedActionCards])];
            }

            // Ensure all unlocked features have their cards added
            if (isManualIceMeltingUnlocked) {
                unlockedActionCards.push('ice-melting-container');
            }
            if (isIceMeltingBasinUnlocked) {
                unlockedActionCards.push('ice-melting-basin-container');
            }
            if (isNuclearIceMelterUnlocked) {
                unlockedActionCards.push('nuclear-ice-melter-container');
            }
            if (isPolarCapMiningUnlocked) {
                unlockedActionCards.push('polar-cap-mining-container');
            }

            if (gameState.isMartianPotatoColonizerUnlocked) {
                isMartianPotatoColonizerUnlocked = true;
                unlockedActionCards.push('martian-potato-colonizer-container');
                initializeMartianPotatoColonizer();

                colonizerCycle = gameState.colonizerCycle || 0;
                
                if (gameState.isMartianPotatoColonizerActive && colonizerCycle < maxColonizerCycles) {
                    isMartianPotatoColonizerActive = true;
                    startMartianPotatoColonizer();
                } else {
                    isMartianPotatoColonizerActive = false;
                    if (colonizerCycle >= maxColonizerCycles) {
                        const toggleSwitch = document.getElementById('martian-potato-colonizer-toggle');
                        if (toggleSwitch) {
                            toggleSwitch.disabled = true;
                        }
                    }
                }
            }

            isSubsurfaceAquiferTapperUnlocked = gameState.isSubsurfaceAquiferTapperUnlocked || false;
            isBucketWheelExcavatorUnlocked = gameState.isBucketWheelExcavatorUnlocked || false;
            isSubterraneanTuberTunnelerUnlocked = gameState.isSubterraneanTuberTunnelerUnlocked || false;

            // Update unlockedActionCards based on the unlock flags
            if (isSubsurfaceAquiferTapperUnlocked) {
                if (!unlockedActionCards.includes('subsurface-aquifer-tapper-container')) {
                    unlockedActionCards.push('subsurface-aquifer-tapper-container');
                }
            }

            if (isBucketWheelExcavatorUnlocked) {
                if (!unlockedActionCards.includes('bucket-wheel-excavator-container')) {
                    unlockedActionCards.push('bucket-wheel-excavator-container');
                }
            }

            if (isSubterraneanTuberTunnelerUnlocked) {
                if (!unlockedActionCards.includes('subterranean-tuber-tunneler-container')) {
                    unlockedActionCards.push('subterranean-tuber-tunneler-container');
                }
            }

            // Remove duplicates
            unlockedActionCards = [...new Set(unlockedActionCards)];
            
            // Reinitialize game elements
            initializePotatoField();
            createTechTree();
            updateDisplay();
            updateIceMeltingProgress();
            updateIceMeltingBasinButton();
            updateActionCards();

            // Ensure DOM is ready before updating action cards
            if (document.readyState === 'complete') {
                updateActionCards();
            } else {
                window.addEventListener('load', updateActionCards);
            }

            // Restart autoplanters and auto harvesters
            reinitializeAutoplanters();
            reinitializeAutoHarvesters();

            // Restart Nuclear Ice Melter if it was active
            if (isNuclearIceMelterActive) {
                startNuclearIceMelter();
            }

            // Handle initial glow on the plant button
            if (!hasSeenInitialGlow) {
                document.getElementById('plant-button').classList.add('glow');
            }

            // Re-initialize chart with loaded data
            initializeHarvestChart();
            updateHarvestChart();

            showToast('Game loaded successfully!', 'Your progress has been restored.', 'success');

            // Restore exploration variables
            window.explorationResourceMultiplier = gameState.explorationResourceMultiplier || 1;
            window.lastExploreTime = gameState.lastExploreTime || 0;
            window.exploreDelay = gameState.exploreDelay || 10000;
            window.waterExplorationMultiplier = gameState.waterExplorationMultiplier || 1;

            growthUpgradesApplied = gameState.growthUpgradesApplied || {
                potatoCompost: false,
                genomeModification: false,
                soilBacteria: false,
                gravitropismAccelerator: false
            };

            nuclearIceMelterPercentage = gameState.nuclearIceMelterPercentage || 3; // Default to 3 if not found
            initializeNuclearIceMelter();
        } catch (error) {
            console.error('Error parsing saved game state:', error);
            showToast('Error loading game', 'There was an error loading your saved game. Starting a new game.', 'error');
        }
    } else {
        console.log('No saved game state found');
        showToast('No saved game found', 'Starting a new game.', 'info');
    }
}

function restoreUpgrades(savedUpgrades) {
    if (savedUpgrades && Array.isArray(savedUpgrades)) {
        upgrades.forEach(upgrade => {
            const savedUpgrade = savedUpgrades.find(u => u.name === upgrade.name);
            if (savedUpgrade) {
                upgrade.purchased = savedUpgrade.purchased || false;
                upgrade.count = savedUpgrade.count || 0;

                const isMilestoneUpgrade = upgrade.unlocksNextTier || false;

                if (!upgrade.repeatable && upgrade.purchased && upgrade.effect && !isMilestoneUpgrade) {
                    // For non-repeatable upgrades, apply the effect once without showing toasts
                    const originalShowToast = window.showToast;
                    window.showToast = () => {}; // Temporarily disable toasts
                    upgrade.effect();
                    window.showToast = originalShowToast; // Restore toast functionality
                }
            }
        });
    }
}

// Function to update the visibility of action cards
function updateActionCards() {
    const allActionCards = document.querySelectorAll('.action-card');
    allActionCards.forEach(card => {
        if (unlockedActionCards.includes(card.id)) {
            card.style.display = 'block';

            // Handle depletions using the reusable function
            if (areResourcesDepleted && [
                'martian-potato-colonizer-container',
                'subsurface-aquifer-tapper-container',
                'bucket-wheel-excavator-container',
                'subterranean-tuber-tunneler-container',
                'polar-cap-mining-container'
            ].includes(card.id)) {
                updateDepletedActionCard(card.id, true, "Resources Depleted");
            } else {
                // For other action cards, ensure they are active unless individually depleted
                updateDepletedActionCard(card.id, false);
            }
            
        } else if (card.id !== 'exploration-container') {
            card.style.display = 'none';
        }
    });
}

function onResourcesDepleted() {
    areResourcesDepleted = true;
    updateActionCards();
    showToast("Resources Depleted", "All resources on Mars have been depleted!", 'warning');
    
    // Specifically handle the Martian Potato Colonizer
    stopMartianPotatoColonizer();
    updateDepletedActionCard('martian-potato-colonizer-container', true, "Resources Depleted");
}

// ==========================================
//            AUTOMATION
// ==========================================

// Check and restart any stopped auto harvesters
function checkAndRestartAutoHarvesters() {
    autoHarvesters.forEach(autoHarvester => {
        if (!autoHarvester.interval) {
            startAutoHarvester(autoHarvester);
        }
    });
}

function reinitializeAutoplanters() {
    autoplanters.forEach(autoplanter => {
        // Restart the interval
        startAutoplanter(autoplanter);
    });
}

function reinitializeAutoHarvesters() {
    autoHarvesters.forEach(autoHarvester => {
        // Restart the interval
        startAutoHarvester(autoHarvester);
    });
}

function createCyclicActionCard(containerId, buttonId, startFunction, stopFunction, cycleEffect, cycleDuration, initialText, activeText, inactiveText) {
    let interval = null;
    let cycleProgress = 0;
    const LED_COUNT = 10;
    const LED_INTERVAL = cycleDuration / LED_COUNT;
    let isFirstLaunch = true;

    function updateLEDProgress(progress) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const leds = container.querySelectorAll('.led-light');
        leds.forEach((led, index) => {
            if (index < progress) {
                led.classList.add('active');
            } else {
                led.classList.remove('active');
            }
        });
    }

    function start() {
        if (interval) return;
        startFunction();
        
        // Immediately light up the first LED
        cycleProgress = 1;
        updateLEDProgress(cycleProgress);
        
        interval = setInterval(() => {
            cycleProgress++;
            if (cycleProgress === LED_COUNT) {
                cycleEffect();
            }
            if (cycleProgress > LED_COUNT) {
                cycleProgress = 1;
            }
            updateLEDProgress(cycleProgress);
        }, LED_INTERVAL);
        
        document.getElementById(buttonId).textContent = activeText;
        document.getElementById(buttonId).classList.add('active');
    }

    function stop() {
        clearInterval(interval);
        interval = null;
        cycleProgress = 0;
        updateLEDProgress(cycleProgress);
        stopFunction();
        document.getElementById(buttonId).textContent = inactiveText;
        document.getElementById(buttonId).classList.remove('active');
    }

    function toggle() {
        if (interval) {
            stop();
        } else {
            if (isFirstLaunch) {
                isFirstLaunch = false;
            }
            start();
        }
    }

    // Set initial button text
    document.getElementById(buttonId).textContent = initialText;
    document.getElementById(buttonId).addEventListener('click', toggle);

    return { start, stop, toggle };
}

const cometaryIceHarvester = createCyclicActionCard(
    'cometary-ice-harvester-container',
    'cometary-ice-harvester-button',
    () => { 
        console.log('Cometary Ice Harvester started');
        isCometaryIceHarvesterActive = true;
    },
    () => { 
        console.log('Cometary Ice Harvester stopped');
        isCometaryIceHarvesterActive = false;
    },
    () => {
        ice += 50;
        updateDisplay();
        showToast("Resources Acquired", "Cometary Ice Harvester collected 50 units of ice!", 'achievement');
    },
    30000, // 30 seconds cycle duration
    "Launch", // initialText
    "Harvesting...", // activeText
    "Harvest Comets" // inactiveText
);

function unlockSubsurfaceAquiferTapper() {
    console.log('Unlocking Subsurface Aquifer Tapper');
    isSubsurfaceAquiferTapperUnlocked = true;
    const container = document.getElementById('subsurface-aquifer-tapper-container');
    console.log('Subsurface Aquifer Tapper container:', container);
    if (container) {
        container.style.display = 'block';
        console.log('Set Subsurface Aquifer Tapper container display to block');
    }
    if (!unlockedActionCards.includes('subsurface-aquifer-tapper-container')) {
        unlockedActionCards.push('subsurface-aquifer-tapper-container');
        console.log('Added subsurface-aquifer-tapper-container to unlockedActionCards');
    }
    console.log('Current unlockedActionCards:', unlockedActionCards);
    console.log('isSubsurfaceAquiferTapperUnlocked:', isSubsurfaceAquiferTapperUnlocked);
    updateActionCards();
}

function unlockBucketWheelExcavator() {
    console.log('Unlocking Bucket Wheel Excavator');
    isBucketWheelExcavatorUnlocked = true;
    const container = document.getElementById('bucket-wheel-excavator-container');
    if (container) {
        container.style.display = 'block';
    }
    if (!unlockedActionCards.includes('bucket-wheel-excavator-container')) {
        unlockedActionCards.push('bucket-wheel-excavator-container');
    }
    console.log('Current unlockedActionCards:', unlockedActionCards);
    updateActionCards();
}

function unlockSubterraneanTuberTunneler() {
    console.log('Unlocking Subterranean Tuber Tunneler');
    isSubterraneanTuberTunnelerUnlocked = true;
    isSubterraneanTuberTunnelerActive = false; // Ensure it starts inactive
    const container = document.getElementById('subterranean-tuber-tunneler-container');
    if (container) {
        container.style.display = 'block';
    }
    if (!unlockedActionCards.includes('subterranean-tuber-tunneler-container')) {
        unlockedActionCards.push('subterranean-tuber-tunneler-container');
    }
    console.log('Current unlockedActionCards:', unlockedActionCards);
    updateActionCards();
}

function toggleSubterraneanTuberTunneler() {
    if (isSubterraneanTuberTunnelerUnlocked) {
        isSubterraneanTuberTunnelerActive = !isSubterraneanTuberTunnelerActive;
        const toggleSwitch = document.getElementById('subterranean-tuber-tunneler-toggle');
        if (toggleSwitch) {
            toggleSwitch.checked = isSubterraneanTuberTunnelerActive;
        }
        if (isSubterraneanTuberTunnelerActive) {
            startSubterraneanTuberTunneler();
        } else {
            stopSubterraneanTuberTunneler();
        }
        console.log('Subterranean Tuber Tunneler active:', isSubterraneanTuberTunnelerActive);
    }
}

function startSubterraneanTuberTunneler() {
    console.log('Starting Subterranean Tuber Tunneler');
    isSubterraneanTuberTunnelerActive = true;
}

function stopSubterraneanTuberTunneler() {
    console.log('Stopping Subterranean Tuber Tunneler');
    isSubterraneanTuberTunnelerActive = false;
}

document.addEventListener('DOMContentLoaded', function() {
    const toggleSwitch = document.getElementById('subterranean-tuber-tunneler-toggle');
    if (toggleSwitch) {
        toggleSwitch.addEventListener('change', toggleSubterraneanTuberTunneler);
    }
});

// ==========================================
//            ACHIEVEMENTS
// ==========================================

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

// Check and update game achievements
function checkAchievements() {
    if (totalPotatoesHarvested >= 1 && !achievements.firstPotato) {
        achievements.firstPotato = true;
        queueAchievement(
            "First Potato",
            "You've harvested your first Martian potato!",
            "This marks the beginning of your journey to colonize Mars with potatoes.",
            "🥔" // Use the potato emoji instead of an image file
        );
    }
    if (totalPotatoesHarvested >= 100 && !achievements.potatoCentury) {
        achievements.potatoCentury = true;
        queueAchievement(
            "Potato Century",
            "You've harvested 100 Martian potatoes!",
            "Your potato farm is starting to take shape. The future of Mars is looking delicious!",
            "potato_century.webp"
        );
    }
    // Add more achievement checks here as needed
}

// ==========================================
//            DISPLAY
// ==========================================

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
    updateResourceCounts();
    updateAutoHarvestersInfo();
    updateAutoPlantersInfo();
    updateNuclearIceMelterToggle();
    updateExploreButton();
    updatePotatoField();
    updateTechTree();
    updateIceMeltingProgress();
    updateIceMeltingBasinButton();
}

function updateAutoHarvestersInfo() {
    updateElementIfChanged('auto-harvesters', `Auto Harvesters: ${autoHarvesters.length}`);
}

function updateAutoPlantersInfo() {
    const autoplantersElement = document.getElementById('automated-planters');
    if (autoplantersElement) {
        const newText = `Automated Planters: ${autoplanters.length}`;
        if (autoplantersElement.textContent !== newText) {
            autoplantersElement.textContent = newText;
            autoplantersElement.style.display = autoplanters.length > 0 ? 'block' : 'none';
        }
    }
}

function updateNuclearIceMelterToggle() {
    const nuclearIceMelterToggle = document.getElementById('nuclear-ice-melter-toggle');
    const nuclearIceMelterDisplay = document.getElementById('nuclear-ice-melter-display');
    if (nuclearIceMelterToggle) {
        nuclearIceMelterToggle.checked = isNuclearIceMelterActive;
    }
    if (nuclearIceMelterDisplay) {
        const displayValue = (nuclearIceMelterPercentage * 10).toString();
        // Pad with a single zero only if it's a one-digit number
        const paddedValue = displayValue.length === 1 ? '0' + displayValue : displayValue;
        nuclearIceMelterDisplay.textContent = `${paddedValue}%`;
    }
}

function updateElementIfChanged(id, newText) {
    const element = document.getElementById(id);
    if (element && element.textContent !== newText) {
        element.textContent = newText;
    }
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
            slotElement.innerHTML = '';
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
    const quantumClass = potato.isQuantumSpawned ? 'quantum-potato' : '';
    const growthColor = growthStage < 33 ? 'rgba(139, 195, 74, 0.4)' : 
                        growthStage < 66 ? 'rgba(76, 175, 80, 0.4)' : 
                        'rgba(56, 142, 60, 0.4)';

    potatoElement.className = `potato ${harvestableClass} ${quantumClass} ${potato.textureClass}`;
    potatoElement.style.transform = `scale(${potato.scaleX}, ${potato.scaleY})`;
    potatoElement.style.borderRadius = potato.borderRadius;
    
    const growthIndicator = potatoElement.querySelector('.growth-indicator');
    growthIndicator.style.height = `${growthStage}%`;
    growthIndicator.style.backgroundColor = growthColor;
    
    const growthText = potatoElement.querySelector('.growth-text');
    growthText.textContent = `${growthStage}%`;
}


// ==========================================
//            MANUAL ACTION FUNCTIONS
// ==========================================

// Handle manual ice melting process
function meltIce(event) {
    if (event && event.stopPropagation) {
        event.stopPropagation(); // Prevent event bubbling only if event exists
    }
    
    if (!isManualIceMeltingUnlocked) {
        return;
    }
    
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
        iceMeltingContainer.style.display = 'block';
    }
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
    if (!unlockedActionCards.includes('ice-melting-basin-container')) {
        unlockedActionCards.push('ice-melting-basin-container');
    }
    updateActionCards();
    updateIceMeltingBasinButton();
}

// Handle filling the Ice Melting Basin
function fillIceMeltingBasin() {
    const container = document.getElementById('ice-melting-basin-container');
    if (container && !container.hasAttribute('disabled')) {
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

// ==========================================
//            COMETARY ICE FUNCTIONS
// ==========================================

function unlockCometaryIceHarvester() {
    isCometaryIceHarvesterUnlocked = true;
    if (!unlockedActionCards.includes('cometary-ice-harvester-container')) {
        unlockedActionCards.push('cometary-ice-harvester-container');
    }
    updateActionCards();
}

function toggleCometaryIceHarvester() {
    if (!isCometaryIceHarvesterUnlocked) return;
    cometaryIceHarvester.toggle();
}

// ==========================================
//            POTATO COLONIZER FUNCTIONS
// ==========================================

function unlockMartianPotatoColonizer() {
    isMartianPotatoColonizerUnlocked = true;
    colonizerCycle = 0;
    if (!unlockedActionCards.includes('martian-potato-colonizer-container')) {
        unlockedActionCards.push('martian-potato-colonizer-container');
    }
    updateActionCards();
    initializeMartianPotatoColonizer();
}

function initializeMartianPotatoColonizer() {
    console.log('Initializing Martian Potato Colonizer');
    const button = document.querySelector('.action-button.colonizer');
    if (button) {
        console.log('Martian Potato Colonizer button found');
        button.removeEventListener('click', toggleMartianPotatoColonizer);
        button.addEventListener('click', toggleMartianPotatoColonizer);
    } else {
        console.warn('Martian Potato Colonizer button not found');
    }
    updateMartianPotatoColonizerUI();
}

function toggleMartianPotatoColonizer() {
    console.log('Toggling Martian Potato Colonizer');
    console.log('Current state:', isMartianPotatoColonizerActive);
    if (isMartianPotatoColonizerActive) {
        stopMartianPotatoColonizer();
    } else {
        startMartianPotatoColonizer();
    }
    updateMartianPotatoColonizerUI();
}

function startMartianPotatoColonizer() {
    console.log('Starting Martian Potato Colonizer');
    console.log('Current cycle:', colonizerCycle, 'Max cycles:', maxColonizerCycles);
    if (colonizerCycle >= maxColonizerCycles) {
        console.log('Colonizer Depleted');
        showToast("Colonizer Depleted", "The Martian Potato Colonizer has reached its maximum cycles.", 'warning');
        return;
    }
    isMartianPotatoColonizerActive = true;
    updateMartianPotatoColonizerUI();
    runMartianPotatoColonizerCycle();
}

function stopMartianPotatoColonizer() {
    console.log('Stopping Martian Potato Colonizer');
    isMartianPotatoColonizerActive = false;
    if (window.martianPotatoColonizerIntervalId) {
        clearInterval(window.martianPotatoColonizerIntervalId);
        window.martianPotatoColonizerIntervalId = null;
        console.log('Cleared Martian Potato Colonizer interval');
    }
    if (areResourcesDepleted) {
        console.log('Resources Depleted');
        updateDepletedActionCard('martian-potato-colonizer-container', true, "Resources Depleted");
    } else {
        updateMartianPotatoColonizerUI();
    }
}

function runMartianPotatoColonizerCycle() {
    console.log('Running Martian Potato Colonizer cycle');
    if (!isMartianPotatoColonizerActive) return;

    // Calculate the current cycle duration based on the cycle number
    const cycleDuration = Math.max(
        INITIAL_COLONIZER_CYCLE_DURATION * Math.pow(0.7, colonizerCycle),
        MIN_COLONIZER_CYCLE_DURATION
    );
    console.log(`Current cycle duration: ${cycleDuration}ms`);

    const ledCount = 10;
    const ledUpdateInterval = cycleDuration / ledCount;

    let currentLed = 0;
    window.martianPotatoColonizerIntervalId = setInterval(() => {
        if (!isMartianPotatoColonizerActive) {
            clearInterval(window.martianPotatoColonizerIntervalId);
            window.martianPotatoColonizerIntervalId = null;
            return;
        }

        updateLEDProgress('martian-potato-colonizer-container', currentLed + 1);
        currentLed++;

        if (currentLed >= ledCount) {
            clearInterval(window.martianPotatoColonizerIntervalId);
            window.martianPotatoColonizerIntervalId = null;
            martianPotatoColonizerEffect();
            updateMartianPotatoColonizerUI();

            if (colonizerCycle < maxColonizerCycles && isMartianPotatoColonizerActive) {
                runMartianPotatoColonizerCycle();
            } else {
                stopMartianPotatoColonizer();
            }
        }
    }, ledUpdateInterval);
}

function updateMartianPotatoColonizerUI() {
    console.log('Updating Martian Potato Colonizer UI');
    const button = document.querySelector('.action-button.colonizer');
    if (button) {
        const newText = isMartianPotatoColonizerActive ? "Colonizing..." : "Colonize";
        console.log('Button state:', newText);
        button.textContent = newText;
        button.classList.toggle('active', isMartianPotatoColonizerActive);
    } else {
        console.warn('Martian Potato Colonizer button not found in updateMartianPotatoColonizerUI');
    }
    updateLEDProgress('martian-potato-colonizer-container', 0);
}

function updateLEDProgress(containerId, progress) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const leds = container.querySelectorAll('.led-light');
    leds.forEach((led, index) => {
        led.classList.toggle('active', index < progress);
    });
}

function martianPotatoColonizerEffect() {
    let resourceAmount = Math.pow(2, colonizerCycle) * 100;

    potatoCount += resourceAmount;
    totalPotatoesHarvested += resourceAmount;
    water += resourceAmount;
    nutrients += resourceAmount;
    ice += resourceAmount;

    updateDisplay();
    
    const nextCycleDuration = Math.max(
        INITIAL_COLONIZER_CYCLE_DURATION * Math.pow(0.7, colonizerCycle + 1),
        MIN_COLONIZER_CYCLE_DURATION
    );
    showToast("Resources Acquired", `Martian Potato Colonizer harvested ${resourceAmount} of each resource! Next cycle in ${(nextCycleDuration / 1000).toFixed(1)}s`, 'achievement');

    colonizerCycle++;

    if (colonizerCycle >= maxColonizerCycles) {
        onResourcesDepleted(); // Call this function when max cycles are reached
    }

    updateHarvestHistory();
}

// ==========================================
//       QUANTUM SPUD SPAWNER FUNCTIONS
// ==========================================

function startQuantumSpudSpawner() {
    if (!isQuantumSpudSpawnerActive) {
        isQuantumSpudSpawnerActive = true;
        quantumSpudSpawnerInterval = setInterval(() => {
            for (let i = 0; i < potatoField.length; i++) {
                if (potatoField[i] === null && consumeResources()) {
                    // Plant a new potato with isQuantumSpawned set to true
                    potatoField[i] = createPotato(true, true);
                    updatePotatoFieldDisplay();
                } else if (potatoField[i] && potatoField[i].growthStage >= 100) {
                    // Harvest the potato
                    harvestPotatoAtIndex(i, true);
                }
            }
            updateDisplay();
        }, 600);
    }
}

function stopQuantumSpudSpawner() {
    if (isQuantumSpudSpawnerActive) {
        isQuantumSpudSpawnerActive = false;
        clearInterval(quantumSpudSpawnerInterval);
    }
}

// Modify the createPotato function to allow for instant growth
function createPotato(instantGrowth = false, isQuantumSpawned = false) {
    const currentTime = Date.now();
    const scaleX = 0.95 + Math.random() * 0.1;
    const scaleY = 0.95 + Math.random() * 0.1;
    const borderRadius = `${45 + Math.random() * 10}% ${55 + Math.random() * 10}% ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% / ${50 + Math.random() * 10}% ${50 + Math.random() * 10}% ${55 + Math.random() * 10}% ${45 + Math.random() * 10}%`;
    const textureClass = `potato-texture-${Math.floor(Math.random() * 8) + 1}`;
    
    return {
        plantedAt: currentTime,
        growthStage: instantGrowth ? 100 : 0,
        scaleX,
        scaleY,
        borderRadius,
        textureClass,
        isQuantumSpawned
    };
}

// Add this function to toggle the Quantum Spud Spawner
function toggleQuantumSpudSpawner() {
    if (isQuantumSpudSpawnerActive) {
            stopQuantumSpudSpawner();
    } else {
        startQuantumSpudSpawner();
    }
    updateQuantumSpudSpawnerToggle();
}

// Add this function to update the Quantum Spud Spawner toggle button
function updateQuantumSpudSpawnerToggle() {
    const toggleElement = document.getElementById('quantum-spud-spawner-toggle');
    if (toggleElement) {
        toggleElement.checked = isQuantumSpudSpawnerActive;
    }
}

// ==========================================
//            NUCLEAR ICE MELTER FUNCTIONS
// ==========================================

// Unlock the Nuclear Ice Melter
function unlockNuclearIceMelter() {
    isNuclearIceMelterUnlocked = true;
    if (!unlockedActionCards.includes('nuclear-ice-melter-container')) {
        unlockedActionCards.push('nuclear-ice-melter-container');
    }
    updateActionCards();
}

// Start the Nuclear Ice Melter
function startNuclearIceMelter() {
    if (potatoCount >= 100) {
        potatoCount -= 100;
        updateDisplay();

        nuclearIceMelterInterval = setInterval(() => {
            // Calculate ice to melt based on the knob's percentage
            const iceToMelt = Math.max(1, Math.floor((ice * nuclearIceMelterPercentage) / 100));

            if (ice >= iceToMelt) {
                ice -= iceToMelt;
                water += iceToMelt;
                updateDisplay();
            } else if (ice >= 1) {
                // Melt remaining ice if less than iceToMelt but at least 1
                water += ice;
                ice = 0;
                updateDisplay();
            } else {
                showToast("Resource Shortage", "Not enough ice to continue melting!", 'setback');
                toggleNuclearIceMelter(); // Turn off if resources are insufficient
            }
        }, 1000); // Runs every second
    } else {
        showToast("Resource Shortage", "Not enough potatoes to start the Nuclear Ice Melter!", 'setback');
        // Turn off the toggle switch
        const toggle = document.getElementById('nuclear-ice-melter-toggle');
        if (toggle) {
            toggle.checked = false;
        }
    }
}

// Stop the Nuclear Ice Melter
function stopNuclearIceMelter() {
    clearInterval(nuclearIceMelterInterval);
}

// Toggle the Nuclear Ice Melter
function toggleNuclearIceMelter() {
    if (isNuclearIceMelterActive) {
        isNuclearIceMelterActive = false;
        stopNuclearIceMelter();
    } else {
        isNuclearIceMelterActive = true;
        startNuclearIceMelter();
    }
}

// Update the initializeNuclearIceMelter function
function initializeNuclearIceMelter() {
    const knobElement = document.getElementById('nuclear-ice-melter-knob');
    if (knobElement) {
        if (!iceMelterKnob) {
            // Create the knob if it doesn't exist
            iceMelterKnob = new Knob({
                id: 'nuclear-ice-melter-knob',
                lowVal: 1,
                highVal: 10,
                value: nuclearIceMelterPercentage,
                sensitivity: 1,
                type: 'FStyle',
                size: 'large',
                label: false
            });
        } else {
            // Update the existing knob
            iceMelterKnob.setValue(nuclearIceMelterPercentage);
        }
        updateNuclearIceMelterDisplay();
    }
}

// Update the knobChanged function
window.knobChanged = function(id, val) {
    if (id === 'nuclear-ice-melter-knob') {
        nuclearIceMelterPercentage = parseInt(val);
        console.log(`Nuclear Ice Melter percentage set to ${nuclearIceMelterPercentage * 10}%`);
        updateNuclearIceMelterDisplay();
    }
};

// Update the updateNuclearIceMelterDisplay function
function updateNuclearIceMelterDisplay() {
    const nuclearIceMelterDisplay = document.getElementById('nuclear-ice-melter-display');
    if (nuclearIceMelterDisplay) {
        const displayValue = (nuclearIceMelterPercentage * 10).toString();
        nuclearIceMelterDisplay.textContent = `${displayValue}%`;
    }
}

// ==========================================
//           Polar Cap Mining Functions
// ==========================================

function unlockPolarCapMining() {
    isPolarCapMiningUnlocked = true;
    const miningContainer = document.getElementById('polar-cap-mining-container');
    if (miningContainer) {
        miningContainer.style.display = 'block';
    }
}

function togglePolarCapMining() {
    if (!isPolarCapMiningUnlocked) return;

    isPolarCapMiningActive = !isPolarCapMiningActive;
    const toggleSwitch = document.getElementById('polar-cap-mining-toggle');
    if (toggleSwitch) {
        toggleSwitch.checked = isPolarCapMiningActive;
    }

    if (isPolarCapMiningActive) {
        startPolarCapMining();
    } else {
        stopPolarCapMining();
    }
}

function startPolarCapMining() {
    polarCapMiningInterval = setInterval(() => {
        if (potatoCount >= 2) {
            potatoCount -= 2;
            ice += 2;
            updateDisplay();
        } else {
            showToast("Resource Shortage", "Not enough potatoes to run Polar Cap Mining!", 'setback');
            togglePolarCapMining(); // Turn off if resources are insufficient
        }
    }, 1000); // Runs every second
}

function stopPolarCapMining() {
    clearInterval(polarCapMiningInterval);
}

// ==========================================
//           Chart / Harvest History Functions
// ==========================================

// Function to get the playtime
function getPlaytime() {
    const playtimeMillis = Date.now() - gameStartTime;
    const playtimeSeconds = Math.floor((playtimeMillis / 1000) % 60);
    const playtimeMinutes = Math.floor((playtimeMillis / (1000 * 60)) % 60);
    const playtimeHours = Math.floor(playtimeMillis / (1000 * 60 * 60));
    return `${playtimeHours}h ${playtimeMinutes}m ${playtimeSeconds}s`;
}

// Function to update harvest history with time-based aggregation
function updateHarvestHistory() {
    const now = Date.now();

    // Add new data point
    harvestHistory.push({
        timestamp: now,
        totalPotatoes: totalPotatoesHarvested
    });

    // Define binning intervals
    const recentInterval = 60 * 1000; // 1 minute
    const oldInterval = 5 * 60 * 1000; // 5 minutes

    // Threshold between recent and old data (e.g., last 30 minutes)
    const recentThreshold = now - (30 * 60 * 1000); // Last 30 minutes

    // Function to aggregate data into bins
    function aggregateData(data, interval) {
        const aggregatedData = [];
        if (data.length === 0) return aggregatedData;

        let bucketStartTime = data[0].timestamp;
        let bucketEndTime = bucketStartTime + interval;
        let bucketTotal = 0;
        let bucketCount = 0;

        data.forEach(entry => {
            while (entry.timestamp >= bucketEndTime) {
                if (bucketCount > 0) {
                    aggregatedData.push({
                        timestamp: bucketStartTime + interval / 2,
                        totalPotatoes: Math.round(bucketTotal / bucketCount) // Round to nearest whole number
                    });
                }
                bucketStartTime = bucketEndTime;
                bucketEndTime += interval;
                bucketTotal = 0;
                bucketCount = 0;
            }
            bucketTotal += entry.totalPotatoes;
            bucketCount += 1;
        });

        // Add the last bucket
        if (bucketCount > 0) {
            aggregatedData.push({
                timestamp: bucketStartTime + interval / 2,
                totalPotatoes: Math.round(bucketTotal / bucketCount) // Round to nearest whole number
            });
        }

        return aggregatedData;
    }

    // Separate recent and old data
    const recentData = harvestHistory.filter(entry => entry.timestamp >= recentThreshold);
    const oldData = harvestHistory.filter(entry => entry.timestamp < recentThreshold);

    // Aggregate old data
    const aggregatedOldData = aggregateData(oldData, oldInterval);

    // Keep recent data as is
    const processedRecentData = recentData;

    // Combine aggregated old data with recent data
    harvestHistory = aggregatedOldData.concat(processedRecentData);

    // Limit the size of the harvestHistory array
    const maxHistoryEntries = 1000; // Adjust as needed
    if (harvestHistory.length > maxHistoryEntries) {
        harvestHistory = harvestHistory.slice(-maxHistoryEntries);
    }

    updateHarvestChart();
}

// Initialize the harvest chart
let harvestChart;

function initializeHarvestChart() {
    if (harvestChart) {
        harvestChart.destroy();
    }
    const ctx = document.getElementById('harvestChart').getContext('2d');
    harvestChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Potatoes Harvested',
                data: [],
                borderColor: '#C2A378',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            animation: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute',
                        tooltipFormat: 'MMM d, h:mm:ss a'
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total Potatoes Harvested'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Total Potatoes: ${context.parsed.y}`;
                        }
                    }
                },
                decimation: {
                    enabled: true,
                    algorithm: 'min-max',
                    samples: 200
                }
            }
        }
    });
}

// Update the harvest chart data
function updateHarvestChart() {
    if (!harvestChart) return;

    // Map harvestHistory to chart data
    const timestamps = harvestHistory.map(entry => new Date(entry.timestamp));
    const totals = harvestHistory.map(entry => entry.totalPotatoes);

    harvestChart.data.labels = timestamps;
    harvestChart.data.datasets[0].data = totals;
    harvestChart.update();

    // Update UI elements
    const totalPotatoesCount = document.getElementById('total-potatoes-count');
    if (totalPotatoesCount) {
        totalPotatoesCount.textContent = totalPotatoesHarvested;
    }

    const missionTimeValue = document.getElementById('mission-time-value');
    if (missionTimeValue) {
        missionTimeValue.textContent = getElapsedMartianTime();
    }
}

function getElapsedMartianTime() {
    const elapsedMillis = Date.now() - gameStartTime;
    const elapsedEarthSeconds = elapsedMillis / 1000;
    const martianSeconds = elapsedEarthSeconds / 1.02749;

    const martianHours = Math.floor(martianSeconds / 3698.958);
    const remainingSeconds = martianSeconds % 3698.958;
    const martianMinutes = Math.floor(remainingSeconds / 61.6493);
    const finalMartianSeconds = Math.floor(remainingSeconds % 61.6493);

    return `${martianHours.toString().padStart(2, '0')}:${martianMinutes.toString().padStart(2, '0')}:${finalMartianSeconds.toString().padStart(2, '0')} MTC`;
}

// ==========================================
//            EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
 // Core game controls
 addEventListenerIfExists('plant-button', 'click', plantPotato);
 addEventListenerIfExists('save-button', 'click', saveGame);
 addEventListenerIfExists('reset-button', 'click', resetGame);

 // Potato field interactions
 document.getElementById('potato-field').addEventListener('click', handlePotatoFieldClick);

 // Debug mode toggle
 document.addEventListener('keydown', handleKeyPress);

 // Debug info controls
 addEventListenerIfExists('minimize-debug', 'click', toggleDebugInfoMinimize);

 // Exploration interaction
 addEventListenerIfExists('exploration-container', 'click', exploreMarsSurface);

 // Resource generation toggles
 addEventListenerIfExists('subsurface-aquifer-tapper-toggle', 'change', () => window['toggleSubsurfaceAquiferTapper']());
 addEventListenerIfExists('bucket-wheel-excavator-toggle', 'change', () => window['toggleBucketWheelExcavator']());
 addEventListenerIfExists('polar-cap-mining-toggle', 'change', togglePolarCapMining);
 addEventListenerIfExists('quantum-spud-spawner-toggle', 'change', toggleQuantumSpudSpawner);

    // Action card interactions
    addEventListenerIfExists('ice-melting-basin-container', 'click', fillIceMeltingBasin);

    // Nuclear Ice Melter toggle
    const nuclearIceMelterToggle = document.getElementById('nuclear-ice-melter-toggle');
    if (nuclearIceMelterToggle) {
        nuclearIceMelterToggle.removeEventListener('change', toggleNuclearIceMelter);
        nuclearIceMelterToggle.removeEventListener('click', handleNuclearIceMelterClick);
        nuclearIceMelterToggle.addEventListener('click', handleNuclearIceMelterClick);
    }

    // Chart modal listeners
    initializeChartModalListeners();

// Define the global knobChanged handler
window.knobChanged = function(id, val) {
    if (id === 'nuclear-ice-melter-knob') {
        nuclearIceMelterPercentage = parseInt(val);
        console.log(`Nuclear Ice Melter percentage set to ${nuclearIceMelterPercentage * 10}%`);
        updateNuclearIceMelterDisplay(); // Update the display
    }
};

// Function to show the Nuclear Ice Melter container
function showNuclearIceMelterContainer() {
    const container = document.getElementById('nuclear-ice-melter-container');
    if (container) {
        container.style.display = 'block';
        console.log('Nuclear Ice Melter container should now be visible');
    } else {
        console.error('Nuclear Ice Melter container not found');
    }
}

// Call the function to show the container
showNuclearIceMelterContainer();

}

function handlePotatoFieldClick(event) {
    const slotElement = event.target.closest('.potato-slot');
    if (slotElement) {
        const index = parseInt(slotElement.getAttribute('data-index'), 10);
        if (potatoField[index] && potatoField[index].growthStage >= 100) {
            harvestPotatoAtIndex(index);
        }
    }
}

function handleKeyPress(event) {
    if (event.key.toLowerCase() === 'd') {
        toggleDebugMode();
    }
}

function toggleDebugInfoMinimize() {
    const debugInfo = document.getElementById('debug-info');
    debugInfo.classList.toggle('minimized');
    const minimizeDebugButton = document.getElementById('minimize-debug');
    minimizeDebugButton.setAttribute('data-text', 
        debugInfo.classList.contains('minimized') ? 'Maximize' : 'Minimize');
}

// Call this function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initGame();
});

function handleNuclearIceMelterClick(event) {
    event.preventDefault(); // Prevent the default toggle behavior
    event.stopPropagation();
    toggleNuclearIceMelter();
}

function initializeChartModalListeners() {
    let harvestChartInitialized = false;
    const chartButton = document.getElementById('chart-button');
    const chartModal = document.getElementById('chart-modal');
    const closeChartModal = document.querySelector('.close-chart-modal');
    
    if (chartButton && chartModal && closeChartModal) {
        chartButton.addEventListener('click', () => {
            chartModal.style.display = 'flex';
            if (!harvestChartInitialized) {
                initializeHarvestChart();
                harvestChartInitialized = true;
            }
            updateHarvestChart();
        });

        closeChartModal.addEventListener('click', () => {
            chartModal.style.display = 'none';
        });

        chartModal.addEventListener('click', (event) => {
            if (event.target === chartModal) {
                chartModal.style.display = 'none';
            }
        });
    }
}

// ==========================================
//            MISCELLANEOUS
// ==========================================

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
            showToast("Debug Mode Enabled", "Added 1,000,000 potatoes for testing. Press 'D' to toggle.", 'debug');
        } else {
            showToast("Debug Mode Disabled", "Press 'D' to re-enable debug mode.", 'debug');
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
        
        const playtime = getPlaytime();
        updateElement('playtime-debug', `Playtime: ${playtime}`);
        
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

