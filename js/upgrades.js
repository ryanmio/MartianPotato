// Upgrade system will be implemented here
console.log("Upgrades system loaded");

// Example upgrade
const handTrowel = {
    name: "Hand Trowel",
    cost: 10,
    multiplier: 2
};

// Upgrade tree structure
const upgrades = [
    {
        name: "Hand",
        cost: 0,
        multiplier: 1
    },
    {
        name: "Hand Trowel",
        cost: 10,
        multiplier: 2
    },
    {
        name: "Automated Planter",
        cost: 50,
        multiplier: 5
    },
    {
        name: "Quantum Spud Spawner",
        cost: 200,
        multiplier: 10
    }
];

function buyUpgrade(index) {
    const upgrade = upgrades[index];
    if (potatoCount >= upgrade.cost) {
        potatoCount -= upgrade.cost;
        potatoesPerClick *= upgrade.multiplier;
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
        button.disabled = potatoCount < upgrade.cost;
        upgradesContainer.appendChild(button);
    });
}

// Initialize upgrades
document.addEventListener('DOMContentLoaded', displayUpgrades);