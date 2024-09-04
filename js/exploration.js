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
        showToast("Exploration Cooldown", `You need to wait ${((exploreDelay - (currentTime - lastExploreTime)) / 1000).toFixed(1)} seconds before exploring again.`, 'setback');
        return;
    }

    // Adjust rewards: water is half as much as soil and oxygen on average
    const waterReward = Math.floor(Math.random() * 5) + 1; // 1-5 range
    const soilReward = Math.floor(Math.random() * 10) + 1; // 1-10 range
    const oxygenReward = Math.floor(Math.random() * 10) + 1; // 1-10 range

    water += waterReward;
    soilNutrients += soilReward;
    oxygen += oxygenReward;

    // Create a list of non-zero rewards
    const rewards = [];
    if (waterReward > 0) rewards.push(`${waterReward} water`);
    if (soilReward > 0) rewards.push(`${soilReward} soil nutrients`);
    if (oxygenReward > 0) rewards.push(`${oxygenReward} oxygen`);

    // Join the rewards with commas and 'and' for the last item
    const rewardString = rewards.join(', ').replace(/,([^,]*)$/, ' and$1');

    showToast(
        "Resources Acquired",
        `An exploration of the martian surface yielded: ${rewardString}.`,
        'achievement'
    );

    lastExploreTime = currentTime;
    updateExplorationProgress();
    updateDisplay();
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
    if (!container) return; // Add this check

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
    if (!container) return; // Add this check

    const button = container.querySelector('button');
    if (button) {
        const nextUpgradeIndex = purchasedUpgrades.length;
        const nextUpgrade = explorationUpgrades[nextUpgradeIndex];
        button.disabled = potatoCount < nextUpgrade.cost;
    }
}

// Modify the updateExplorationProgress function
function updateExplorationProgress() {
    const cooldownElement = document.getElementById('exploration-cooldown');
    const currentTime = Date.now();
    const remainingTime = Math.max(0, exploreDelay - (currentTime - lastExploreTime));
    cooldownElement.textContent = remainingTime > 0 ? `(${(remainingTime / 1000).toFixed(1)}s)` : 'Ready';
}

// Modify the event listener
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    exploreButton.innerHTML = '🚀'; // Use innerHTML instead of textContent
    exploreButton.addEventListener('click', exploreMarsSurface);
    updateExplorationProgress();
});