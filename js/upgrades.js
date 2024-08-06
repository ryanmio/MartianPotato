// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { name: "Hand", cost: 0, effect: () => { plantingDelay = 2000; } },
        { name: "Hand Trowel", cost: 1, effect: () => { plantingDelay = 1500; } },
        { name: "Planting Stick", cost: 5, effect: () => { plantingDelay = 1000; } },
        { name: "Automated Planter", cost: 2, effect: () => { startAutomatedPlanting(); } },
        { name: "Quantum Spud Spawner", cost: 1000, effect: () => { plantingDelay = 500; } }
    ]
};

let currentPlantingUpgrade = 0;

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    if (potatoCount >= upgrade.cost) {
        potatoCount -= upgrade.cost;
        upgrade.effect();
        if (type === 'planting') {
            currentPlantingUpgrade = index;
        }
        updateDisplay();
        displayUpgrades();
        rawPotatoesPerSecond = calculatePotatoesPerSecond(); // Add this line
    }
}

function displayUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '<h2>Upgrades</h2>';

    if (currentPlantingUpgrade < upgrades.planting.length - 1) {
        const plantingUpgrade = upgrades.planting[currentPlantingUpgrade + 1];
        const plantingButton = createUpgradeButton('planting', currentPlantingUpgrade + 1, plantingUpgrade);
        upgradesContainer.appendChild(plantingButton);
    }
}

function createUpgradeButton(type, index, upgrade) {
    const button = document.createElement('button');
    button.id = `${type}-upgrade-${index}`;
    button.textContent = `Buy ${upgrade.name} (Cost: ${upgrade.cost} potatoes)`;
    button.onclick = () => buyUpgrade(type, index);
    button.disabled = potatoCount < upgrade.cost;
    return button;
}

function updateUpgradeButtons() {
    const index = currentPlantingUpgrade + 1;
    const button = document.getElementById(`planting-upgrade-${index}`);
    if (button) {
        button.disabled = potatoCount < upgrades.planting[index].cost;
    }
}

let automatedPlantingInterval;

function startAutomatedPlanting() {
    if (!automatedPlantingInterval) {
        automatedPlantingInterval = setInterval(() => {
            if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
                potatoCount += 1; // Always plant one potato at a time
                water -= 1 / waterEfficiency;
                soilNutrients -= 1 / soilEfficiency;
                oxygen -= 1 / oxygenEfficiency;
                updateDisplay();
                updateUpgradeButtons();
            }
        }, plantingDelay);
    }
}

document.addEventListener('DOMContentLoaded', displayUpgrades);