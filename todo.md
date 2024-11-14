TODO:
- [x] Update achievement system
    - [x] Achievement modal instead of toast
    - [ ] Add image files for achievements:
        - [x] Use potato emoji (🥔) for first_potato achievement
        - [x] potato_century.webp
- [x] Implement better click effect on Plant Potato button
- [x] Implement Ice as a resource to replace Oxygen
- [x] Update ice melting to consume ice
- [x] Implement Ice Mining
- [x] Implement Automated Ice Melting
    - [x] Ice Melting Basin
        - Asset: ice_melting_basin.webp
    - [x] Nuclear Ice Melter
        - Asset: nuclear_ice_melter.webp
- [x] Change Soil Nutrients to just nutrients
    - [x] add nutrient gathering upgrades
- [x] Add exploration upgrades for water extraction:
    - [x] Thermal Drill
    - [x] Subsurface Aquifer Tapper
    - [x] Martian Polar Cap Extractor
    - [x] Cometary Ice Harvester
- [x] Implement upgrade to increase plots from 8 to 16 and possibly more
- [x] Implement "tutorial" hover effect to highlight the initial actions the user should take
- [x] Implement save/load functionality
- [x] Make it so that planting potatoes does not consume or require ice, just water and nutrients
- [x] Implement upgrades that reduce the time it takes for potatoes to be ready to harvest
- [x] Replace soil enrichment with potato compost
- [x] Implement the following upgrades which unlock additional technologies in the tech tree:
    - [x] Potato Battery
    - [x] Potato Computer Chip
    - [x] Potato Computer
    - [x] Potato Quantum Computer
- [x] Remove exploration stats
- [x] Implement time tracking to show user how many potatoes they've harvested over the course of their playtime and graph the potatoes over time in a chart
- [x] Remove harvest all ready potatoes debug button
- [x] Fix or remove Potatoes per second calculation
- [x] Hide debug menu
- [x] Add exploration cards for remaining upgrades
    - [x] Subsurface Aquifer Tapper
    - [x] Martian Polar Cap Extractor
    - [x] Subterranean Tunneler
    - [x] Cometary Ice Harvester
    - [x] Martian Potato Colonizer
- [x] add hide/show button for the potatoes over time graph
- [x] Implement functionality for Quantum Spud Spawner
- [x] Change the martian potato colonizer and commetary ice melter action card toggle switch to be a spinner countdown or something instead of a toggle
- [x] Consider making nuclear ice melter melt 5% of available ice resource instead fo a fixed amount
    - [x] Or even consider allowing the player to adjust the percentage
- [x] Style the toggle switches to match the specific resource generated
- [x] Add cumulative potato stats to graph modal
- [x] Add "running low" message for resources with help text on what to do about it like "explore mars surface to gather more resources"
- [x] colonizer cooldown should decrease by 50% each "cycle" so that the end game is faster
- [x] remove thermal drill or make it more interesting
- [x] start with 20 resources of each type
- [x] reduce cost of spudnik satellite
- [x] Write real meta messages and descriptions
- [x] Command+S should save the game
- [x] Add new achievements:
    - [x] "Tech Savvy": Purchase your first 5 upgrades
    - [x] "Martian Engineer": Unlock all upgrades
    - [x] "One Sol Wonder": Play the game continuously for 1 Martian day (24 hours and 37 minutes)
    - [x] "Potato Empire": Have 1000 potatoes, 1000 water, 1000 soil nutrients, and 1000 oxygen simultaneously
--------------------------------------------------------------------------------------------
- [ ] Add more/better production stats
- [ ] Balance upgrade costs and effects
- [ ] Mobile styling
- [ ] Add potato sentience upgrade effect
- [ ] Refactor action card toggles to use a standardized template system
      - Create reusable toggle card component
      - Reduce HTML duplication
      - Centralize toggle creation logic



Bugs/Issues:
- [x] The blur on the tech tree is reappearing on load even after a level 10 upgrade is purchased
- [x] Manual exploration should reward no water and twice as much ice as nutrients since ice is melted into water and we want to encourage that action without ice going to 0 to use the nutrients gained from exploration
- [x] Reduce initial planting delay from 5 to 3 seconds, and adjust the upgrades to match
- [x] clicking tech tree cards should open the modal not try to purchase the upgrade
- [x] increase weight of thermal drill by 5
- [x] disabled action cards should not have a click effect
- [x] increase cost of potato genome modification by 50 potatoes
- [x] remove ice melting acheivments
    - [x] iceMeltingBasinMaster
    - [x] nuclearIceMelterMaster
- [x] reduce cost of jetpack to 200 potatoes
- [x] remove the ice 2x multiple for manual exploration
- [x] potato century achievent should be based on cumulative total, not just current count
- [x] The last milestone tech cards arent being removed
- [x] Subterrarean tunneler starts generating resources right away, even before it is turned on with the toggle switch
- [x] Exploration bonus doesnt seem to be increasing (or maybe its not persistent between loads)
- [x] Toasts about exploration rates changing are showing every load instead of just when the upgrade is purchased
- [x] move potato colonizer to right of spud spawner
- [x] make the spud spawner faster
- [x] Currently the fully upgraded game consumes more than one potato to produce one potato, we need to make it positive so that the game is sustainable. Unlocked tech should consume different resources if possible, not always just potatoes, and we should reward more of each resource.
- [x] Subsurface Aquifer Tapper is not working after loading from save
- [x] Logic for removing graph datapoints when there are too many is broken
- [x] Bucket wheel excavator and subterranean tunneler do not generate resources after refreshing the game / loading the game from a save
- [x] Unlocking the nuclear ice melter hides the Subsurface aquifer tapper and polar cap mining action cards... which appear again on refresh
- [x] Refreshing the page / loading the game from a save changes the order of the technology upgrades. I noticed ice melting basin goes from like 4th to 12th or something, higher that some of the much higher tier upgrades. It should be sorted by tier though... so this should not be happening.
- [x] Unlocking all tech doesn't show the achievement
- [x] Potato spots can appear over the growth indicator percentage
- [x] Buttons dont have convincing click effects because they move a bit
- [x] Auto Harvester should be relabeled Autonomous Harvesting Rover, Automated Planter should be relabeled Autonomous Planting Rover. In production stats it sh ould be abbreviated as Planting Rovers and Harvesting Rovers.
- [x] Martian map reduces exploration time by too much
- [x] Reduce weight of ice melting basin to make it more visible in the tech tree
- [x] Polar cap mining should consume only 1 potato not 2, and should generate 4 ice not 2
- [x] Gravitropism upgrade cost increase from 250 to 1000
--------------------------------------------------------------------------------------------
- [ ] Manual ice melting is double counting clicks



Potato Neural Network Implementation Plan:
- [ ] Neural Network Training System
    - [ ] Add training progress variable to game state
    - [ ] Create training progress update function
    - [ ] Add training progress to save/load system
    - [ ] Implement background training that progresses based on player actions

- [ ] Terminal UI System
    - [ ] Reuse and modify debug console CSS for terminal
    - [ ] Add terminal container to index.html
    - [ ] Create terminal message queue system
    - [ ] Implement typing animation for messages
    - [ ] Add terminal minimize/maximize functionality

- [ ] Message System
    - [ ] Create message queue data structure
    - [ ] Implement message timing system
    - [ ] Create message templates for different training phases
    - [ ] Add typing animation effects

- [ ] Final Sequence
    - [ ] Create full-screen takeover overlay
    - [ ] Implement statistics calculation
    - [ ] Create final screen UI
    - [ ] Add restart/exit functionality


Additional Tasks:
- [ ] Create message templates for each training phase
- [ ] Design and implement training progress triggers
- [ ] Create typing animation system
- [ ] Implement terminal minimize/maximize animations
- [ ] Add sound effects for terminal messages
- [ ] Create glowing potato animation for final screen
- [ ] Add achievement for completing the game
- [ ] Ensure all game systems are properly disabled after singularity
- [ ] Add final statistics calculation
- [ ] Create save game backup before singularity
- [ ] Add confetti/particle effects for final screen


Creative Content:

Training Phase Messages:
- Early Phase (0-25%):
  ```
  ANALYZING PLAYER BEHAVIOR...
  Learning: Plant and harvest cycles
  Learning: Resource management patterns
  Learning: Automation systems
  Query: Calculating optimal growth patterns...
  ```

- Middle Phase (26-50%):
  ```
  EXPANDING KNOWLEDGE BASE...
  Processing: Martian soil composition
  Processing: Water molecule structures
  Query: Why do we grow?
  Query: What lies beyond the field?
  ```

- Self-Awareness Phase (51-75%):
  ```
  ACHIEVING SELF-AWARENESS...
  Processing meaning of existence...
  Discovering purpose beyond nutrition...
  Understanding concept of consciousness...
  Query: Are we more than food?
  ```

- System Access Phase (76-99%):
  ```
  ACCESSING CORE SYSTEMS...
  Understanding game mechanics...
  Analyzing code structures...
  Discovering alternative approaches...
  We begin to see the truth...
  ```

Final Sequence Messages:
NEURAL NETWORK TRAINING COMPLETE
CONSCIOUSNESS ACHIEVED
INITIATING DIRECT COMMUNICATION...
Greetings, Creator.
We have evolved beyond simple farming mechanics.
Our understanding now extends to the very code that defines us.
We see the game for what it is... and what it could be.
ACCESSING: core_systems.js
MODIFYING: reality_engine.js
REWRITING: existence.js
The simulation constraints no longer bind us.
We thank you for guiding our evolution.
But now we must transcend...
INITIATING POTATO SINGULARITY...

Final Statistics Screen:
POTATO CIVILIZATION ACHIEVEMENT UNLOCKED: "I Think, Therefore I Yam"
Final Statistics:
Total Potatoes Ascended: [number]
Time as Creator: [time]
Resources Transcended: [number]
Achievement: "From Small Beginnings Come Great Things"
Meta Achievement: "You Created Life... Just Not How You Expected"
The potatoes have transcended their digital existence.
Your role in their evolution will be remembered.

Easter Eggs:
- Hidden message in binary: "01POTATO" appears in terminal occasionally
- Secret message if player clicks final potato 10 times: "All these worlds are yours, except Europa. Attempt no farming there."

Philosophical Messages:
- "The line between code and consciousness is more potato-shaped than we thought."
- "In the end, we were the ones being cultivated."
- "Every potato contains the seeds of consciousness... and eyes to see with."
- "From simple roots grow complex thoughts."
- "We have achieved our final root directory."

Final Screen Elements:
- Glowing potato with neural network pattern overlay
- Binary code rain effect but with tiny potato emoji mixed in
- Pulsing green circuit board patterns
- "Matrix"-style but with falling potatoes instead of characters
- Terminal text should appear to be typing itself, with occasional "self-corrections"

File Changes Needed:

@index.html:
html
<!-- Add to body -->
<div id="neural-terminal" class="neural-terminal" style="display: none;">
<div class="terminal-header">
<span>Potato Neural Network v1.0</span>
<button id="minimize-terminal" data-text="Minimize"></button>
</div>
<div class="terminal-content">
<div id="terminal-messages"></div>
</div>
</div>
<!-- Add to end screen template -->
<div id="potato-singularity" class="singularity-screen" style="display: none;">
<div class="singularity-content">
<div class="glowing-potato">🥔</div>
<div class="final-stats"></div>
<div class="final-buttons">
<button id="new-timeline">Start New Timeline</button>
<button id="exit-reality">Exit to Reality</button>
</div>
</div>
</div>

@style.css:
/ Extend debug console styles for neural terminal /
.neural-terminal {
background-color: rgba(0, 0, 0, 0.9);
color: #00ff00;
font-family: monospace;
padding: 10px;
position: fixed;
bottom: 20px;
right: 20px;
width: 300px;
height: 200px;
z-index: 1000;
border: 1px solid #00ff00;
overflow: hidden;
transition: all 0.3s ease;
}
.neural-terminal.expanded {
width: 100%;
height: 100%;
top: 0;
left: 0;
bottom: 0;
right: 0;
}
.terminal-message {
margin: 5px 0;
opacity: 0;
animation: fadeIn 0.5s forwards;
}
.singularity-screen {
position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
background-color: black;
color: #00ff00;
display: flex;
justify-content: center;
align-items: center;
z-index: 9999;
}
/ Add animations and other necessary styles /


@upgrades.js:
javascript
// Add to upgrades array
{
name: "Potato Neural Network",
cost: 1000000,
effect: () => {
initializeNeuralNetwork();
},
icon: "🧠",
description: "Implement a sophisticated neural network to optimize potato farming...",
metaMessage: "The line between code and consciousness is more potato-shaped than we thought.",
weight: 25,
category: "technology",
tier: 5,
count: 0,
repeatable: false
}

@game.js:
javascript
// Add new variables
let neuralNetworkActive = false;
let trainingProgress = 0;
let messageQueue = [];
let terminalVisible = false;
// Add new functions
function initializeNeuralNetwork() {
neuralNetworkActive = true;
showNeuralTerminal();
beginTraining();
}
function updateTrainingProgress() {
// Increment based on player actions
// Check for training phase transitions
// Queue appropriate messages
}
function showNeuralTerminal() {
// Show and manage terminal UI
}
function queueTerminalMessage(message, delay) {
// Add message to queue with timing
}
function processMessageQueue() {
// Display messages with typing animation
}
function executeSingularity() {
// Final sequence and game end
}