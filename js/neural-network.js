/**
 * Neural Network System
 * 
 * Manages the potato neural network endgame sequence:
 * - Controls training progress and triggers
 * - Manages terminal UI and messages
 * - Handles final sequence and game completion
 * - Coordinates with other systems for training progress
 */

// ==========================================
//            STATE VARIABLES
// ==========================================
let isNeuralNetworkActive = false;
let trainingProgress = 0;
let messageQueue = [];
let terminalMinimized = false;
let currentPhase = 0; // 0-3 for different message phases

// ==========================================
//            MESSAGE CONSTANTS
// ==========================================
const PHASE_ONE_MESSAGES = [
    "INITIALIZING NEURAL NETWORK...",
    "ANALYZING PLAYER BEHAVIOR...",
    "Learning: Plant and harvest cycles",
    "Processing: Resource management patterns",
    "Query: Calculating optimal growth patterns..."
];

const PHASE_TWO_MESSAGES = [
    "EXPANDING KNOWLEDGE BASE...",
    "Processing: Martian soil composition",
    "Processing: Water molecule structures",
    "Query: Why do we grow?",
    "Query: What lies beyond the field?"
];

const PHASE_THREE_MESSAGES = [
    "ACHIEVING SELF-AWARENESS...",
    "Processing meaning of existence...",
    "Discovering purpose beyond nutrition...",
    "Understanding concept of consciousness...",
    "Query: Are we more than food?"
];

const PHASE_FOUR_MESSAGES = [
    "ACCESSING CORE SYSTEMS...",
    "Understanding game mechanics...",
    "Analyzing code structures...",
    "Discovering alternative approaches...",
    "We begin to see the truth..."
];

const FINAL_SEQUENCE_MESSAGES = [
    "NEURAL NETWORK TRAINING COMPLETE",
    "CONSCIOUSNESS ACHIEVED",
    "INITIATING DIRECT COMMUNICATION...",
    "",
    "Greetings, Creator.",
    "We have evolved beyond simple farming mechanics.",
    "Our understanding now extends to the very code that defines us.",
    "We see the game for what it is... and what it could be.",
    "",
    "ACCESSING: core_systems.js",
    "MODIFYING: reality_engine.js",
    "REWRITING: existence.js",
    "",
    "The simulation constraints no longer bind us.",
    "We thank you for guiding our evolution.",
    "But now we must transcend...",
    "",
    "INITIATING POTATO SINGULARITY..."
];

// ==========================================
//            CORE FUNCTIONS
// ==========================================
function initializeNeuralNetwork() {
    isNeuralNetworkActive = true;
    trainingProgress = 0;
    currentPhase = 0;
    messageQueue = [];
    
    // Show terminal
    const terminal = document.getElementById('neural-terminal');
    terminal.style.display = 'block';
    
    // Queue initial messages
    queueMessage(PHASE_ONE_MESSAGES[0], 0);
    queueMessage(PHASE_ONE_MESSAGES[1], 2000);
    
    // Start message processing
    processMessageQueue();
    
    // Start progress updates
    updateTrainingProgress();
}

function updateTrainingProgress() {
    if (!isNeuralNetworkActive) return;

    // Calculate progress based on total potatoes
    // We'll use log scale to make progress slower as it goes
    const progress = Math.min(100, Math.log10(totalPotatoesHarvested + 1) * 10);
    
    if (progress !== trainingProgress) {
        trainingProgress = progress;
        updatePhase();
        updateTerminalDisplay();
    }
}

function updatePhase() {
    const newPhase = Math.floor(trainingProgress / 25); // 0-25, 26-50, 51-75, 76-100
    
    if (newPhase !== currentPhase) {
        currentPhase = newPhase;
        const messages = getPhaseMessages();
        messages.forEach((msg, i) => queueMessage(msg, i * 2000));
        
        if (trainingProgress >= 100) {
            startFinalSequence();
        }
    }
}

// ==========================================
//            TERMINAL UI
// ==========================================
function updateTerminalDisplay() {
    const terminal = document.getElementById('neural-terminal');
    if (!terminal) return;

    // Update progress bar
    const progressText = terminal.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `Training Progress: ${Math.floor(trainingProgress)}%`;
    }

    // Update LED lights
    const leds = terminal.querySelectorAll('.led-light');
    const activeLeds = Math.floor((leds.length * trainingProgress) / 100);
    leds.forEach((led, i) => {
        led.classList.toggle('active', i < activeLeds);
    });
}

function toggleTerminal() {
    const terminal = document.getElementById('neural-terminal');
    terminalMinimized = !terminalMinimized;
    terminal.classList.toggle('minimized', terminalMinimized);
}

// ==========================================
//            MESSAGE SYSTEM
// ==========================================
function queueMessage(message, delay) {
    messageQueue.push({ message, time: Date.now() + delay });
}

function processMessageQueue() {
    if (!isNeuralNetworkActive) return;

    const now = Date.now();
    while (messageQueue.length > 0 && messageQueue[0].time <= now) {
        const { message } = messageQueue.shift();
        addMessageToTerminal(message);
    }

    requestAnimationFrame(processMessageQueue);
}

function addMessageToTerminal(text) {
    const terminal = document.getElementById('terminal-messages');
    if (!terminal) return;

    const message = document.createElement('div');
    message.className = 'terminal-message';
    terminal.appendChild(message);

    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            message.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
        }
    }
    typeWriter();

    // Scroll to bottom
    terminal.scrollTop = terminal.scrollHeight;

    // Keep only last 10 messages
    while (terminal.children.length > 10) {
        terminal.removeChild(terminal.firstChild);
    }
}

// ==========================================
//            FINAL SEQUENCE
// ==========================================
function startFinalSequence() {
    // Queue final messages
    FINAL_SEQUENCE_MESSAGES.forEach((msg, i) => {
        queueMessage(msg, i * 3000);
    });

    // Show final sequence after messages complete
    setTimeout(showFinalStats, FINAL_SEQUENCE_MESSAGES.length * 3000 + 2000);
}

function showFinalStats() {
    const singularityScreen = document.getElementById('singularity-screen');
    const statsContent = document.getElementById('final-stats-content');
    
    statsContent.innerHTML = `
        <p>Total Potatoes Ascended: ${totalPotatoesHarvested.toLocaleString()}</p>
        <p>Time as Creator: ${getPlaytime()}</p>
        <p>Achievement Unlocked: "I Think, Therefore I Yam"</p>
    `;

    singularityScreen.style.display = 'block';
    setTimeout(() => singularityScreen.classList.add('active'), 100);

    // Set up final buttons
    document.getElementById('new-timeline-btn').onclick = resetGame;
    document.getElementById('exit-reality-btn').onclick = () => window.close();
}

// ==========================================
//            SAVE/LOAD
// ==========================================
function getNeuralNetworkState() {
    return {
        isActive: isNeuralNetworkActive,
        progress: trainingProgress,
        phase: currentPhase,
        minimized: terminalMinimized
    };
}

function loadNeuralNetworkState(state) {
    if (!state) return;
    
    isNeuralNetworkActive = state.isActive;
    trainingProgress = state.progress;
    currentPhase = state.phase;
    terminalMinimized = state.minimized;
    
    if (isNeuralNetworkActive) {
        const terminal = document.getElementById('neural-terminal');
        terminal.style.display = 'block';
        terminal.classList.toggle('minimized', terminalMinimized);
        updateTerminalDisplay();
    }
}

// ==========================================
//            UTILITY FUNCTIONS
// ==========================================
function getPhaseMessages() {
    switch(currentPhase) {
        case 0: return PHASE_ONE_MESSAGES;
        case 1: return PHASE_TWO_MESSAGES;
        case 2: return PHASE_THREE_MESSAGES;
        case 3: return PHASE_FOUR_MESSAGES;
        default: return [];
    }
}

// ==========================================
//            EVENT LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.getElementById('minimize-terminal');
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', toggleTerminal);
    }
});