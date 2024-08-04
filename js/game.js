// Main game logic will go here
console.log("Game initialized");

let potatoCount = 0;

function plantPotato() {
    potatoCount++;
    updateDisplay();
}

function updateDisplay() {
    // This function will be implemented to update the game display
    console.log("Potatoes: " + potatoCount);
}