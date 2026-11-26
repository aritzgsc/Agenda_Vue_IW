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

async function iniciarAgenda() {
    var configurado = firebaseConfigurado();
    var conexion = null;
    var fallo = '';
    if (configurado) {
        try {
            conexion = await conectarFirebase();
        } catch (e) {
            fallo = 'No se pudieron cargar las bibliotecas de Firebase. Recarga para reintentar.';
        }
    }
    new Vue({
        el: '#agenda',
        data: {
            contactos: configurado ? [] : [
                { id: 1, nombre: 'John Doe', email: 'john.doe@deusto.es', telefono: '555555555' }
            ],
            nuevo: formularioVacio(),
            siguienteId: 2,
            contactoPendiente: null,
            error: '',
            errorBorrado: '',
            mensaje: '',
            modoLocal: !configurado,
            cargando: !!conexion,
            ocupado: false,
            errorConexion: fallo,
            uid: null,
            conectado: false
        },
        computed: {
            bloqueado: function () {
                return this.ocupado || (!this.modoLocal && !this.conectado);
            }
        },
        mounted: function () {
            $('#inicio-agenda').remove();
        },
        created: function () {
            if (!conexion) return;
            var vm = this;
            var generacion = 0;
            this.cancelarAuth = conexion.auth.onAuthStateChanged(async function (usuario) {
                var actual = ++generacion;
                vm.contactoPendiente = null;
                vm.conectado = false;
                vm.cargando = true;
                vm.errorConexion = '';
                if (vm.$firestoreRefs.contactos) vm.$unbind('contactos');
                vm.uid = null;
                vm.contactos = [];
                try {
                    if (!usuario) {
                        await conexion.auth.signInAnonymously();
                        return;
                    }
                    vm.uid = usuario.uid;
                    await vm.$bind('contactos', vm.coleccion());
                    if (actual === generacion && vm.uid === usuario.uid) {
                        vm.conectado = true;
                        vm.cargando = false;
                    }
                } catch (e) {
                    if (actual !== generacion) return;
                    vm.errorConexion = 'No se pudo acceder a los contactos. Revisa Firebase y sus reglas.';
                    vm.cargando = false;
                }
            }, function () {
                generacion++;
                vm.contactoPendiente = null;
                vm.conectado = false;
                vm.cargando = false;
                vm.errorConexion = 'No se pudo comprobar la sesión de Firebase.';
                if (vm.$firestoreRefs.contactos) vm.$unbind('contactos');
                vm.uid = null;
                vm.contactos = [];
            });
        },
        beforeDestroy: function () {
            if (this.cancelarAuth) this.cancelarAuth();
        },
        methods: {
            coleccion: function () {
                return conexion.db.collection('users').doc(this.uid).collection('contacts');
            },
            guardar: async function () {
                if (this.bloqueado) return;
                var contacto = {
                    nombre: this.nuevo.nombre.trim(),
                    email: this.nuevo.email.trim(),
                    telefono: this.nuevo.telefono.trim()
                };
                this.mensaje = '';
                this.errorBorrado = '';
                this.error = validarContacto(contacto);
                if (this.error) return;
                this.ocupado = true;
                try {
                    if (this.modoLocal) {
                        contacto.id = this.siguienteId++;
                        this.contactos.push(contacto);
                    } else {
                        await this.coleccion().add(contacto);
                    }
                    this.nuevo = formularioVacio();
                    this.mensaje = 'Contacto añadido.';
                } catch (e) {
                    this.error = 'No se pudo guardar el contacto. Comprueba la conexión.';
                } finally {
                    this.ocupado = false;
                    this.$nextTick(function () { $('#name').focus(); });
                }
            },
            solicitarBorrado: function (contacto, event) {
                if (this.bloqueado) return;
                this.contactoPendiente = contacto.id;
                var acciones = event.currentTarget.closest('.delete-actions');
                this.$nextTick(function () {
                    var cancelar = acciones.querySelector('.delete-cancel');
                    if (cancelar) cancelar.focus();
                });
            },
            cancelarBorrado: function (event) {
                if (this.bloqueado) return;
                var acciones = event.currentTarget.closest('.delete-actions');
                this.contactoPendiente = null;
                this.$nextTick(function () {
                    var boton = acciones.querySelector('.delete-start');
                    if (boton) boton.focus();
                });
            },
            eliminar: async function (contacto) {
                if (this.bloqueado || this.contactoPendiente !== contacto.id) return;
                this.errorBorrado = '';
                this.mensaje = '';
                this.ocupado = true;
                try {
                    if (this.modoLocal) {
                        this.contactos = this.contactos.filter(function (item) {
                            return item.id !== contacto.id;
                        });
                    } else {
                        await this.coleccion().doc(contacto.id).delete();
                    }
                    this.contactoPendiente = null;
                    this.mensaje = 'Contacto eliminado.';
                    this.$nextTick(function () { this.$refs.estadoContactos.focus(); });
                } catch (e) {
                    this.errorBorrado = 'No se pudo eliminar el contacto. Comprueba la conexión.';
                } finally {
                    this.ocupado = false;
                }
            }
        }
    });
}

iniciarAgenda();
