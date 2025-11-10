document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('username');
    const pinInputs = document.querySelectorAll('.pin-input');
    const loginBtn = document.getElementById('loginBtn');
    const notification = document.getElementById('notification');
    const loading = document.getElementById('loading');
    const particlesContainer = document.getElementById('particles');
    const togglePinBtn = document.getElementById('togglePinVisibility');
    const pinError = document.getElementById('pin-error');
    const usernameError = document.getElementById('username-error');
    
    let isPinVisible = false;
    
    // DATOS DEL USUARIO VÁLIDO
    const validUser = {
        name: "Ash Ketchum",
        pin: "1234",
        account: "0987654321",
        balance: 500.00
    };
    
    // CONFIGURACIÓN DE VALIDATE.JS
    const constraints = {
        username: {
            presence: {
                allowEmpty: false,
                message: "es requerido"
            },
            format: {
                pattern: /^Ash Ketchum$/i,
                message: "no válido"
            }
        },
        pin: {
            presence: {
                allowEmpty: false,
                message: "es requerido"
            },
            length: {
                is: 4,
                message: "debe tener exactamente 4 dígitos"
            },
            format: {
                pattern: /^\d+$/,
                message: "solo puede contener números"
            }
        }
    };
    
    // INICIALIZAR DATOS EN LOCALSTORAGE
    function initializeUserData() {
        if (!localStorage.getItem('userData')) {
            const userData = {
                name: validUser.name,
                account: validUser.account,
                balance: validUser.balance,
                transactions: []
            };
            localStorage.setItem('userData', JSON.stringify(userData));
        }
    }
    
    // Función de validación con Validate.js
    function validateCredentials(username, pin) {
        const validationResult = validate({ username: username, pin: pin }, constraints);
        
        if (validationResult) {
            const errors = [];
            if (validationResult.username) {
                validationResult.username.forEach(error => {
                    errors.push("Usuario " + error);
                });
            }
            if (validationResult.pin) {
                validationResult.pin.forEach(error => {
                    errors.push("PIN " + error);
                });
            }
            return errors;
        }
        return [];
    }
    
    // Validar campo de usuario individualmente
    function validateUsernameField() {
        const username = usernameInput.value.trim();
        
        if (username.length > 0) {
            const validation = validate({ username: username }, { username: constraints.username });
            
            if (validation && validation.username) {
                usernameError.textContent = "" + validation.username[0];
                usernameError.style.display = 'block';
                return false;
            } else {
                usernameError.style.display = 'none';
                return true;
            }
        } else {
            usernameError.style.display = 'none';
            return false;
        }
    }
    
    // Función para validar el campo PIN
    function validatePinField() {
        let enteredPIN = '';
        pinInputs.forEach(input => {
            enteredPIN += input.value;
        });
        
        if (enteredPIN.length > 0) {
            const validation = validate({ pin: enteredPIN }, { pin: constraints.pin });
            
            if (validation && validation.pin) {
                pinError.textContent = "PIN " + validation.pin[0];
                pinError.style.display = 'block';
                return false;
            } else {
                pinError.style.display = 'none';
                return true;
            }
        } else {
            pinError.style.display = 'none';
            return false;
        }
    }
    
    // Crear partículas de fondo
    createParticles();
    
    // Inicializar datos del usuario
    initializeUserData();
    
    // Validar campo de usuario en tiempo real
    usernameInput.addEventListener('input', function() {
        validateUsernameField();
        checkFormComplete();
    });
    
    usernameInput.addEventListener('blur', function() {
        validateUsernameField();
    });
    
    // Manejar el auto-tabbing entre inputs de PIN
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value && !/^\d$/.test(this.value)) {
                this.value = '';
                this.classList.add('invalid');
                validatePinField();
                return;
            }
            
            if (this.value.length === 1 && index < pinInputs.length - 1) {
                pinInputs[index + 1].focus();
            }
            
            validatePinField();
            checkFormComplete();
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                pinInputs[index - 1].focus();
            }
            
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
            
            const validation = validate({ pin: pasteData }, { pin: constraints.pin });
            
            if (!validation || !validation.pin) {
                for (let i = 0; i < 4; i++) {
                    pinInputs[i].value = pasteData[i] || '';
                }
                pinInputs[3].focus();
                validatePinField();
                checkFormComplete();
            } else {
                showNotification("PIN " + validation.pin[0]);
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
    
    // Función para verificar si el formulario está completo y válido
    function checkFormComplete() {
        const username = usernameInput.value.trim();
        let pinComplete = true;
        let enteredPIN = '';
        
        pinInputs.forEach(input => {
            if (input.value === '') {
                pinComplete = false;
            }
            enteredPIN += input.value;
        });
        
        const isUsernameValid = validateUsernameField();
        const isPinValid = validatePinField();
        
        if (username && pinComplete && isUsernameValid && isPinValid) {
            loginBtn.style.opacity = '1';
            loginBtn.disabled = false;
        } else {
            loginBtn.style.opacity = '0.7';
            loginBtn.disabled = true;
        }
    }
    
    // Manejar el intento de login
    loginBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        let enteredPIN = '';
        pinInputs.forEach(input => {
            enteredPIN += input.value;
        });
        
        // Validar credenciales CON VALIDATE.JS
        const validation = validateCredentials(username, enteredPIN);
        
        if (validation.length > 0) {
            showNotification(validation[0]);
            return;
        }
        
        // Verificar si las credenciales son correctas
        if (username.toLowerCase() === validUser.name.toLowerCase() && enteredPIN === validUser.pin) {
            // Mostrar animación de carga
            loading.style.display = 'block';
            loginBtn.disabled = true;
            
            setTimeout(function() {
                loading.style.display = 'none';
                loginBtn.disabled = false;
                
                // USAR SWEETALERT
                Swal.fire({
                    icon: 'success',
                    title: '¡Acceso concedido!',
                    text: `Bienvenido ${validUser.name}`,
                    timer: 2000,
                    showConfirmButton: false,
                    willClose: () => {
                        window.location.href = "Pantalla de acciones.html";
                    }
                });
            }, 1500);
        } else {
            // USAR SWEETALERT PARA ERROR
            Swal.fire({
                icon: 'error',
                title: 'Credenciales incorrectas',
                text: 'El nombre de usuario o PIN no son válidos.',
                confirmButtonText: 'Entendido'
            });
        }
    });
    
    // Función para mostrar notificaciones (fallback)
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
        const colors = ['#FFCC00', '#3B5BB7', '#FFFFFF', '#FF0000'];
        const count = 20;
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            const size = Math.random() * 12 + 3;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            
            const duration = Math.random() * 15 + 8;
            const delay = Math.random() * 3;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    // Enfocar el campo de usuario al cargar la página
    usernameInput.focus();
    
    // Mejorar accesibilidad del teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            usernameInput.value = '';
            pinInputs.forEach(input => input.value = '');
            usernameInput.focus();
            checkFormComplete();
        }
        
        if (e.key === 'Enter' && !loginBtn.disabled) {
            loginBtn.click();
        }
    });
});