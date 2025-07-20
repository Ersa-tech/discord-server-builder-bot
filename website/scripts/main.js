// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeToolSwitcher();
});

// Tool switcher functionality
function initializeToolSwitcher() {
    const toolOptions = document.querySelectorAll('.tool-option');
    const toolPanels = document.querySelectorAll('.tool-panel');
    
    toolOptions.forEach(option => {
        option.addEventListener('click', function() {
            const targetTool = this.getAttribute('data-tool');
            
            // Remove active class from all options and panels
            toolOptions.forEach(opt => opt.classList.remove('active'));
            toolPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Show corresponding panel
            const targetPanel = document.getElementById(targetTool + '-panel');
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Track Discord bot invite clicks
function trackBotInvite() {
    console.log('Discord bot invite clicked');
}

// Add click tracking to invite buttons
document.addEventListener('DOMContentLoaded', function() {
    const inviteButtons = document.querySelectorAll('.action-button');
    inviteButtons.forEach(button => {
        button.addEventListener('click', trackBotInvite);
    });
});
