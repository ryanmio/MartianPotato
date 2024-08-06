// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { name: "Hand", cost: 0, effect: () => { plantingDelay = 2000; } },
        { name: "Hand Trowel", cost: 5, effect: () => { plantingDelay = 1500; } },
        { name: "Planting Stick", cost: 10, effect: () => { plantingDelay = 1000; } },
        { name: "Automated Planter", cost: 20, effect: () => { addAutoplanter(); }, count: 0 },
        { name: "Quantum Spud Spawner", cost: 1000, effect: () => { plantingDelay = 500; } }
    ]
};

let currentPlantingUpgrade = 0;

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    const cost = index === 3 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    if (potatoCount >= cost) {
        potatoCount -= cost;
        upgrade.effect();
        if (type === 'planting' && index !== 3) {
            currentPlantingUpgrade = index;
        }
        updateDisplay();
        displayUpgrades();
        rawPotatoesPerSecond = calculatePotatoesPerSecond();
    }
}

function displayUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '<h2>Upgrades</h2>';

    upgrades.planting.forEach((upgrade, index) => {
        if (index > currentPlantingUpgrade || (index === 3 && upgrade.count > 0)) {
            const upgradeButton = createUpgradeButton('planting', index, upgrade);
            upgradesContainer.appendChild(upgradeButton);
        }
    });
}

function createUpgradeButton(type, index, upgrade) {
    const button = document.createElement('button');
    button.id = `${type}-upgrade-${index}`;
    const cost = index === 3 ? Math.floor(upgrade.cost * Math.pow(1.15, upgrade.count)) : upgrade.cost;
    const countText = index === 3 ? ` (${upgrade.count})` : '';
    button.textContent = `Buy ${upgrade.name}${countText} (Cost: ${cost} potatoes)`;
    button.onclick = () => buyUpgrade(type, index);
    button.disabled = potatoCount < cost;
    return button;
}

function updateUpgradeButtons() {
    const index = currentPlantingUpgrade + 1;
    const button = document.getElementById(`planting-upgrade-${index}`);
    if (button) {
        button.disabled = potatoCount < upgrades.planting[index].cost;
    }
}

let autoplanters = [];

function addAutoplanter() {
    const autoplanter = {
        interval: null,
        cost: Math.floor(20 * Math.pow(1.15, upgrades.planting[3].count))
    };
    autoplanters.push(autoplanter);
    upgrades.planting[3].count++;
    startAutoplanter(autoplanter);
}

function startAutomatedPlanting() {
    autoplanters.forEach(autoplanter => {
        if (!autoplanter.interval) {
            startAutoplanter(autoplanter);
        }
    });
}

function startAutoplanter(autoplanter) {
    autoplanter.interval = setInterval(() => {
        if (consumeResources()) {
            potatoCount++;
            updateDisplay();
            updateUpgradeButtons();
        } else {
            clearInterval(autoplanter.interval);
            autoplanter.interval = null;
        }
    }, plantingDelay);
}

function checkAndRestartAutoplanters() {
    if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
        startAutomatedPlanting();
    }
}

document.addEventListener('DOMContentLoaded', displayUpgrades);