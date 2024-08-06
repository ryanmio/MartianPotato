// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = {
    planting: [
        { name: "Hand", cost: 0, effect: () => { plantingDelay = 2000; } },
        { name: "Hand Trowel", cost: 1, effect: () => { plantingDelay = 1500; } },
        { name: "Planting Stick", cost: 1, effect: () => { plantingDelay = 1000; } },
        { name: "Automated Planter", cost: 5, effect: () => { startAutomatedPlanting(); } },
        { name: "Quantum Spud Spawner", cost: 1000, effect: () => { plantingDelay = 500; } }
    ],
    harvesting: [
        { name: "Bare Hands", cost: 0, effect: () => { potatoesPerClick = 1; } },
        { name: "Potato Fork", cost: 20, effect: () => { potatoesPerClick = 2; } },
        { name: "Potato Harvester", cost: 100, effect: () => { potatoesPerClick = 5; } },
        { name: "Quantum Harvester", cost: 500, effect: () => { potatoesPerClick = 10; } }
    ]
};

let currentPlantingUpgrade = 0;
let currentHarvestingUpgrade = 0;

function buyUpgrade(type, index) {
    const upgrade = upgrades[type][index];
    if (potatoCount >= upgrade.cost) {
        potatoCount -= upgrade.cost;
        upgrade.effect();
        if (type === 'planting') {
            currentPlantingUpgrade++;
        } else if (type === 'harvesting') {
            currentHarvestingUpgrade++;
        }
        updateDisplay();
        displayUpgrades();
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

    if (currentHarvestingUpgrade < upgrades.harvesting.length - 1) {
        const harvestingUpgrade = upgrades.harvesting[currentHarvestingUpgrade + 1];
        const harvestingButton = createUpgradeButton('harvesting', currentHarvestingUpgrade + 1, harvestingUpgrade);
        upgradesContainer.appendChild(harvestingButton);
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
    ['planting', 'harvesting'].forEach(type => {
        const index = type === 'planting' ? currentPlantingUpgrade + 1 : currentHarvestingUpgrade + 1;
        const button = document.getElementById(`${type}-upgrade-${index}`);
        if (button) {
            button.disabled = potatoCount < upgrades[type][index].cost;
        }
    });
}

let automatedPlantingInterval;

function startAutomatedPlanting() {
    if (!automatedPlantingInterval) {
        automatedPlantingInterval = setInterval(() => {
            if (water >= 1 && soilNutrients >= 1 && oxygen >= 1) {
                potatoCount += potatoesPerClick;
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