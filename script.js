document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
            // Ensure scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Render Languages and Tools cards if About section is clicked
            if (sectionId === 'about') {
                renderLanguagesAndTools();
            }
            
            // Load blog entries if Blog section is clicked
            if (sectionId === 'blog') {
                loadBlogEntries();
            }
            
            // Animate project items if Projects section is clicked
            if (sectionId === 'projects') {
                animateProjectItems();
            }
            
            // Apply text animations to the current section
            animateSectionText(sectionId);
        });
    });
    document.getElementById('home').style.display = 'block';
    animateSectionText('home');

    // Initialize Particle Network Animation
    var ParticleNetworkAnimation, PNA;
    ParticleNetworkAnimation = PNA = function() {};

    PNA.prototype.init = function(element) {
        this.$el = element;

        this.container = element;
        this.canvas = document.createElement('canvas');
        this.sizeCanvas();
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.particleNetwork = new ParticleNetwork(this);

        this.bindUiActions();

        return this;
    };

    PNA.prototype.bindUiActions = function() {
        window.addEventListener('resize', function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.sizeCanvas();
            this.particleNetwork.createParticles();
        }.bind(this));
    };

    PNA.prototype.sizeCanvas = function() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    };

    var Particle = function(parent, x, y) {
        this.network = parent;
        this.canvas = parent.canvas;
        this.ctx = parent.ctx;
        this.particleColor = returnRandomArrayitem(this.network.options.particleColors);
        this.radius = getLimitedRandom(1.5, 2.5);
        this.opacity = 0;
        this.x = x || Math.random() * this.canvas.width;
        this.y = y || Math.random() * this.canvas.height;
        this.velocity = {
            x: (Math.random() - 0.5) * parent.options.velocity,
            y: (Math.random() - 0.5) * parent.options.velocity
        };
    };

    Particle.prototype.update = function() {
        if (this.opacity < 1) {
            this.opacity += 0.01;
        } else {
            this.opacity = 1;
        }
        // Change direction if outside boundaries
        if (this.x > this.canvas.width + 100 || this.x < -100) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.y > this.canvas.height + 100 || this.y < -100) {
            this.velocity.y = -this.velocity.y;
        }

        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    };

    Particle.prototype.draw = function() {
        // Draw particle
        this.ctx.beginPath();
        this.ctx.fillStyle = this.particleColor;
        this.ctx.globalAlpha = this.opacity;
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    };

    var ParticleNetwork = function(parent) {
        this.options = {
            velocity: 1, // the higher the faster
            density: 15000, // the lower the denser
            netLineDistance: 200,
            netLineColor: '#8C1515', // Changed color
            particleColors: ['#aaa'] // ['#6D4E5C', '#aaa', '#FFC458' ]
        };
        this.canvas = parent.canvas;
        this.ctx = parent.ctx;

        this.init();
    };

    ParticleNetwork.prototype.init = function() {
        // Create particle objects
        this.createParticles(true);

        // Update canvas
        this.animationFrame = requestAnimationFrame(this.update.bind(this));

        this.bindUiActions();
    };

    ParticleNetwork.prototype.createParticles = function(isInitial) {
        // Initialize / reset particles
        var me = this;
        this.particles = [];
        var quantity = this.canvas.width * this.canvas.height / this.options.density;

        if (isInitial) {
            var counter = 0;
            clearInterval(this.createIntervalId);
            this.createIntervalId = setInterval(function() {
                if (counter < quantity - 1) {
                    // Create particle object
                    this.particles.push(new Particle(this));
                }
                else {
                    clearInterval(me.createIntervalId);
                }
                counter++;
            }.bind(this), 250);
        }
        else {
            // Create particle objects
            for (var i = 0; i < quantity; i++) {
                this.particles.push(new Particle(this));
            }
        }
    };

    ParticleNetwork.prototype.createInteractionParticle = function() {
        // Add interaction particle
        this.interactionParticle = new Particle(this);
        this.interactionParticle.velocity = {
            x: 0,
            y: 0
        };
        this.particles.push(this.interactionParticle);
        return this.interactionParticle;
    };

    ParticleNetwork.prototype.removeInteractionParticle = function() {
        // Find it
        var index = this.particles.indexOf(this.interactionParticle);
        if (index > -1) {
            // Remove it
            this.interactionParticle = undefined;
            this.particles.splice(index, 1);
        }
    };

    ParticleNetwork.prototype.update = function() {
        if (this.canvas) {

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;

            // Draw connections
            for (var i = 0; i < this.particles.length; i++) {
                for (var j = this.particles.length - 1; j > i; j--) {
                    var distance, p1 = this.particles[i], p2 = this.particles[j];

                    // Check if the two points are close enough
                    distance = Math.min(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
                    if (distance > this.options.netLineDistance) {
                        continue;
                    }

                    // Measure precise distance
                    distance = Math.sqrt(
                        Math.pow(p1.x - p2.x, 2) +
                        Math.pow(p1.y - p2.y, 2)
                    );
                    if (distance > this.options.netLineDistance) {
                        continue;
                    }

                    this.ctx.beginPath();
                    this.ctx.strokeStyle = this.options.netLineColor;
                    this.ctx.globalAlpha = (this.options.netLineDistance - distance) / this.options.netLineDistance * p1.opacity * p2.opacity;
                    this.ctx.lineWidth = 0.7;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }

            // Draw particles
            for (var i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
                this.particles[i].draw();
            }

            if (this.options.velocity !== 0) {
                this.animationFrame = requestAnimationFrame(this.update.bind(this));
            }

        }
        else {
            cancelAnimationFrame(this.animationFrame);
        }
    };

    ParticleNetwork.prototype.bindUiActions = function() {
        // Mouse / touch event handling
        this.spawnQuantity = 3;
        this.mouseIsDown = false;
        this.touchIsMoving = false;

        this.onMouseMove = function(e) {
            if (!this.interactionParticle) {
                this.createInteractionParticle();
            }
            this.interactionParticle.x = e.offsetX;
            this.interactionParticle.y = e.offsetY;
        }.bind(this);

        this.onTouchMove = function(e) {
            e.preventDefault();
            this.touchIsMoving = true;
            if (!this.interactionParticle) {
                this.createInteractionParticle();
            }
            this.interactionParticle.x = e.changedTouches[0].clientX;
            this.interactionParticle.y = e.changedTouches[0].clientY;
        }.bind(this);

        this.onMouseDown = function(e) {
            this.mouseIsDown = true;
            var counter = 0;
            var quantity = this.spawnQuantity;
            var intervalId = setInterval(function() {
                if (this.mouseIsDown) {
                    if (counter === 1) {
                        quantity = 1;
                    }
                    for (var i = 0; i < quantity; i++) {
                        if (this.interactionParticle) {
                            this.particles.push(new Particle(this, this.interactionParticle.x, this.interactionParticle.y));
                        }
                    }
                }
                else {
                    clearInterval(intervalId);
                }
                counter++;
            }.bind(this), 50);
        }.bind(this);

        this.onTouchStart = function(e) {
            e.preventDefault();
            setTimeout(function() {
                if (!this.touchIsMoving) {
                    for (var i = 0; i < this.spawnQuantity; i++) {
                        this.particles.push(new Particle(this, e.changedTouches[0].clientX, e.changedTouches[0].clientY));
                    }
                }
            }.bind(this), 200);
        }.bind(this);

        this.onMouseUp = function(e) {
            this.mouseIsDown = false;
        }.bind(this);

        this.onMouseOut = function(e) {
            this.removeInteractionParticle();
        }.bind(this);

        this.onTouchEnd = function(e) {
            e.preventDefault();
            this.touchIsMoving = false;
            this.removeInteractionParticle();
        }.bind(this);

        this.canvas.addEventListener('mousemove', this.onMouseMove);
        this.canvas.addEventListener('touchmove', this.onTouchMove);
        this.canvas.addEventListener('mousedown', this.onMouseDown);
        this.canvas.addEventListener('touchstart', this.onTouchStart);
        this.canvas.addEventListener('mouseup', this.onMouseUp);
        this.canvas.addEventListener('mouseout', this.onMouseOut);
        this.canvas.addEventListener('touchend', this.onTouchEnd);
    };

    ParticleNetwork.prototype.unbindUiActions = function() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.onMouseMove);
            this.canvas.removeEventListener('touchmove', this.onTouchMove);
            this.canvas.removeEventListener('mousedown', this.onMouseDown);
            this.canvas.removeEventListener('touchstart', this.onTouchStart);
            this.canvas.removeEventListener('mouseup', this.onMouseUp);
            this.canvas.removeEventListener('mouseout', this.onMouseOut);
            this.canvas.removeEventListener('touchend', this.onTouchEnd);
        }
    };

    var getLimitedRandom = function(min, max, roundToInteger) {
        var number = Math.random() * (max - min) + min;
        if (roundToInteger) {
            number = Math.round(number);
        }
        return number;
    };

    var returnRandomArrayitem = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    const themeCheckbox = document.querySelector('.theme-checkbox');
    themeCheckbox.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
    });

    // Check local storage for theme preference
    try {
        if (localStorage.getItem('theme') === 'light') {
            themeCheckbox.checked = true;
            document.body.classList.add('light-mode');
        } else {
            themeCheckbox.checked = false;
            document.body.classList.remove('light-mode');
        }
    } catch (e) {
        console.warn('Unable to access localStorage:', e);
        themeCheckbox.checked = false;
        document.body.classList.remove('light-mode');
    }

    themeCheckbox.addEventListener('change', function() {
        try {
            if (this.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            }
        } catch (e) {
            console.warn('Unable to access localStorage:', e);
        }
    });

    // Hide loading screen after 3 seconds with fade transition
    setTimeout(function() {
        const loadingScreen = document.querySelector('.loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 1000); // Match the transition duration
    }, 3000);

    var pna = new ParticleNetworkAnimation();
    pna.init(document.querySelector('.particle-network-animation'));

    function renderLanguagesAndTools() {
        const toolsContainer = document.querySelector('#about .tools-container');
        toolsContainer.innerHTML = ''; // Clear existing content
        const icons = [
            'anaconda', 'androidstudio', 'apple', 'arduino', 'aws', 'azure', 'bash', 'blender', 'c', 'cpp', 
            'cloudflare', 'css', 'discord', 'docker', 'elasticsearch', 'firebase', 'flask', 'gcp', 'git', 
            'github', 'githubactions', 'gitlab', 'gmail', 'godot', 'html', 'instagram', 'java', 'js', 'kali', 
            'latex', 'linkedin', 'linux', 'md', 'matlab', 'mint', 'mongodb', 'mysql', 'nodejs', 'obsidian', 
            'opencv', 'powershell', 'py', 'pytorch', 'raspberrypi', 'replit', 'stackoverflow', 'sublime', 
            'tensorflow', 'ubuntu', 'unity', 'unreal', 'vim', 'visualstudio', 'vscode', 'windows', 'wordpress'
        ];

        icons.forEach((icon, index) => {
            const img = document.createElement('img');
            img.src = `https://skillicons.dev/icons?i=${icon}`;
            img.style.opacity = 0;
            img.style.transition = 'opacity 0.5s ease-in-out';
            img.style.margin = '5px'; // Add margin for compact layout
            toolsContainer.appendChild(img);

            setTimeout(() => {
                img.style.opacity = 1;
            }, index * 200); // Slightly faster rendering
        });
    }

    // Blog functionality
    let blogEntriesCache = [];
    let currentBlogEntry = null;

    function loadBlogEntries() {
        const blogContent = document.querySelector('.blog-entry');
        const blogGrid = document.querySelector('.blog-grid');
        const blogLoading = document.querySelector('.blog-loading');
        
        // Show loading spinner
        blogLoading.style.display = 'flex';
        blogContent.innerHTML = '';
        blogGrid.innerHTML = '';
        
        // If we already have cached entries, use them
        if (blogEntriesCache.length > 0) {
            renderBlogGrid(blogEntriesCache);
            blogLoading.style.display = 'none';
            return;
        }
        
        // For demo purposes, fetch both entry0.md and entry1.md
        const entries = [
            { id: 'entry0', path: 'blog/entry0.md' },
            { id: 'entry1', path: 'blog/entry1.md' }
        ];
        
        // Debug logs to help identify issues
        console.log('Loading blog entries:', entries);
        
        // Create promises for each file to fetch titles
        const titlePromises = entries.map(entry => 
            fetch(entry.path)
                .then(response => {
                    console.log(`Fetched ${entry.path}, status: ${response.status}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${entry.path}: ${response.status}`);
                    }
                    return response.text();
                })
                .then(markdown => {
                    console.log(`Parsed markdown from ${entry.path}`, markdown.substring(0, 50) + '...');
                    // Remove comment line if present in the markdown file
                    markdown = markdown.replace(/\/\/ filepath:.+?\n/, '');
                    
                    // Extract title from markdown (first h1 or h2)
                    const titleMatch = markdown.match(/^#\s+(.*?)$|^##\s+(.*?)$/m);
                    const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : 'Untitled Post';
                    
                    // Return enhanced entry with title and content
                    return {
                        ...entry,
                        title: title,
                        content: markdown
                    };
                })
                .catch(error => {
                    console.error(`Error fetching ${entry.path}:`, error);
                    return {
                        ...entry,
                        title: 'Error Loading Post',
                        error: true
                    };
                })
        );
        
        // When all promises are resolved, render the grid
        Promise.all(titlePromises)
            .then(enhancedEntries => {
                console.log('All blog entries loaded:', enhancedEntries);
                blogEntriesCache = enhancedEntries;
                renderBlogGrid(enhancedEntries);
                blogLoading.style.display = 'none';
            })
            .catch(error => {
                console.error('Error loading blog entries:', error);
                blogLoading.style.display = 'none';
                blogGrid.innerHTML = '<div class="blog-error">Failed to load blog entries. Please try again later.</div>';
            });
    }

    function renderBlogGrid(entries) {
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.innerHTML = '';
        
        entries.forEach((entry, index) => {
            // Create blog card
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.dataset.entryId = entry.id;
            card.dataset.entryPath = entry.path;
            
            // Add hover animation elements
            card.innerHTML = `
                <div class="blog-card-background"></div>
                <div class="blog-card-content">
                    <h3>${entry.title}</h3>
                    <div class="blog-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 6V18M6 12H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            `;
            
            // Add click event
            card.addEventListener('click', function() {
                // Reset all cards
                document.querySelectorAll('.blog-card').forEach(c => 
                    c.classList.remove('active')
                );
                
                // Set this card as active
                this.classList.add('active');
                
                // Load content
                loadBlogContent(this.dataset.entryPath);
                currentBlogEntry = this.dataset.entryId;
                
                // Scroll to content
                document.querySelector('.blog-content').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
            
            blogGrid.appendChild(card);
            
            // Staggered entrance animation
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 100);
        });
        
        // Display welcome message instead of loading the first post
        showBlogWelcomeMessage();
    }

    // Add a new function to show welcome message
    function showBlogWelcomeMessage() {
        const blogContent = document.querySelector('.blog-entry');
        const blogLoading = document.querySelector('.blog-loading');
        
        // Hide loading spinner
        blogLoading.style.display = 'none';
        
        // Show welcome message
        blogContent.innerHTML = `
            <div class="blog-welcome">
                <h3>Welcome to My Blog</h3>
                <p>Select a blog post from the cards above to read its content.</p>
            </div>
        `;
        
        // Set initial opacity and transform for animation
        blogContent.style.opacity = '0';
        blogContent.style.transform = 'translateY(20px)';
        
        // Trigger animation
        setTimeout(() => {
            blogContent.style.opacity = '1';
            blogContent.style.transform = 'translateY(0)';
        }, 50);
    }

    function loadBlogContent(entry) {
        const blogContent = document.querySelector('.blog-entry');
        const blogLoading = document.querySelector('.blog-loading');
        
        // Show loading spinner
        blogLoading.style.display = 'flex';
        blogContent.innerHTML = '';
        
        // If we have the content cached, use it directly
        const cachedEntry = blogEntriesCache.find(e => e.path === entry || e.id === entry);
        if (cachedEntry && cachedEntry.content) {
            console.log('Using cached content for:', entry);
            renderBlogContent(cachedEntry.content);
            return;
        }
        
        // Otherwise fetch the file
        console.log('Fetching blog content from:', entry);
        fetch(entry)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${entry}: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                // Remove comment line if present in the markdown file
                markdown = markdown.replace(/\/\/ filepath:.+?\n/, '');
                renderBlogContent(markdown);
            })
            .catch(error => {
                console.error('Error loading blog content:', error);
                blogLoading.style.display = 'none';
                blogContent.innerHTML = '<div class="blog-error">Sorry, there was an error loading the blog post. Please try again later.</div>';
            });
    }

    function renderBlogContent(markdown) {
        const blogContent = document.querySelector('.blog-entry');
        const blogLoading = document.querySelector('.blog-loading');
        
        try {
            // Make sure marked is available
            if (typeof marked === 'undefined') {
                throw new Error('Markdown parser (marked) is not loaded');
            }
            
            // Convert markdown to HTML
            const html = marked.parse(markdown);
            console.log('Parsed HTML:', html.substring(0, 50) + '...');
            
            // Hide loading spinner
            blogLoading.style.display = 'none';
            
            // Add content with animation
            blogContent.innerHTML = html;
            blogContent.style.opacity = '0';
            blogContent.style.transform = 'translateY(20px)';
            
            // Trigger animation
            setTimeout(() => {
                blogContent.style.opacity = '1';
                blogContent.style.transform = 'translateY(0)';
            }, 50);
        } catch (error) {
            console.error('Error rendering blog content:', error);
            blogLoading.style.display = 'none';
            blogContent.innerHTML = '<div class="blog-error">Error rendering blog content. Please try again later.</div>';
        }
    }

    function animateProjectItems() {
        const projectItems = document.querySelectorAll('#projects li');
        projectItems.forEach((item, index) => {
            // Reset any previous animations
            item.style.opacity = 0;
            item.style.transform = 'translateY(20px)';
            
            // Apply staggered animation
            setTimeout(() => {
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                item.style.opacity = 1;
                item.style.transform = 'translateY(0)';
            }, 100 * index);
            
            // Create project type indicators
            const projectLinks = item.querySelectorAll('a');
            projectLinks.forEach(link => {
                if (!link.querySelector('.project-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'project-link-icon';
                    
                    // Determine icon based on link text/href
                    if (link.textContent.toLowerCase().includes('github')) {
                        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 0.297C5.37 0.297 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.297 12 0.297Z" fill="currentColor"></path></svg>';
                    } else if (link.textContent.toLowerCase().includes('demo') || link.href.includes('github.io')) {
                        icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"></path></svg>';
                    }
                    
                    // Add icon before the link text
                    link.prepend(icon);
                    
                    // Add animation to the icon
                    setTimeout(() => {
                        icon.style.opacity = 1;
                        icon.style.transform = 'scale(1)';
                    }, 300 * index + 200);
                }
            });
        });
        
        // Animate the project section header
        const projectHeader = document.querySelector('#projects h2');
        if (projectHeader) {
            projectHeader.classList.add('animated-header');
        }
    }
    
    function animateSectionText(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        // Animate headings
        const headings = section.querySelectorAll('h2, h3, h4');
        headings.forEach((heading, index) => {
            heading.classList.add('animated-text');
            heading.style.animationDelay = `${index * 0.1}s`;
        });
        
        // Animate paragraphs
        const paragraphs = section.querySelectorAll('p');
        paragraphs.forEach((paragraph, index) => {
            paragraph.classList.add('fade-in-text');
            paragraph.style.animationDelay = `${index * 0.15 + 0.2}s`;
        });
        
        // Animate list items (except project items which have custom animation)
        if (sectionId !== 'projects') {
            const listItems = section.querySelectorAll('li');
            listItems.forEach((item, index) => {
                item.classList.add('slide-in-text');
                item.style.animationDelay = `${index * 0.1 + 0.3}s`;
            });
        }
    }
});
