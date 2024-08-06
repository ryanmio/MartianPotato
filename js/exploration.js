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

// Initialize exploration
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    exploreButton.addEventListener('click', exploreMarsSurface);
});