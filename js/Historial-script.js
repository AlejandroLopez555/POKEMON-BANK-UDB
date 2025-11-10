// Inicializar jsPDF
window.jsPDF = window.jspdf.jsPDF;

document.addEventListener('DOMContentLoaded', function() {
    // CARGAR DATOS DEL USUARIO DESDE LOCALSTORAGE
    const userData = JSON.parse(localStorage.getItem('userData')) || {
        name: "Ash Ketchum",
        account: "0987654321",
        balance: 500.00,
        transactions: []
    };

    // ACTUALIZAR INTERFAZ CON DATOS REALES
    document.querySelector('.user-info span').textContent = userData.name;
    document.querySelector('.account-owner').innerHTML = `<i class="fas fa-user"></i> ${userData.name}`;
    document.querySelector('.account-number').innerHTML = `<i class="fas fa-credit-card"></i> No. ${userData.account}`;

    // Variables globales
    let currentFilter = 'all';
    let currentSearch = '';
    let currentPage = 1;
    const transactionsPerPage = 5;
    
    // Elementos del DOM
    const transactionsContainer = document.getElementById('transactionsContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageButtons = document.querySelectorAll('.page-btn:not(#prevPage):not(#nextPage)');
    const authModal = document.getElementById('authModal');
    const pinInputs = document.querySelectorAll('.pin-input');
    const authSubmit = document.getElementById('authSubmit');
    const authCancel = document.getElementById('authCancel');
    const errorMessage = document.getElementById('errorMessage');
    
    // Inicializar la visualización de transacciones
    renderTransactions();
    updatePagination();
    
    // Configurar event listeners para los filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover la clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Agregar la clase active al botón clickeado
            this.classList.add('active');
            
            // Actualizar el filtro actual
            currentFilter = this.getAttribute('data-filter');
            
            // Reiniciar a la primera página
            currentPage = 1;
            updatePagination();
            
            // Volver a renderizar las transacciones
            renderTransactions();
        });
    });
    
    // Configurar event listener para la búsqueda
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Configurar event listeners para la paginación
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
            renderTransactions();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filterTransactions().length / transactionsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
            renderTransactions();
        }
    });
    
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.querySelector('i')) {
                currentPage = parseInt(this.textContent);
                updatePagination();
                renderTransactions();
            }
        });
    });
    
    // Export button functionality - abre el modal de autenticación
    document.getElementById('exportBtn').addEventListener('click', function() {
        if (userData.transactions.length === 0) {
            showAlert('No hay transacciones para exportar', 'warning');
            return;
        }
        authModal.style.display = 'flex';
        pinInputs[0].focus();
    });
    
    // Configurar la navegación entre inputs de PIN
    pinInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1) {
                const nextInput = this.getAttribute('data-next');
                if (nextInput) {
                    document.getElementById(nextInput).focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '') {
                const prevInput = this.getAttribute('data-prev');
                if (prevInput) {
                    document.getElementById(prevInput).focus();
                }
            }
        });
    });
    
    // Botón de cancelar autenticación
    authCancel.addEventListener('click', function() {
        closeAuthModal();
    });
    
    // Botón de verificar PIN
    authSubmit.addEventListener('click', function() {
        verifyPin();
    });
    
    // Permitir verificar con Enter
    pinInputs.forEach(input => {
        input.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                verifyPin();
            }
        });
    });
    
    // Función para cerrar el modal de autenticación
    function closeAuthModal() {
        authModal.style.display = 'none';
        errorMessage.style.display = 'none';
        // Limpiar los inputs
        pinInputs.forEach(input => {
            input.value = '';
        });
    }
    
    // Función para verificar el PIN
    function verifyPin() {
        const pin = Array.from(pinInputs).map(input => input.value).join('');
        
        // VALIDAR CON VALIDATE.JS
        const constraints = {
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
        
        const validation = validate({ pin: pin }, constraints);
        
        if (validation) {
            errorMessage.textContent = `PIN ${validation.pin[0]}`;
            errorMessage.style.display = 'block';
            pinInputs.forEach(input => input.value = '');
            pinInputs[0].focus();
            return;
        }
        
        if (pin === '1234') { // PIN correcto
            closeAuthModal();
            exportToPDF();
        } else {
            // PIN incorrecto
            errorMessage.textContent = 'PIN incorrecto. Intenta nuevamente.';
            errorMessage.style.display = 'block';
            // Limpiar los inputs
            pinInputs.forEach(input => {
                input.value = '';
            });
            pinInputs[0].focus();
        }
    }
    
    // Función para exportar a PDF
    function exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.setTextColor(42, 75, 141);
        doc.text('Pokémon Bank - Historial de Transacciones', 105, 20, { align: 'center' });
        
        // Información de la cuenta
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Titular: ${userData.name}`, 20, 30);
        doc.text(`Cuenta: ${userData.account}`, 20, 37);
        doc.text(`Saldo actual: $${userData.balance.toFixed(2)}`, 20, 44);
        doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 20, 51);
        
        // Preparar datos para la tabla
        const filteredTransactions = filterTransactions();
        const tableData = filteredTransactions.map(transaction => {
            let typeText = '';
            if (transaction.type === 'deposit') typeText = 'Depósito';
            if (transaction.type === 'withdraw') typeText = 'Retiro';
            if (transaction.type === 'payment') typeText = 'Pago';
            
            let amountSign = '';
            let amountDisplay = '';
            if (transaction.type === 'deposit') {
                amountSign = '+';
                amountDisplay = `+$${transaction.amount.toFixed(2)}`;
            } else {
                amountSign = '-';
                amountDisplay = `-$${transaction.amount.toFixed(2)}`;
            }
            
            return [
                transaction.date,
                typeText,
                transaction.description,
                amountDisplay,
                `$${transaction.balanceAfter.toFixed(2)}`
            ];
        });
        
        // Crear la tabla
        doc.autoTable({
            startY: 60,
            head: [['Fecha', 'Tipo', 'Descripción', 'Monto', 'Balance']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [42, 75, 141],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 20 },
                2: { cellWidth: 70 },
                3: { cellWidth: 25 },
                4: { cellWidth: 30 }
            }
        });
        
        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Página ${i} de ${pageCount} - Pokémon Bank - ${new Date().toLocaleDateString()}`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        
        // Guardar el PDF
        doc.save(`historial_pokemon_bank_${userData.name.replace(' ', '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
        
        // Mostrar mensaje de éxito
        showAlert('Historial exportado correctamente en formato PDF', 'success');
    }
    
    // Función para realizar la búsqueda
    function performSearch() {
        currentSearch = searchInput.value.toLowerCase().trim();
        currentPage = 1;
        updatePagination();
        renderTransactions();
    }
    
    // Función para filtrar transacciones según el filtro y búsqueda actual
    function filterTransactions() {
        const transactions = userData.transactions;
        
        if (transactions.length === 0) {
            return [];
        }
        
        return transactions.filter(transaction => {
            // Aplicar filtro por tipo
            let matchesFilter = false;
            if (currentFilter === 'all') {
                matchesFilter = true;
            } else if (currentFilter === 'deposit') {
                matchesFilter = transaction.type === 'deposit';
            } else if (currentFilter === 'withdrawal') {
                matchesFilter = transaction.type === 'withdraw';
            } else if (currentFilter === 'payment') {
                matchesFilter = transaction.type === 'payment';
            } else if (currentFilter === 'recent') {
                // Filtro para últimos 7 días
                const transactionDate = new Date(transaction.date);
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                matchesFilter = transactionDate >= sevenDaysAgo;
            }
            
            // Aplicar filtro de búsqueda
            const matchesSearch = currentSearch === '' || 
                                 transaction.description.toLowerCase().includes(currentSearch) ||
                                 transaction.date.toLowerCase().includes(currentSearch) ||
                                 transaction.amount.toString().includes(currentSearch);
            
            return matchesFilter && matchesSearch;
        });
    }
    
    // Función para renderizar las transacciones
    function renderTransactions() {
        const filteredTransactions = filterTransactions();
        const startIndex = (currentPage - 1) * transactionsPerPage;
        const endIndex = startIndex + transactionsPerPage;
        const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
        
        // Limpiar el contenedor
        transactionsContainer.innerHTML = '';
        
        // Mostrar mensaje si no hay transacciones
        if (paginatedTransactions.length === 0) {
            transactionsContainer.innerHTML = `
                <div class="no-transactions">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px; color: #666;"></i>
                    <h3>No se encontraron transacciones</h3>
                    <p>${userData.transactions.length === 0 ? 'Aún no has realizado transacciones.' : 'Intenta con otros filtros o términos de búsqueda'}</p>
                </div>
            `;
            return;
        }
        
        // Renderizar cada transacción
        paginatedTransactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.className = 'transaction-item';
            
            // Determinar la clase según el tipo
            let typeClass = '';
            let amountClass = '';
            let amountSign = '';
            let typeText = '';
            
            if (transaction.type === 'deposit') {
                typeClass = 'type-deposit';
                amountClass = 'amount-deposit';
                amountSign = '+';
                typeText = 'Depósito';
            } else if (transaction.type === 'withdraw') {
                typeClass = 'type-withdrawal';
                amountClass = 'amount-withdrawal';
                amountSign = '-';
                typeText = 'Retiro';
            } else if (transaction.type === 'payment') {
                typeClass = 'type-payment';
                amountClass = 'amount-payment';
                amountSign = '-';
                typeText = 'Pago';
            }
            
            transactionElement.innerHTML = `
                <div class="transaction-detail">
                    <div class="transaction-date">${transaction.date}</div>
                    <div class="transaction-description">
                        <span class="transaction-type ${typeClass}">${typeText}</span>
                        ${transaction.description}
                    </div>
                </div>
                <div class="transaction-amount-info">
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign}$${transaction.amount.toFixed(2)}
                    </div>
                    <div class="transaction-balance">
                        Balance: $${transaction.balanceAfter.toFixed(2)}
                    </div>
                </div>
            `;
            
            transactionsContainer.appendChild(transactionElement);
        });
    }
    
    // Función para actualizar la paginación
    function updatePagination() {
        const filteredTransactions = filterTransactions();
        const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage) || 1;
        
        // Actualizar botones de página
        pageButtons.forEach((button, index) => {
            if (index < totalPages) {
                button.textContent = index + 1;
                button.style.display = 'flex';
                
                if (index + 1 === currentPage) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            } else {
                button.style.display = 'none';
            }
        });
        
        // Ocultar/mostrar botones de anterior/siguiente
        prevPageBtn.style.display = currentPage > 1 ? 'flex' : 'none';
        nextPageBtn.style.display = currentPage < totalPages ? 'flex' : 'none';
        
        // Ocultar paginación si no hay transacciones
        document.querySelector('.pagination').style.display = 
            filteredTransactions.length === 0 ? 'none' : 'flex';
    }
    
    // Función para mostrar alertas (reemplaza los alert nativos)
    function showAlert(message, type = 'info') {
        // Usar SweetAlert si está disponible, sino usar alert nativo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: message,
                timer: 3000,
                showConfirmButton: false,
                background: 'rgba(255, 255, 255, 0.95)'
            });
        } else {
            alert(message);
        }
    }
});