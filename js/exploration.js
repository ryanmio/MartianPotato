let explorationLevel = 0;
const explorationCost = 100;

function exploreMarsSurface() {
    const waterReward = Math.floor(Math.random() * 10) + 1;
    const soilReward = Math.floor(Math.random() * 10) + 1;
    const oxygenReward = Math.floor(Math.random() * 10) + 1;

    water += waterReward;
    soilNutrients += soilReward;
    oxygen += oxygenReward;
    explorationLevel++;

    updateDisplay();
    updateUpgradeButtons();
    alert(`Exploration successful! You found:\nWater: ${waterReward}\nSoil Nutrients: ${soilReward}\nOxygen: ${oxygenReward}`);
}

function discoverRandomEvent() {
    const events = [
        "You found an ancient Martian artifact!",
        "You discovered a new area rich in resources!",
        "You encountered a dust storm and lost some resources.",
        "You found traces of an ancient Martian potato civilization!",
        "You discovered a mysterious underground cave system."
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    handleSpecialEvent(randomEvent);
    return randomEvent;
}

function handleSpecialEvent(event) {
    switch (event) {
        case "You discovered a new area rich in resources!":
            water += 50;
            soilNutrients += 50;
            oxygen += 50;
            break;
        case "You encountered a dust storm and lost some resources.":
            water -= 20;
            soilNutrients -= 20;
            oxygen -= 20;
            break;
        // Add more cases for other events as needed
    }
}

const explorationUpgrades = [
    { name: "Potato-Powered Rover", cost: 500, efficiency: 1, delay: 2000 },
    { name: "Spudnik Satellite", cost: 2000, efficiency: 2, delay: 1500 },
    { name: "Subterranean Tuber Tunneler", cost: 5000, efficiency: 3, delay: 1000 },
    { name: "Martian Potato Colonizer", cost: 20000, efficiency: 5, delay: 500 }
];

let currentExplorationUpgrade = -1;
let autonomousExplorationInterval = null;

function buyExplorationUpgrade() {
    const nextUpgrade = explorationUpgrades[currentExplorationUpgrade + 1];
    if (potatoCount >= nextUpgrade.cost) {
        potatoCount -= nextUpgrade.cost;
        currentExplorationUpgrade++;
        startAutonomousExploration();
        updateDisplay();
        displayExplorationUpgrades();
    }
}

function startAutonomousExploration() {
    if (autonomousExplorationInterval) {
        clearInterval(autonomousExplorationInterval);
    }
    const upgrade = explorationUpgrades[currentExplorationUpgrade];
    autonomousExplorationInterval = setInterval(() => {
        const resourceGain = Math.floor(Math.random() * 3 * upgrade.efficiency) + 1;
        const resourceType = ['water', 'soilNutrients', 'oxygen'][Math.floor(Math.random() * 3)];
        window[resourceType] += resourceGain;
        updateDisplay();
        console.log(`${upgrade.name} discovered ${resourceGain} ${resourceType}!`);
    }, upgrade.delay);
}

function displayExplorationUpgrades() {
    const container = document.getElementById('exploration-upgrades');
    container.innerHTML = '<h3>Exploration Upgrades</h3>';
    if (currentExplorationUpgrade < explorationUpgrades.length - 1) {
        const nextUpgrade = explorationUpgrades[currentExplorationUpgrade + 1];
        const button = document.createElement('button');
        button.textContent = `Buy ${nextUpgrade.name} (Cost: ${nextUpgrade.cost} potatoes)`;
        button.onclick = buyExplorationUpgrade;
        button.disabled = potatoCount < nextUpgrade.cost;
        container.appendChild(button);
    }
}

// Initialize exploration
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    exploreButton.addEventListener('click', exploreMarsSurface);
    displayExplorationUpgrades();
});