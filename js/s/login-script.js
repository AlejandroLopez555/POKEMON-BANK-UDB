document.addEventListener('DOMContentLoaded', function() {
        const pinInputs = document.querySelectorAll('.pin-input');
        const loginBtn = document.getElementById('loginBtn');
        const notification = document.getElementById('notification');
        const loading = document.getElementById('loading');
        const particlesContainer = document.getElementById('particles');
        const togglePinBtn = document.getElementById('togglePinVisibility');
        const pinError = document.getElementById('pin-error');
        
        let isPinVisible = false;
        
        // Función de validación personalizada (reemplazo de Validate.js)
        function validatePIN(pin) {
            const errors = [];
            
            if (!pin) {
                errors.push("El PIN es requerido");
                return errors;
            }
            
            if (pin.length !== 4) {
                errors.push("debe tener exactamente 4 dígitos");
            }
            
            if (!/^\d+$/.test(pin)) {
                errors.push("solo puede contener números");
            }
            
            return errors;
        }
        
        // Crear partículas de fondo
        createParticles();
        
        // Manejar el auto-tabbing entre inputs de PIN
        pinInputs.forEach((input, index) => {
            input.addEventListener('input', function() {
                // Validar que solo se ingresen números
                if (this.value && !/^\d$/.test(this.value)) {
                    this.value = '';
                    this.classList.add('invalid');
                    validatePinField();
                    return;
                }
                
                if (this.value.length === 1 && index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
                
                // Verificar si todos los campos están llenos
                checkPINComplete();
                validatePinField();
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && this.value === '' && index > 0) {
                    pinInputs[index - 1].focus();
                }
                
                // Permitir navegación con flechas
                if (e.key === 'ArrowLeft' && index > 0) {
                    pinInputs[index - 1].focus();
                }
                if (e.key === 'ArrowRight' && index < pinInputs.length - 1) {
                    pinInputs[index + 1].focus();
                }
            });
            
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pasteData = (e.clipboardData || window.clipboardData).getData('text');
                
                // Validar el PIN pegado
                const validation = validatePIN(pasteData);
                
                if (validation.length === 0) {
                    // El PIN es válido
                    for (let i = 0; i < 4; i++) {
                        pinInputs[i].value = pasteData[i] || '';
                    }
                    pinInputs[3].focus();
                    checkPINComplete();
                    validatePinField();
                } else {
                    // Mostrar error de validación
                    showNotification('PIN ' + validation[0]);
                }
            });
            
            input.addEventListener('blur', function() {
                validatePinField();
            });
        });
        
        // Toggle para mostrar/ocultar PIN
        togglePinBtn.addEventListener('click', function() {
            isPinVisible = !isPinVisible;
            const icon = togglePinBtn.querySelector('i');
            const text = togglePinBtn.querySelector('span');
            
            pinInputs.forEach(input => {
                input.type = isPinVisible ? 'text' : 'password';
            });
            
            if (isPinVisible) {
                icon.className = 'fas fa-eye-slash';
                text.textContent = 'Ocultar PIN';
            } else {
                icon.className = 'fas fa-eye';
                text.textContent = 'Mostrar PIN';
            }
            
            togglePinBtn.setAttribute('aria-label', isPinVisible ? 'Ocultar PIN' : 'Mostrar PIN');
        });
        
        // Función para validar el campo PIN
        function validatePinField() {
            let enteredPIN = '';
            pinInputs.forEach(input => {
                enteredPIN += input.value;
            });
            
            // Solo validar si hay al menos un dígito
            if (enteredPIN.length > 0) {
                const validation = validatePIN(enteredPIN);
                
                if (validation.length > 0) {
                    // Mostrar error
                    pinError.textContent = "" + validation[0];
                    pinError.style.display = 'block';
                    return false;
                } else {
                    // Ocultar error
                    pinError.style.display = 'none';
                    return true;
                }
            } else {
                pinError.style.display = 'none';
                return false;
            }
        }
        
        // Función para verificar si todos los campos de PIN están llenos
        function checkPINComplete() {
            let allFilled = true;
            pinInputs.forEach(input => {
                if (input.value === '') {
                    allFilled = false;
                }
            });
            
            if (allFilled) {
                loginBtn.style.opacity = '1';
                loginBtn.disabled = false;
            } else {
                loginBtn.style.opacity = '0.7';
                loginBtn.disabled = true;
            }
        }
        
        // Manejar el intento de login
        loginBtn.addEventListener('click', function() {
            let enteredPIN = '';
            pinInputs.forEach(input => {
                enteredPIN += input.value;
            });
            
            // Validar el PIN
            const validation = validatePIN(enteredPIN);
            
            if (validation.length > 0) {
                showNotification('PIN ' + validation[0]);
                return;
            }
            
            // Verificar si el PIN es el correcto
            if (enteredPIN === '1996') {
                // Mostrar animación de carga
                loading.style.display = 'block';
                loginBtn.disabled = true;
                
                setTimeout(function() {
                    loading.style.display = 'none';
                    loginBtn.disabled = false;
                    
                    showNotification('¡Acceso concedido! Redirigiendo...', 'success');
                    
                    setTimeout(function() {
                        window.location.href = "Pantalla de acciones.html";
                    }, 2000);
                }, 2000);
            } else {
                showNotification('PIN incorrecto. Intenta de nuevo.');
            }
        });
        
        // Función para mostrar notificaciones
        function showNotification(message, type = 'error') {
            const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
            notification.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i> <span>${message}</span>`;
            
            if (type === 'success') {
                notification.classList.add('success');
            } else {
                notification.classList.remove('success');
            }
            
            notification.classList.add('show');
            
            setTimeout(function() {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Función para crear partículas de fondo
        function createParticles() {
            // Reducir número de partículas para mejor rendimiento
            const colors = ['#FFCC00', '#3B5BB7', '#FFFFFF', '#FF0000'];
            const count = 20;
            
            for (let i = 0; i < count; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // Tamaño aleatorio
                const size = Math.random() * 12 + 3;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Color aleatorio
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                
                // Posición inicial aleatoria
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;
                
                // Duración y delay aleatorios
                const duration = Math.random() * 15 + 8;
                const delay = Math.random() * 3;
                particle.style.animationDuration = `${duration}s`;
                particle.style.animationDelay = `${delay}s`;
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Enfocar el primer campo del PIN al cargar la página
        pinInputs[0].focus();
        
        // Mejorar accesibilidad del teclado
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Limpiar todos los campos al presionar Escape
                pinInputs.forEach(input => input.value = '');
                pinInputs[0].focus();
                checkPINComplete();
                validatePinField();
            }
            
            // Enviar formulario con Enter cuando todos los campos estén llenos
            if (e.key === 'Enter' && !loginBtn.disabled) {
                loginBtn.click();
            }
        });
    });