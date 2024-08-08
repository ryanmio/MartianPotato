const explorationUpgrades = [
    { name: "Martian Map", cost: 10, effect: () => { exploreDelay = 30000; } },
    { name: "Binoculars", cost: 50, effect: () => { exploreDelay = 20000; } },
    { name: "Jetpack", cost: 250, effect: () => { exploreDelay = 10000; } },
    { name: "Potato-Powered Rover", cost: 500, rate: 0.1 },
    { name: "Spudnik Satellite", cost: 2000, rate: 0.5 },
    { name: "Subterranean Tuber Tunneler", cost: 5000, rate: 1 },
    { name: "Martian Potato Colonizer", cost: 20000, rate: 2 }
];

let exploreDelay = 6000; // Initial delay of 6 seconds
let lastExploreTime = 0;
let purchasedUpgrades = [];
let autonomousExplorationInterval = null;
let totalExplorationRate = 0;

function exploreMarsSurface() {
    const currentTime = Date.now();
    if (currentTime - lastExploreTime < exploreDelay) {
        alert(`You need to wait ${((exploreDelay - (currentTime - lastExploreTime)) / 1000).toFixed(1)} seconds before exploring again.`);
        return;
    }

    const waterReward = Math.floor(Math.random() * 10) + 1;
    const soilReward = Math.floor(Math.random() * 10) + 1;
    const oxygenReward = Math.floor(Math.random() * 10) + 1;

    water += waterReward;
    soilNutrients += soilReward;
    oxygen += oxygenReward;

    lastExploreTime = currentTime;
    updateDisplay();
    alert(`Exploration successful! You found:\nWater: ${waterReward}\nSoil Nutrients: ${soilReward}\nOxygen: ${oxygenReward}`);
}

function buyExplorationUpgrade(index) {
    const upgrade = explorationUpgrades[index];
    if (potatoCount >= upgrade.cost && !purchasedUpgrades.includes(upgrade)) {
        potatoCount -= upgrade.cost;
        purchasedUpgrades.push(upgrade);
        if (upgrade.rate) {
            totalExplorationRate += upgrade.rate;
            updateAutonomousExploration();
        } else {
            upgrade.effect();
        }
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
    const nextUpgradeIndex = purchasedUpgrades.length;
    if (nextUpgradeIndex < explorationUpgrades.length) {
        const nextUpgrade = explorationUpgrades[nextUpgradeIndex];
        const button = document.createElement('button');
        button.id = 'exploration-upgrade-button';
        button.textContent = `Buy ${nextUpgrade.name} (Cost: ${nextUpgrade.cost} potatoes)`;
        button.onclick = () => buyExplorationUpgrade(nextUpgradeIndex);
        button.disabled = potatoCount < nextUpgrade.cost;
        container.appendChild(button);
    }
}

function updateExplorationUpgradeButton() {
    const container = document.getElementById('exploration-upgrades');
    const button = container.querySelector('button');
    if (button) {
        const nextUpgradeIndex = purchasedUpgrades.length;
        const nextUpgrade = explorationUpgrades[nextUpgradeIndex];
        button.disabled = potatoCount < nextUpgrade.cost;
    }
}

// Initialize exploration
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    exploreButton.addEventListener('click', exploreMarsSurface);
    displayExplorationUpgrades();
});