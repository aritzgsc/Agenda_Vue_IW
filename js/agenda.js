new Vue({
    el: '#agenda',
    data: {
        contactos: [
            { id: 1, nombre: 'John Doe', email: 'john.doe@deusto.es', telefono: '555555555' }
        ],
        nuevo: { nombre: '', email: '', telefono: '' },
        siguienteId: 2,
        error: '',
        mensaje: ''
    },
    methods: {
        guardar: function () {
            var nombre = this.nuevo.nombre.trim();
            var email = this.nuevo.email.trim();
            var telefono = this.nuevo.telefono.trim();
            this.error = '';
            this.mensaje = '';
            if (!nombre || nombre.length > 80) {
                this.error = 'Introduce un nombre de hasta 80 caracteres.';
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
                this.error = 'Introduce un correo válido.';
                return;
            }
            if (!/^[+\d() -]{6,25}$/.test(telefono) || telefono.replace(/\D/g, '').length < 6) {
                this.error = 'Introduce un teléfono válido.';
                return;
            }
            this.contactos.push({ id: this.siguienteId++, nombre: nombre, email: email, telefono: telefono });
            this.nuevo = { nombre: '', email: '', telefono: '' };
            this.mensaje = 'Contacto añadido.';
        }
    }
});
