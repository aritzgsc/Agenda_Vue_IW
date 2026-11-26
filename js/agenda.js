function formularioVacio() {
    return { nombre: '', email: '', telefono: '' };
}

function validarContacto(contacto) {
    if (!contacto.nombre || contacto.nombre.length > 80) {
        return 'Introduce un nombre de hasta 80 caracteres.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacto.email) || contacto.email.length > 254) {
        return 'Introduce un correo válido.';
    }
    if (!/^[+\d() -]{6,25}$/.test(contacto.telefono) || contacto.telefono.replace(/\D/g, '').length < 6) {
        return 'Introduce un teléfono válido.';
    }
    return '';
}

new Vue({
    el: '#agenda',
    data: {
        contactos: [
            { id: 1, nombre: 'John Doe', email: 'john.doe@deusto.es', telefono: '555555555' }
        ],
        nuevo: formularioVacio(),
        siguienteId: 2,
        contactoPendiente: null,
        error: '',
        mensaje: ''
    },
    methods: {
        guardar: function () {
            var contacto = {
                nombre: this.nuevo.nombre.trim(),
                email: this.nuevo.email.trim(),
                telefono: this.nuevo.telefono.trim()
            };
            this.mensaje = '';
            this.error = validarContacto(contacto);
            if (this.error) return;
            contacto.id = this.siguienteId++;
            this.contactos.push(contacto);
            this.nuevo = formularioVacio();
            this.mensaje = 'Contacto añadido.';
            this.$nextTick(function () {
                $('#name').focus();
            });
        },
        solicitarBorrado: function (contacto, event) {
            this.contactoPendiente = contacto.id;
            var acciones = event.currentTarget.closest('.delete-actions');
            this.$nextTick(function () {
                var cancelar = acciones.querySelector('.delete-cancel');
                if (cancelar) cancelar.focus();
            });
        },
        cancelarBorrado: function (event) {
            var acciones = event.currentTarget.closest('.delete-actions');
            this.contactoPendiente = null;
            this.$nextTick(function () {
                var boton = acciones.querySelector('.delete-start');
                if (boton) boton.focus();
            });
        },
        eliminar: function (contacto) {
            if (this.contactoPendiente !== contacto.id) return;
            this.contactos = this.contactos.filter(function (item) {
                return item.id !== contacto.id;
            });
            this.error = '';
            this.contactoPendiente = null;
            this.mensaje = 'Contacto eliminado.';
            this.$nextTick(function () { this.$refs.estadoContactos.focus(); });
        }
    }
});
