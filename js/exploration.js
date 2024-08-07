const explorationUpgrades = [
    { name: "Potato-Powered Rover", cost: 500, rate: 0.1 },
    { name: "Spudnik Satellite", cost: 2000, rate: 0.5 },
    { name: "Subterranean Tuber Tunneler", cost: 5000, rate: 1 },
    { name: "Martian Potato Colonizer", cost: 20000, rate: 2 }
];

let purchasedUpgrades = [];
let autonomousExplorationInterval = null;
let totalExplorationRate = 0;

function exploreMarsSurface() {
    const waterReward = Math.floor(Math.random() * 10) + 1;
    const soilReward = Math.floor(Math.random() * 10) + 1;
    const oxygenReward = Math.floor(Math.random() * 10) + 1;

    water += waterReward;
    soilNutrients += soilReward;
    oxygen += oxygenReward;

    updateDisplay();
    alert(`Exploration successful! You found:\nWater: ${waterReward}\nSoil Nutrients: ${soilReward}\nOxygen: ${oxygenReward}`);
    
    // 10% chance of triggering a random event
    if (Math.random() < 0.1) {
        const event = discoverRandomEvent();
        alert(event);
    }
}

function buyExplorationUpgrade(index) {
    const upgrade = explorationUpgrades[index];
    if (potatoCount >= upgrade.cost && !purchasedUpgrades.includes(upgrade)) {
        potatoCount -= upgrade.cost;
        purchasedUpgrades.push(upgrade);
        totalExplorationRate += upgrade.rate;
        updateAutonomousExploration();
        updateDisplay();
        displayExplorationUpgrades();
    }
}

function updateAutonomousExploration() {
    if (autonomousExplorationInterval) {
        clearInterval(autonomousExplorationInterval);
    }
    if (totalExplorationRate > 0) {
        autonomousExplorationInterval = setInterval(() => {
            const resourceGain = Math.floor(Math.random() * 3 * totalExplorationRate) + 1;
            const resourceType = ['water', 'soilNutrients', 'oxygen'][Math.floor(Math.random() * 3)];
            window[resourceType] += resourceGain;
            updateDisplay();
            console.log(`Autonomous exploration discovered ${resourceGain} ${resourceType}!`);
        }, 1000); // Run every second
    }
}

function displayExplorationUpgrades() {
    const container = document.getElementById('exploration-upgrades');
    container.innerHTML = '<h3>Exploration Upgrades</h3>';
    explorationUpgrades.forEach((upgrade, index) => {
        if (!purchasedUpgrades.includes(upgrade)) {
            const button = document.createElement('button');
            button.textContent = `Buy ${upgrade.name} (Cost: ${upgrade.cost} potatoes)`;
            button.onclick = () => buyExplorationUpgrade(index);
            button.disabled = potatoCount < upgrade.cost;
            container.appendChild(button);
        }
    });
}

// Initialize exploration
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    exploreButton.addEventListener('click', exploreMarsSurface);
    displayExplorationUpgrades();
});