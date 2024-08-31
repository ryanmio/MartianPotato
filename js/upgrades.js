// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { 
            name: "Hand Trowel", 
            cost: 0, 
            effect: () => { plantingDelay = 4000; },
            metaMessage: "Manual labor. The game begins with the simplest form of interaction, making future efficiencies feel like significant advancements. Notice how your patience is tested to make each upgrade feel more rewarding."
        },
        { 
            name: "Watering Can", 
            cost: 1, 
            effect: () => { plantingDelay = 3000; },
            metaMessage: "Integrating water delivery. This upgrade speeds up the planting process, giving you a sense of progress while subtly introducing the concept of resource management."
        },
        { 
            name: "Automated Planter", 
            cost: 5, 
            effect: () => { addAutoplanter(); }, 
            count: 0,
            metaMessage: "Automation's allure. This upgrade significantly reduces active playtime, giving you a sense of progress and control, while quietly introducing a new constraint: power. The game keeps you engaged by shifting your focus to resource management."
        },
        { 
            name: "Quantum Spud Spawner", 
            cost: 1000, 
            effect: () => { plantingDelay = 500; },
            metaMessage: "The ultimate efficiency. The game offers peak performance, yet at a steep resource cost. This reflects the paradox of progress: as you achieve perfection, your burden increases. What appears to be the pinnacle of advancement is, in fact, the height of your dependency."
        }
    ],
    harvesting: [
        { 
            name: "Hand", 
            cost: 0, 
            effect: () => { /* No effect for initial hand harvesting */ },
            metaMessage: "The starting point. Remember this moment of simplicity as the game grows more complex."
        },
        { 
            name: "Auto Harvester", 
            cost: 100, 
            effect: () => { addAutoHarvester(); }, 
            count: 0,
            metaMessage: "Your first step towards full automation. The game is reducing your direct involvement, shifting your focus to management and strategy."
        }
    ]
};

let currentPlantingUpgrade = 0;

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    const cost = type === 'planting' && index === 2 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    if (potatoCount >= cost) {
        potatoCount -= cost;
        upgrade.effect();
        if (type === 'planting') {
            if (index === 2) {
                upgrade.count++;
            } else if (index === 3) {
                currentPlantingUpgrade = index;
            } else {
                currentPlantingUpgrade = index;
            }
        } else if (type === 'harvesting' && index === 1) {
            upgrade.count++;
        }
        updateDisplay();
        displayUpgrades();
        rawPotatoesPerSecond = calculatePotatoesPerSecond();
        console.log("Upgrade purchased:", upgrade.name);
        console.log("New planting delay:", plantingDelay);
        if (upgrade.metaMessage) {
            console.log("Meta message:", upgrade.metaMessage);
            showToast("Upgrade Insight", upgrade.metaMessage, 'meta');
        } else {
            console.log("No meta message for this upgrade");
        }
    }
}

function displayUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '<h2>Upgrades</h2>';

    if (currentPlantingUpgrade < 2) {
        // Show the next upgrade up to Automated Planter
        const nextUpgradeIndex = currentPlantingUpgrade + 1;
        const nextUpgrade = upgrades.planting[nextUpgradeIndex];
        const upgradeButton = createUpgradeButton('planting', nextUpgradeIndex, nextUpgrade);
        upgradesContainer.appendChild(upgradeButton);
    } else if (currentPlantingUpgrade === 2) {
        // Show only the Automated Planter button if it's the current upgrade
        const autoplanterButton = createUpgradeButton('planting', 2, upgrades.planting[2]);
        upgradesContainer.appendChild(autoplanterButton);
    }

    // Show Quantum Spud Spawner if Automated Planter has been purchased
    if (upgrades.planting[2].count > 0) {
        const quantumSpudButton = createUpgradeButton('planting', 3, upgrades.planting[3]);
        upgradesContainer.appendChild(quantumSpudButton);
    }

    // Show Auto Harvester upgrade
    const autoHarvesterUpgrade = upgrades.harvesting[1];
    const autoHarvesterButton = createUpgradeButton('harvesting', 1, autoHarvesterUpgrade);
    upgradesContainer.appendChild(autoHarvesterButton);
}

function createUpgradeButton(type, index, upgrade) {
    const button = document.createElement('button');
    button.id = `${type}-upgrade-${index}`;
    const cost = type === 'planting' && index === 2 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    button.textContent = `Buy ${upgrade.name} (Cost: ${cost} potatoes)`;
    button.onclick = () => buyUpgrade(type, index);
    button.disabled = potatoCount < cost;
    return button;
}

function updateUpgradeButtons() {
    const index = currentPlantingUpgrade + 1;
    const plantingButton = document.getElementById(`planting-upgrade-${index}`);
    if (plantingButton) {
        plantingButton.disabled = potatoCount < upgrades.planting[index].cost;
    }

    const autoHarvesterButton = document.getElementById('harvesting-upgrade-1');
    if (autoHarvesterButton) {
        autoHarvesterButton.disabled = potatoCount < upgrades.harvesting[1].cost;
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

function showMetaMessage(message) {
    showToast("Upgrade Insight", message, 'meta');
}

document.addEventListener('DOMContentLoaded', () => {
    displayUpgrades();
    updateUpgradeButtons();
});