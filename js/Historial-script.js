// Inicializar jsPDF
        window.jsPDF = window.jspdf.jsPDF;
        
        // Datos de ejemplo para las transacciones
        const transactions = [
            { id: 1, date: "15/05/2023", description: "Depósito de efectivo", type: "deposit", amount: 500.00, balance: 5640.75 },
            { id: 2, date: "14/05/2023", description: "Compra en Centro Pokémon", type: "withdrawal", amount: 120.50, balance: 5140.75 },
            { id: 3, date: "12/05/2023", description: "Pago de servicios - Electricidad", type: "payment", amount: 85.30, balance: 5261.25 },
            { id: 4, date: "10/05/2023", description: "Transferencia recibida - Misty", type: "deposit", amount: 300.00, balance: 5346.55 },
            { id: 5, date: "08/05/2023", description: "Retiro en ATM - Ciudad Celeste", type: "withdrawal", amount: 200.00, balance: 5046.55 },
            { id: 6, date: "05/05/2023", description: "Pago de servicios - Internet", type: "payment", amount: 45.75, balance: 5246.55 },
            { id: 7, date: "03/05/2023", description: "Depósito de nómina - Gimnasio Pokémon", type: "deposit", amount: 1200.00, balance: 5292.30 },
            { id: 8, date: "01/05/2023", description: "Compra en Tienda Pokémon", type: "withdrawal", amount: 75.25, balance: 4092.30 },
            { id: 9, date: "28/04/2023", description: "Pago de servicios - Agua", type: "payment", amount: 60.40, balance: 4167.55 },
            { id: 10, date: "25/04/2023", description: "Depósito de efectivo", type: "deposit", amount: 350.00, balance: 4227.95 },
            { id: 11, date: "22/04/2023", description: "Compra en Centro Comercial", type: "withdrawal", amount: 185.75, balance: 3877.95 },
            { id: 12, date: "20/04/2023", description: "Transferencia recibida - Brock", type: "deposit", amount: 150.00, balance: 4063.70 }
        ];

        document.addEventListener('DOMContentLoaded', function() {
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
            
            // Back button functionality
            document.getElementById('backBtn').addEventListener('click', function() {
                alert('Volviendo a la pantalla de cuenta...');
            });
            
            // Export button functionality - abre el modal de autenticación
            document.getElementById('exportBtn').addEventListener('click', function() {
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
                
                if (pin === '1996') {
                    // PIN correcto
                    closeAuthModal();
                    exportToPDF();
                } else {
                    // PIN incorrecto
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
                doc.text('Titular: Ash Ketchum', 20, 30);
                doc.text('Cuenta: 0987-6543-2100-1234', 20, 37);
                doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 20, 44);
                
                // Preparar datos para la tabla
                const filteredTransactions = filterTransactions();
                const tableData = filteredTransactions.map(transaction => {
                    let typeText = '';
                    if (transaction.type === 'deposit') typeText = 'Depósito';
                    if (transaction.type === 'withdrawal') typeText = 'Retiro';
                    if (transaction.type === 'payment') typeText = 'Pago';
                    
                    let amountSign = '';
                    if (transaction.type === 'deposit') amountSign = '+';
                    else amountSign = '-';
                    
                    return [
                        transaction.date,
                        typeText,
                        transaction.description,
                        `${amountSign}$${transaction.amount.toFixed(2)}`
                    ];
                });
                
                // Crear la tabla
                doc.autoTable({
                    startY: 50,
                    head: [['Fecha', 'Tipo', 'Descripción', 'Monto']],
                    body: tableData,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [42, 75, 141],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240]
                    }
                });
                
                // Guardar el PDF
                doc.save(`historial_pokemon_bank_${new Date().toISOString().slice(0, 10)}.pdf`);
                
                // Mostrar mensaje de éxito
                alert('Historial exportado correctamente.');
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
                return transactions.filter(transaction => {
                    // Aplicar filtro por tipo
                    let matchesFilter = false;
                    if (currentFilter === 'all') {
                        matchesFilter = true;
                    } else if (currentFilter === 'deposit') {
                        matchesFilter = transaction.type === 'deposit';
                    } else if (currentFilter === 'withdrawal') {
                        matchesFilter = transaction.type === 'withdrawal';
                    } else if (currentFilter === 'payment') {
                        matchesFilter = transaction.type === 'payment';
                    } else if (currentFilter === 'recent') {
                        // Filtro para últimos 7 días (simulado)
                        const recentIds = [1, 2, 3, 4, 5]; // IDs de transacciones "recientes"
                        matchesFilter = recentIds.includes(transaction.id);
                    }
                    
                    // Aplicar filtro de búsqueda
                    const matchesSearch = currentSearch === '' || 
                                         transaction.description.toLowerCase().includes(currentSearch) ||
                                         transaction.date.includes(currentSearch);
                    
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
                            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <h3>No se encontraron transacciones</h3>
                            <p>Intenta con otros filtros o términos de búsqueda</p>
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
                    
                    if (transaction.type === 'deposit') {
                        typeClass = 'type-deposit';
                        amountClass = 'amount-deposit';
                        amountSign = '+';
                    } else if (transaction.type === 'withdrawal') {
                        typeClass = 'type-withdrawal';
                        amountClass = 'amount-withdrawal';
                        amountSign = '-';
                    } else if (transaction.type === 'payment') {
                        typeClass = 'type-payment';
                        amountClass = 'amount-payment';
                        amountSign = '-';
                    }
                    
                    // Determinar el texto del tipo
                    let typeText = '';
                    if (transaction.type === 'deposit') typeText = 'Depósito';
                    if (transaction.type === 'withdrawal') typeText = 'Retiro';
                    if (transaction.type === 'payment') typeText = 'Pago';
                    
                    transactionElement.innerHTML = `
                        <div class="transaction-detail">
                            <div class="transaction-date">${transaction.date}</div>
                            <div class="transaction-description">
                                <span class="transaction-type ${typeClass}">${typeText}</span>
                                ${transaction.description}
                            </div>
                        </div>
                        <div class="transaction-amount ${amountClass}">
                            ${amountSign}$${transaction.amount.toFixed(2)}
                        </div>
                    `;
                    
                    transactionsContainer.appendChild(transactionElement);
                });
            }
            
            // Función para actualizar la paginación
            function updatePagination() {
                const filteredTransactions = filterTransactions();
                const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
                
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
            }
        });