// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { name: "Hand", cost: 0, effect: () => { plantingDelay = 2000; } },
        { name: "Hand Trowel", cost: 1, effect: () => { plantingDelay = 1500; } },
        { name: "Planting Stick", cost: 1, effect: () => { plantingDelay = 1000; } },
        { name: "Automated Planter", cost: 1, effect: () => { addAutoplanter(); }, count: 0 },
        { name: "Quantum Spud Spawner", cost: 1000, effect: () => { plantingDelay = 500; } }
    ],
    harvesting: [
        { name: "Hand", cost: 0, effect: () => { /* No effect for initial hand harvesting */ } },
        { name: "Auto Harvester", cost: 10, effect: () => { addAutoHarvester(); }, count: 0 }
    ]
};

let currentPlantingUpgrade = 0;

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    const cost = type === 'planting' && index === 3 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    if (potatoCount >= cost) {
        potatoCount -= cost;
        upgrade.effect();
        if (type === 'planting') {
            if (index === 3) {
                upgrade.count++;
            } else {
                currentPlantingUpgrade = index;
            }
        } else if (type === 'harvesting' && index === 1) {
            upgrade.count++;
        }
        updateDisplay();
        displayUpgrades();
        rawPotatoesPerSecond = calculatePotatoesPerSecond();
    }
}

function displayUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '<h2>Upgrades</h2>';

    if (currentPlantingUpgrade < 3) {
        // Show the next upgrade up to Automated Planter
        const nextUpgradeIndex = currentPlantingUpgrade + 1;
        const nextUpgrade = upgrades.planting[nextUpgradeIndex];
        const upgradeButton = createUpgradeButton('planting', nextUpgradeIndex, nextUpgrade);
        upgradesContainer.appendChild(upgradeButton);
    } else if (currentPlantingUpgrade === 3) {
        // Show only the Automated Planter button if it's the current upgrade
        const autoplanterButton = createUpgradeButton('planting', 3, upgrades.planting[3]);
        upgradesContainer.appendChild(autoplanterButton);
    }

    // Show Quantum Spud Spawner if Automated Planter has been purchased and it's not the current upgrade
    if (upgrades.planting[3].count > 0 && currentPlantingUpgrade < 4) {
        const quantumSpudButton = createUpgradeButton('planting', 4, upgrades.planting[4]);
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
    const cost = type === 'planting' && index === 3 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
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
            
            potatoField[emptySlotIndex] = {
                plantedAt: currentTime,
                growthStage: 0,
                scaleX,
                scaleY,
                borderRadius
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

function addAutoHarvester() {
    const autoHarvester = {
        interval: null,
        cost: Math.floor(10 * Math.pow(1.15, upgrades.harvesting[1].count))
    };
    autoHarvesters.push(autoHarvester);
    startAutoHarvester(autoHarvester);
    updateDisplay();
}

function startAutoHarvester(autoHarvester) {
    autoHarvester.interval = setInterval(() => {
        potatoField.forEach((potato, index) => {
            if (potato && potato.growthStage >= 100) {
                harvestPotatoAtIndex(index);
            }
        });
    }, 2000); // Try to harvest every 2 seconds
}

document.addEventListener('DOMContentLoaded', () => {
    displayUpgrades();
    updateUpgradeButtons();
});