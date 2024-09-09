// This file implements the upgrade system for the Martian Potato game
// It defines available upgrades, manages the tech tree UI, and handles upgrade purchases

// Game Constants
const TECH_TREE_UPDATE_INTERVAL = 1000; // Update every second
const BASE_HARVEST_DELAY = 1000; // 1 second in milliseconds

// Upgrade System Variables
let currentPlantingUpgrade = 0;
let highestPurchasedWeight = 0;
let lastTechTreeUpdate = 0;

// Automation Arrays
let autoplanters = [];
let autoHarvesters = [];

// Achievement System Variables
let achievementQueue = [];
let isAchievementModalOpen = false;

// Subsurface Aquifer Tapper Variables
let isSubsurfaceAquiferTapperUnlocked = false;
let isSubsurfaceAquiferTapperActive = false;
let subsurfaceAquiferTapperInterval = null;

// Martian Bucket-Wheel Excavator Variables
let isBucketWheelExcavatorUnlocked = false;
let isBucketWheelExcavatorActive = false;
let bucketWheelExcavatorInterval = null;

// Upgrade Definitions
const upgrades = [
    { 
        name: "Hand Trowel", 
        cost: 0, 
        effect: () => { plantingDelay = 4000; },
        icon: "🖐️",
        description: "The simplest tool for planting potatoes.",
        metaMessage: "Manual labor. The game begins with the simplest form of interaction, making future efficiencies feel like significant advancements.",
        weight: 1,
        category: "planting"
    },
    { 
        name: "Manual Ice Melting", 
        cost: 0, 
        effect: () => { 
            unlockManualIceMelting();
            showToast("Upgrade Unlocked", "You can now manually melt ice for water!", 'achievement');
        },
        icon: "🧊",
        description: "Collect water by manually melting Martian ice, 1 unit per 5 clicks.",
        metaMessage: "The grind begins. By starting with a low-yield, high-effort method, the game establishes a baseline against which all future upgrades will feel like progress, even if they simply shift the type of effort required.",
        assetName: "manual_ice_melting.webp",
        weight: 2,
        category: "harvesting"
    },
    { 
        name: "Watering Can", 
        cost: 1, 
        effect: () => { plantingDelay = 3000; },
        icon: "🚿",
        description: "Speeds up the planting process by efficiently watering the soil.",
        metaMessage: "Integrating water delivery. This upgrade speeds up the planting process, giving you a sense of progress while subtly introducing the concept of resource management.",
        weight: 3,
        category: "planting"
    },
    { 
        name: "Automated Planter", 
        cost: 5, 
        effect: () => { addAutoplanter(); }, 
        count: 0,
        icon: "🤖",
        description: "Automatically plants potatoes, reducing manual labor.",
        metaMessage: "Automation's allure. This upgrade significantly reduces active playtime, giving you a sense of progress and control, while quietly introducing a new constraint: power.",
        weight: 3,
        category: "planting"
    },
    { 
        name: "Auto Harvester", 
        cost: 100, 
        effect: () => { addAutoHarvester(); }, 
        count: 0,
        icon: "🤖",
        description: "Automatically harvests mature potatoes.",
        metaMessage: "Your first step towards full automation. The game is reducing your direct involvement, shifting your focus to management and strategy.",
        weight: 5,
        category: "harvesting"
    },
    { 
        name: "Quantum Spud Spawner", 
        cost: 1000000, 
        effect: () => { plantingDelay = 500; },
        icon: "⚛️",
        description: "Utilizes quantum technology for near-instant potato planting.",
        metaMessage: "The ultimate efficiency. The game offers peak performance, yet at a steep resource cost. This reflects the paradox of progress: as you achieve perfection, your burden increases.",
        weight: 20,
        category: "planting"
    },
    { 
        name: "Martian Map", 
        cost: 10, 
        effect: () => { 
            window.exploreDelay = Math.max(1000, window.exploreDelay - 5000);
            updateExploreButton();
        },
        icon: "🗺️",
        description: "Reduces exploration time by 5 seconds.",
        metaMessage: "Efficiency through knowledge. This upgrade demonstrates how information can lead to faster progress, subtly encouraging you to value data and exploration.",
        weight: 2,
        category: "exploration"
    },
    { 
        name: "Binoculars", 
        cost: 50, 
        effect: () => { 
            window.exploreDelay = Math.max(1000, window.exploreDelay - 1000);
            updateExploreButton();
        },
        icon: "🔭",
        description: "Further reduces exploration time by 1 second.",
        metaMessage: "Incremental improvements. This upgrade shows how small advancements can accumulate, encouraging continued investment in seemingly minor upgrades.",
        weight: 3,
        category: "exploration"
    },
    { 
        name: "Jetpack", 
        cost: 250, 
        effect: () => { 
            window.exploreDelay = Math.max(1000, Math.floor(window.exploreDelay * 0.5));
            updateExploreButton();
        },
        icon: "🚀",
        description: "Halves the exploration cooldown time.",
        metaMessage: "Technological leaps. This upgrade represents a significant advancement, showing how larger investments can lead to more substantial improvements.",
        weight: 5,
        category: "exploration"
    },
    { 
        name: "Spudnik Satellite", 
        cost: 2000, 
        effect: () => { 
            window.explorationResourceMultiplier = 1.5; 
            showToast("Upgrade Effect", "Spudnik Satellite now increases resource yields from exploration by 50%!", 'achievement');
        },
        icon: "🛰️",
        description: "Orbits Mars, providing detailed surface scans and increasing resource discovery by 50%.",
        metaMessage: "Global perspective. This upgrade demonstrates how technology can provide a broader view, leading to more efficient resource discovery and management.",
        weight: 10,
        category: "exploration"
    },
    { 
        name: "Martian Bucket-Wheel Excavator", 
        cost: 3500, 
        effect: () => { 
            unlockBucketWheelExcavator();
        },
        icon: "⛏️",
        description: "A massive mobile strip-mining machine that consumes 1 potato per second to generate 2 nutrients and 2 ice.",
        metaMessage: "Industrial-scale operations. This upgrade showcases how large-scale machinery can dramatically increase resource gathering efficiency, shifting the game's scale.",
        assetName: "bucket_wheel_excavator.webp",
        weight: 12,
        category: "exploration"
    },
    { 
        name: "Subterranean Tuber Tunneler", 
        cost: 5000, 
        effect: () => { window.totalExplorationRate += 1; updateAutonomousExploration(); },
        icon: "🕳️",
        description: "Burrows beneath the Martian surface, uncovering hidden resource deposits.",
        metaMessage: "Digging deeper. This upgrade shows how exploring new frontiers (in this case, underground) can lead to significant resource gains, encouraging players to think beyond the obvious.",
        weight: 13,
        category: "exploration"
    },
    { 
        name: "Martian Potato Colonizer", 
        cost: 20000, 
        effect: () => { window.totalExplorationRate += 2; updateAutonomousExploration(); },
        icon: "🏙️",
        description: "Establishes autonomous potato-growing colonies across Mars, greatly increasing resource discovery.",
        metaMessage: "Full automation. This final upgrade represents the pinnacle of your Martian potato empire, showcasing how far you've come from manual labor to planet-wide automation.",
        weight: 14,
        category: "exploration"
    },
    {
        name: "Thermal Drill",
        cost: 200,
        effect: () => { 
            window.waterExplorationMultiplier = (window.waterExplorationMultiplier || 1) * 1.5;
            updateAutonomousExploration();
        },
        icon: "🔥",
        description: "A specialized drill that uses heat to extract water from ice deposits more effectively.",
        metaMessage: "Efficiency through technology. This upgrade introduces the concept of specialized tools, showing how targeted innovations can significantly boost resource gathering.",
        weight: 6,
        category: "exploration"
    },
    {
        name: "Subsurface Aquifer Tapper",
        cost: 500,
        effect: () => { 
            unlockSubsurfaceAquiferTapper();
        },
        icon: "💧",
        description: "Accesses underground water reserves. Consumes 1 potato per second to produce 2 water per second when active.",
        metaMessage: "Automated resource conversion. This upgrade introduces the concept of continuous resource transformation, requiring players to balance potato production and water generation.",
        weight: 8,
        category: "exploration"
    },
    {
        name: "Martian Polar Cap Extractor",
        cost: 2500,
        effect: () => { 
            window.waterExplorationMultiplier = (window.waterExplorationMultiplier || 1) * 3;
            window.polarCapBonusChance = 0.05;
            updateAutonomousExploration();
        },
        icon: "❄️",
        description: "Allows remote extraction of water from Mars' polar ice caps during exploration missions.",
        metaMessage: "High-risk, high-reward. This upgrade introduces an element of chance, offering the excitement of potentially large bonuses to keep players engaged.",
        weight: 12,
        category: "exploration"
    },
    {
        name: "Cometary Ice Harvester",
        cost: 10000,
        effect: () => { 
            window.waterExplorationMultiplier = (window.waterExplorationMultiplier || 1) * 2.5;
            window.totalExplorationRate *= 1.1;
            updateAutonomousExploration();
        },
        icon: "☄️",
        description: "Occasionally intercepts and harvests passing comets for their water-rich ice, boosting both exploration and water collection.",
        metaMessage: "Thinking beyond Mars. This upgrade expands the game's scope, showing how advanced technology can turn previously unreachable resources into viable options.",
        weight: 15,
        category: "exploration"
    }
];

// Update the tech tree UI, throttled to run at most once per second
function updateTechTree() {
    const currentTime = Date.now();
    if (currentTime - lastTechTreeUpdate < TECH_TREE_UPDATE_INTERVAL) {
        return; // Exit if not enough time has passed since the last update
    }
    lastTechTreeUpdate = currentTime;

    const techCards = document.querySelectorAll('.tech-card');
    
    techCards.forEach((card) => {
        const upgradeName = card.dataset.upgradeName;
        const upgrade = upgrades.find(u => u.name === upgradeName);
        
        if (upgrade) {
            const upgradeCost = getUpgradeCost(upgrade);
            const isPurchasable = potatoCount >= upgradeCost;

            // Update purchasability and cost display
            card.classList.toggle('purchasable', isPurchasable);
            const costElement = card.querySelector('.tech-card-cost');
            if (costElement) {
                costElement.textContent = `Cost: ${upgradeCost} potatoes`;
            }
        }
    });
}

// Main game loop function, called on each animation frame
function gameLoop(currentTime) {
    if (currentTime - lastFrameTime >= FRAME_DELAY) {
        updatePlantButton();
        if (updateResources(currentTime)) {
            updateDisplay();
            checkAndRestartAutoplanters();
        }
        updatePotatoGrowth();
        updateTechTree(); // Call updateTechTree here, it will self-throttle
        lastFrameTime = currentTime;
    }
    requestAnimationFrame(gameLoop);
}

// Create and populate the tech tree UI
function createTechTree() {
    const techTree = document.getElementById('tech-tree');
    techTree.innerHTML = ''; // Clear existing content

    // Sort upgrades by weight and create cards for each
    const sortedUpgrades = upgrades.slice().sort((a, b) => a.weight - b.weight);
    sortedUpgrades.forEach((upgrade) => {
        if (!upgrade.purchased || (upgrade.count !== undefined && upgrade.count > 0)) {
            techTree.appendChild(createCard(upgrade));
        }
    });
}

// Create a single tech card for the given upgrade
function createCard(upgrade) {
    const card = document.createElement('div');
    card.className = 'tech-card';
    card.dataset.upgradeName = upgrade.name;
    card.dataset.weight = upgrade.weight;

    const iconElement = document.createElement('div');
    iconElement.className = 'tech-card-icon';

    const imageName = upgrade.assetName || (upgrade.name.replace(/\s+/g, '_').toLowerCase() + '.webp');
    const imageUrl = `images/${imageName}`;

    const img = new Image();
    img.src = imageUrl;
    img.onerror = () => {
        iconElement.textContent = upgrade.icon;
        console.log(`Failed to load image: ${imageUrl}`);
    };
    img.onload = () => {
        iconElement.innerHTML = '';
        iconElement.appendChild(img);
    };

    iconElement.textContent = upgrade.icon; // Fallback content

    const detailsElement = document.createElement('div');
    detailsElement.className = 'tech-card-details';
    detailsElement.innerHTML = `
        <h3 class="tech-card-name" title="${upgrade.name}">${upgrade.name}</h3>
        <p class="tech-card-cost">Cost: ${getUpgradeCost(upgrade)} potatoes</p>
    `;

    // Only add the details button if the upgrade weight is not above 10 or if a weight 10 upgrade has been purchased
    if (upgrade.weight <= 10 || highestPurchasedWeight >= 10) {
        const detailsButton = document.createElement('button');
        detailsButton.className = 'details-button';
        detailsButton.textContent = 'Details';
        detailsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click event
            showUpgradeModal(upgrade);
        });
        detailsElement.appendChild(detailsButton);
    }

    card.appendChild(iconElement);
    card.appendChild(detailsElement);

    // Add blur class if the upgrade weight is above 10 and no weight 10 upgrade has been purchased
    if (upgrade.weight > 10 && highestPurchasedWeight < 10) {
        card.classList.add('blurred');
    }

    return card;
}

// Calculate the cost of an upgrade, considering potential count-based scaling
function getUpgradeCost(upgrade) {
    if (upgrade.count !== undefined) {
        return Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count));
    }
    return upgrade.cost;
}

// Display a modal with detailed information about an upgrade
function showUpgradeModal(upgrade) {
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const upgradeCost = getUpgradeCost(upgrade);
    const content = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>${upgrade.name}</h2>
            <p>${upgrade.description}</p>
            <p class="tech-card-cost">Cost: ${upgradeCost} potatoes</p>
            <button class="buy-upgrade-button" ${potatoCount >= upgradeCost ? '' : 'disabled'}>Buy Upgrade</button>
        </div>
    `;
    modal.innerHTML = content;

    const buyButton = modal.querySelector('.buy-upgrade-button');
    buyButton.addEventListener('click', () => {
        buyUpgrade(upgrade);
        modal.remove();
    });

    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.remove();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

// Handle the purchase of an upgrade
function buyUpgrade(upgrade) {
    const cost = getUpgradeCost(upgrade);
    if (potatoCount >= cost) {
        potatoCount -= cost;
        upgrade.effect();
        if (upgrade.count !== undefined) {
            upgrade.count++;
        } else {
            upgrade.purchased = true;
        }
        updateDisplay();
        
        // Update the highest purchased weight
        highestPurchasedWeight = Math.max(highestPurchasedWeight, upgrade.weight);

        // Queue an achievement for the upgrade purchase
        queueAchievement(
            `Technology Unlocked: ${upgrade.name}`,
            upgrade.description,
            upgrade.metaMessage
        );

        // Update the specific card that was just purchased
        const card = document.querySelector(`.tech-card[data-upgrade-name="${upgrade.name}"]`);
        if (card) {
            const costElement = card.querySelector('.tech-card-cost');
            if (costElement) {
                costElement.textContent = `Cost: ${getUpgradeCost(upgrade)} potatoes`;
            }
        }
        
        // If a weight 10 upgrade was purchased, update all cards
        if (upgrade.weight === 10) {
            updateAllCards();
        }

        createTechTree(); // Recreate the tech tree to reflect changes
    } else {
        showToast("Not Enough Potatoes", "You don't have enough potatoes to purchase this upgrade.", 'setback');
    }
}

// Update all tech cards when a weight 10 upgrade is purchased
function updateAllCards() {
    const cards = document.querySelectorAll('.tech-card');
    cards.forEach(card => {
        const weight = parseInt(card.dataset.weight, 10);
        if (weight > 10) {
            card.classList.remove('blurred');
            if (!card.querySelector('.details-button')) {
                const detailsButton = document.createElement('button');
                detailsButton.className = 'details-button';
                detailsButton.textContent = 'Details';
                detailsButton.addEventListener('click', (event) => {
                    event.stopPropagation();
                    const upgradeName = card.dataset.upgradeName;
                    const upgrade = upgrades.find(u => u.name === upgradeName);
                    if (upgrade) {
                        showUpgradeModal(upgrade);
                    }
                });
                card.querySelector('.tech-card-details').appendChild(detailsButton);
            }
        }
    });
}

// Add a new autoplanter to the game
function addAutoplanter() {
    const autoplanter = {
        interval: null,
        cost: Math.floor(20 * Math.pow(1.15, upgrades.find(u => u.name === "Automated Planter").count))
    };
    autoplanters.push(autoplanter);
    rawPotatoesPerSecond += 1; // Each autoplanter adds 1 potato per second
    startAutoplanter(autoplanter);
    updateDisplay();
}

// Start the autoplanting process for a given autoplanter
function startAutoplanter(autoplanter) {
    autoplanter.interval = setInterval(() => {
        const emptySlotIndex = potatoField.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1 && consumeResources()) {
            const currentTime = Date.now();
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
            updateDisplay();
        }
    }, 2000); // Try to plant every 2 seconds
}

// Check and restart any stopped autoplanters
function checkAndRestartAutoplanters() {
    autoplanters.forEach(autoplanter => {
        if (!autoplanter.interval) {
            startAutoplanter(autoplanter);
        }
    });
}

// Add a new auto harvester to the game
function addAutoHarvester() {
    const autoHarvester = {
        interval: null,
        cost: Math.floor(100 * Math.pow(1.15, upgrades.find(u => u.name === "Auto Harvester").count))
    };
    autoHarvesters.push(autoHarvester);
    startAutoHarvester(autoHarvester);
    updateDisplay();
}

// Start the auto harvesting process for a given auto harvester
function startAutoHarvester(autoHarvester) {
    autoHarvester.interval = setInterval(() => {
        harvestOneReadyPotato();
    }, BASE_HARVEST_DELAY);
}

// Harvest a single ready potato from the field
function harvestOneReadyPotato() {
    for (let i = 0; i < potatoField.length; i++) {
        if (potatoField[i] && potatoField[i].growthStage >= 100) {
            harvestPotatoAtIndex(i);
            break; // Only harvest one potato
        }
    }
}

// Initialize the tech tree with correct costs
function initializeTechTree() {
    createTechTree();
    updateTechTree(); // Ensure initial costs are set correctly
}

// Set up event listeners and initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTechTree();

    const techTree = document.getElementById('tech-tree');
    const leftArrow = document.getElementById('tech-tree-left');
    const rightArrow = document.getElementById('tech-tree-right');

    const updateArrows = () => {
        leftArrow.style.display = techTree.scrollLeft > 0 ? 'block' : 'none';
        rightArrow.style.display = techTree.scrollWidth > techTree.clientWidth + techTree.scrollLeft ? 'block' : 'none';
    };

    leftArrow.addEventListener('click', () => {
        techTree.scrollBy({ left: -200, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        techTree.scrollBy({ left: 200, behavior: 'smooth' });
    });

    techTree.addEventListener('scroll', updateArrows);
    window.addEventListener('resize', updateArrows);

    updateArrows(); // Initial check

    const iceMeltingContainer = document.getElementById('ice-melting-container');
    if (iceMeltingContainer) {
        iceMeltingContainer.style.display = 'none'; // Hide by default
    }

    const subsurfaceAquiferTapperContainer = document.getElementById('subsurface-aquifer-tapper-container');
    if (subsurfaceAquiferTapperContainer) {
        subsurfaceAquiferTapperContainer.style.display = 'none'; // Hide by default
    }

    const subsurfaceAquiferTapperToggle = document.getElementById('subsurface-aquifer-tapper-toggle');
    if (subsurfaceAquiferTapperToggle) {
        subsurfaceAquiferTapperToggle.addEventListener('change', toggleSubsurfaceAquiferTapper);
    }

    const bucketWheelExcavatorToggle = document.getElementById('bucket-wheel-excavator-toggle');
    if (bucketWheelExcavatorToggle) {
        bucketWheelExcavatorToggle.addEventListener('change', toggleBucketWheelExcavator);
    }

    initializeActionCards();
});

// Unlock the manual ice melting feature
function unlockManualIceMelting() {
    isManualIceMeltingUnlocked = true;
    const iceMeltingContainer = document.getElementById('ice-melting-container');
    if (iceMeltingContainer) {
        iceMeltingContainer.style.display = 'block';
    }
}

// Queue an achievement for display
function queueAchievement(title, message, metaMessage = '', imageName = '') {
    achievementQueue.push({ title, message, metaMessage, imageName });
    if (!isAchievementModalOpen) {
        showNextAchievement();
    }
}

// Display the next queued achievement
function showNextAchievement() {
    if (achievementQueue.length === 0) {
        isAchievementModalOpen = false;
        resumeGame();
        return;
    }

    isAchievementModalOpen = true;
    pauseGame();

    const achievement = achievementQueue.shift();
    const modal = document.createElement('div');
    modal.className = 'achievement-modal';

    let imageHtml = '';
    if (achievement.title.startsWith('Technology Unlocked:')) {
        const upgradeName = achievement.title.replace('Technology Unlocked: ', '');
        const upgrade = upgrades.find(u => u.name === upgradeName);
        if (upgrade) {
            const imageName = upgrade.assetName || (upgrade.name.replace(/\s+/g, '_').toLowerCase() + '.webp');
            imageHtml = `<img src="images/${imageName}" alt="${upgradeName}" onerror="this.onerror=null;this.parentNode.innerHTML='${upgrade.icon}';">`;
        }
    } else if (achievement.imageName) {
        if (achievement.imageName.startsWith('🥔')) {
            // If the imageName is the potato emoji, display it directly
            imageHtml = `<span style="font-size: 80px;">${achievement.imageName}</span>`;
        } else {
            // Otherwise, treat it as an image file
            imageHtml = `<img src="images/${achievement.imageName}" alt="${achievement.title}" onerror="this.onerror=null;this.parentNode.innerHTML='🏆';">`;
        }
    }

    modal.innerHTML = `
        <div class="achievement-content">
            <h2>${achievement.title}</h2>
            <div class="achievement-body">
                <div class="achievement-image">
                    ${imageHtml}
                </div>
                <div class="achievement-text">
                    <p>${achievement.message}</p>
                </div>
            </div>
            ${achievement.metaMessage ? `<p class="meta-message">${achievement.metaMessage}</p>` : ''}
            <button id="continue-button">Continue</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('continue-button').addEventListener('click', () => {
        document.body.removeChild(modal);
        showNextAchievement();
    });
}

// Pause the game
function pauseGame() {
    // Implement game pausing logic here
    // For example, stop all intervals, disable buttons, etc.
    clearInterval(window.autonomousExplorationInterval);
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);
}

// Resume the game
function resumeGame() {
    // Implement game resuming logic here
    // For example, restart all intervals, enable buttons, etc.
    updateAutonomousExploration();
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.disabled = false);
}

// Unlock the Subsurface Aquifer Tapper
function unlockSubsurfaceAquiferTapper() {
    isSubsurfaceAquiferTapperUnlocked = true;
    const tapperContainer = document.getElementById('subsurface-aquifer-tapper-container');
    if (tapperContainer) {
        tapperContainer.style.display = 'block';
    }
}

// Toggle the Subsurface Aquifer Tapper
function toggleSubsurfaceAquiferTapper() {
    if (!isSubsurfaceAquiferTapperUnlocked) return;

    isSubsurfaceAquiferTapperActive = !isSubsurfaceAquiferTapperActive;
    const toggleSwitch = document.getElementById('subsurface-aquifer-tapper-toggle');
    if (toggleSwitch) {
        toggleSwitch.checked = isSubsurfaceAquiferTapperActive;
    }

    if (isSubsurfaceAquiferTapperActive) {
        startSubsurfaceAquiferTapper();
    } else {
        stopSubsurfaceAquiferTapper();
    }
}

// Start the Subsurface Aquifer Tapper
function startSubsurfaceAquiferTapper() {
    subsurfaceAquiferTapperInterval = setInterval(() => {
        if (potatoCount >= 1) {
            potatoCount -= 1;
            water += 2;
            updateDisplay();
        } else {
            showToast("Resource Shortage", "Not enough potatoes to run the Subsurface Aquifer Tapper!", 'setback');
            toggleSubsurfaceAquiferTapper(); // Turn off if resources are insufficient
        }
    }, 1000); // Run every second
}

// Stop the Subsurface Aquifer Tapper
function stopSubsurfaceAquiferTapper() {
    clearInterval(subsurfaceAquiferTapperInterval);
}

// Unlock the Bucket-Wheel Excavator
function unlockBucketWheelExcavator() {
    isBucketWheelExcavatorUnlocked = true;
    const excavatorContainer = document.getElementById('bucket-wheel-excavator-container');
    if (excavatorContainer) {
        excavatorContainer.style.display = 'block';
    }
}

// Toggle the Bucket-Wheel Excavator
function toggleBucketWheelExcavator() {
    if (!isBucketWheelExcavatorUnlocked) return;

    isBucketWheelExcavatorActive = !isBucketWheelExcavatorActive;
    const toggleSwitch = document.getElementById('bucket-wheel-excavator-toggle');
    if (toggleSwitch) {
        toggleSwitch.checked = isBucketWheelExcavatorActive;
    }

    if (isBucketWheelExcavatorActive) {
        startBucketWheelExcavator();
    } else {
        stopBucketWheelExcavator();
    }
}

// Start the Bucket-Wheel Excavator
function startBucketWheelExcavator() {
    bucketWheelExcavatorInterval = setInterval(() => {
        if (potatoCount >= 1) {
            potatoCount -= 1;
            nutrients += 2;
            ice += 2;
            updateDisplay();
        } else {
            showToast("Resource Shortage", "Not enough potatoes to run the Martian Bucket-Wheel Excavator!", 'setback');
            toggleBucketWheelExcavator(); // Turn off if resources are insufficient
        }
    }, 1000); // Run every second
}

// Stop the Bucket-Wheel Excavator
function stopBucketWheelExcavator() {
    clearInterval(bucketWheelExcavatorInterval);
}

function initializeActionCards() {
    const clickableCards = document.querySelectorAll('.action-card.clickable');
    clickableCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!card.hasAttribute('disabled')) {
                const actionName = card.id.replace('-container', '');
                handleActionCardClick(actionName);
            }
        });
    });
}

function handleActionCardClick(actionName) {
    switch (actionName) {
        case 'exploration':
            exploreMarsSurface();
            break;
        case 'ice-melting':
            meltIce();
            break;
        // Add more cases for future clickable action cards
        default:
            console.warn(`No handler for action card: ${actionName}`);
    }
}