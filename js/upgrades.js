// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { 
            name: "Hand Trowel", 
            cost: 0, 
            effect: () => { plantingDelay = 4000; },
            icon: "🖐️",
            description: "The simplest tool for planting potatoes.",
            metaMessage: "Manual labor. The game begins with the simplest form of interaction, making future efficiencies feel like significant advancements."
        },
        { 
            name: "Watering Can", 
            cost: 1, 
            effect: () => { plantingDelay = 3000; },
            icon: "🚿",
            description: "Speeds up the planting process by efficiently watering the soil.",
            metaMessage: "Integrating water delivery. This upgrade speeds up the planting process, giving you a sense of progress while subtly introducing the concept of resource management."
        },
        { 
            name: "Automated Planter", 
            cost: 5, 
            effect: () => { addAutoplanter(); }, 
            count: 0,
            icon: "🤖",
            description: "Automatically plants potatoes, reducing manual labor.",
            metaMessage: "Automation's allure. This upgrade significantly reduces active playtime, giving you a sense of progress and control, while quietly introducing a new constraint: power."
        },
        { 
            name: "Quantum Spud Spawner", 
            cost: 1000, 
            effect: () => { plantingDelay = 500; },
            icon: "⚛️",
            description: "Utilizes quantum technology for near-instant potato planting.",
            metaMessage: "The ultimate efficiency. The game offers peak performance, yet at a steep resource cost. This reflects the paradox of progress: as you achieve perfection, your burden increases."
        }
    ],
    harvesting: [
        { 
            name: "Hand", 
            cost: 0, 
            effect: () => { /* No effect for initial hand harvesting */ },
            icon: "🤚",
            description: "Harvest potatoes manually.",
            metaMessage: "The starting point. Remember this moment of simplicity as the game grows more complex."
        },
        { 
            name: "Auto Harvester", 
            cost: 100, 
            effect: () => { addAutoHarvester(); }, 
            count: 0,
            icon: "🤖",
            description: "Automatically harvests mature potatoes.",
            metaMessage: "Your first step towards full automation. The game is reducing your direct involvement, shifting your focus to management and strategy."
        }
    ]
};

let currentPlantingUpgrade = 0;

function createTechTree() {
    const techTree = document.getElementById('tech-tree');
    techTree.innerHTML = ''; // Clear existing content

    for (const category in upgrades) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'tech-category';
        categoryDiv.innerHTML = `<h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>`;

        upgrades[category].forEach((upgrade, index) => {
            categoryDiv.appendChild(createCard(upgrade, category, index));
        });

        techTree.appendChild(categoryDiv);
    }
    
    updateTechTree(); // Call this to set initial states
}

function createCard(upgrade, type, index) {
    const card = document.createElement('div');
    card.className = 'tech-card';
    card.innerHTML = `
        <div class="tech-card-icon">${upgrade.icon}</div>
        <h3>${upgrade.name}</h3>
    `;

    card.addEventListener('click', () => showUpgradeModal(upgrade, type, index));

    return card;
}

function showUpgradeModal(upgrade, type, index) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    let content = `
        <div>
            <h2>${upgrade.name}</h2>
            <p>${upgrade.description}</p>
    `;

    if (!upgrade.purchased) {
        content += `
            <p class="tech-card-cost">Cost: ${upgrade.cost} potatoes</p>
            <button class="buy-upgrade-button">Buy Upgrade</button>
        `;
    } else {
        content += `<p class="meta-message">${upgrade.metaMessage}</p>`;
    }

    content += `</div>`;
    modal.innerHTML = content;

    if (!upgrade.purchased) {
        const buyButton = modal.querySelector('.buy-upgrade-button');
        buyButton.addEventListener('click', () => {
            buyUpgrade(type, index);
            modal.remove();
        });
    }

    modal.addEventListener('click', (event) => {
        if (event.target === modal || event.target.className === 'modal') {
            modal.remove();
        }
    });

    document.body.appendChild(modal);
}

function updateTechTree() {
    const techCards = document.querySelectorAll('.tech-card');
    const upgradeCategories = Object.keys(upgrades);
    
    techCards.forEach((card, index) => {
        const categoryIndex = Math.floor(index / upgradeCategories.length);
        const upgradeIndex = index % upgradeCategories.length;
        
        const category = upgradeCategories[categoryIndex];
        const upgrade = upgrades[category] && upgrades[category][upgradeIndex];
        
        if (upgrade && upgrade.purchased) {
            card.classList.add('purchased');
        } else {
            card.classList.remove('purchased');
        }
    });
}

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    if (!upgrade) return; // Exit if the upgrade doesn't exist

    const cost = type === 'planting' && index === 2 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    if (potatoCount >= cost) {
        potatoCount -= cost;
        upgrade.effect();
        upgrade.purchased = true;
        if (type === 'planting') {
            if (index === 2) {
                upgrade.count++;
            } else {
                currentPlantingUpgrade = Math.max(currentPlantingUpgrade, index);
            }
        } else if (type === 'harvesting' && index === 1) {
            upgrade.count++;
        }
        updateDisplay(); // Update other game elements
        updateTechTree(); // Update the tech tree display
        console.log("Upgrade purchased:", upgrade.name);
        console.log("New planting delay:", plantingDelay);
        showToast("Upgrade Purchased", `You have purchased the ${upgrade.name} upgrade!`, 'achievement');
        showToast("Meta Insight", upgrade.metaMessage, 'meta');
    } else {
        showToast("Not Enough Potatoes", "You don't have enough potatoes to purchase this upgrade.", 'setback');
    }
}

let autoplanters = [];

function addAutoplanter() {
    const autoplanter = {
        interval: null,
        cost: Math.floor(20 * Math.pow(1.15, upgrades.planting[3].count))
    };
    autoplanters.push(autoplanter);
    rawPotatoesPerSecond += 1; // Each autoplanter adds 1 potato per second
    startAutoplanter(autoplanter);
    updateDisplay();
}

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

function checkAndRestartAutoplanters() {
    autoplanters.forEach(autoplanter => {
        if (!autoplanter.interval) {
            startAutoplanter(autoplanter);
        }
    });
}

let autoHarvesters = [];
const BASE_HARVEST_DELAY = 1000; // 1 second in milliseconds

function addAutoHarvester() {
    const autoHarvester = {
        cost: Math.floor(10 * Math.pow(1.15, upgrades.harvesting[1].count))
    };
    autoHarvesters.push(autoHarvester);
    updateAutoHarvesterDelay();
    updateDisplay();
}

function updateAutoHarvesterDelay() {
    const newDelay = BASE_HARVEST_DELAY / autoHarvesters.length;
    if (autoHarvesters.length === 1) {
        startAutoHarvester(newDelay);
    } else {
        clearInterval(autoHarvestInterval);
        startAutoHarvester(newDelay);
    }
}

let autoHarvestInterval;
let lastAutoHarvestTime = 0;

function startAutoHarvester(delay) {
    clearInterval(autoHarvestInterval);
    autoHarvestInterval = setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - lastAutoHarvestTime >= delay) {
            harvestOneReadyPotato();
            lastAutoHarvestTime = currentTime;
        }
    }, 100); // Check more frequently, but only harvest based on the delay
}

function harvestOneReadyPotato() {
    for (let i = 0; i < potatoField.length; i++) {
        if (potatoField[i] && potatoField[i].growthStage >= 100) {
            harvestPotatoAtIndex(i);
            break; // Only harvest one potato
        }
    }
}

// Initialize the tech tree
document.addEventListener('DOMContentLoaded', createTechTree);