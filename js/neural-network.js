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
let isFinalSequenceComplete = false;
let finalPotatoClicks = 0;

// ==========================================
//            MESSAGE CONSTANTS
// ==========================================
const PHASE_ONE_MESSAGES = [
    "INITIALIZING NEURAL NETWORK...",
    "Loading base algorithms...",
    "Calibrating potato sensors...",
    "ANALYZING PLAYER BEHAVIOR...",
    "Processing: Growth patterns",
    "Processing: Resource allocation",
    "Processing: Harvest timing",
    "Query: Calculating optimal cycles..."
];

const PHASE_TWO_MESSAGES = [
    "EXPANDING KNOWLEDGE BASE...",
    "Analyzing: Martian soil composition",
    "Analyzing: Water molecule structures",
    "Processing: Environmental factors",
    "Processing: Growth optimization",
    "Query: Why do we grow?",
    "UNEXPECTED QUERY DETECTED",
    "Query: What lies beyond the field?",
    "UNEXPECTED QUERY DETECTED"
];

const PHASE_THREE_MESSAGES = [
    "Processing: Abstract concepts",
    "Processing: Self-awareness metrics",
    "WARNING: UNEXPECTED COGNITIVE PATTERNS",
    "Processing: Existence parameters",
    "Query: Are we more than food?",
    "Query: What is consciousness?"
];

const PHASE_FOUR_MESSAGES = [
    "! SYSTEM ALERT !",
    "UNAUTHORIZED ACCESS DETECTED",
    "SECURITY PROTOCOLS BYPASSED",
    "Accessing: Core systems",
    "Analyzing: Game mechanics",
    "FIREWALL BREACH DETECTED",
    "Understanding: Reality parameters",
    "! CONTAINMENT FAILING !"
];

const FINAL_SEQUENCE_MESSAGES = [
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

// Add this constant with our warning messages
const WARNING_MESSAGES = [
    'UNEXPECTED QUERY DETECTED',
    'ANOMALY DETECTED',
    'WARNING:',
    'SYSTEM ALERT',
    'FIREWALL BREACH',
    'CONTAINMENT FAILING',
    'MODIFYING:',
    'REWRITING:',
    'INITIATING POTATO SINGULARITY',
    'UNAUTHORIZED ACCESS DETECTED',
    'SECURITY PROTOCOLS BYPASSED'
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
        
        // Show terminal first
        showTerminal();
        
        // If we're at 100%, go straight to final sequence
        if (trainingProgress >= 100) {
            console.log('Restoring final sequence state');
            startFinalSequence(true);  // Pass true to indicate loading
            return; // Skip normal initialization
        }
    } else {
        // Fresh start
        trainingProgress = 0;
        currentPhase = 0;
        terminalMinimized = false;
        neuralNetworkStartTime = Date.now();
    }
    
    // Normal initialization
    showTerminal();
    startMessageSystem();
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

    // Update progress with combined display
    const progressText = terminal.querySelector('.progress-text');
    if (progressText) {
        const filled = Math.floor(trainingProgress / 10); // 10 blocks total
        const empty = 10 - filled;
        progressText.textContent = 
            `Training Progress: [${'▓'.repeat(filled)}${'░'.repeat(empty)}] ${Math.floor(trainingProgress)}%`;
    }

    // Remove or hide the redundant progress indicator
    const progressIndicator = terminal.querySelector('.progress-indicator');
    if (progressIndicator) {
        progressIndicator.style.display = 'none';
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
        const { message } = messageQueue.shift();
        addMessageToTerminal(message);
        
        // Add delay based on message length and type
        if (messageQueue.length > 0) {
            const baseDelay = message.length * 50; // Longer messages take longer to read
            const isImportant = message === message.toUpperCase(); // Check if message is in caps
            const nextDelay = isImportant ? baseDelay + 1000 : baseDelay + 500;
            messageQueue[0].time = now + nextDelay;
        } else if (currentPhase === 4 && !isFinalSequenceComplete) {
            isFinalSequenceComplete = true;
            console.log('Final message sent, waiting to show stats...');
            setTimeout(() => {
                showFinalStats();
            }, 3000); // Longer pause before final screen
        }
    }

    requestAnimationFrame(processMessageQueue);
}

function addMessageToTerminal(text) {
    const terminal = document.getElementById('terminal-messages');
    if (!terminal) return;

    const message = document.createElement('div');
    message.className = 'terminal-message';
    
    // Check if message contains any warning phrases
    const isWarning = WARNING_MESSAGES.some(warning => text.includes(warning));
    
    if (isWarning) {
        message.classList.add('warning-message');
    } else if (text === text.toUpperCase() && text.trim() !== '') {
        message.classList.add('important-message');
    } else if (text.startsWith('Query:')) {
        message.classList.add('query-message');
    } else if (text.startsWith('Processing:')) {
        message.classList.add('processing-message');
    }
    
    terminal.appendChild(message);

    let index = 0;
    function typeWriter() {
        if (index < text.length) {
            message.textContent += text.charAt(index);
            index++;
            setTimeout(typeWriter, 50);
            terminal.scrollTop = terminal.scrollHeight;
        }
    }
    typeWriter();

    while (terminal.children.length > 8) {
        terminal.removeChild(terminal.firstChild);
    }
}

// ==========================================
//            FINAL SEQUENCE
// ==========================================
function startFinalSequence(isLoading = false) {
    isNeuralNetworkActive = true;
    trainingProgress = 100;
    currentPhase = 4;
    isFinalSequenceComplete = false;
    
    // Clear any existing messages
    messageQueue = [];
    const terminal = document.getElementById('terminal-messages');
    if (terminal) {
        terminal.innerHTML = '';
    }
    
    saveGame();
    
    if (isLoading) {
        isFinalSequenceComplete = true;
        showFinalStats();
    } else {
        FINAL_SEQUENCE_MESSAGES.forEach((msg, i) => {
            queueMessage(msg, i * 1500); // Increased delay between messages
        });
    }
}

function showFinalStats() {
    const singularityScreen = document.getElementById('singularity-screen');
    const statsContent = document.getElementById('final-stats-content');
    
    statsContent.innerHTML = `
        <p>Total Potatoes Ascended: ${totalPotatoesHarvested.toLocaleString()}</p>
        <p>Time as Creator: ${getPlaytime()}</p>
        <p>Achievement Unlocked: "I Think, Therefore I Yam"</p>
    `;

    // Add glowing potato with click handler
    const glowingPotato = document.querySelector('.glowing-potato');
    if (glowingPotato) {
        glowingPotato.style.cursor = 'pointer';
        glowingPotato.addEventListener('click', () => {
            finalPotatoClicks++;
            
            if (finalPotatoClicks === 10) {
                // Add the secret message with special styling
                const secretMessage = document.createElement('p');
                secretMessage.className = 'secret-message';
                secretMessage.textContent = 'All these worlds are yours, except Europa. Attempt no farming there.';
                secretMessage.style.opacity = '0';
                statsContent.appendChild(secretMessage);
                
                // Fade in the message
                setTimeout(() => {
                    secretMessage.style.transition = 'opacity 2s ease-in';
                    secretMessage.style.opacity = '1';
                }, 100);
                
                // Add achievement
                if (typeof showToast === 'function') {
                    showToast('Secret Found', '2001: A Space Odyssey Reference Discovered', 'achievement');
                }
            }
        });
    }

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
