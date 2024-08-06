// Upgrade system will be implemented here
console.log("Upgrades system loaded");

const upgrades = [
    { name: "Hand Trowel", cost: 10, effect: () => { plantingDelay = 1500; } },
    { name: "Automated Planter", cost: 50, effect: () => { plantingDelay = 1000; } },
    { name: "Quantum Spud Spawner", cost: 200, effect: () => { plantingDelay = 500; } },
    { name: "Potato Fork", cost: 20, effect: () => { potatoesPerClick = 2; } },
    { name: "Potato Harvester", cost: 100, effect: () => { potatoesPerClick = 5; } },
    { name: "Quantum Harvester", cost: 500, effect: () => { potatoesPerClick = 10; } }
];

function buyUpgrade(index) {
    const upgrade = upgrades[index];
    if (potatoCount >= upgrade.cost) {
        potatoCount -= upgrade.cost;
        upgrade.effect();
        updateDisplay();
        updateUpgradeButtons();
    }
}

function displayUpgrades() {
    const upgradesContainer = document.getElementById('upgrades-container');
    upgradesContainer.innerHTML = '<h2>Upgrades</h2>';
    upgrades.forEach((upgrade, index) => {
        const button = document.createElement('button');
        button.id = `upgrade-${index}`;
        button.textContent = `Buy ${upgrade.name} (Cost: ${upgrade.cost} potatoes)`;
        button.onclick = () => buyUpgrade(index);
        upgradesContainer.appendChild(button);
    });
}

function updateUpgradeButtons() {
    upgrades.forEach((upgrade, index) => {
        const button = document.getElementById(`upgrade-${index}`);
        if (button) {
            button.disabled = potatoCount < upgrade.cost;
        }
    });
}

document.addEventListener('DOMContentLoaded', displayUpgrades);