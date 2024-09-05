window.totalExplorationRate = 0;

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

    window.lastExploreTime = currentTime;
    updateDisplay();
}

// Modify the event listener
document.addEventListener('DOMContentLoaded', () => {
    const exploreButton = document.getElementById('explore-button');
    if (exploreButton) {
        exploreButton.innerHTML = '👩‍🚀';
        exploreButton.addEventListener('click', exploreMarsSurface);
    }
});