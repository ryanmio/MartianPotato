// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { name: "Hand", cost: 0, effect: () => { plantingDelay = 2000; } },
        { name: "Hand Trowel", cost: 1, effect: () => { plantingDelay = 1500; } },
        { name: "Planting Stick", cost: 1, effect: () => { plantingDelay = 1000; } },
        { name: "Automated Planter", cost: 1, effect: () => { addAutoplanter(); }, count: 0 },
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

    const nextUpgradeIndex = currentPlantingUpgrade + 1;
    if (nextUpgradeIndex < upgrades.planting.length) {
        const nextUpgrade = upgrades.planting[nextUpgradeIndex];
        const upgradeButton = createUpgradeButton('planting', nextUpgradeIndex, nextUpgrade);
        upgradesContainer.appendChild(upgradeButton);
    }

    // Always show the Automated Planter if it has been purchased at least once
    if (upgrades.planting[3].count > 0) {
        const autoplanterButton = createUpgradeButton('planting', 3, upgrades.planting[3]);
        upgradesContainer.appendChild(autoplanterButton);
    }
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
    rawPotatoesPerSecond += 1; // Each autoplanter adds 1 potato per second
    startAutoplanter(autoplanter);
    updateDisplay();
}

function startAutomatedPlanting() {
    autoplanters.forEach(autoplanter => {
        if (!autoplanter.interval) {
            startAutoplanter(autoplanter);
        }
    });
}

function startAutoplanter(autoplanter) {
    let accumulatedPotatoes = 0;
    autoplanter.interval = setInterval(() => {
        if (consumeResources(0.1)) {  // Consume 0.1 resources every 100ms
            accumulatedPotatoes += 0.1;  // Add 0.1 potatoes every 100ms
            if (accumulatedPotatoes >= 1) {
                potatoCount += Math.floor(accumulatedPotatoes);
                accumulatedPotatoes %= 1;
                updateDisplay();
            }
        } else {
            clearInterval(autoplanter.interval);
            autoplanter.interval = null;
        }
    }, 100);  // Run every 100ms instead of plantingDelay
}

function checkAndRestartAutoplanters() {
    if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
        startAutomatedPlanting();
    }
}

document.addEventListener('DOMContentLoaded', displayUpgrades);