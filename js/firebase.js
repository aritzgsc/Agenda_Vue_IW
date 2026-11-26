// Solo se descargan las bibliotecas si Firebase está configurado.
function firebaseConfigurado() {
    var config = window.agendaFirebaseConfig || {};
    return ['apiKey', 'authDomain', 'projectId', 'appId'].every(function (clave) {
        return typeof config[clave] === 'string' && config[clave].trim() !== '';
    });
}

function cargarScript(url) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = url;
        var temporizador = setTimeout(function () {
            script.remove();
            reject(new Error('Tiempo de carga agotado.'));
        }, 15000);
        script.onload = function () {
            clearTimeout(temporizador);
            resolve();
        };
        script.onerror = function () {
            clearTimeout(temporizador);
            reject(new Error('No se pudo cargar Firebase/Vuefire.'));
        };
        document.head.appendChild(script);
    });
}

async function conectarFirebase() {
    var cdn = 'https://www.gstatic.com/firebasejs/7.24.0/';
    await cargarScript(cdn + 'firebase-app.js');
    await cargarScript(cdn + 'firebase-auth.js');
    await cargarScript(cdn + 'firebase-firestore.js');
    await cargarScript('https://cdn.jsdelivr.net/npm/vuefire@2.2.5/dist/vuefire.js');
    Vue.use(Vuefire.firestorePlugin);
    firebase.initializeApp(window.agendaFirebaseConfig);
    return { auth: firebase.auth(), db: firebase.firestore() };
}
