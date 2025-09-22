// TODO EL SCRIPT DEL INDEX EN UN SOLO ARCHIVO

// 1. Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// 2. Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            document.getElementById('dropdown').checked = false;
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// 3. Animation on scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.c-card, .c-feature');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        // If element is in viewport
        if(position.top < window.innerHeight - 100) {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }
    });
}

// 4. Initialize elements for animation
document.querySelectorAll('.c-card, .c-feature').forEach(element => {
    element.style.opacity = 0;
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
});

// 5. Listen for scroll events
window.addEventListener('scroll', animateOnScroll);

// 6. Initial check when page loads
window.addEventListener('load', animateOnScroll);

// 7. Button redirect
document.querySelector('.voltage-button button').addEventListener('click', function() {
    window.location.href = 'login.html';
});

// 8. También ejecutar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    animateOnScroll();
});