let typeChart, monthlyChart, amountChart, balanceChart;

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

    // PROCESAR DATOS PARA GRÁFICOS
    function processTransactionData() {
        const transactions = userData.transactions;
        
        if (transactions.length === 0) {
            return {
                types: {
                    labels: ['Depósitos', 'Retiros', 'Pagos'],
                    data: [0, 0, 0],
                    colors: ['#2ecc71', '#e74c3c', '#3498db']
                },
                monthly: {
                    labels: ['Sin datos'],
                    data: [0]
                },
                amounts: {
                    labels: ['Depósitos', 'Retiros', 'Pagos'],
                    data: [0, 0, 0],
                    colors: ['#2ecc71', '#e74c3c', '#3498db']
                },
                balance: {
                    labels: ['Sin transacciones'],
                    data: [userData.balance]
                }
            };
        }

        // Contar transacciones por tipo
        const typeCount = {
            deposit: 0,
            withdraw: 0,
            payment: 0
        };

        // Sumar montos por tipo
        const typeAmounts = {
            deposit: 0,
            withdraw: 0,
            payment: 0
        };

        // Agrupar por mes
        const monthlyData = {};
        const balanceEvolution = [];
        const balanceLabels = [];

        // Procesar cada transacción
        transactions.forEach(transaction => {
            // Contar por tipo
            typeCount[transaction.type]++;
            
            // Sumar montos por tipo
            typeAmounts[transaction.type] += transaction.amount;
            
            // Agrupar por mes
            const date = new Date(transaction.date);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
            
            // Evolución del balance
            balanceEvolution.push(transaction.balanceAfter);
            balanceLabels.push(transaction.date.split(' ')[0]); // Solo la fecha
        });

        // Preparar datos para gráficos
        return {
            types: {
                labels: ['Depósitos', 'Retiros', 'Pagos'],
                data: [typeCount.deposit, typeCount.withdraw, typeCount.payment],
                colors: ['#2ecc71', '#e74c3c', '#3498db']
            },
            monthly: {
                labels: Object.keys(monthlyData),
                data: Object.values(monthlyData)
            },
            amounts: {
                labels: ['Depósitos', 'Retiros', 'Pagos'],
                data: [typeAmounts.deposit, typeAmounts.withdraw, typeAmounts.payment],
                colors: ['#2ecc71', '#e74c3c', '#3498db']
            },
            balance: {
                labels: balanceLabels.reverse(), // Más reciente primero
                data: balanceEvolution.reverse() // Más reciente primero
            }
        };
    }

    // ACTUALIZAR TABLA DE TRANSACCIONES
    function updateTransactionsTable() {
        const tableBody = document.querySelector('#transactions-table tbody');
        const transactions = userData.transactions;
        
        tableBody.innerHTML = '';

        if (transactions.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        No hay transacciones registradas
                    </td>
                </tr>
            `;
            return;
        }

        // Mostrar últimas 12 transacciones
        const recentTransactions = transactions.slice(0, 12);
        
        recentTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            
            const typeClass = `type-${transaction.type}`;
            const typeText = transaction.type === 'deposit' ? 'Depósito' : 
                           transaction.type === 'withdraw' ? 'Retiro' : 'Pago';
            
            const amountSign = transaction.type === 'deposit' ? '' : '-';
            
            row.innerHTML = `
                <td>${transaction.date}</td>
                <td>${transaction.description}</td>
                <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                <td>${amountSign}$${transaction.amount.toFixed(2)}</td>
                <td>$${transaction.balanceAfter.toFixed(2)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // INICIALIZAR GRÁFICOS
    function initializeCharts() {
        const transactionData = processTransactionData();
        
        // Calcular totales para las tarjetas de resumen
        const totalIncome = transactionData.amounts.data[0];
        const totalExpenses = transactionData.amounts.data[1] + transactionData.amounts.data[2];
        const netBalance = userData.balance;
        const totalTransactions = userData.transactions.length;

        // Actualizar tarjetas de resumen
        document.querySelector('.income .value').textContent = `$${totalIncome.toFixed(2)}`;
        document.querySelector('.expenses .value').textContent = `$${totalExpenses.toFixed(2)}`;
        document.querySelector('.balance .value').textContent = `$${netBalance.toFixed(2)}`;
        document.querySelector('.summary-card:last-child .value').textContent = totalTransactions;

        // Destruir gráficos existentes si los hay
        if (typeChart) typeChart.destroy();
        if (monthlyChart) monthlyChart.destroy();
        if (amountChart) amountChart.destroy();
        if (balanceChart) balanceChart.destroy();

        // Crear gráfica de tipos (Doughnut)
        const typeCtx = document.getElementById('typeChart').getContext('2d');
        typeChart = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: transactionData.types.labels,
                datasets: [{
                    data: transactionData.types.data,
                    backgroundColor: transactionData.types.colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const value = context.raw;
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Crear gráfica mensual (Bar)
        const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
        monthlyChart = new Chart(monthlyCtx, {
            type: 'bar',
            data: {
                labels: transactionData.monthly.labels,
                datasets: [{
                    label: 'Número de Transacciones',
                    data: transactionData.monthly.data,
                    backgroundColor: '#3b4cca',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

        // Crear gráfica de montos (Bar)
        const amountCtx = document.getElementById('amountChart').getContext('2d');
        amountChart = new Chart(amountCtx, {
            type: 'bar',
            data: {
                labels: transactionData.amounts.labels,
                datasets: [{
                    label: 'Monto Total ($)',
                    data: transactionData.amounts.data,
                    backgroundColor: transactionData.amounts.colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Monto: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });

        // Crear gráfica de balance (Line)
        const balanceCtx = document.getElementById('balanceChart').getContext('2d');
        balanceChart = new Chart(balanceCtx, {
            type: 'line',
            data: {
                labels: transactionData.balance.labels,
                datasets: [{
                    label: 'Balance de Cuenta ($)',
                    data: transactionData.balance.data,
                    backgroundColor: 'rgba(59, 76, 202, 0.1)',
                    borderColor: '#3b4cca',
                    borderWidth: 2,
                    tension: 0.2,
                    fill: true,
                    pointBackgroundColor: '#3b4cca',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Balance: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // FUNCIONALIDAD DE FILTROS
    document.getElementById('apply-filters').addEventListener('click', function() {
        const dateRange = document.getElementById('date-range').value;
        const transactionType = document.getElementById('transaction-type').value;
        const amountRange = document.getElementById('amount-range').value;
        
        // En una implementación real, aquí se filtrarían los datos
        // Por ahora solo mostramos un mensaje
        showToast(`Filtros aplicados:\nRango: ${dateRange} días\nTipo: ${transactionType}\nMonto: ${amountRange}`);
        
        // Recargar gráficos con datos actualizados
        initializeCharts();
    });

    // CONFIGURAR EVENTOS PARA DESCARGAR GRÁFICOS
    document.querySelectorAll('.download-chart').forEach(button => {
        button.addEventListener('click', function() {
            const chartId = this.getAttribute('data-chart');
            downloadChart(chartId);
        });
    });

    // CONFIGURAR EVENTO PARA EXPORTAR DATOS
    document.getElementById('export-data').addEventListener('click', exportDataToCSV);

    // FUNCIÓN PARA DESCARGAR GRÁFICO COMO IMAGEN
    function downloadChart(chartId) {
        let chart;
        let fileName;
        
        switch(chartId) {
            case 'typeChart':
                chart = typeChart;
                fileName = 'distribucion-tipo-transacciones';
                break;
            case 'monthlyChart':
                chart = monthlyChart;
                fileName = 'evolucion-mensual-transacciones';
                break;
            case 'amountChart':
                chart = amountChart;
                fileName = 'distribucion-montos-tipo';
                break;
            case 'balanceChart':
                chart = balanceChart;
                fileName = 'evolucion-balance';
                break;
            default:
                return;
        }
        
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        
        showToast(`Gráfico descargado como ${fileName}.png`);
    }

    // FUNCIÓN PARA EXPORTAR DATOS A CSV
    function exportDataToCSV() {
        const transactions = userData.transactions;
        
        if (transactions.length === 0) {
            showToast('No hay datos para exportar');
            return;
        }
        
        let csv = 'Fecha,Descripción,Tipo,Monto,Balance\n';
        
        transactions.forEach(transaction => {
            const typeText = transaction.type === 'deposit' ? 'Depósito' : 
                           transaction.type === 'withdraw' ? 'Retiro' : 'Pago';
            
            const amount = transaction.type === 'deposit' ? transaction.amount : -transaction.amount;
            
            const row = [
                `"${transaction.date}"`,
                `"${transaction.description}"`,
                `"${typeText}"`,
                amount.toFixed(2),
                transaction.balanceAfter.toFixed(2)
            ];
            
            csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `transacciones-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Datos exportados como CSV');
    }

    // FUNCIÓN PARA MOSTRAR NOTIFICACIONES TOAST
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // INICIALIZAR LA PÁGINA
    initializeCharts();
    updateTransactionsTable();
});