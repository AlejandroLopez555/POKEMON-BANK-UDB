document.addEventListener('DOMContentLoaded', function() {
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
                            // Redirigir a index.html
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
            
            // Form submission handlers
            document.getElementById('depositForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const amount = document.getElementById('depositAmount').value;
                const method = document.getElementById('depositMethod').value;
                
                if (amount < 5) {
                    Swal.fire({
                        title: 'Depósito mínimo',
                        text: 'El depósito mínimo es de $5.00.',
                        icon: 'warning',
                        confirmButtonColor: '#2A4B8D',
                        background: 'rgba(255, 255, 255, 0.95)'
                    });
                    return;
                }
                
                Swal.fire({
                    title: '¡Depósito exitoso!',
                    html: `Has depositado <b>$${amount}</b> mediante <b>${method}</b>.`,
                    icon: 'success',
                    confirmButtonColor: '#2A4B8D',
                    background: 'rgba(255, 255, 255, 0.95)'
                }).then(() => {
                    $('#depositModal').modal('hide');
                    this.reset();
                    document.getElementById('cardDetails').style.display = 'none';
                });
            });
            
            document.getElementById('withdrawForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const amount = document.getElementById('withdrawAmount').value;
                const method = document.getElementById('withdrawMethod').value;
                
                if (amount > 5640.75) {
                    Swal.fire({
                        title: 'Fondos insuficientes',
                        text: 'No tienes suficiente saldo para realizar este retiro.',
                        icon: 'warning',
                        confirmButtonColor: '#2A4B8D',
                        background: 'rgba(255, 255, 255, 0.95)'
                    });
                    return;
                }
                
                Swal.fire({
                    title: '¡Retiro exitoso!',
                    html: `Has retirado <b>$${amount}</b> mediante <b>${method}</b>.`,
                    icon: 'success',
                    confirmButtonColor: '#2A4B8D',
                    background: 'rgba(255, 255, 255, 0.95)'
                }).then(() => {
                    $('#withdrawModal').modal('hide');
                    this.reset();
                });
            });
            
            document.getElementById('paymentForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const service = document.getElementById('serviceType').value;
                const account = document.getElementById('serviceAccount').value;
                const amount = document.getElementById('paymentAmount').value;
                
                Swal.fire({
                    title: '¡Pago realizado!',
                    html: `Has pagado <b>$${amount}</b> por el servicio de <b>${service}</b> a la cuenta <b>${account}</b>.`,
                    icon: 'success',
                    confirmButtonColor: '#2A4B8D',
                    background: 'rgba(255, 255, 255, 0.95)'
                }).then(() => {
                    $('#paymentModal').modal('hide');
                    this.reset();
                });
            });
            
            // Initialize tooltips
            $('[data-toggle="tooltip"]').tooltip();
        });