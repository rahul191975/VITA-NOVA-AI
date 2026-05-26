// ============================================
// AI Healthy Diet Planner & Smart Grocery Scanner
// JavaScript Interactivity
// ============================================

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initLoadingScreen();
    initNavigation();
    initFileUpload();
    initScanner();
    initChatbot();
    initAnimatedCounters();
    initSectionAnimations();
    initSmoothScroll();
    initFeatureCards();
    initDietForm();
    initUnifiedAnalyzer();
});

// ============================================
// Loading Screen
// ============================================
function initLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Hide loading screen after 2.5 seconds
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2500);
}

// ============================================
// Navigation
// ============================================
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// ============================================
// Smooth Scroll
// ============================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// Document & Product Scan Animation Utilities
// ============================================

function runDocScanAnimation(progressElementId, fillElementId, stepsPrefix, onComplete) {
    const progressText = document.getElementById(progressElementId);
    const progressFill = document.getElementById(fillElementId);
    
    // Reset all steps
    const step1 = document.getElementById(`${stepsPrefix}Step1`);
    const step2 = document.getElementById(`${stepsPrefix}Step2`);
    const step3 = document.getElementById(`${stepsPrefix}Step3`);
    const step4 = document.getElementById(`${stepsPrefix}Step4`);
    
    const steps = [step1, step2, step3, step4];
    steps.forEach(step => {
        if (step) {
            step.className = 'pending';
            const icon = step.querySelector('i');
            if (icon) icon.className = 'far fa-circle';
        }
    });
    
    let percent = 0;
    if (progressText) progressText.textContent = '0%';
    if (progressFill) progressFill.style.width = '0%';
    
    const interval = setInterval(() => {
        percent += 2; // Increment by 2%
        if (percent > 100) percent = 100;
        
        if (progressText) progressText.textContent = `${percent}%`;
        if (progressFill) progressFill.style.width = `${percent}%`;
        
        // Update steps based on progress
        if (percent >= 5 && percent < 30) {
            setStepActive(step1);
        } else if (percent >= 30 && percent < 60) {
            setStepCompleted(step1);
            setStepActive(step2);
        } else if (percent >= 60 && percent < 85) {
            setStepCompleted(step2);
            setStepActive(step3);
        } else if (percent >= 85 && percent < 100) {
            setStepCompleted(step3);
            setStepActive(step4);
        } else if (percent === 100) {
            setStepCompleted(step4);
            clearInterval(interval);
            setTimeout(() => {
                onComplete();
            }, 300);
        }
    }, 50); // Takes 2.5 seconds total
    
    function setStepActive(step) {
        if (step && step.className !== 'active') {
            step.className = 'active';
            const icon = step.querySelector('i');
            if (icon) icon.className = 'fas fa-circle-notch fa-spin-slow';
        }
    }
    
    function setStepCompleted(step) {
        if (step && step.className !== 'completed') {
            step.className = 'completed';
            const icon = step.querySelector('i');
            if (icon) icon.className = 'fas fa-check-circle';
        }
    }
}

// ============================================
// File Upload Functionality
// ============================================
function initFileUpload() {
    const uploadBox = document.getElementById('uploadBox');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const filePreview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingAnimation = document.getElementById('loadingAnimation');
    const resultCard = document.getElementById('resultCard');
    const uploadContent = document.querySelector('.upload-content');
    
    // Browse button click
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Upload box click
    uploadBox.addEventListener('click', (e) => {
        if (e.target !== browseBtn && e.target !== removeFile && !filePreview.contains(e.target)) {
            fileInput.click();
        }
    });
    
    // File input change
    let currentFile = null;

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentFile = file;
            showFilePreview(file);
        }
    });
    
    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = '#B48CC7';
        uploadBox.style.background = 'rgba(255, 203, 164, 0.25)';
    });
    
    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'rgba(180, 140, 199, 0.28)';
        uploadBox.style.background = 'var(--card-bg)';
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'rgba(180, 140, 199, 0.28)';
        uploadBox.style.background = 'var(--card-bg)';
        
        const file = e.dataTransfer.files[0];
        if (file) {
            currentFile = file;
            showFilePreview(file);
        }
    });
    
    // Show file preview
    function showFilePreview(file) {
        fileName.textContent = file.name;
        uploadContent.style.display = 'none';
        filePreview.style.display = 'flex';
    }
    
    // Remove file
    removeFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        currentFile = null;
        uploadContent.style.display = 'block';
        filePreview.style.display = 'none';
        resultCard.style.display = 'none';
    });
    
    // Analyze button
    analyzeBtn.addEventListener('click', () => {
        if (currentFile) {
            // Show loading animation
            loadingAnimation.style.display = 'block';
            resultCard.style.display = 'none';
            
            // Start both the API call and the scanning animation
            let apiResult = null;
            let apiError = null;
            
            const apiPromise = FeatureIntegration.medicalReport(currentFile)
                .then(res => {
                    if (!res || !res.data) throw new Error("No analysis data returned");
                    apiResult = res.data;
                })
                .catch(err => { apiError = err; });
                
            runDocScanAnimation('docScanPercent', 'docScanProgressFill', 'report', () => {
                checkAndShowResults();
            });
            
            function checkAndShowResults() {
                if (apiError) {
                    loadingAnimation.style.display = 'none';
                    alert('Analysis failed: ' + apiError.message);
                } else if (apiResult) {
                    loadingAnimation.style.display = 'none';
                    displayReportAnalysis(apiResult);
                    resultCard.style.display = 'block';
                    resultCard.style.animation = 'slideIn 0.5s ease';
                    
                    if (apiResult.dietPlan || apiResult.diet_plan) {
                        displayDietPlan(apiResult.dietPlan || apiResult.diet_plan);
                        const dietSection = document.getElementById('diet');
                        if (dietSection) {
                            dietSection.scrollIntoView({ behavior: 'smooth' });
                        }
                    }
                } else {
                    // API is still loading, wait a bit and check again
                    setTimeout(checkAndShowResults, 100);
                }
            }
        } else {
            alert('Please upload a file first');
        }
    });
}

// ============================================
// Centralized Grocery Scanner System
// ============================================
const ScannerSystem = {
    scanDuration: 2500, // Sync with our premium scanning duration

    products: [
        {
            name: 'Organic Whole Grain Cereal',
            brand: 'HealthFirst',
            score: 85,
            calories: 150,
            protein: '8g',
            carbs: '25g',
            fiber: '5g',
            sugar: '3g',
            fat: '2g',
            verdict: 'This product is high in fiber and protein, making it a healthy choice for your diet.'
        },
        {
            name: 'Fruit Juice Cocktail',
            brand: 'SweetLife',
            score: 35,
            calories: 120,
            protein: '0g',
            carbs: '30g',
            fiber: '0g',
            sugar: '28g',
            fat: '0g',
            verdict: 'This product contains high sugar content with minimal nutritional value. Consider alternatives.'
        },
        {
            name: 'Greek Yogurt',
            brand: 'ProDairy',
            score: 78,
            calories: 100,
            protein: '15g',
            carbs: '8g',
            fiber: '0g',
            sugar: '6g',
            fat: '4g',
            verdict: 'Excellent source of protein with moderate sugar. Great for breakfast or snacks.'
        },
        {
            name: 'Potato Chips',
            brand: 'Crunchy',
            score: 25,
            calories: 160,
            protein: '2g',
            carbs: '15g',
            fiber: '1g',
            sugar: '0g',
            fat: '10g',
            verdict: 'High in unhealthy fats and sodium. Limit consumption for better health.'
        }
    ],

    elements: {},
    stream: null,
    isScanning: false,

    init() {
        this.elements = {
            scanBtn: document.getElementById('scanBtn'),
            uploadProductBtn: document.getElementById('uploadProductBtn'),
            productAnalysis: document.getElementById('productAnalysis'),
            scannerFrame: document.querySelector('.scanner-frame'),
            productName: document.querySelector('.product-info h3'),
            productBrand: document.querySelector('.product-info p'),
            nutritionItems: document.querySelectorAll('.nutrition-item'),
            verdictText: document.querySelector('.product-verdict p'),
            scoreCircle: document.querySelector('.score-circle'),
            scoreValue: document.querySelector('.score-value'),
            scoreLabel: document.querySelector('.score-label'),
            verdictBadge: document.querySelector('.verdict-badge')
        };

        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.accept = 'image/*';
        this.fileInput.hidden = true;
        document.body.appendChild(this.fileInput);

        this.elements.scanBtn.addEventListener('click', () => this.scan());
        this.elements.uploadProductBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
    },

    async scan() {
        if (this.isScanning) return;
        this.isScanning = true;
        
        const video = document.getElementById('cameraFeed');
        const canvas = document.getElementById('cameraCanvas');
        const scanBtn = this.elements.scanBtn;
        
        if (!this.stream) {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = this.stream;
                video.style.display = 'block';
                scanBtn.innerHTML = '<i class="fas fa-camera"></i> Capture Image';
                this.isScanning = false;
                return;
            } catch (err) {
                console.warn("Camera access denied or unavailable, running client-side simulation:", err);
                alert("Camera access denied or unavailable. Simulating a product scan instead...");
                
                // Draw a beautiful circular scanner target on canvas for simulation
                const prod = this.getRandomProduct();
                const productData = {
                    name: prod.name,
                    calories: prod.calories,
                    protein: parseInt(prod.protein) || 5,
                    sugar: parseInt(prod.sugar) || 2,
                    fiber: parseInt(prod.fiber) || 3,
                    sodium: 150,
                    carbs: parseInt(prod.carbs) || 20,
                    fat: parseInt(prod.fat) || 2
                };
                
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                const grad = ctx.createLinearGradient(0, 0, 400, 400);
                grad.addColorStop(0, '#2D0B45');
                grad.addColorStop(1, '#B48CC7');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 400, 400);
                ctx.strokeStyle = 'rgba(255, 203, 164, 0.7)';
                ctx.lineWidth = 4;
                ctx.strokeRect(60, 60, 280, 280);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(prod.name, 200, 190);
                ctx.font = '14px sans-serif';
                ctx.fillStyle = '#FFCBA4';
                ctx.fillText("SIMULATION MODE", 200, 230);
                const imageSrc = canvas.toDataURL('image/jpeg');
                
                const apiPromise = analyzeProduct(productData);
                
                this.runScanAnimation(imageSrc, apiPromise, () => {
                    this.showResults();
                    this.isScanning = false;
                });
                return;
            }
        }
        
        // Capture frame
        scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const imageSrc = canvas.toDataURL('image/jpeg');
        
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
            
            // Stop stream
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            video.style.display = 'none';
            scanBtn.innerHTML = '<i class="fas fa-camera"></i> Scan Product';
            
            const apiPromise = FeatureIntegration.productScanner(file);
            
            this.runScanAnimation(imageSrc, apiPromise, () => {
                this.showResults();
                this.isScanning = false;
            });
        }, 'image/jpeg');
    },

    runScanAnimation(imageSrc, apiPromise, onComplete) {
        const scannerFrame = this.elements.scannerFrame;
        const previewImg = document.getElementById('scannerPreviewImg');
        const statusText = document.getElementById('scannerHudStatus');
        const percentText = document.getElementById('scannerHudPercent');
        
        // Bounding boxes
        const boxes = [
            scannerFrame.querySelector('.ocr-bounding-box.box-1'),
            scannerFrame.querySelector('.ocr-bounding-box.box-2'),
            scannerFrame.querySelector('.ocr-bounding-box.box-3'),
            scannerFrame.querySelector('.ocr-bounding-box.box-4')
        ];
        
        // Reset bounding boxes
        boxes.forEach(box => {
            if (box) box.classList.remove('active');
        });
        
        if (previewImg && imageSrc) {
            previewImg.src = imageSrc;
            previewImg.style.display = 'block';
        }
        
        scannerFrame.classList.add('scanning');
        
        let percent = 0;
        let animationDone = false;
        let apiDone = false;
        let apiError = null;
        
        apiPromise
            .then((res) => {
                if (!res) throw new Error("No data returned from scan");
                displayProductAnalysis(res);
                apiDone = true;
                checkCompletion();
            })
            .catch(err => {
                apiError = err;
                apiDone = true;
                checkCompletion();
            });
            
        const interval = setInterval(() => {
            percent += 2;
            if (percent > 100) percent = 100;
            
            if (percentText) percentText.textContent = `${percent}%`;
            
            // Update status based on percentage
            if (statusText) {
                if (percent < 25) {
                    statusText.textContent = "INITIALIZING SCAN...";
                } else if (percent >= 25 && percent < 50) {
                    statusText.textContent = "EXTRACTING TEXT...";
                    if (boxes[0]) boxes[0].classList.add('active');
                } else if (percent >= 50 && percent < 75) {
                    statusText.textContent = "IDENTIFYING INGREDIENTS...";
                    if (boxes[1]) boxes[1].classList.add('active');
                    if (boxes[2]) boxes[2].classList.add('active');
                } else if (percent >= 75 && percent < 100) {
                    statusText.textContent = "ANALYZING NUTRITION VALUES...";
                    if (boxes[3]) boxes[3].classList.add('active');
                } else if (percent === 100) {
                    statusText.textContent = "SCAN COMPLETE";
                }
            }
            
            if (percent === 100) {
                clearInterval(interval);
                animationDone = true;
                checkCompletion();
            }
        }, 50); // 2.5s duration
        
        function checkCompletion() {
            if (animationDone && apiDone) {
                scannerFrame.classList.remove('scanning');
                if (previewImg) {
                    previewImg.style.display = 'none';
                    previewImg.src = '';
                }
                boxes.forEach(box => {
                    if (box) box.classList.remove('active');
                });
                
                if (apiError) {
                    alert("Scan failed: " + apiError.message);
                } else {
                    if (onComplete) onComplete();
                }
            }
        }
    },

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.isScanning = true;
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageSrc = e.target.result;
            const apiPromise = FeatureIntegration.productScanner(file);
            
            this.runScanAnimation(imageSrc, apiPromise, () => {
                this.showResults();
                this.isScanning = false;
            });
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    },

    getRandomProduct() {
        return this.products[Math.floor(Math.random() * this.products.length)];
    },

    displayProduct(product) {
        // Fallback or old UI handler - display product analysis is done in displayProductAnalysis now, 
        // but let's keep it here for client compatibility.
        const { productName, productBrand, nutritionItems, verdictText } = this.elements;

        productName.textContent = product.name;
        productBrand.textContent = `Brand: ${product.brand}`;

        const nutritionValues = [
            `${product.calories} kcal`,
            product.protein,
            product.carbs,
            product.fiber,
            product.sugar,
            product.fat
        ];
        nutritionItems.forEach((item, index) => {
            item.querySelector('span:last-child').textContent = nutritionValues[index];
        });

        verdictText.textContent = product.verdict;
        this.updateHealthScore(product.score);
        this.showResults();
    },

    updateHealthScore(score) {
        const { scoreCircle, scoreValue, scoreLabel, verdictBadge } = this.elements;

        scoreValue.textContent = score;
        scoreCircle.classList.remove('green', 'yellow', 'red');

        if (score >= 70) {
            scoreCircle.classList.add('green');
            scoreLabel.textContent = 'Healthy';
            verdictBadge.className = 'verdict-badge success';
            verdictBadge.innerHTML = '<i class="fas fa-check-circle"></i> Recommended';
        } else if (score >= 50) {
            scoreCircle.classList.add('yellow');
            scoreLabel.textContent = 'Moderate';
            verdictBadge.className = 'verdict-badge warning';
            verdictBadge.innerHTML = '<i class="fas fa-exclamation-circle"></i> Consume in Moderation';
        } else {
            scoreCircle.classList.add('red');
            scoreLabel.textContent = 'Risky';
            verdictBadge.className = 'verdict-badge danger';
            verdictBadge.innerHTML = '<i class="fas fa-times-circle"></i> Not Recommended';
        }

        const percentage = (score / 100) * 360;
        const color = score >= 70 ? '#B48CC7' : score >= 50 ? '#f59e0b' : '#ef4444';
        scoreCircle.style.background = `conic-gradient(${color} 0deg, ${color} ${percentage}deg, rgba(180, 140, 199, 0.2) ${percentage}deg)`;
    },

    showResults() {
        const { productAnalysis } = this.elements;
        productAnalysis.classList.add('active');
        productAnalysis.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};

function initScanner() {
    ScannerSystem.init();
}

// ============================================
// Chatbot Functionality
// ============================================
function initChatbot() {
    const chatbotButton = document.getElementById('chatbotButton');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChat = document.getElementById('closeChat');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    // Toggle chatbot window
    chatbotButton.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
    });
    
    // Close chatbot
    closeChat.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });
    
    // Send message
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add user message
            addMessage(message, 'user');
            chatInput.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            try {
                // Feature 3: AI Chatbot API
                const aiResponse = await handleChatMessage(message);
                removeTypingIndicator();
                addMessage(aiResponse, 'ai');
            } catch (e) {
                removeTypingIndicator();
                console.error('Chat error:', e);
                addMessage("Sorry, the AI is temporarily unavailable.", 'ai');
            }
        }
    }
    
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = type === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `<p>${text}</p>`;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typingIndicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(content);
        
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// ============================================
// Animated Counters
// ============================================
function initAnimatedCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => {
        observer.observe(stat);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString() + (target < 100 ? '' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, stepTime);
}

// ============================================
// Section Entrance Animations
// ============================================
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// Hero CTA Button Interactions
// ============================================
const heroButtons = document.querySelectorAll('.hero-buttons .btn');
heroButtons.forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        
        if (buttonText.includes('Get Started')) {
            // Scroll to features section
            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
        } else if (buttonText.includes('Upload Report')) {
            // Scroll to upload section
            document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============================================
// Feature Card Hover Effects
// ============================================
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ============================================
// Meal Card Interactions
// ============================================
const mealCards = document.querySelectorAll('.meal-card');
mealCards.forEach(card => {
    card.addEventListener('click', function() {
        // Add a subtle click animation
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
});

// ============================================
// Testimonial Card Hover Effects
// ============================================
const testimonialCards = document.querySelectorAll('.testimonial-card');
testimonialCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 25px 50px rgba(180, 140, 199, 0.2), 0 12px 30px rgba(255, 203, 164, 0.25)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '';
    });
});

// ============================================
// Parallax Effect for Hero Background
// ============================================
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-bg');
    const scrolled = window.pageYOffset;
    
    if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ============================================
// Console Welcome Message
// ============================================
console.log('%c AI Healthy Diet Planner & Smart Grocery Scanner ', 'background: linear-gradient(135deg, #2D0B45 0%, #FFCBA4 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Built with ❤️ for better health ', 'color: #B48CC7; font-size: 14px;');

// ============================================
// Feature Cards Interactivity
// ============================================
function initFeatureCards() {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const heading = card.querySelector('h3').textContent.trim();
            console.log(`Feature card clicked: ${heading}`);
            
            if (heading === 'AI Diet Plan Generator' || heading === 'Weekly Meal Planner') {
                const target = document.getElementById('diet');
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            } else if (heading === 'Grocery Barcode Scanner' || heading === 'Product OCR Analysis') {
                const target = document.getElementById('scanner');
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            } else if (heading === 'Disease Report Upload' || heading === 'AI Health Analysis') {
                const target = document.getElementById('upload');
                if (target) {
                    const offsetTop = target.offsetTop - 80;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            } else if (heading === 'Indian Food Recommendations') {
                const chatbotWindow = document.getElementById('chatbotWindow');
                const chatInput = document.getElementById('chatInput');
                if (chatbotWindow) {
                    chatbotWindow.classList.add('active');
                }
                if (chatInput) {
                    chatInput.value = "Can you recommend some healthy Indian food adaptations for my diet?";
                    chatInput.focus();
                }
            } else if (heading === 'AI Nutrition Chatbot') {
                const chatbotWindow = document.getElementById('chatbotWindow');
                if (chatbotWindow) {
                    chatbotWindow.classList.add('active');
                }
            }
        });
    });
}

// ============================================
// Diet Plan Form Handler
// ============================================
function initDietForm() {
    const dietForm = document.getElementById('dietPlanForm');
    const loadingAnim = document.getElementById('dietLoadingAnimation');
    const resultDiv = document.getElementById('dietPlanResult');

    if (!dietForm) return;

    dietForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Extract input values
        const ageVal = document.getElementById('dietAge').value;
        const gender = document.getElementById('dietGender').value;
        const weightVal = document.getElementById('dietWeight').value;
        const heightVal = document.getElementById('dietHeight').value;
        const sugarVal = document.getElementById('dietSugar').value;
        
        const age = ageVal ? parseInt(ageVal) : 35;
        const weight = weightVal ? parseFloat(weightVal) : 70;
        const height = heightVal ? parseFloat(heightVal) : 175;
        const bloodSugar = sugarVal ? parseFloat(sugarVal) : null;
        const preference = document.getElementById('dietPreference').value;

        // Calculate BMI: weight / ((height / 100) ** 2)
        const bmi = weight / ((height / 100) ** 2);
        const roundedBmi = parseFloat(bmi.toFixed(1));

        // Create health profile payload
        const healthProfile = {
            age: age,
            gender: gender,
            weight: weight,
            height: height,
            bmi: roundedBmi,
            diet_preference: preference,
            dietPreference: preference
        };
        if (bloodSugar !== null) {
            healthProfile.blood_sugar = bloodSugar;
            healthProfile.bloodSugar = bloodSugar;
        }

        // Show loading animation and hide result container
        if (loadingAnim) loadingAnim.style.display = 'block';
        if (resultDiv) resultDiv.style.display = 'none';

        try {
            // Call the backend integration API wrapper
            const response = await generateDietPlanViaBackend(healthProfile);
            
            // Hide loading animation and display result container
            if (loadingAnim) loadingAnim.style.display = 'none';
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.style.animation = 'slideIn 0.5s ease';
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } catch (error) {
            console.error('Diet Plan generation error:', error);
            if (loadingAnim) loadingAnim.style.display = 'none';
            alert('Failed to generate diet plan. Please try again.');
        }
    });
}

// ============================================
// Unified Document Analyzer Form & Interactions
// ============================================
function initUnifiedAnalyzer() {
    const unifiedForm = document.getElementById('unifiedAnalysisForm');
    const unifiedLoading = document.getElementById('unifiedLoading');
    const unifiedResults = document.getElementById('unifiedResults');

    const fileInput = document.getElementById('unifiedFileInput');
    const browseBtn = document.getElementById('unifiedBrowseBtn');
    const uploadBox = document.getElementById('unifiedUploadBox');
    const uploadContent = document.getElementById('unifiedUploadContent');
    const filePreview = document.getElementById('unifiedFilePreview');
    const fileNameText = document.getElementById('unifiedFileName');
    const removeFileBtn = document.getElementById('unifiedRemoveFile');

    let currentFile = null;

    if (!unifiedForm) return;

    // Trigger file selection
    if (browseBtn && fileInput) {
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    if (uploadBox && fileInput) {
        uploadBox.addEventListener('click', (e) => {
            if (e.target !== browseBtn && e.target !== removeFileBtn && !filePreview.contains(e.target)) {
                fileInput.click();
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                currentFile = file;
                showFilePreview(file);
            }
        });
    }

    // Drag and drop events
    if (uploadBox) {
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = '#B48CC7';
            uploadBox.style.background = 'rgba(255, 203, 164, 0.25)';
        });

        uploadBox.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = 'rgba(180, 140, 199, 0.28)';
            uploadBox.style.background = 'var(--card-bg)';
        });

        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.style.borderColor = 'rgba(180, 140, 199, 0.28)';
            uploadBox.style.background = 'var(--card-bg)';

            const file = e.dataTransfer.files[0];
            if (file) {
                currentFile = file;
                showFilePreview(file);
            }
        });
    }

    function showFilePreview(file) {
        if (fileNameText && uploadContent && filePreview) {
            fileNameText.textContent = file.name;
            uploadContent.style.display = 'none';
            filePreview.style.display = 'flex';
        }
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (fileInput) fileInput.value = '';
            currentFile = null;
            if (uploadContent && filePreview) {
                uploadContent.style.display = 'block';
                filePreview.style.display = 'none';
            }
        });
    }

    // Form submission
    unifiedForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Show loading indicator, hide results
        if (unifiedLoading) unifiedLoading.style.display = 'block';
        if (unifiedResults) unifiedResults.style.display = 'none';

        // Gather variables
        const nameVal = document.getElementById('unifiedName').value;
        const ageVal = document.getElementById('unifiedAge').value;
        const genderVal = document.getElementById('unifiedGender').value;
        const weightVal = document.getElementById('unifiedWeight').value;
        const heightVal = document.getElementById('unifiedHeight').value;
        const goalVal = document.getElementById('unifiedGoal').value;
        const conditionsVal = document.getElementById('unifiedConditions').value;
        const dietVal = document.getElementById('unifiedDiet').value;
        const scanTypeVal = document.getElementById('unifiedScanType').value;
        const textDataVal = document.getElementById('unifiedTextData').value;

        const requestData = {
            user_name: nameVal || 'User',
            age: ageVal || 'N/A',
            gender: genderVal || 'N/A',
            weight: weightVal || 'N/A',
            height: heightVal || 'N/A',
            goal: goalVal || 'N/A',
            conditions: conditionsVal || 'N/A',
            diet_type: dietVal || 'N/A',
            scan_type: scanTypeVal || 'product_scan',
            ocr_text_or_json_data: textDataVal || ''
        };

        // Start both the API call and the scanning animation
        let apiResult = null;
        let apiError = null;

        const apiPromise = analyzeDocument(requestData, currentFile)
            .then(res => { apiResult = res; })
            .catch(err => { apiError = err; });

        runDocScanAnimation('unifiedScanPercent', 'unifiedScanProgressFill', 'unified', () => {
            checkAndShowResults();
        });

        function checkAndShowResults() {
            if (apiError) {
                if (unifiedLoading) unifiedLoading.style.display = 'none';
                alert('Unified document analysis failed: ' + apiError.message);
            } else if (apiResult && apiResult.success) {
                if (unifiedLoading) unifiedLoading.style.display = 'none';
                
                // Populate results
                if (unifiedResults) {
                    unifiedResults.style.display = 'block';
                    unifiedResults.style.animation = 'slideIn 0.5s ease';
                }

                // Render Markdown content
                const markdownOutput = document.getElementById('markdownOutput');
                if (markdownOutput) {
                    markdownOutput.innerHTML = renderMarkdownToHtml(apiResult.analysis);
                }

                // Metadata
                const metaText = document.getElementById('unifiedResultMeta');
                if (metaText) {
                    const todayStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                    metaText.textContent = `Analyzed on ${todayStr} | For ${nameVal}`;
                }

                // Confidence gauge
                const confidence = extractConfidenceDetails(apiResult.analysis);
                const percentText = document.getElementById('confidencePercentText');
                const circleIndicator = document.getElementById('confidenceIndicatorCircle');
                const reasonSection = document.getElementById('confidenceReasonSection');
                const reasonContent = document.getElementById('confidenceReasonContent');

                const finalScore = confidence.score !== null ? confidence.score : 80;
                
                if (percentText) percentText.textContent = `${finalScore}%`;
                
                if (circleIndicator) {
                    // Total circumference is 163.36 (radius = 26)
                    const offset = 163.36 * (1 - finalScore / 100);
                    circleIndicator.style.strokeDashoffset = offset;
                }

                if (reasonSection) {
                    if (confidence.reason) {
                        reasonSection.style.display = 'block';
                        if (reasonContent) reasonContent.innerHTML = confidence.reason;
                    } else {
                        reasonSection.style.display = 'none';
                    }
                }

                // Smooth scroll to results
                if (unifiedResults) {
                    unifiedResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

            } else if (apiResult) {
                if (unifiedLoading) unifiedLoading.style.display = 'none';
                alert('Unified document analysis failed: ' + (apiResult.error || 'Unknown error'));
            } else {
                // API is still loading, wait a bit and check again
                setTimeout(checkAndShowResults, 100);
            }
        }
    });
}
