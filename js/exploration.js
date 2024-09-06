window.totalExplorationRate = 0;
window.explorationResourceMultiplier = 1; // Add this line

window.lastExploreTime = 0;
window.exploreDelay = 10000; // 10 seconds initial delay

function exploreMarsSurface() {
    const currentTime = Date.now();
    if (currentTime - window.lastExploreTime < window.exploreDelay) {
        const waitTime = ((window.exploreDelay - (currentTime - window.lastExploreTime)) / 1000).toFixed(1);
        showToast("Exploration Cooldown", `You need to wait ${waitTime} seconds before exploring again.`, 'setback');
        return;
    }

    // Adjust rewards: water is half as much as soil and oxygen on average
    const waterReward = Math.floor(Math.random() * 5 + 1) * window.explorationResourceMultiplier; // 1-5 range
    const soilReward = Math.floor(Math.random() * 10 + 1) * window.explorationResourceMultiplier; // 1-10 range
    const oxygenReward = Math.floor(Math.random() * 10 + 1) * window.explorationResourceMultiplier; // 1-10 range

    water += waterReward;
    soilNutrients += soilReward;
    oxygen += oxygenReward;

    // Create a list of non-zero rewards
    const rewards = [];
    if (waterReward > 0) rewards.push(`${waterReward.toFixed(1)} water`);
    if (soilReward > 0) rewards.push(`${soilReward.toFixed(1)} soil nutrients`);
    if (oxygenReward > 0) rewards.push(`${oxygenReward.toFixed(1)} oxygen`);

    // Join the rewards with commas and 'and' for the last item
    const rewardString = rewards.join(', ').replace(/,([^,]*)$/, ' and$1');

    showToast(
        "Resources Acquired",
        `An exploration of the martian surface yielded: ${rewardString}.`,
        'achievement'
    );

    window.lastExploreTime = currentTime;
    updateDisplay();
}

// Add this function to handle autonomous exploration
function autonomousExploration() {
    if (window.totalExplorationRate > 0) {
        const waterReward = (Math.random() * 2.5 + 0.5) * window.totalExplorationRate * window.explorationResourceMultiplier;
        const soilReward = (Math.random() * 5 + 1) * window.totalExplorationRate * window.explorationResourceMultiplier;
        const oxygenReward = (Math.random() * 5 + 1) * window.totalExplorationRate * window.explorationResourceMultiplier;

        water += waterReward;
        soilNutrients += soilReward;
        oxygen += oxygenReward;

        updateDisplay();
    }
}

// Add this function to update autonomous exploration
function updateAutonomousExploration() {
    clearInterval(window.autonomousExplorationInterval);
    if (window.totalExplorationRate > 0) {
        window.autonomousExplorationInterval = setInterval(autonomousExploration, 1000);
    }
}

// Modify the event listener
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    if (exploreButton) {
        exploreButton.innerHTML = '👩‍🚀';
        exploreButton.addEventListener('click', exploreMarsSurface);
    }
    updateAutonomousExploration(); // Start autonomous exploration if applicable
});