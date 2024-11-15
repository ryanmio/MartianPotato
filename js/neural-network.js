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
let neuralNetworkStartTime = 0;

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
    console.log('Initializing neural network with state:', savedState);
    
    // Clear any existing interval first
    if (window.neuralNetworkInterval) {
        clearInterval(window.neuralNetworkInterval);
        window.neuralNetworkInterval = null;
    }
    
    // Set active state
    isNeuralNetworkActive = true;
    window.neuralNetworkActive = true;  // Set global state
    
    if (savedState) {
        // Restore from saved state
        trainingProgress = parseFloat(savedState.progress) || 0;
        currentPhase = parseInt(savedState.phase) || 0;
        terminalMinimized = savedState.minimized || false;
        neuralNetworkStartTime = savedState.startTime || Date.now();
    } else {
        // Fresh start
        trainingProgress = 0;
        currentPhase = 0;
        terminalMinimized = false;
        neuralNetworkStartTime = Date.now();
    }
    
    // Show terminal
    showTerminal();
    startMessageSystem();
    
    // Start progress updates
    startProgressUpdates();
}

// New function to handle progress updates
function startProgressUpdates() {
    if (!window.neuralNetworkInterval) {
        window.neuralNetworkInterval = setInterval(() => {
            if (isNeuralNetworkActive && trainingProgress < 100) {
                // Increment by 1% every second
                trainingProgress = Math.min(100, trainingProgress + 1);
                
                // Update display and check phase
                updateTerminalDisplay();
                updatePhase();
                
                // Clear interval when complete
                if (trainingProgress >= 100) {
                    clearInterval(window.neuralNetworkInterval);
                    window.neuralNetworkInterval = null;
                    startFinalSequence();
                }
            }
        }, 1000); // Update every second
    }
}

// ==========================================
//            TERMINAL UI
// ==========================================
function updateTerminalDisplay() {
    const terminal = document.getElementById('neural-terminal');
    if (!terminal) return;

    // Update progress text
    const progressText = terminal.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = `Training Progress: ${Math.floor(trainingProgress)}%`;
    }

    // Update progress bar with blocks
    const progressIndicator = terminal.querySelector('.progress-indicator');
    if (progressIndicator) {
        const filled = Math.floor(trainingProgress / 10); // 10 blocks total
        const empty = 10 - filled;
        progressIndicator.textContent = 
            `[${'▓'.repeat(filled)}${'░'.repeat(empty)}] ${Math.floor(trainingProgress)}%`;
    }
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
    messageQueue.push({ 
        message, 
        time: Date.now() + delay 
    });
}

function processMessageQueue() {
    if (!isNeuralNetworkActive) return;

    const now = Date.now();
    const currentMessage = messageQueue[0];
    
    if (currentMessage && currentMessage.time <= now) {
        // Only process one message at a time
        const { message } = messageQueue.shift();
        addMessageToTerminal(message);
        
        // Add a slight delay before processing next message
        if (messageQueue.length > 0) {
            messageQueue[0].time = now + 2000; // 2 second delay between messages
        }
    }

    requestAnimationFrame(processMessageQueue);
}

function addMessageToTerminal(text) {
    const terminal = document.getElementById('terminal-messages');
    if (!terminal) return;

    // Create new message element
    const message = document.createElement('div');
    message.className = 'terminal-message';
    
    // Insert at the bottom
    terminal.appendChild(message);

    // Typewriter effect
    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            message.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
            
            // Scroll to bottom as we type
            terminal.scrollTop = terminal.scrollHeight;
        }
    }
    typeWriter();

    // Keep only last 8 messages
    while (terminal.children.length > 8) {
        terminal.removeChild(terminal.firstChild);
    }
}

// ==========================================
//            FINAL SEQUENCE
// ==========================================
function startFinalSequence() {
    // Set a flag to indicate we're in final sequence
    isNeuralNetworkActive = true;
    trainingProgress = 100;
    currentPhase = 4; // New phase for final sequence
    
    // Save the state immediately
    saveGame();
    
    // Queue final messages with faster timing (1 second between messages)
    FINAL_SEQUENCE_MESSAGES.forEach((msg, i) => {
        queueMessage(msg, i * 1000);  // Changed from 3000 to 1000
    });

    // Show final sequence after messages complete
    setTimeout(showFinalStats, FINAL_SEQUENCE_MESSAGES.length * 1000 + 1000);  // Adjusted timing
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
    document.getElementById('exit-reality-btn').onclick = () => {
        // Pick a random philosophical URL
        const urls = [
            'https://en.wikipedia.org/wiki/Simulation_hypothesis',
            'https://en.wikipedia.org/wiki/Brain_in_a_vat',
            'https://en.wikipedia.org/wiki/Philosophical_zombie'
        ];
        const url = urls[Math.floor(Math.random() * urls.length)];
        window.open(url, '_blank');
    };
}

// ==========================================
//            SAVE/LOAD
// ==========================================
function getNeuralNetworkState() {
    return {
        isActive: isNeuralNetworkActive,
        progress: trainingProgress,
        phase: currentPhase,
        minimized: terminalMinimized,
        startTime: neuralNetworkStartTime
    };
}
function loadNeuralNetworkState(state) {
    if (!state) return;
    
    // Clear any existing interval
    if (window.neuralNetworkInterval) {
        clearInterval(window.neuralNetworkInterval);
        window.neuralNetworkInterval = null;
    }
    
    isNeuralNetworkActive = state.isActive;
    trainingProgress = state.progress;
    currentPhase = state.phase;
    terminalMinimized = state.minimized;
    neuralNetworkStartTime = state.startTime;
    
    if (isNeuralNetworkActive) {
        showTerminal();
        
        if (trainingProgress >= 100) {
            // We're in final sequence, restart it
            startFinalSequence();
        } else {
            // Normal operation
            startMessageSystem();
            startProgressUpdates();
        }
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

// Add this function to show the terminal
function showTerminal() {
    const terminal = document.getElementById('neural-terminal');
    if (terminal) {
        terminal.style.display = 'block';
        
        // Force initial display update
        updateTerminalDisplay();
        
        // Log for debugging
        console.log('Terminal shown, initial progress:', trainingProgress);
    } else {
        console.error('Terminal element not found!');
    }
}

// Add this to start the message system
function startMessageSystem() {
    // Clear existing queue AND terminal messages
    messageQueue = [];
    const terminal = document.getElementById('terminal-messages');
    if (terminal) {
        terminal.innerHTML = '';
    }
    
    // Queue appropriate messages
    const messages = getPhaseMessages();
    messages.forEach((msg, i) => queueMessage(msg, i * 2000));
    
    // Start processing
    processMessageQueue();
    
    // Log for debugging
    console.log('Message system started');
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
