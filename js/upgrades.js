// This file implements the upgrade system for the Martian Potato game
// It defines available upgrades, manages the tech tree UI, and handles upgrade purchases

// Game Constants
const TECH_TREE_UPDATE_INTERVAL = 1000; // Update every second
const BASE_HARVEST_DELAY = 1000; // 1 second in milliseconds

// Upgrade System Variables
let currentPlantingUpgrade = 0;
let lastTechTreeUpdate = 0;
let unlockedActionCards = [];
let currentTier = 1; // Initialize current tier to 1

// Add this near the top of the file
let growthUpgradesApplied = {
    potatoCompost: false,
    genomeModification: false,
    soilBacteria: false,
    gravitropismAccelerator: false
};

// Near the top of the file, after variable declarations
console.log('Initial unlockedActionCards:', unlockedActionCards);


// Automation Arrays
let autoplanters = [];
let autoHarvesters = [];

// Achievement System Variables
let achievementQueue = [];
let isAchievementModalOpen = false;

// Upgrade Definitions
const upgrades = [
    { 
        name: "Hand Trowel", 
        cost: 1,
        effect: function() { 
            plantingDelay = Math.max(2500, plantingDelay - 500); 
        },
        icon: "🖐️",
        description: "Reduces planting time by 0.5 seconds.",
        metaMessage: "Manual labor. The game begins with the simplest form of interaction, making future efficiencies feel like significant advancements.",
        weight: 1,
        category: "planting",
        tier: 1,
        count: 0, // Initialize count
        repeatable: false // Specify if the upgrade is repeatable
    },
    { 
        name: "Manual Ice Melting", 
        cost: 3,
        effect: () => { 
            console.log("Manual Ice Melting upgrade purchased");
            unlockManualIceMelting(); // Call the function from game.js
        },
        icon: "🧊",
        description: "Collect water by manually melting Martian ice, 1 unit per 5 clicks.",
        metaMessage: "The grind begins. By starting with a low-yield, high-effort method, the game establishes a baseline against which all future upgrades will feel like progress, even if they simply shift the type of effort required.",
        assetName: "manual_ice_melting.webp",
        weight: 2,
        category: "harvesting",
        tier: 1,
        count: 0,
        repeatable: false,
        actionCardId: 'ice-melting-container' // Added property
    },
    { 
        name: "Watering Can", 
        cost: 5,
        effect: function() { 
            plantingDelay = Math.max(2000, plantingDelay - 500); 
        },
        icon: "🚿",
        description: "Further reduces planting time by 0.5 seconds.",
        metaMessage: "Integrating water delivery. This upgrade speeds up the planting process, giving you a sense of progress while subtly introducing the concept of resource management.",
        weight: 2,
        category: "planting",
        tier: 1,
        count: 0,
        repeatable: false
    },
    { 
        name: "Automated Planter", 
        cost: 25,
        effect: () => { addAutoplanter(); }, 
        icon: "🤖",
        description: "Automatically plants potatoes, reducing manual labor.",
        metaMessage: "Automation's allure. This upgrade significantly reduces active playtime, giving you a sense of progress and control, while quietly introducing a new constraint: power.",
        weight: 4,
        category: "planting",
        tier: 1,
        count: 0,
        repeatable: true
    },
    { 
        name: "Auto Harvester", 
        cost: 50,
        effect: () => { addAutoHarvester(); }, 
        icon: "🤖",
        description: "Automatically harvests mature potatoes.",
        metaMessage: "Your first step towards full automation. The game is reducing your direct involvement, shifting your focus to management and strategy.",
        weight: 5,
        category: "harvesting",
        tier: 1,
        count: 0,
        repeatable: true
    },
    { 
        name: "Quantum Spud Spawner", 
        cost: 1000000, // Define an appropriate cost
        effect: function() { 
            unlockQuantumSpudSpawner(); 
        },
        icon: "⚛️",
        description: "Automatically plants and harvests potatoes across all field slots instantly.",
        metaMessage: "Harness quantum mechanics to revolutionize potato farming on Mars.",
        weight: 20,
        category: "automation",
        tier: 5,
        count: 0,
        repeatable: false,
        actionCardId: 'quantum-spud-spawner-container' // Added property for UI integration
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
        tier: 1,
        count: 0,
        repeatable: false
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
        tier: 1,
        count: 0,
        repeatable: false
    },
    { 
        name: "Jetpack", 
        cost: 200, 
        effect: () => { 
            window.exploreDelay = Math.max(1000, Math.floor(window.exploreDelay * 0.5));
            updateExploreButton();
        },
        icon: "🚀",
        description: "Halves the exploration cooldown time.",
        metaMessage: "Technological leaps. This upgrade represents a significant advancement, showing how larger investments can lead to more substantial improvements.",
        weight: 6,
        category: "exploration",
        tier: 2,
        count: 0,
        repeatable: false
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
        tier: 2,
        count: 0,
        repeatable: false
    },
    { 
        name: "Martian Bucket-Wheel Excavator", 
        cost: 750,
        effect: () => {
            console.log('Executing Bucket Wheel Excavator effect');
            unlockBucketWheelExcavator();
            isBucketWheelExcavatorUnlocked = true;
        },
        icon: "⛏️",
        description: "A massive mobile strip-mining machine that consumes 1 potato per second to generate 2 nutrients and 2 ice.",
        metaMessage: "Industrial-scale operations. This upgrade showcases how large-scale machinery can dramatically increase resource gathering efficiency, shifting the game's scale.",
        assetName: "bucket_wheel_excavator.webp",
        weight: 12,
        category: "exploration",
        tier: 3,
        count: 0,
        repeatable: false,
        actionCardId: 'bucket-wheel-excavator-container' // Added property
    },
    { 
        name: "Subterranean Tuber Tunneler",
        cost: 2500,
        effect: () => {
            console.log('Executing Subterranean Tuber Tunneler effect');
            unlockSubterraneanTuberTunneler();
            isSubterraneanTuberTunnelerUnlocked = true;
        },
        icon: "🕳️",
        description: "Burrows beneath the Martian surface, uncovering hidden resource deposits.",
        metaMessage: "Digging deeper. This upgrade shows how exploring new frontiers (in this case, underground) can lead to significant resource gains, encouraging players to think beyond the obvious.",
        weight: 13,
        category: "exploration",
        tier: 3,
        count: 0,
        repeatable: false,
        actionCardId: 'subterranean-tuber-tunneler-container' // Added property
    },
    { 
        name: "Martian Potato Colonizer", 
        cost: 50000,
        effect: () => {
            unlockMartianPotatoColonizer();
        },
        icon: "🚀",
        description: "Deploys potato colonies across Mars, harvesting exponentially increasing resources over time.",
        metaMessage: "Full automation and colonization. You've transformed Mars into a thriving potato planet.",
        weight: 16,
        category: "exploration",
        tier: 4,
        count: 0,
        repeatable: false,
        actionCardId: 'martian-potato-colonizer-container' // Added property
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
        weight: 10, // Changed from 5 to 10
        category: "exploration",
        tier: 1,
        count: 0,
        repeatable: false
    },
    {
        name: "Subsurface Aquifer Tapper",
        cost: 250,
        effect: () => {
            console.log('Executing Subsurface Aquifer Tapper effect');
            unlockSubsurfaceAquiferTapper();
            isSubsurfaceAquiferTapperUnlocked = true; 
        },
        icon: "💧",
        description: "Accesses underground water reserves. Consumes 1 potato per second to produce 2 water per second when active.",
        metaMessage: "Automated resource conversion. This upgrade introduces the concept of continuous resource transformation, requiring players to balance potato production and water generation.",
        weight: 6,
        category: "exploration",
        tier: 2,
        count: 0,
        repeatable: false,
        actionCardId: 'subsurface-aquifer-tapper-container' // Added property
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
        tier: 3,
        count: 0,
        repeatable: false,
        actionCardId: 'polar-cap-mining-container' // Added property
    },
    {
        name: "Cometary Ice Harvester",
        cost: 5000,
        effect: () => { 
            unlockCometaryIceHarvester();
        },
        icon: "☄️",
        description: "Harnesses passing comets to harvest ice, providing 10 units of water every 10 seconds.",
        metaMessage: "Celestial opportunities. This upgrade highlights the vast potential of space, encouraging players to look beyond their immediate surroundings and harness cosmic resources.",
        weight: 14,
        category: "exploration",
        tier: 3,
        count: 0,
        repeatable: false,
        actionCardId: 'cometary-ice-harvester-container' // Added property
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
        tier: 1,
        count: 0,
        repeatable: false,
        actionCardId: 'ice-melting-basin-container' // Added property
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
        tier: 3,
        count: 0,
        repeatable: false,
        actionCardId: 'nuclear-ice-melter-container' // Added property
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
        tier: 2,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Compost",
        cost: 50,
        effect: () => {
            if (!growthUpgradesApplied.potatoCompost) {
                growthTimeMultiplier *= 0.5;
                growthUpgradesApplied.potatoCompost = true;
                showToast("Upgrade Effect", "Potato growth time reduced by 50%!", 'achievement');
            }
        },
        icon: "🌱",
        description: "Soil enrichment with potato compost to speed up potato growth by 50%.",
        metaMessage: "",
        weight: 5,
        category: "growth",
        tier: 1,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Genome Modification",
        cost: 100, // Changed from 50 to 100
        effect: () => {
            if (!growthUpgradesApplied.genomeModification) {
                growthTimeMultiplier *= 0.5;
                growthUpgradesApplied.genomeModification = true;
                showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
            }
        },
        icon: "🧬",
        description: "Genetically modify potatoes to grow faster in Martian conditions.",
        metaMessage: "Modify potato genes for rapid growth.",
        weight: 10,
        category: "growth",
        tier: 2,
        count: 0,
        repeatable: false
    },
    {
        name: "Martian Soil Bacteria Inoculant",
        cost: 175,
        effect: () => {
            if (!growthUpgradesApplied.soilBacteria) {
                growthTimeMultiplier *= 0.5;
                growthUpgradesApplied.soilBacteria = true;
                showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
            }
        },
        icon: "🦠",
        description: "Introduce beneficial Martian soil bacteria to enhance nutrient uptake and accelerate potato growth.",
        metaMessage: "Boost nutrient uptake with specialized bacteria.",
        weight: 12,
        category: "growth",
        tier: 3,
        count: 0,
        repeatable: false
    },
    {
        name: "Gravitropism Accelerator",
        cost: 250,
        effect: () => {
            if (!growthUpgradesApplied.gravitropismAccelerator) {
                growthTimeMultiplier *= 0.5;
                growthUpgradesApplied.gravitropismAccelerator = true;
                showToast("Upgrade Effect", "Potato growth time reduced by an additional 50%!", 'achievement');
            }
        },
        icon: "🌍",
        description: "Manipulate the gravity sensing mechanisms in potato roots to accelerate growth in Martian gravity.",
        metaMessage: "Harness gravity to speed up potato growth.",
        weight: 15,
        category: "growth",
        tier: 3,
        count: 0,
        repeatable: false
    },
    // Milestone upgrades
    {
        name: "Potato Battery",
        cost: 50,
        effect: () => { 
            // Existing effect code
            unlockNextTier(); // Function to unlock the next tier
        },
        unlocksNextTier: true,
        icon: "🔋",
        description: "Generates electricity from potatoes.",
        metaMessage: "The irony of power from food...",
        weight: 6,
        category: "energy",
        tier: 1,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Computer Chip",
        cost: 500,
        effect: () => {
            unlockNextTier(); // Unlock tier 3
        },
        unlocksNextTier: true,
        icon: "💻",
        description: "Create basic computing circuits using potato-based components.",
        metaMessage: "From food to thought...",
        weight: 11,
        category: "technology",
        tier: 2,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Computer",
        cost: 2000,
        effect: () => {
            unlockNextTier(); // Unlock tier 4
        },
        unlocksNextTier: true,
        icon: "🖥️",
        description: "Assemble a functional computer using potato-based components.",
        metaMessage: "The rise of tuber technology.",
        weight: 16,
        category: "technology",
        tier: 3,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Quantum Computer",
        cost: 10000,
        effect: () => {
            unlockNextTier(); // Unlock tier 5
        },
        unlocksNextTier: true,
        icon: "🔬",
        description: "Harness quantum properties of specially grown potatoes for advanced computing.",
        metaMessage: "Quantum supremacy, potato style.",
        weight: 21,
        category: "technology",
        tier: 4,
        count: 0,
        repeatable: false
    },
    {
        name: "Potato Sentience",
        cost: 1000000,
        effect: () => {
            // Add sentience effect here
        },
        unlocksNextTier: true,
        icon: "🧠",
        description: "Achieve the unthinkable: sentient potatoes.",
        metaMessage: "We were so preoccupied with whether we could, we didn't stop to think if we should.",
        weight: 25,
        category: "technology",
        tier: 5,
        count: 0,
        repeatable: false
    }
];

function unlockNextTier(fromLoad = false) {
    if (currentTier < MAX_TIER) {
        currentTier += 1;
        if (!fromLoad) {
            showToast("New Technology Tier Unlocked!", `Tier ${currentTier} technologies are now available.`, 'upgrade');
            updateTechTree();
        }
    }
}

// Helper function to generate a standardized card ID based on the upgrade name
function getCardId(upgradeName) {
    return `upgrade-${upgradeName.replace(/\s+/g, '-').toLowerCase()}`;
}

// Update the tech tree UI, throttled to run at most once per second
function updateTechTree() {
    const currentTime = Date.now();
    if (currentTime - lastTechTreeUpdate < TECH_TREE_UPDATE_INTERVAL) {
        return; // Exit if not enough time has passed since the last update
    }
    lastTechTreeUpdate = currentTime;

    const techTree = document.getElementById('tech-tree');
    const existingCards = new Set(Array.from(techTree.children).map(card => card.id));

    upgrades.forEach((upgrade) => {
        let shouldDisplayCard = false;
        if (upgrade.tier <= currentTier) {
            if (upgrade.repeatable || upgrade.count === 0) { // Display if repeatable or not yet purchased
                shouldDisplayCard = true;
            }
        }

        const cardId = getCardId(upgrade.name); // Use helper function

        if (shouldDisplayCard) {
            if (!existingCards.has(cardId)) {
                techTree.appendChild(createCard(upgrade));
                existingCards.add(cardId);
            } else {
                const card = document.getElementById(cardId);
                const upgradeCost = getUpgradeCost(upgrade);
                const isPurchasable = (upgrade.repeatable ? (potatoCount >= upgradeCost) : (potatoCount >= upgradeCost && upgrade.count === 0));

                // Update purchasability and cost display
                card.classList.toggle('purchasable', isPurchasable);
                const costElement = card.querySelector('.tech-card-cost');
                if (costElement) {
                    costElement.textContent = `Cost: ${upgradeCost} potatoes`;
                }
            }
        } else if (existingCards.has(cardId)) {
            const card = document.getElementById(cardId);
            if (card) {
                techTree.removeChild(card);
                existingCards.delete(cardId);
            }
        }
    });

    // After updating the tech tree, update the arrow visibility
    updateCarouselArrows();
}

// Function to update the visibility of carousel arrows
function updateCarouselArrows() {
    const techTreeContainer = document.getElementById('tech-tree');
    const leftArrow = document.getElementById('tech-tree-left');
    const rightArrow = document.getElementById('tech-tree-right');

    // Check if scrolling to the left is possible
    if (techTreeContainer.scrollLeft > 0) {
        leftArrow.style.display = 'block';
    } else {
        leftArrow.style.display = 'none';
    }

    // Check if scrolling to the right is possible
    if (techTreeContainer.scrollWidth - techTreeContainer.clientWidth - techTreeContainer.scrollLeft > 0) {
        rightArrow.style.display = 'block';
    } else {
        rightArrow.style.display = 'none';
    }
}


// Also, call updateCarouselArrows when the window is resized or when the tech tree is scrolled
window.addEventListener('resize', updateCarouselArrows);
document.getElementById('tech-tree').addEventListener('scroll', updateCarouselArrows);

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

    upgrades.forEach((upgrade) => {
        let shouldDisplayCard = false;
        if (upgrade.tier <= currentTier) {
            if (upgrade.repeatable || upgrade.count === 0) { // Display if repeatable or not yet purchased
                shouldDisplayCard = true;
            }
        }

        if (shouldDisplayCard) {
            const card = createCard(upgrade);
            techTree.appendChild(card);
        }
    });
}

// Create a single tech card for the given upgrade
function createCard(upgrade) {
    const card = document.createElement('div');
    const cardId = getCardId(upgrade.name); // Use helper function
    card.id = cardId; // Assign unique ID to prevent duplicates
    card.className = 'tech-card';
    card.dataset.upgradeName = upgrade.name;
    card.dataset.weight = upgrade.weight;
    card.dataset.tier = upgrade.tier; // Add tier data attribute

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

    // Fallback content
    iconElement.textContent = upgrade.icon; 

    const detailsElement = document.createElement('div');
    detailsElement.className = 'tech-card-details';
    detailsElement.innerHTML = `
        <h3 class="tech-card-name" title="${upgrade.name}">${upgrade.name}</h3>
        <p class="tech-card-cost">Cost: ${getUpgradeCost(upgrade)} potatoes</p>
    `;

    // Add the details button if the upgrade's tier is less than or equal to the current tier
    if (upgrade.tier <= currentTier) {
        const detailsButton = document.createElement('button');
        detailsButton.className = 'details-button';
        detailsButton.textContent = 'Details';
        detailsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent card click event
            showUpgradeModal(upgrade);
        });
        detailsElement.appendChild(detailsButton);
    } else {
        // For upgrades in higher tiers, you can optionally display a lock icon or message
        const lockedMessage = document.createElement('div');
        lockedMessage.className = 'locked-message';
        lockedMessage.textContent = 'Locked';
        detailsElement.appendChild(lockedMessage);
    }

    card.appendChild(iconElement);
    card.appendChild(detailsElement);

    // Click event listener to open the upgrade modal
    if (upgrade.tier <= currentTier) {
        card.addEventListener('click', () => {
            showUpgradeModal(upgrade);
        });
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
    const existingModal = document.querySelector('.upgrade-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal upgrade-modal'; // Assign both classes
    
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
        if (upgrade.effect) {
            console.log(`Applying effect for upgrade: ${upgrade.name}`);
            upgrade.effect();
        }
        upgrade.count++;
        console.log(`Upgrade ${upgrade.name} count: ${upgrade.count}`);
        updateDisplay();

        // Add this block
        if (!upgrade.repeatable) {
            upgrade.purchased = true;
            console.log(`Marked upgrade ${upgrade.name} as purchased`);
        }

        const techCard = document.getElementById(getCardId(upgrade.name));
        if (techCard) {
            if (!upgrade.repeatable && upgrade.count >= 1) {
                techCard.remove();
            } else if (upgrade.repeatable) {
                const costElement = techCard.querySelector('.tech-card-cost');
                if (costElement) {
                    costElement.textContent = `Cost: ${getUpgradeCost(upgrade)} potatoes`;
                }
            }
        }

        showToast("Upgrade Unlocked", `You have unlocked the ${upgrade.name} upgrade!`, 'achievement');

        // Unlock the corresponding action card if applicable
        unlockActionCardForUpgrade(upgrade.name);

        // Save the game after purchasing an upgrade
        saveGame();

        // Update the tech tree to reflect changes
        updateTechTree();
    } else {
        showToast("Not Enough Potatoes", "You don't have enough potatoes to purchase this upgrade.", 'setback');
    }
}

function unlockQuantumSpudSpawner() {
    console.log("Unlocking Quantum Spud Spawner");
    isQuantumSpudSpawnerUnlocked = true;
    const spawnerContainer = document.getElementById('quantum-spud-spawner-container');
    if (spawnerContainer) {
        spawnerContainer.style.display = 'block';
        console.log("Quantum Spud Spawner container displayed");
    } else {
        console.warn("Quantum Spud Spawner container not found in the DOM");
    }
    
    // Add the Quantum Spud Spawner to the unlockedActionCards array
    if (!unlockedActionCards.includes('quantum-spud-spawner-container')) {
        unlockedActionCards.push('quantum-spud-spawner-container');
        console.log("Added Quantum Spud Spawner to unlockedActionCards");
    }
    
    showToast("New Technology Unlocked", "You've unlocked the Quantum Spud Spawner!", 'upgrade');
    
    // Update the game state or UI as needed
    updateActionCards();
    updateDisplay();
}

// Add a new autoplanter to the game
function addAutoplanter() {
    const autoplanter = {
        interval: null,
        cost: Math.floor(20 * Math.pow(1.15, upgrades.find(u => u.name === "Automated Planter").count))
    };
    autoplanters.push(autoplanter);
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

    leftArrow.addEventListener('click', () => {
        techTree.scrollBy({ left: -200, behavior: 'smooth' });
    });

    rightArrow.addEventListener('click', () => {
        techTree.scrollBy({ left: 200, behavior: 'smooth' });
    });

    // Use the existing updateCarouselArrows function
    techTree.addEventListener('scroll', updateCarouselArrows);
    window.addEventListener('resize', updateCarouselArrows);

    updateCarouselArrows(); // Initial check

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

// ==========================================
//            MANUAL ACTION FUNCTIONS
// ==========================================


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


// ==========================================
//            AUTOMATION FUNCTIONS
// ==========================================

// General function to manage automation devices
function createAutomationDevice(deviceConfig) {
    const { 
        id, 
        containerId, 
        toggleId, 
        isUnlocked, 
        isActive, 
        unlockFunction, 
        startFunction, 
        stopFunction, 
        resourceCheck, 
        resourceConsume, 
        resourceProduce, 
        intervalTime 
    } = deviceConfig;

    // Unlock the device
    window[unlockFunction] = function() {
        window[isUnlocked] = true;
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'block';
        }
    };

    // Toggle the device
    window[`toggle${id}`] = function() {
        // Prevent toggling on if resources are depleted
        if (!window[isUnlocked] || areResourcesDepleted) return;

        window[isActive] = !window[isActive];
        const toggleSwitch = document.getElementById(toggleId);
        if (toggleSwitch) {
            toggleSwitch.checked = window[isActive];
        }

        if (window[isActive]) {
            window[startFunction]();
        } else {
            window[stopFunction]();
        }
    };

    // Start the device
    window[startFunction] = function() {
        if (areResourcesDepleted) {
            window[isActive] = false;
            const toggleSwitch = document.getElementById(toggleId);
            if (toggleSwitch) {
                toggleSwitch.checked = false;
            }
            updateDepletedActionCard(containerId, true, "Resources Depleted");
            return;
        }

        window[`${id}Interval`] = setInterval(() => {
            if (resourceCheck()) {  // Use the resourceCheck function here
                resourceConsume();
                resourceProduce();
                updateDisplay();
            } else {
                // Don't automatically toggle off, just skip this cycle
                console.log(`Skipping ${id} cycle due to insufficient resources`);
            }
        }, intervalTime);
    };

    // Stop the device
    window[stopFunction] = function() {
        clearInterval(window[`${id}Interval`]);
        window[`${id}Interval`] = null; // Ensure the interval is cleared
        window[isActive] = false;
        const toggleSwitch = document.getElementById(toggleId);
        if (toggleSwitch) {
            toggleSwitch.checked = false;
        }
    };
}

// Configuration for Subsurface Aquifer Tapper
createAutomationDevice({
    id: 'SubsurfaceAquiferTapper',
    containerId: 'subsurface-aquifer-tapper-container',
    toggleId: 'subsurface-aquifer-tapper-toggle',
    isUnlocked: 'isSubsurfaceAquiferTapperUnlocked',
    isActive: 'isSubsurfaceAquiferTapperActive',
    unlockFunction: 'unlockSubsurfaceAquiferTapper',
    startFunction: 'startSubsurfaceAquiferTapper',
    stopFunction: 'stopSubsurfaceAquiferTapper',
    resourceCheck: () => potatoCount >= 1,
    resourceConsume: () => { potatoCount -= 1; },
    resourceProduce: () => { water += 2; },
    intervalTime: 1000
});

// Configuration for Bucket-Wheel Excavator
createAutomationDevice({
    id: 'BucketWheelExcavator',
    containerId: 'bucket-wheel-excavator-container',
    toggleId: 'bucket-wheel-excavator-toggle',
    isUnlocked: 'isBucketWheelExcavatorUnlocked',
    isActive: 'isBucketWheelExcavatorActive',
    unlockFunction: 'unlockBucketWheelExcavator',
    startFunction: 'startBucketWheelExcavator',
    stopFunction: 'stopBucketWheelExcavator',
    resourceCheck: () => potatoCount >= 1,
    resourceConsume: () => { potatoCount -= 1; },
    resourceProduce: () => { nutrients += 2; ice += 2; },
    intervalTime: 1000
});

// Configuration for Subterranean Tuber Tunneler
createAutomationDevice({
    id: 'SubterraneanTuberTunneler',
    containerId: 'subterranean-tuber-tunneler-container',
    toggleId: 'subterranean-tuber-tunneler-toggle',
    isUnlocked: 'isSubterraneanTuberTunnelerUnlocked',
    isActive: 'isSubterraneanTuberTunnelerActive',
    unlockFunction: 'unlockSubterraneanTuberTunneler',
    startFunction: 'startSubterraneanTuberTunneler',
    stopFunction: 'stopSubterraneanTuberTunneler',
    resourceCheck: () => window.isSubterraneanTuberTunnelerActive && potatoCount >= 2,
    resourceConsume: () => { potatoCount -= 2; },
    resourceProduce: () => { 
        nutrients += 1; 
        ice += 1; 
    },
    intervalTime: 2000 // Runs every 2 seconds
});

// Configuration for Cometary Ice Harvester
createAutomationDevice({
    id: 'CometaryIceHarvester',
    containerId: 'cometary-ice-harvester-container',
    toggleId: 'cometary-ice-harvester-toggle',
    isUnlocked: 'isCometaryIceHarvesterUnlocked',
    isActive: 'isCometaryIceHarvesterActive',
    unlockFunction: 'unlockCometaryIceHarvester',
    startFunction: 'startCometaryIceHarvester',
    stopFunction: 'stopCometaryIceHarvester',
    resourceCheck: () => potatoCount >= 5,
    resourceConsume: () => { potatoCount -= 5; },
    resourceProduce: () => {
        ice += 50;
        updateDisplay();
        showToast("Resources Acquired", "Cometary Ice Harvester collected 50 units of ice!", 'achievement');
    },
    intervalTime: 30000 // Runs every 30 seconds
});

// Update event listeners
document.getElementById('subsurface-aquifer-tapper-toggle').addEventListener('change', () => {
    window['toggleSubsurfaceAquiferTapper']();
});

document.getElementById('bucket-wheel-excavator-toggle').addEventListener('change', () => {
    window['toggleBucketWheelExcavator']();
});

document.getElementById('subterranean-tuber-tunneler-toggle').addEventListener('change', () => {
    window['toggleSubterraneanTuberTunneler']();
});

document.getElementById('cometary-ice-harvester-button').addEventListener('change', () => {
    toggleCometaryIceHarvester();
});


// ==========================================
//            ACTION CARD FUNCTIONS
// ==========================================

// This function handles clicks on action cards, executing the appropriate function based on the action name.
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
        console.log(`Initializing click listener for action card: ${card.id}`);
        card.addEventListener('click', () => {
            if (!card.hasAttribute('disabled')) {
                const actionName = card.id.replace('-container', '');
                handleActionCardClick(actionName);
            } else {
                console.log(`Action card ${card.id} is disabled`);
            }
        });
    });
}

// Modify the unlockActionCardForUpgrade function to include the Quantum Spud Spawner
function unlockActionCardForUpgrade(upgradeName) {
    const actionCardIdMap = {
        "Manual Ice Melting": 'ice-melting-container',
        "Ice Melting Basin": 'ice-melting-basin-container',
        "Nuclear Ice Melter": 'nuclear-ice-melter-container',
        "Cometary Ice Harvester": 'cometary-ice-harvester-container',
        "Martian Potato Colonizer": 'martian-potato-colonizer-container',
        "Quantum Spud Spawner": 'quantum-spud-spawner-container',
        // ... add new mappings here as they are created
    };

    const actionCardId = actionCardIdMap[upgradeName];
    if (actionCardId && !unlockedActionCards.includes(actionCardId)) {
        unlockedActionCards.push(actionCardId);
        const actionCard = document.getElementById(actionCardId);
        if (actionCard) {
            actionCard.style.display = 'block';
            console.log(`Unlocked action card: ${actionCardId}`);
        } else {
            console.warn(`Action card element not found: ${actionCardId}`);
        }
    }
}