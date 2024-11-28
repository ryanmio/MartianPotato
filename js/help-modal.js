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
        const headerRegex = /^(#{1,3})\s+(.+?)(?:\s*{#[\w-]+})?\s*$/gm;
        let match;
        
        console.log('Generating navigation from content...');
        
        while ((match = headerRegex.exec(content)) !== null) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^\w]+/g, '-');
            
            console.log(`Found header: Level ${level}, Text: "${text}", ID: "${id}"`);
            
            headers.push({ level, text, id });
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
        
        console.log('Navigation HTML generated:', navHtml);
    }

    scrollToSection(id) {
        console.log(`Attempting to scroll to section: ${id}`);
        const element = document.getElementById(id);
        
        if (element) {
            console.log(`Found element with id: ${id}, offsetTop: ${element.offsetTop}`);
            
            // Get the modal content element for scrolling
            const modalContent = this.content;
            const headerHeight = 60; // Height of the modal header
            const scrollPadding = 20; // Additional padding for visual comfort
            
            // Calculate scroll position with refined offset
            const scrollTop = Math.max(0, element.offsetTop - headerHeight - scrollPadding);
            
            console.log(`Scrolling to position: ${scrollTop} (offsetTop: ${element.offsetTop}, headerHeight: ${headerHeight}, padding: ${scrollPadding})`);
            modalContent.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
            
            // Add a highlight effect
            element.classList.add('highlight');
            setTimeout(() => element.classList.remove('highlight'), 2000);
        } else {
            console.warn(`No element found with id: ${id}`);
        }
    }

    loadContent() {
        // Instructions content embedded directly
        const markdown = `# Martian Potato - Game Guide

## Game Objective

Welcome to your new role as Mars' premier potato farmer! Your mission is to establish and grow a self-sustaining potato-based colony on the Red Planet. Starting with just a handful of resources and your first precious potato, you'll develop technologies, automate processes, and expand your operation from a simple farming outpost to a thriving Martian civilization.

As you progress, you'll unlock increasingly advanced technologies that transform your humble farming operation into an automated potato empire. Each breakthrough brings new possibilities, from simple automated planters to quantum technologies that push the boundaries of potato science.

## Gameplay Basics

### Resource Management
Your potato farm requires careful management of three essential resources:

- **Water**: Essential for potato growth. Initially obtained by melting ice, but later upgrades will allow direct water generation and more efficient ice melting.
- **Ice**: Your primary source of water in the early game. Explore the Martian surface to find ice deposits and use various technologies to melt it efficiently.
- **Nutrients**: Required for planting potatoes. Gather these through surface exploration and later through automated systems.

### Planting and Growing
1. Each potato requires both water and nutrients to plant
2. Growth takes time - watch the percentage indicator
3. Harvest potatoes when they reach 100% growth
4. Harvested potatoes can be used to purchase upgrades

### Resource Generation
- **Early Game**: Manually explore Mars and melt ice
- **Mid Game**: Use automated systems like the Ice Melting Basin
- **Late Game**: Access advanced technologies for direct resource generation

## Game Progression

### Early Game - Manual Operations
The initial phase requires hands-on management:
- Manually explore the Martian surface for resources
- Plant and harvest potatoes one at a time
- Melt ice manually to generate water
- Save potatoes to purchase your first automation upgrades

### Mid Game - Basic Automation
As you acquire upgrades, operations become more automated:
- Autonomous rovers handle planting and harvesting
- Ice Melting Basin provides steady water supply
- Resource gathering becomes more efficient
- Focus shifts to managing your automated systems

### Late Game - Full Automation
Eventually, your colony becomes largely self-sustaining:
- Advanced technologies generate resources automatically
- Quantum systems dramatically increase efficiency
- Multiple automation systems work together
- Focus on optimization and expansion

The game transitions naturally from active management to strategic oversight as you unlock more advanced technologies. While the early game may feel hands-on, patience and smart upgrade choices will lead to a thriving automated colony.

## Core Mechanics

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
- Experiment with different upgrade combinations

## Upgrade System

### Technology Tree
Your colony's advancement is driven by milestone-based upgrades:
- Each upgrade unlocks new technologies or capabilities
- Higher-tier upgrades become visible as you progress
- Some upgrades require previous technologies to be unlocked
- Costs are displayed in potatoes - plan your harvests accordingly

### Types of Upgrades

#### Automation Upgrades
- **Autonomous Planting Rovers**: Automatically plant new potatoes
  - Can be purchased multiple times to increase efficiency
  - Each rover increases automatic planting rate
- **Autonomous Harvesting Rovers**: Automatically collect mature potatoes
  - Multiple purchases increase collection speed
  - Works alongside manual harvesting

#### Resource Generation
- **Ice Melting Basin**: Basic automated water production
- **Nuclear Ice Melter**: Advanced ice-to-water conversion
- **Subsurface Aquifer Tapper**: Direct water extraction
- **Martian Polar Cap Extractor**: Large-scale ice collection

#### Advanced Technologies
- **Quantum Technologies**: Late-game upgrades for massive efficiency
- **Specialized Equipment**: Unique tools for specific tasks
- **Colony Expansion**: Increase your operation's scale
- **Research Upgrades**: Improve overall efficiency

### Purchasing Strategy
1. Focus on automation upgrades early to reduce manual work
2. Balance resource generation with consumption
3. Save potatoes for important milestone upgrades
4. Consider multiple rover purchases to increase automation speed

Remember that some upgrades are one-time purchases that unlock new capabilities, while others (like rovers) can be bought multiple times for increased efficiency.`;

        console.log('Loading content...');
        
        // Generate navigation first
        this.generateNavigation(markdown);
        
        // Configure marked options for header IDs
        marked.setOptions({
            headerIds: true,
            gfm: true
        });
        
        // Convert markdown to HTML using marked.parse()
        console.log('Converting markdown to HTML...');
        const htmlContent = marked.parse(markdown);
        
        // Add custom classes to elements and ensure IDs are preserved
        const styledHtml = htmlContent
            .replace(/<h1/g, '<h1 class="help-title"')
            .replace(/<h2/g, '<h2 class="help-section"')
            .replace(/<h3/g, '<h3 class="help-subsection"')
            .replace(/<ul>/g, '<ul class="help-list">')
            .replace(/<code>/g, '<code class="help-code">');
        
        console.log('Setting innerHTML...');
        this.content.innerHTML = styledHtml;
        
        // Add IDs to headers if they don't have them
        this.content.querySelectorAll('h1, h2, h3').forEach(header => {
            if (!header.id) {
                header.id = header.textContent.toLowerCase().replace(/[^\w]+/g, '-');
            }
            console.log(`Header: ${header.tagName}, id="${header.id}", text="${header.textContent}"`);
        });
        
        // Add click handlers to all navigation links
        this.nav.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            console.log(`Adding click handler for link: ${href}`);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const id = href.substring(1);
                console.log(`Link clicked: ${href}, scrolling to: ${id}`);
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