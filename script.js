// DOM Elements
const toggleButton = document.getElementById('toggleLogging');
const clearButton = document.getElementById('clearLogs');
const downloadButton = document.getElementById('downloadLogs');
const logDisplay = document.getElementById('logDisplay');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');
const inputArea = document.getElementById('inputArea');
const themeToggle = document.getElementById('themeToggle');

// State
let isLogging = false;
let keyLogs = [];

// Theme Management
const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
};

// Initialize theme from localStorage or system preference
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
};

// Utility function to format timestamp
const getFormattedTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
};

// Function to create and append a log entry
const addLogEntry = (key, eventType) => {
    const timestamp = getFormattedTimestamp();
    const logEntry = document.createElement('div');
    const logText = `[${timestamp}] ${eventType}: ${key}`;
    
    logEntry.className = 'log-entry';
    logEntry.textContent = logText;
    logDisplay.appendChild(logEntry);
    logDisplay.scrollTop = logDisplay.scrollHeight;
    
    // Store log entry for download
    keyLogs.push(logText);
};

// Function to update UI state
const updateUIState = (logging) => {
    isLogging = logging;
    
    // Update button
    toggleButton.innerHTML = isLogging ? 
        '<span class="icon">⏹</span> Stop Logging' : 
        '<span class="icon">▶</span> Start Logging';
    toggleButton.classList.toggle('logging', isLogging);
    
    // Update status indicator
    statusDot.classList.toggle('active', isLogging);
    statusText.textContent = isLogging ? 'Logging active' : 'Logging inactive';
    
    // Update textarea state
    inputArea.placeholder = isLogging ? 
        'Type here to see keystrokes being logged...' : 
        'Click \'Start Logging\' and type here to see keystrokes being logged...';
    inputArea.focus();
};

// Function to download logs
const downloadLogs = () => {
    if (keyLogs.length === 0) {
        alert('No logs to download');
        return;
    }

    const logText = keyLogs.join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `keylog-${timestamp}.txt`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    URL.revokeObjectURL(url);
};

// Event handler for keydown events
const handleKeyEvent = (event) => {
    if (!isLogging) return;
    
    // Get key information
    let keyDisplay = event.key;
    if (event.key === ' ') keyDisplay = 'Space';
    else if (event.key.length === 1) keyDisplay = event.key;
    else keyDisplay = event.key.charAt(0).toUpperCase() + event.key.slice(1);
    
    // Add modifiers if present
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    
    const displayText = modifiers.length > 0 ? 
        `${modifiers.join('+')}+${keyDisplay}` : 
        keyDisplay;
    
    addLogEntry(displayText, 'KeyDown');
};

// Event Listeners
toggleButton.addEventListener('click', () => {
    updateUIState(!isLogging);
});

clearButton.addEventListener('click', () => {
    logDisplay.innerHTML = '';
    keyLogs = [];
});

downloadButton.addEventListener('click', downloadLogs);

inputArea.addEventListener('keydown', handleKeyEvent);

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// Prevent certain key combinations from triggering browser shortcuts
inputArea.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
        // Allow copy/paste operations
        if (!['c', 'v'].includes(event.key.toLowerCase())) {
            event.preventDefault();
        }
    }
});

// Initialize theme on page load
initializeTheme();