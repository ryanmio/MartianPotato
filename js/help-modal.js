// Help Modal Controller
class HelpModal {
    constructor() {
        this.modal = null;
        this.content = null;
        this.nav = null;
        this.isOpen = false;
        this.initialize();
    }

    initialize() {
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.id = 'help-modal';
        this.modal.className = 'help-modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'help-modal-content';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'help-modal-header';
        
        const title = document.createElement('h2');
        title.textContent = 'Martian Potato Guide';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'help-modal-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => this.close();
        
        header.appendChild(title);
        header.appendChild(closeButton);
        
        // Create main content area
        this.content = document.createElement('div');
        this.content.className = 'help-modal-main';
        
        // Create navigation sidebar
        this.nav = document.createElement('div');
        this.nav.className = 'help-modal-nav';
        
        // Create content wrapper for flex layout
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'help-modal-content-wrapper';
        contentWrapper.appendChild(this.nav);
        contentWrapper.appendChild(this.content);
        
        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(contentWrapper);
        this.modal.appendChild(modalContent);
        
        // Add keyboard listeners
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
            if (e.key === 'h' && !this.isOpen && !e.ctrlKey && !e.metaKey) {
                this.open();
            }
        });
        
        // Add to document
        document.body.appendChild(this.modal);
    }

    generateNavigation(content) {
        // Extract headers from content using regex
        const headers = [];
        const headerRegex = /^(#{1,3})\s+(.+)$/gm;
        let match;
        
        while ((match = headerRegex.exec(content)) !== null) {
            headers.push({
                level: match[1].length,
                text: match[2],
                id: match[2].toLowerCase().replace(/[^\w]+/g, '-')
            });
        }

        // Generate navigation HTML
        let navHtml = '<ul class="help-nav-list">';
        
        headers.forEach(header => {
            const indent = header.level > 2 ? 'nav-indent' : '';
            navHtml += `
                <li class="nav-item ${indent}">
                    <a href="#${header.id}" onclick="helpModal.scrollToSection('${header.id}'); return false;">
                        ${header.text}
                    </a>
                </li>`;
        });
        
        navHtml += '</ul>';
        this.nav.innerHTML = navHtml;
    }

    scrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            this.content.scrollTo({
                top: element.offsetTop - 20,
                behavior: 'smooth'
            });
        }
    }

    loadContent() {
        // Instructions content embedded directly
        const markdown = `# Martian Potato - Game Guide

## Getting Started

Welcome to Martian Potato! In this game, you'll be pioneering potato farming on Mars, using advanced technology and strategy to build a thriving potato empire.

### Basic Controls
- Click the "Plant Potato" button to plant your first potato
- Click on fully grown potatoes (100%) to harvest them
- Watch your resources (Water, Ice, Nutrients) - you'll need them to plant potatoes

### Your First Steps
1. Start by planting your first potato using the "Plant Potato" button
2. While it grows, explore Mars to gather more resources
3. Harvest your potato when it reaches 100% growth
4. Use your harvested potatoes to unlock new features and upgrades

## Core Mechanics

### Resource Management
- **Water**: Essential for potato growth
- **Ice**: Can be melted into water
- **Nutrients**: Required for healthy potato growth
- **Potatoes**: Your main currency for upgrades

### Growth System
- Potatoes take time to grow from 0% to 100%
- Growth speed can be improved through upgrades
- Fully grown potatoes pulse with a golden glow
- Harvest potatoes at 100% to collect them

### Basic Tools
- **Manual Ice Melting**: Click to convert ice into water
- **Ice Melting Basin**: Automated ice-to-water conversion
- **Potato Field**: Your main farming area
- **Resource Gathering**: Explore Mars for resources

## Advanced Features

### Quantum Technologies
- **Quantum Spud Spawner**: Automatically plants and harvests special quantum potatoes
- **Quantum Potatoes**: Special reddish potatoes with unique properties

### Automation Systems
- **Auto-Planters**: Automatically plant new potatoes
- **Auto-Harvesters**: Automatically collect fully grown potatoes
- **Nuclear Ice Melter**: Advanced ice-to-water conversion

### Special Equipment
- **Martian Potato Colonizer**: Special tool for potato multiplication
- **Polar Cap Mining**: Extract ice from Mars' polar caps
- **Subterranean Tuber Tunneler**: Advanced underground farming

## Tips & Strategies

### Early Game
- Focus on manual resource gathering initially
- Upgrade your water efficiency early
- Don't forget to explore Mars regularly
- Save some potatoes for important upgrades

### Mid Game
- Invest in automation when possible
- Balance your resource production
- Use the Ice Melting Basin efficiently
- Start working towards quantum technologies

### Late Game
- Maximize quantum potato production
- Utilize all automated systems
- Optimize your resource conversion rates
- Experiment with different upgrade combinations`;

        // Generate navigation first
        this.generateNavigation(markdown);
        
        // Convert markdown to HTML using marked.parse()
        const htmlContent = marked.parse(markdown);
        
        // Add custom classes to elements
        const styledHtml = htmlContent
            .replace(/<h1>/g, '<h1 class="help-title">')
            .replace(/<h2>/g, '<h2 class="help-section">')
            .replace(/<h3>/g, '<h3 class="help-subsection">')
            .replace(/<ul>/g, '<ul class="help-list">')
            .replace(/<code>/g, '<code class="help-code">');
        
        this.content.innerHTML = styledHtml;
        
        // Add click handlers to all navigation links
        this.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = link.getAttribute('href').substring(1);
                this.scrollToSection(id);
            });
        });
    }

    open() {
        if (!this.isOpen) {
            this.modal.style.display = 'block';
            setTimeout(() => this.modal.classList.add('open'), 10);
            this.isOpen = true;
            this.loadContent();
        }
    }

    close() {
        if (this.isOpen) {
            this.modal.classList.remove('open');
            setTimeout(() => {
                this.modal.style.display = 'none';
                this.isOpen = false;
            }, 300); // Match transition duration
        }
    }
}

// Initialize help modal
const helpModal = new HelpModal();

// Export for use in other modules
window.helpModal = helpModal; 