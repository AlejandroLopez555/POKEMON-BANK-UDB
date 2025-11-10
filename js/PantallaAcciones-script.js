document.addEventListener('DOMContentLoaded', function() {
    // CARGAR DATOS DEL USUARIO DESDE LOCALSTORAGE
    let userData = JSON.parse(localStorage.getItem('userData')) || {
        name: "Ash Ketchum",
        account: "0987654321",
        balance: 500.00,
        transactions: []
    };

    // ACTUALIZAR LA INTERFAZ CON DATOS REALES
    function updateUserInterface() {
        // Actualizar nombre de usuario
        document.querySelector('.user-info span').textContent = userData.name;
        document.querySelector('.account-owner').innerHTML = `<i class="fas fa-user"></i> ${userData.name}`;
        
        // Actualizar número de cuenta
        document.querySelector('.account-number').innerHTML = `<i class="fas fa-credit-card"></i> No. ${userData.account}`;
        
        // Actualizar saldo en todos los lugares
        const balanceElements = [
            document.querySelector('.balance-amount'),
            document.querySelector('#balanceModal .modal-body div:nth-child(2)'),
            document.querySelector('#withdrawForm .form-text')
        ];
        
        balanceElements.forEach(element => {
            if (element) {
                if (element.classList.contains('balance-amount')) {
                    element.textContent = `$${userData.balance.toFixed(2)}`;
                } else if (element.classList.contains('form-text')) {
                    element.textContent = `Saldo disponible: $${userData.balance.toFixed(2)}`;
                } else {
                    element.textContent = `$${userData.balance.toFixed(2)}`;
                }
            }
        });

        // Actualizar historial de transacciones
        updateTransactionHistory();
    }

    // FUNCIÓN PARA REGISTRAR TRANSACCIONES
    function registerTransaction(type, amount, method, description = '') {
        const transaction = {
            id: Date.now(),
            type: type, // 'deposit', 'withdraw', 'payment'
            amount: parseFloat(amount),
            method: method,
            description: description,
            date: new Date().toLocaleString('es-ES'),
            balanceAfter: userData.balance
        };
        
        userData.transactions.unshift(transaction); // Agregar al inicio
        localStorage.setItem('userData', JSON.stringify(userData));
        
        return transaction;
    }

    // ACTUALIZAR HISTORIAL DE TRANSACCIONES EN LA INTERFAZ
    function updateTransactionHistory() {
        const transactionHistory = document.querySelector('.transaction-history');
        if (!transactionHistory) return;

        // Limpiar historial existente
        transactionHistory.innerHTML = '';

        // Mostrar últimas 5 transacciones
        const recentTransactions = userData.transactions.slice(0, 5);
        
        if (recentTransactions.length === 0) {
            transactionHistory.innerHTML = `
                <div class="transaction-item">
                    <div class="transaction-detail">
                        <div class="transaction-name">No hay transacciones recientes</div>
                        <div class="transaction-date">Realiza tu primera transacción</div>
                    </div>
                </div>
            `;
            return;
        }

        recentTransactions.forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            
            const isDeposit = transaction.type === 'deposit';
            const sign = isDeposit ? '+' : '-';
            const transactionClass = isDeposit ? 'transaction-deposit' : 'transaction-withdraw';
            
            transactionItem.innerHTML = `
                <div class="transaction-detail">
                    <div class="transaction-name">${transaction.description}</div>
                    <div class="transaction-date">${transaction.date}</div>
                </div>
                <div class="transaction-amount ${transactionClass}">${sign}$${transaction.amount.toFixed(2)}</div>
            `;
            
            transactionHistory.appendChild(transactionItem);
        });
    }

    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        Swal.fire({
            title: '¿Cerrar sesión?',
            text: "¿Estás seguro de que deseas cerrar sesión?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2A4B8D',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar',
            background: 'rgba(255, 255, 255, 0.95)',
            customClass: {
                title: 'swal-title',
                confirmButton: 'swal-button'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Cerrando sesión...',
                    text: 'Redirigiendo al inicio.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: 'rgba(255, 255, 255, 0.95)'
                }).then(() => {
                    window.location.href = 'index.html';
                });
            }
        });
    });

    // Mostrar/ocultar detalles de tarjeta según método seleccionado
    document.getElementById('depositMethod').addEventListener('change', function() {
        const cardDetails = document.getElementById('cardDetails');
        if (this.value.includes('Tarjeta')) {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });

    // FORM HANDLERS ACTUALIZADOS CON LOCALSTORAGE Y VALIDATE.JS

    document.getElementById('depositForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('depositAmount').value);
        const method = document.getElementById('depositMethod').value;

        // VALIDACIONES CON VALIDATE.JS
        const constraints = {
            amount: {
                numericality: {
                    greaterThan: 4.99,
                    message: "debe ser mayor a $5.00"
                }
            },
            method: {
                presence: {
                    allowEmpty: false,
                    message: "es requerido"
                }
            }
        };
        
        const validation = validate({ amount: amount, method: method }, constraints);
        
        if (validation) {
            if (validation.amount) {
                Swal.fire({
                    title: 'Depósito mínimo',
                    text: `El depósito ${validation.amount[0]}.`,
                    icon: 'warning',
                    confirmButtonColor: '#2A4B8D',
                    background: 'rgba(255, 255, 255, 0.95)'
                });
                return;
            }
            if (validation.method) {
                Swal.fire({
                    title: 'Método requerido',
                    text: `El método de depósito ${validation.method[0]}.`,
                    icon: 'warning',
                    confirmButtonColor: '#2A4B8D',
                    background: 'rgba(255, 255, 255, 0.95)'
                });
                return;
            }
        }

        // ACTUALIZAR SALDO Y REGISTRAR TRANSACCIÓN
        userData.balance += amount;
        registerTransaction('deposit', amount, method, `Depósito mediante ${method}`);
        
        Swal.fire({
            title: '¡Depósito exitoso!',
            html: `Has depositado <b>$${amount.toFixed(2)}</b> mediante <b>${method}</b>.<br>
                  <small>Nuevo saldo: $${userData.balance.toFixed(2)}</small>`,
            icon: 'success',
            confirmButtonColor: '#2A4B8D',
            background: 'rgba(255, 255, 255, 0.95)'
        }).then(() => {
            $('#depositModal').modal('hide');
            this.reset();
            document.getElementById('cardDetails').style.display = 'none';
            updateUserInterface();
        });
    });

    document.getElementById('withdrawForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('withdrawAmount').value);
        const method = document.getElementById('withdrawMethod').value;
        
        // VALIDAR FONDOS SUFICIENTES
        if (amount > userData.balance) {
            Swal.fire({
                title: 'Fondos insuficientes',
                text: `No tienes suficiente saldo. Tu saldo actual es $${userData.balance.toFixed(2)}.`,
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }
        
        // VALIDAR MONTO MÍNIMO
        if (amount < 1) {
            Swal.fire({
                title: 'Retiro mínimo',
                text: 'El retiro mínimo es de $1.00.',
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }

        // VALIDAR MÉTODO
        if (!method) {
            Swal.fire({
                title: 'Método requerido',
                text: 'Debes seleccionar un método de retiro.',
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }
        
        // ACTUALIZAR SALDO Y REGISTRAR TRANSACCIÓN
        userData.balance -= amount;
        registerTransaction('withdraw', amount, method, `Retiro mediante ${method}`);
        
        Swal.fire({
            title: '¡Retiro exitoso!',
            html: `Has retirado <b>$${amount.toFixed(2)}</b> mediante <b>${method}</b>.<br>
                  <small>Nuevo saldo: $${userData.balance.toFixed(2)}</small>`,
            icon: 'success',
            confirmButtonColor: '#2A4B8D',
            background: 'rgba(255, 255, 255, 0.95)'
        }).then(() => {
            $('#withdrawModal').modal('hide');
            this.reset();
            updateUserInterface();
        });
    });

    document.getElementById('paymentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const service = document.getElementById('serviceType').value;
        const account = document.getElementById('serviceAccount').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        
        // VALIDACIONES
        if (!service) {
            Swal.fire({
                title: 'Servicio requerido',
                text: 'Debes seleccionar un tipo de servicio.',
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }

        if (!account) {
            Swal.fire({
                title: 'Cuenta requerida',
                text: 'Debes ingresar el número de cuenta del servicio.',
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }

        if (amount > userData.balance) {
            Swal.fire({
                title: 'Fondos insuficientes',
                text: `No tienes suficiente saldo. Tu saldo actual es $${userData.balance.toFixed(2)}.`,
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }

        if (amount < 1) {
            Swal.fire({
                title: 'Monto inválido',
                text: 'El monto del pago debe ser mayor a $1.00.',
                icon: 'warning',
                confirmButtonColor: '#2A4B8D',
                background: 'rgba(255, 255, 255, 0.95)'
            });
            return;
        }
        
        // ACTUALIZAR SALDO Y REGISTRAR TRANSACCIÓN
        userData.balance -= amount;
        registerTransaction('payment', amount, service, `Pago de ${service} - Cuenta: ${account}`);
        
        Swal.fire({
            title: '¡Pago realizado!',
            html: `Has pagado <b>$${amount.toFixed(2)}</b> por el servicio de <b>${service}</b> a la cuenta <b>${account}</b>.<br>
                  <small>Nuevo saldo: $${userData.balance.toFixed(2)}</small>`,
            icon: 'success',
            confirmButtonColor: '#2A4B8D',
            background: 'rgba(255, 255, 255, 0.95)'
        }).then(() => {
            $('#paymentModal').modal('hide');
            this.reset();
            updateUserInterface();
        });
    });

    // ACTUALIZAR EL MÁXIMO PERMITIDO PARA RETIRO EN TIEMPO REAL
    document.getElementById('withdrawAmount').addEventListener('input', function() {
        const maxAmount = userData.balance;
        this.setAttribute('max', maxAmount);
    });

    // Inicializar tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Actualizar la interfaz al cargar la página
    updateUserInterface();
    
});