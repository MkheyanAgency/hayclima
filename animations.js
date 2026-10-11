// ==================== Ultra Smooth Premium Animations ====================

// Scroll Reveal Animations with Intersection Observer
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

// Create observer for reveal animations
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, observerOptions);

// Observe all reveal elements
document.addEventListener('DOMContentLoaded', () => {
    // Basic reveal elements
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // Fade up elements
    const fadeUpElements = document.querySelectorAll('.reveal-fade-up');
    fadeUpElements.forEach(el => revealObserver.observe(el));

    // Fade left elements
    const fadeLeftElements = document.querySelectorAll('.reveal-fade-left');
    fadeLeftElements.forEach(el => revealObserver.observe(el));

    // Fade right elements
    const fadeRightElements = document.querySelectorAll('.reveal-fade-right');
    fadeRightElements.forEach(el => revealObserver.observe(el));

    // Scale reveal elements
    const scaleElements = document.querySelectorAll('.reveal-scale');
    scaleElements.forEach(el => revealObserver.observe(el));
});

// Parallax Effect on Mouse Movement
document.addEventListener('mousemove', (e) => {
    const parallaxElements = document.querySelectorAll('.parallax');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 10;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        el.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Ripple Click Effect
document.addEventListener('click', (e) => {
    const rippleElements = document.querySelectorAll('.ripple-btn');
    rippleElements.forEach(btn => {
        if (btn.contains(e.target)) {
            createRipple(e, btn);
        }
    });
});

function createRipple(event, button) {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Magnetic Button Effect
const magneticButtons = document.querySelectorAll('.magnetic-btn');

magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const strength = btn.dataset.strength || 20;
        btn.style.transform = `translate(${x * strength / 100}px, ${y * strength / 100}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
    });
});

// Animated Counters
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            const duration = parseInt(counter.dataset.duration) || 2000;
            animateCounter(counter, target, duration);
            counterObserver.unobserve(counter);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// FAQ Accordion Animation
const accordionItems = document.querySelectorAll('.accordion-item');

accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other accordions
            accordionItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Toggle current accordion
            if (!isActive) {
                item.classList.add('active');
            }
        });
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80; // Navbar height
            const targetPosition = target.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Image Zoom Hover Effect
document.querySelectorAll('.img-zoom-hover').forEach(container => {
    const img = container.querySelector('img');
    if (img) {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            img.style.transformOrigin = `${x}% ${y}%`;
        });
    }
});

// GPU Accelerated Animations - Add to elements on scroll
const gpuObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('gpu-accelerated');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.gpu-animate').forEach(el => {
    gpuObserver.observe(el);
});

// Floating Particles Background
function createFloatingParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}%;
            top: ${y}%;
            background: rgba(0, 119, 255, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            position: absolute;
            animation: floatParticle ${duration}s ease-in-out ${delay}s infinite;
            pointer-events: none;
        `;
        
        container.appendChild(particle);
    }
}

// Add particle animation keyframes dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
        }
        25% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
        }
        50% {
            transform: translateY(-40px) translateX(-10px);
            opacity: 0.8;
        }
        75% {
            transform: translateY(-20px) translateX(5px);
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(style);

// Initialize particles on DOM load
document.addEventListener('DOMContentLoaded', createFloatingParticles);

// Smooth Page Transition
window.addEventListener('load', () => {
    document.body.classList.add('page-transition');
});

// Optimized Scroll Handler with requestAnimationFrame
let ticking = false;
const scrollElements = document.querySelectorAll('.scroll-animate');

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrollY = window.pageYOffset;
            
            scrollElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// Lazy Loading Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;
                
                if (src) {
                    img.src = src;
                    img.classList.add('loaded');
                    img.removeAttribute('data-src');
                }
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Performance: Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Use debounced scroll handler for heavy operations
const debouncedScrollHandler = debounce(() => {
    // Heavy scroll operations here
}, 100);

window.addEventListener('scroll', debouncedScrollHandler);

// Touch-friendly hover effects for mobile
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Prevent layout shift with proper image dimensions
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('load', function() {
        this.style.aspectRatio = `${this.naturalWidth} / ${this.naturalHeight}`;
    });
});

console.log('%c Premium HVAC Animations Loaded ', 'background: linear-gradient(135deg, #0077ff 0%, #00aaff 100%); color: white; padding: 10px 20px; border-radius: 5px; font-size: 14px; font-weight: bold;');
