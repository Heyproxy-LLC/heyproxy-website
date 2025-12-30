"use strict";
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear().toString();
    }
    // Hamburger menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
    // Close menu when clicking a link
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    // Smooth scroll for navigation
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
    // Enhanced nav scroll effect
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
            nav.style.background = 'rgba(0, 0, 0, 0.8)';
            nav.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        }
        else {
            nav.style.background = 'rgba(0, 0, 0, 0.5)';
            nav.style.boxShadow = 'none';
        }
        lastScroll = currentScroll;
    });
    // Parallax effect for gradient orbs
    const orbs = document.querySelectorAll('.gradient-orb');
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        orbs.forEach((orb, index) => {
            const speed = 0.5 + (index * 0.2);
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card');
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
        observer.observe(el);
    });
    // Animated counter for tech stats
    const animateCounter = (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = start;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target.toString() + '+';
                clearInterval(timer);
            }
            else {
                element.textContent = Math.floor(current).toString();
            }
        }, 16);
    };
    // Observer for tech stat cards
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const numberElement = entry.target.querySelector('.tech-stat-number');
                if (numberElement && !numberElement.classList.contains('counted')) {
                    numberElement.classList.add('counted');
                    const target = parseInt(numberElement.getAttribute('data-target') || '0');
                    animateCounter(numberElement, target);
                }
            }
        });
    }, { threshold: 0.5 });
    // Observe tech stat cards
    const techStatCards = document.querySelectorAll('.tech-stat-card');
    techStatCards.forEach(card => statsObserver.observe(card));
    // Add animate-in class styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
    // Magnetic button effect
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');
    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const mouseEvent = e;
            const rect = button.getBoundingClientRect();
            const x = mouseEvent.clientX - rect.left - rect.width / 2;
            const y = mouseEvent.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
});
