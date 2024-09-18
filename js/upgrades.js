// This file implements the upgrade system for the Martian Potato game
// It defines available upgrades, manages the tech tree UI, and handles upgrade purchases

// Game Constants
const TECH_TREE_UPDATE_INTERVAL = 1000; // Update every second
const BASE_HARVEST_DELAY = 1000; // 1 second in milliseconds

// Upgrade System Variables
let currentPlantingUpgrade = 0;
let highestPurchasedWeight = 0;
let lastTechTreeUpdate = 0;
let unlockedActionCards = [];

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
        cost: 1,
        effect: () => { plantingDelay = Math.max(2500, plantingDelay - 500); },
        icon: "🖐️",
        description: "Reduces planting time by 0.5 seconds.",
        metaMessage: "Manual labor. The game begins with the simplest form of interaction, making future efficiencies feel like significant advancements.",
        weight: 1,
        category: "planting",
        tier: 1
    },
    { 
        name: "Manual Ice Melting", 
        cost: 3,
        effect: () => { 
            unlockManualIceMelting();
        },
        icon: "🧊",
        description: "Collect water by manually melting Martian ice, 1 unit per 5 clicks.",
        metaMessage: "The grind begins. By starting with a low-yield, high-effort method, the game establishes a baseline against which all future upgrades will feel like progress, even if they simply shift the type of effort required.",
        assetName: "manual_ice_melting.webp",
        weight: 2,
        category: "harvesting",
        tier: 1
    },
    { 
        name: "Watering Can", 
        cost: 5,
        effect: () => { plantingDelay = Math.max(2000, plantingDelay - 500); },
        icon: "🚿",
        description: "Further reduces planting time by 0.5 seconds.",
        metaMessage: "Integrating water delivery. This upgrade speeds up the planting process, giving you a sense of progress while subtly introducing the concept of resource management.",
        weight: 2,
        category: "planting",
        tier: 1
    },
    { 
        name: "Automated Planter", 
        cost: 25,
        effect: () => { addAutoplanter(); }, 
        count: 0,
        repeatable: true,
        icon: "🤖",
        description: "Automatically plants potatoes, reducing manual labor.",
        metaMessage: "Automation's allure. This upgrade significantly reduces active playtime, giving you a sense of progress and control, while quietly introducing a new constraint: power.",
        weight: 4,
        category: "planting",
        tier: 1
    },
    { 
        name: "Auto Harvester", 
        cost: 50,
        effect: () => { addAutoHarvester(); }, 
        count: 0,
        repeatable: true,
        icon: "🤖",
        description: "Automatically harvests mature potatoes.",
        metaMessage: "Your first step towards full automation. The game is reducing your direct involvement, shifting your focus to management and strategy.",
        weight: 5,
        category: "harvesting",
        tier: 1
    },
    { 
        name: "Quantum Spud Spawner", 
        cost: 1000000, 
        effect: () => { plantingDelay = 500; },
        icon: "⚛️",
        description: "Utilizes quantum technology for near-instant potato planting (0.5 seconds).",
        metaMessage: "The ultimate efficiency. The game offers peak performance, yet at a steep resource cost. This reflects the paradox of progress: as you achieve perfection, your burden increases.",
        weight: 20,
        category: "planting",
        tier: 4
    },
    { 
        name: "Martian Map", 
        cost: 5,
        effect: () => { 
            window.exploreDelay = Math.max(1000, window.exploreDelay - 5000);
            updateExploreButton();
        },
        icon: "🗺️",
        description: "Reduces exploration time by 5 seconds.",
        metaMessage: "Efficiency through knowledge. This upgrade demonstrates how information can lead to faster progress, subtly encouraging you to value data and exploration.",
        weight: 2,
        category: "exploration",
        tier: 1
    },
    { 
        name: "Binoculars", 
        cost: 20,
        effect: () => { 
            window.exploreDelay = Math.max(1000, window.exploreDelay - 1000);
            updateExploreButton();
        },
        icon: "🔭",
        description: "Further reduces exploration time by 1 second.",
        metaMessage: "Incremental improvements. This upgrade shows how small advancements can accumulate, encouraging continued investment in seemingly minor upgrades.",
        weight: 3,
        category: "exploration",
        tier: 1
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
        weight: 6,
        category: "exploration",
        tier: 2
    },
    { 
        name: "Spudnik Satellite", 
        cost: 300,
        effect: () => { 
            window.explorationResourceMultiplier = 1.5; 
            showToast("Upgrade Effect", "Spudnik Satellite now increases resource yields from exploration by 50%!", 'achievement');
        },
        icon: "🛰️",
        description: "Orbits Mars, providing detailed surface scans and increasing resource discovery by 50%.",
        metaMessage: "Global perspective. This upgrade demonstrates how technology can provide a broader view, leading to more efficient resource discovery and management.",
        weight: 7,
        category: "exploration",
        tier: 2
    },
    { 
        name: "Martian Bucket-Wheel Excavator", 
        cost: 750,
        effect: () => { 
            unlockBucketWheelExcavator();
        },
        icon: "⛏️",
        description: "A massive mobile strip-mining machine that consumes 1 potato per second to generate 2 nutrients and 2 ice.",
        metaMessage: "Industrial-scale operations. This upgrade showcases how large-scale machinery can dramatically increase resource gathering efficiency, shifting the game's scale.",
        assetName: "bucket_wheel_excavator.webp",
        weight: 12,
        category: "exploration",
        tier: 3
    },
    { 
        name: "Subterranean Tuber Tunneler", 
        cost: 2500,
        effect: () => { window.totalExplorationRate += 1; updateAutonomousExploration(); },
        icon: "🕳️",
        description: "Burrows beneath the Martian surface, uncovering hidden resource deposits.",
        metaMessage: "Digging deeper. This upgrade shows how exploring new frontiers (in this case, underground) can lead to significant resource gains, encouraging players to think beyond the obvious.",
        weight: 13,
        category: "exploration"
    },
    { 
        name: "Martian Potato Colonizer", 
        cost: 50000,
        effect: () => { window.totalExplorationRate += 2; updateAutonomousExploration(); },
        icon: "🏙️",
        description: "Establishes autonomous potato-growing colonies across Mars, greatly increasing resource discovery.",
        metaMessage: "Full automation. This final upgrade represents the pinnacle of your Martian potato empire, showcasing how far you've come from manual labor to planet-wide automation.",
        weight: 16,
        category: "exploration",
        tier: 4
    },
    {
        name: "Thermal Drill",
        cost: 75,
        effect: () => { 
            window.waterExplorationMultiplier = (window.waterExplorationMultiplier || 1) * 1.5;
            updateAutonomousExploration();
        },
        icon: "🔥",
        description: "A specialized drill that uses heat to extract water from ice deposits more effectively.",
        metaMessage: "Efficiency through technology. This upgrade introduces the concept of specialized tools, showing how targeted innovations can significantly boost resource gathering.",
        weight: 5,
        category: "exploration",
        tier: 1
    },
    {
        name: "Subsurface Aquifer Tapper",
        cost: 250,
        effect: () => { 
            unlockSubsurfaceAquiferTapper();
        },
        icon: "💧",
        description: "Accesses underground water reserves. Consumes 1 potato per second to produce 2 water per second when active.",
        metaMessage: "Automated resource conversion. This upgrade introduces the concept of continuous resource transformation, requiring players to balance potato production and water generation.",
        weight: 6,
        category: "exploration",
        tier: 2
    },
    {
        name: "Polar Cap Mining",
        cost: 1500,
        effect: () => { 
            unlockPolarCapMining();
        },
        icon: "🧊",
        description: "Enables mining operations at Mars' polar caps. Consumes 2 potatoes per second to produce 2 ice per second.",
        metaMessage: "Tapping into new resources. This upgrade allows you to harvest ice directly from the polar caps, introducing resource management dynamics.",
        weight: 12,
        category: "exploration",
        tier: 3
    },
    {
        name: "Cometary Ice Harvester",
        cost: 5000,
        effect: () => { 
            window.waterExplorationMultiplier = (window.waterExplorationMultiplier || 1) * 2.5;
            window.totalExplorationRate *= 1.1;
            updateAutonomousExploration();
        },
        icon: "☄️",
        description: "Occasionally intercepts and harvests passing comets for their water-rich ice, boosting both exploration and water collection.",
        metaMessage: "Thinking beyond Mars. This upgrade expands the game's scope, showing how advanced technology can turn previously unreachable resources into viable options.",
        weight: 17,
        category: "exploration",
        tier: 4
    },
    {
        name: "Ice Melting Basin",
        cost: 25,
        effect: () => { unlockIceMeltingBasin(); },
        icon: "🛁",
        description: "A large basin that can melt ice more efficiently. Consumes 8 ice to produce 1 water per second for 8 seconds.",
        metaMessage: "Batch processing. This upgrade introduces the concept of delayed gratification and resource management over time.",
        assetName: "ice_melting_basin.webp",
        weight: 4,
        category: "harvesting",
        tier: 1
    },
    {
        name: "Nuclear Ice Melter",
        cost: 1000,
        effect: () => { 
            console.log("Nuclear Ice Melter upgrade purchased");
            unlockNuclearIceMelter();
        },
        icon: "☢️",
        description: "A powerful nuclear-powered ice melter. Consumes 100 potatoes to activate, then melts 5 ice per second to produce 5 water per second.",
        metaMessage: "High-energy solution. This upgrade introduces the concept of significant initial investment for continuous high output.",
        assetName: "nuclear_ice_melter.webp",
        weight: 12,
        category: "harvesting",
        tier: 3
    },
    {
        name: "Field Expansion",
        cost: 500,
        effect: () => { 
            updateFieldSize(16);
            showToast("Upgrade Purchased", "Your potato field has been expanded to 16 plots!", 'upgrade');
        },
        icon: "🌱",
        description: "Increase your potato field from 8 to 16 plots",
        metaMessage: "Scaling up operations. This upgrade demonstrates how investment in infrastructure can lead to exponential growth potential.",
        weight: 10,
        category: "planting",
        tier: 2
    },
    {
        name: "Potato Compost",
        cost: 50,
        effect: () => {
            growthTimeMultiplier *= 0.5;
            showToast("Upgrade Effect", "Potato growth time reduced by 50%!", 'achievement');
        },
        icon: "🌱",
        description: "Soil enrichment with potato compost to speed up potato growth by 50%.",
        metaMessage: "",
        weight: 5,
        category: "growth",
        tier: 1
    },
    {
        name: "Potato Genome Modification",
        cost: 50,
        effect: () => {
            growthTimeMultiplier *= 0.5;
            showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
        },
        icon: "🧬",
        description: "Genetically modify potatoes to grow faster in Martian conditions.",
        metaMessage: "Modify potato genes for rapid growth.",
        weight: 10,
        category: "growth",
        tier: 2
    },
    {
        name: "Martian Soil Bacteria Inoculant",
        cost: 175,
        effect: () => {
            growthTimeMultiplier *= 0.5;
            showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
        },
        icon: "🦠",
        description: "Introduce beneficial Martian soil bacteria to enhance nutrient uptake and accelerate potato growth.",
        metaMessage: "Boost nutrient uptake with specialized bacteria.",
        weight: 12,
        category: "growth",
        tier: 3
    },
    {
        name: "Gravitropism Accelerator",
        cost: 250,
        effect: () => {
            growthTimeMultiplier *= 0.5;
            showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
        },
        icon: "🌍",
        description: "Manipulate the gravity sensing mechanisms in potato roots to accelerate growth in Martian gravity.",
        metaMessage: "Harness gravity to speed up potato growth.",
        weight: 15,
        category: "growth",
        tier: 3
    }
];

// Update the tech tree UI, throttled to run at most once per second
function updateTechTree() {
    const currentTime = Date.now();
    if (currentTime - lastTechTreeUpdate < TECH_TREE_UPDATE_INTERVAL) {
        return; // Exit if not enough time has passed since the last update
    }
    lastTechTreeUpdate = currentTime;

    const techTree = document.getElementById('tech-tree');
    const existingCards = new Set(Array.from(techTree.children).map(card => card.dataset.upgradeName));

    upgrades.forEach((upgrade) => {
        let shouldDisplayCard = false;
        if (upgrade.repeatable) {
            // Always display repeatable upgrades
            shouldDisplayCard = true;
        } else if (!upgrade.purchased) {
            // Display non-repeatable upgrades that haven't been purchased
            shouldDisplayCard = true;
        }

        if (shouldDisplayCard) {
            if (!existingCards.has(upgrade.name)) {
                techTree.appendChild(createCard(upgrade));
            } else {
                const card = techTree.querySelector(`.tech-card[data-upgrade-name="${upgrade.name}"]`);
                const upgradeCost = getUpgradeCost(upgrade);
                const isPurchasable = potatoCount >= upgradeCost;

                // Update purchasability and cost display
                card.classList.toggle('purchasable', isPurchasable);
                const costElement = card.querySelector('.tech-card-cost');
                if (costElement) {
                    costElement.textContent = `Cost: ${upgradeCost} potatoes`;
                }
            }
        } else if (existingCards.has(upgrade.name)) {
            const card = techTree.querySelector(`.tech-card[data-upgrade-name="${upgrade.name}"]`);
            card.remove();
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

// Update the createTechTree function
function createTechTree() {
    const techTree = document.getElementById('tech-tree');
    techTree.innerHTML = ''; // Clear existing content

    // Sort upgrades by weight
    const sortedUpgrades = upgrades.slice().sort((a, b) => a.weight - b.weight);

    sortedUpgrades.forEach((upgrade) => {
        let shouldDisplayCard = false;
        if (upgrade.repeatable) {
            // Always display repeatable upgrades
            shouldDisplayCard = true;
        } else if (!upgrade.purchased) {
            // Display non-repeatable upgrades that haven't been purchased
            shouldDisplayCard = true;
        }

        if (shouldDisplayCard) {
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

        // Show a toast notification for the purchase
        showToast("Upgrade Unlocked", `You have unlocked the ${upgrade.name} upgrade!`, 'achievement');

        // Unlock the corresponding action card if applicable
        unlockActionCardForUpgrade(upgrade.name);

        // Update action cards
        updateActionCards();

        // Remove the purchased upgrade from the tech tree if it's not repeatable
        if (!upgrade.repeatable) {
            const techCard = document.querySelector(`.tech-card[data-upgrade-name="${upgrade.name}"]`);
            if (techCard) {
                techCard.remove();
            }
        } else {
            // For repeatable upgrades, update the cost display
            const techCard = document.querySelector(`.tech-card[data-upgrade-name="${upgrade.name}"]`);
            if (techCard) {
                const costElement = techCard.querySelector('.tech-card-cost');
                if (costElement) {
                    costElement.textContent = `Cost: ${getUpgradeCost(upgrade)} potatoes`;
                }
            }
        }

        // If a weight 10 upgrade was purchased, update all cards
        if (upgrade.weight === 10) {
            updateAllCards();
        }

        saveGame(); // Save the game after purchasing an upgrade
    } else {
        showToast("Not Enough Potatoes", "You don't have enough potatoes to purchase this upgrade.", 'setback');
    }
}

// Add this new function to unlock the corresponding action card
function unlockActionCardForUpgrade(upgradeName) {
    let cardId;
    switch (upgradeName) {
        case "Manual Ice Melting":
            cardId = 'ice-melting-container';
            unlockManualIceMelting();
            break;
        case "Ice Melting Basin":
            cardId = 'ice-melting-basin-container';
            unlockIceMeltingBasin();
            break;
        case "Subsurface Aquifer Tapper":
            cardId = 'subsurface-aquifer-tapper-container';
            unlockSubsurfaceAquiferTapper();
            break;
        case "Martian Bucket-Wheel Excavator":
            cardId = 'bucket-wheel-excavator-container';
            unlockBucketWheelExcavator();
            break;
        case "Nuclear Ice Melter":
            cardId = 'nuclear-ice-melter-container';
            unlockNuclearIceMelter();
            break;
        case "Polar Cap Mining":
            cardId = 'polar-cap-mining-container';
            unlockPolarCapMining();
            break;
    }
    if (cardId && !unlockedActionCards.includes(cardId)) {
        unlockedActionCards.push(cardId);
        updateActionCards();
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

// Check and restart any stopped auto harvesters
function checkAndRestartAutoHarvesters() {
    autoHarvesters.forEach(autoHarvester => {
        if (!autoHarvester.interval) {
            startAutoHarvester(autoHarvester);
        }
    });
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

    const nuclearIceMelterToggle = document.getElementById('nuclear-ice-melter-toggle');
    if (nuclearIceMelterToggle) {
        nuclearIceMelterToggle.addEventListener('change', (event) => {
            event.stopPropagation(); // Prevent event from bubbling up
            toggleNuclearIceMelter();
        });
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

// Unlock the Ice Melting Basin
function unlockIceMeltingBasin() {
    isIceMeltingBasinUnlocked = true;
    const iceMeltingBasinContainer = document.getElementById('ice-melting-basin-container');
    if (iceMeltingBasinContainer) {
        iceMeltingBasinContainer.style.display = 'block';
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

// Add this to the handleActionCardClick function
function handleActionCardClick(actionName) {
    switch (actionName) {
        case 'exploration':
            exploreMarsSurface();
            break;
        case 'ice-melting':
            meltIce();
            break;
        case 'ice-melting-basin':
            fillIceMeltingBasin();
            break;
        case 'nuclear-ice-melter':
            toggleNuclearIceMelter();
            break;
        case 'polar-cap-mining':
            togglePolarCapMining();
            break;
        // Add more cases for future clickable action cards
        default:
            console.warn(`No handler for action card: ${actionName}`);
    }
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
        case 'ice-melting-basin':
            fillIceMeltingBasin();
            break;
        // Add more cases for future clickable action cards
        default:
            console.warn(`No handler for action card: ${actionName}`);
    }
}