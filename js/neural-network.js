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
function initializeNeuralNetwork(savedState = null) {
    console.log('4. Neural Network Init:', {
        savedState,
        isNewInit: !savedState,
        globalActive: window.neuralNetworkActive
    });

    // IMPORTANT: Set both local and global state
    window.neuralNetworkActive = true;
    isNeuralNetworkActive = true;

    if (savedState) {
        trainingProgress = savedState.progress;
        currentPhase = savedState.phase;
        terminalMinimized = savedState.minimized;
    } else {
        trainingProgress = 0;
        currentPhase = 0;
        terminalMinimized = false;
    }

    console.log('5. Showing terminal...');
    const terminal = document.getElementById('neural-terminal');
    console.log('5a. Terminal element:', terminal);
    
    if (terminal) {
        console.log('5b. Setting terminal display');
        terminal.style.display = 'block';
        terminal.classList.toggle('minimized', terminalMinimized);
        console.log('5c. Terminal display set to:', terminal.style.display);
    } else {
        console.error('Terminal element not found!');
    }

    // IMPORTANT: Show terminal immediately
    showTerminal();
    
    // Start systems
    startMessageSystem();
    startTrainingProgress();
    
    console.log('Neural network initialization complete:', {
        active: isNeuralNetworkActive,
        progress: trainingProgress,
        phase: currentPhase,
        minimized: terminalMinimized,
        terminalVisible: document.getElementById('neural-terminal').style.display === 'block'
    });
}

// New helper functions for cleaner initialization
function showTerminal() {
    const terminal = document.getElementById('neural-terminal');
    if (!terminal) {
        console.error('Neural terminal element not found');
        return;
    }
    
    // Force display block
    terminal.style.display = 'block';
    
    // Set minimized state if needed
    terminal.classList.toggle('minimized', terminalMinimized);
    
    // Update display
    updateTerminalDisplay();
}

function startMessageSystem() {
    // Clear existing queue
    messageQueue = [];
    
    // Queue appropriate messages
    const messages = getPhaseMessages();
    messages.forEach((msg, i) => queueMessage(msg, i * 2000));
    
    // Start processing
    processMessageQueue();
}

function startTrainingProgress() {
    // Start progress updates in game loop
    updateTrainingProgress();
}

// Add to game loop check
function updateTrainingProgress() {
    if (!isNeuralNetworkActive) return;
    
    // Base speed: complete in 60 seconds
    const baseProgress = (Date.now() - gameStartTime) / 600;
    const potatoBonus = Math.min(50, (totalPotatoesHarvested / 4000));
    const progress = Math.min(100, baseProgress * (1 + (potatoBonus / 100)));
    
    if (progress !== trainingProgress) {
        trainingProgress = progress;
        updatePhase();
        updateTerminalDisplay();
        
        // IMPORTANT: Ensure terminal is visible
        const terminal = document.getElementById('neural-terminal');
        if (terminal && terminal.style.display !== 'block') {
            console.log('Forcing terminal display');
            showTerminal();
        }
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
    const state = {
        isActive: window.neuralNetworkActive,
        progress: trainingProgress,
        phase: currentPhase,
        minimized: terminalMinimized
    };
    console.log('Getting neural network state:', state);
    return state;
}

function loadNeuralNetworkState(state) {
    console.log('Neural Network - Loading State:', state);
    if (!state) {
        console.log('Neural Network - No state to load');
        return;
    }
    
    isNeuralNetworkActive = state.isActive;
    trainingProgress = state.progress;
    currentPhase = state.phase;
    terminalMinimized = state.minimized;
    
    console.log('Neural Network - Active:', isNeuralNetworkActive);
    
    if (isNeuralNetworkActive) {
        console.log('Neural Network - Reinitializing terminal');
        // Reinitialize the terminal
        const terminal = document.getElementById('neural-terminal');
        if (!terminal) {
            console.error('Neural Network - Terminal element not found');
            return;
        }
        terminal.style.display = 'block';
        terminal.classList.toggle('minimized', terminalMinimized);
        
        // Restart message processing
        processMessageQueue();
        
        // Update display
        updateTerminalDisplay();
        
        // Queue messages for current phase
        const messages = getPhaseMessages();
        messages.forEach((msg, i) => queueMessage(msg, i * 2000));
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