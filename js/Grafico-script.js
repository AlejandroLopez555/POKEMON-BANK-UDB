let typeChart, monthlyChart, amountChart, balanceChart;
        
        document.addEventListener('DOMContentLoaded', function() {
            
            const transactionData = {
                types: {
                    labels: ['Depósitos', 'Retiros', 'Pagos'],
                    data: [5, 4, 3], // 4 de cada tipo
                    colors: ['#2ecc71', '#e74c3c', '#3498db']
                },
                monthly: {
                    labels: ['Abril', 'Mayo'],
                    data: [5, 7] // 5 transacciones en abril, 7 en mayo
                },
                amounts: {
                    labels: ['Depósitos', 'Retiros', 'Pagos'],
                    data: [2350, 451.75, 191.45], // Total de montos por tipo
                    colors: ['#2ecc71', '#e74c3c', '#3498db']
                },
                balance: {
                    labels: ['20/04', '22/04', '25/04', '28/04', '01/05', '03/05', '05/05', '08/05', '10/05', '12/05', '14/05', '15/05'],
                    data: [4063.70, 3877.95, 4227.95, 4167.55, 4092.30, 5292.30, 5246.55, 5046.55, 5346.55, 5261.25, 5140.75, 5640.75]
                }
            };
            
            // Calcular totales para las tarjetas de resumen
            const totalIncome = transactionData.amounts.data[0];
            const totalExpenses = transactionData.amounts.data[1] + transactionData.amounts.data[2];
            const netBalance = totalIncome - totalExpenses;
            
            // Actualizar tarjetas de resumen
            document.querySelector('.income .value').textContent = `$${totalIncome.toFixed(2)}`;
            document.querySelector('.expenses .value').textContent = `$${totalExpenses.toFixed(2)}`;
            document.querySelector('.balance .value').textContent = `$${netBalance.toFixed(2)}`;
            
            // Crear gráficas
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
                                    const percentage = Math.round((value / total) * 100);
                                    return `${context.label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
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
            
            // Manejar filtros
            document.getElementById('apply-filters').addEventListener('click', function() {
                const dateRange = document.getElementById('date-range').value;
                const transactionType = document.getElementById('transaction-type').value;
                const amountRange = document.getElementById('amount-range').value;
                
                // Simular filtrado de datos
                showToast(`Filtros aplicados:\nRango: ${dateRange} días\nTipo: ${transactionType}\nMonto: ${amountRange}\n\nLos gráficos se actualizarán con los datos filtrados.`);
                
                // En una implementación real, aquí se haría una llamada a una API
                // o se filtrarían los datos localmente para actualizar los gráficos
            });
            
            // Configurar eventos para los botones de descarga de gráficos
            document.querySelectorAll('.download-chart').forEach(button => {
                button.addEventListener('click', function() {
                    const chartId = this.getAttribute('data-chart');
                    downloadChart(chartId);
                });
            });
            
            // Configurar evento para exportar datos
            document.getElementById('export-data').addEventListener('click', exportDataToCSV);
        });
        
        // Función para descargar un gráfico como imagen
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
        
        // Función para exportar datos a CSV
        function exportDataToCSV() {
            const table = document.getElementById('transactions-table');
            let csv = [];
            
            // Obtener encabezados
            const headers = [];
            for (let i = 0; i < table.rows[0].cells.length; i++) {
                headers.push(table.rows[0].cells[i].textContent);
            }
            csv.push(headers.join(','));
            
            // Obtener datos de las filas
            for (let i = 1; i < table.rows.length; i++) {
                const row = [];
                for (let j = 0; j < table.rows[i].cells.length; j++) {
                    // Limpiar el texto (eliminar etiquetas HTML)
                    let text = table.rows[i].cells[j].textContent;
                    // Escapar comillas para CSV
                    text = text.replace(/"/g, '""');
                    // Envolver en comillas si contiene coma
                    if (text.includes(',')) {
                        text = `"${text}"`;
                    }
                    row.push(text);
                }
                csv.push(row.join(','));
            }
            
            // Crear el archivo CSV
            const csvContent = "data:text/csv;charset=utf-8," + csv.join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `transacciones-${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Datos exportados como CSV');
        }
        
        // Función para mostrar notificaciones toast
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }