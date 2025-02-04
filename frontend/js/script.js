// Variables globales
let balizasSeleccionadas = new Set();
let datosClimaCache = {};
let climaChart = null;
let graficoChart = null;

$(document).ready(function() {
    $("#tabs").tabs({
        activate: function(event, ui) {
            if (ui.newPanel.attr('id') === 'tabs-3') {
                console.log('Tab gráfico activado');
                // Cargar las balizas inmediatamente al activar la pestaña
                cargarBalizasGrafico().then(() => {
                    console.log('Balizas cargadas para el gráfico');
                    // Solo inicializar el gráfico si no existe
                    if (!graficoChart) {
                        initializeGraficoChart();
                    }
                    // Actualizar traducciones dinámicas
                    updateDynamicTranslations();
                });
            }
        }
    });
    
    var map = L.map("mapid").setView([43.0, -2.5], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    //se crea un set para guardar las balizas que el usuario ha seleccionado en el mapa
    let markersMap = {};
    // Objeto para almacenar los datos del clima de cada baliza
    let datosClimaCache = {};
    
    // Set para mantener los atributos activos
    let atributosActivos = new Set();

    // Cargar atributos activos del localStorage
    function cargarAtributosActivos() {
        const atributosGuardados = localStorage.getItem('atributosActivos');
        if (atributosGuardados) {
            return new Set(JSON.parse(atributosGuardados));
        }
        // Por defecto, todos los atributos están visibles
        return new Set(['temperatura', 'humedad', 'viento', 'presion_atmosferica', 'tiempo', 'precipitaciones']);
    }

    // Guardar atributos activos en localStorage
    function guardarAtributosActivos() {
        localStorage.setItem('atributosActivos', 
            JSON.stringify(Array.from(atributosActivos)));
    }

    // Guardar balizas y sus datos en localStorage
    function guardarBalizas() {
        try {
            const balizasArray = Array.from(balizasSeleccionadas);
            
            // Guardar balizas seleccionadas
            localStorage.setItem('balizasSeleccionadas', JSON.stringify(balizasArray));
            
            // Guardar datos del clima
            localStorage.setItem('datosClimaCache', JSON.stringify(datosClimaCache));

            console.log('Balizas guardadas:', balizasArray);
            console.log('Datos clima guardados:', datosClimaCache);
        } catch (error) {
            console.error('Error al guardar datos en localStorage:', error);
        }
    }

    // Cargar balizas seleccionadas y sus datos del localStorage
    async function cargarBalizasGuardadas() {
        try {
            const balizasGuardadas = localStorage.getItem('balizasSeleccionadas');
            const datosClimaGuardados = localStorage.getItem('datosClimaCache');
            
            if (balizasGuardadas) {
                const balizasParseadas = JSON.parse(balizasGuardadas);
                balizasSeleccionadas = new Set(balizasParseadas);
                console.log('Balizas cargadas:', balizasParseadas);
                
                // Cargar los datos del clima si existen
                if (datosClimaGuardados) {
                    datosClimaCache = JSON.parse(datosClimaGuardados);
                }

                return balizasSeleccionadas;
            }
            return new Set();
        } catch (error) {
            console.error('Error al cargar datos del localStorage:', error);
            return new Set();
        }
    }

    // Función para crear un icono
    function crearIcono(tipo = 'blue') {
        return L.icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${tipo}.png`,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
        });
    }

    // Configuración del drag & drop
    function inicializarDragAndDrop() {
        const atributos = document.querySelectorAll('.atributo');
        const listasAtributos = document.querySelectorAll('.lista-atributos');
        const listaActivos = document.getElementById('atributos-activos-lista');
        const listaOcultos = document.getElementById('atributos-lista');

        // Mover los atributos a sus listas correspondientes según el estado guardado
        atributos.forEach(atributo => {
            const tipoAtributo = atributo.getAttribute('data-tipo');
            if (atributosActivos.has(tipoAtributo)) {
                listaActivos.appendChild(atributo);
            } else {
                listaOcultos.appendChild(atributo);
            }

            atributo.draggable = true;
            
            atributo.addEventListener('dragstart', function(e) {
                e.target.classList.add('dragging');
            });

            atributo.addEventListener('dragend', function(e) {
                e.target.classList.remove('dragging');
            });
        });

        listasAtributos.forEach(lista => {
            lista.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.classList.add('drag-over');
            });

            lista.addEventListener('dragleave', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
            });

            lista.addEventListener('drop', function(e) {
                e.preventDefault();
                this.classList.remove('drag-over');
                
                const atributoArrastrado = document.querySelector('.dragging');
                if (!atributoArrastrado) return;

                const tipoAtributo = atributoArrastrado.getAttribute('data-tipo');
                
                // Actualizar el set de atributos activos según la lista destino
                if (this.id === 'atributos-activos-lista') {
                    atributosActivos.add(tipoAtributo);
                } else {
                    atributosActivos.delete(tipoAtributo);
                }

                // Mover el elemento a la nueva lista
                this.appendChild(atributoArrastrado);
                
                // Guardar el estado de los atributos
                guardarAtributosActivos();

                // Mostrar notificación
                const notification = document.getElementById('notification');
                notification.classList.add('show');

                try {
                    // Actualizar la visualización usando los datos en cache
                    const cards = document.querySelectorAll('.clima-card');
                    cards.forEach(card => {
                        const municipio = card.querySelector('.card-title').textContent.trim();
                        const baliza = Array.from(balizasSeleccionadas).find(b => b.municipio === municipio);
                        
                        if (!baliza || !datosClimaCache[baliza.id]) return;

                        const clima = datosClimaCache[baliza.id];
                        
                        // Construir los elementos del clima según los atributos activos
                        const climaItems = [];
                        
                        if (atributosActivos.has('temperatura')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="temperatura">
                                    <i class="fas fa-thermometer-half"></i>
                                    <span>${convertUnit(clima.temperatura, '°C')}${translations[currentLanguage]['°C']}</span>
                                </div>
                            `);
                        }
                        
                        if (atributosActivos.has('humedad')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="humedad">
                                    <i class="fas fa-tint"></i>
                                    <span>${clima.humedad}${translations[currentLanguage]['%']}</span>
                                </div>
                            `);
                        }
                        
                        if (atributosActivos.has('viento')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="viento">
                                    <i class="fas fa-wind"></i>
                                    <span>${convertUnit(clima.viento, 'km/h')}${translations[currentLanguage]['km/h']}</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('presion_atmosferica')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="presion_atmosferica">
                                    <i class="fas fa-compress-arrows-alt"></i>
                                    <span>${clima.presion_atmosferica}${translations[currentLanguage]['hPa']}</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('tiempo')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="tiempo">
                                    <i class="${obtenerIconoTiempo(clima.tiempo)}"></i>
                                    <span>${translateWeather(clima.tiempo)}</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('precipitaciones')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="precipitaciones">
                                    <i class="fas fa-cloud-rain"></i>
                                    <span>${convertUnit(clima.precipitaciones, 'mm')}${translations[currentLanguage]['mm']}</span>
                                </div>
                            `);
                        }

                        const cardBody = card.querySelector('.card-body');
                        cardBody.innerHTML = `
                            ${climaItems.length > 0 ? 
                                `<div class="clima-info">${climaItems.join('')}</div>` : 
                                '<p class="text-center" data-translate="No hay datos visibles">No hay datos visibles</p>'
                            }
                            <div class="ultima-actualizacion">
                                <i class="far fa-clock"></i>
                                <span data-translate="Última actualización">Última actualización</span>: ${new Date(clima.fecha).toLocaleString(currentLanguage === 'es' ? 'es-ES' : 'en-US')}
                            </div>
                        `;

                        // Actualizar el color de fondo según la temperatura
                        if (atributosActivos.has('temperatura')) {
                            let fondo = 'card-templado';
                            if (clima.temperatura > 25) fondo = 'card-muy-calido';
                            else if (clima.temperatura > 20) fondo = 'card-calido';
                            else if (clima.temperatura > 10) fondo = 'card-templado';
                            else if (clima.temperatura > 0) fondo = 'card-frio';
                            else fondo = 'card-muy-frio';
                            
                            card.className = `card mb-3 clima-card ${fondo}`;
                        }
                    });

                    // Ocultar notificación después de completar la actualización
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 500);

                } catch (error) {
                    console.error('Error al actualizar visualización:', error);
                    // Cambiar el mensaje de la notificación en caso de error
                    const notificationContent = notification.querySelector('.notification-content');
                    notificationContent.innerHTML = `
                        <i class="fas fa-exclamation-circle"></i>
                        <span>Error al actualizar los datos</span>
                    `;
                    setTimeout(() => {
                        notification.classList.remove('show');
                    }, 3000);
                }
            });
        });
    }

    // Función para actualizar los datos del clima de una baliza
    async function actualizarDatosClima(baliza) {
        try {
            const response = await fetch(`http://localhost:85/api/climas/ultima/`);
            const datosClima = await response.json();
            const climaBaliza = datosClima.find(d => d.baliza_id === baliza.id);
            
            if (climaBaliza) {
                datosClimaCache[baliza.id] = climaBaliza;
                // Actualizar localStorage con los nuevos datos
                localStorage.setItem('datosClimaCache', JSON.stringify(datosClimaCache));
                return climaBaliza;
            }
            return null;
        } catch (error) {
            console.error('Error al actualizar datos del clima:', error);
            return null;
        }
    }

    // Inicializar estados desde localStorage
    async function inicializarEstado() {
        try {
            atributosActivos = cargarAtributosActivos();
            balizasSeleccionadas = await cargarBalizasGuardadas();
            
            // Si hay balizas guardadas, actualizar sus datos
            if (balizasSeleccionadas.size > 0) {
                const response = await fetch(`http://localhost:85/api/climas/ultima/`);
                const datosClima = await response.json();
                
                balizasSeleccionadas.forEach(baliza => {
                    const climaBaliza = datosClima.find(d => d.baliza_id === baliza.id);
                    if (climaBaliza) {
                        datosClimaCache[baliza.id] = climaBaliza;
                    }
                });
                
                // Guardar los datos actualizados
                localStorage.setItem('datosClimaCache', JSON.stringify(datosClimaCache));
            }
            
            // Inicializar drag & drop después de cargar los estados
            inicializarDragAndDrop();
            
            console.log('Estado inicializado:', {
                balizasSeleccionadas: Array.from(balizasSeleccionadas),
                atributosActivos: Array.from(atributosActivos)
            });
            
            // Si hay balizas seleccionadas, actualizar la información climática
            if (balizasSeleccionadas.size > 0) {
                actualizarInformacionClimatica();
            }
        } catch (error) {
            console.error('Error al inicializar estado:', error);
        }
    }

    // Inicializar el estado al cargar la página
    inicializarEstado().then(() => {
        fetch("http://localhost:85/api/balizas")
            .then((response) => response.json())
            .then(async (data) => {
                // Primero, actualizar los datos del clima para las balizas seleccionadas
                for (const baliza of Array.from(balizasSeleccionadas)) {
                    await actualizarDatosClima(baliza);
                }

                data.forEach((baliza) => {
                    // Comprobar si la baliza está en el conjunto de balizas seleccionadas
                    const balizaSeleccionada = Array.from(balizasSeleccionadas)
                        .find(b => b.id === baliza.id);
                    
                    if (balizaSeleccionada) {
                        // Actualizar la baliza en el conjunto con los datos más recientes
                        balizasSeleccionadas.delete(balizaSeleccionada);
                        balizasSeleccionadas.add(baliza);
                    }

                    const estaSeleccionada = balizaSeleccionada !== undefined;
                    const iconoBaliza = crearIcono(estaSeleccionada ? 'red' : 'blue');

                const marker = L.marker([baliza.latitud, baliza.longitud], {
                    icon: iconoBaliza,
                    id: `marker-${baliza.municipio.toLowerCase().replace(/\s+/g, '-')}`
                })
                    .on("mouseover", function () {
                        this.openPopup();
                    })
                    .on("mouseout", function () {
                        this.closePopup();
                    })
                        .on("click", async function () {
                            const estaSeleccionada = Array.from(balizasSeleccionadas).some(b => b.id === baliza.id);

                        if (estaSeleccionada) {
                                // Eliminar la baliza usando el ID
                                balizasSeleccionadas.forEach(b => {
                                    if (b.id === baliza.id) {
                                        balizasSeleccionadas.delete(b);
                                        // Eliminar datos del cache
                                        delete datosClimaCache[b.id];
                                    }
                                });
                                this.setIcon(crearIcono('blue'));
                        } else {
                            balizasSeleccionadas.add(baliza);
                                this.setIcon(crearIcono('red'));
                                
                                // Obtener y almacenar los datos del clima
                                await actualizarDatosClima(baliza);
                            }
                            
                            // Guardar el estado actual de las balizas
                            guardarBalizas();
                        actualizarInformacionClimatica();
                    })
                    .bindPopup(`<b>${baliza.municipio}</b>`)
                    .addTo(map);

                    // Guardar referencia al marker
                    markersMap[baliza.id] = marker;

                    // Si la baliza estaba seleccionada previamente, añadirla al set
                    if (estaSeleccionada) {
                        balizasSeleccionadas.add(baliza);
                    }
                });
                
                // Actualizar la información climática inicial si hay balizas seleccionadas
                if (balizasSeleccionadas.size > 0) {
                    actualizarInformacionClimatica();
                }
            
            //cada vez que se cambia de pestaña de tabs, comprueba si es la pestaña de clima(tabs-2) y actualiza la información del clima
            $("#tabs").on("tabsactivate", function(event, ui) {
                if (ui.newPanel.attr('id') === 'tabs-2') {
                    actualizarInformacionClimatica();
                }
            });
            
                // Función para actualizar la visualización de las cards
            async function actualizarInformacionClimatica() {
                    if (balizasSeleccionadas.size === 0) {
                        $("#tiempo-actual").html('<p>No hay balizas seleccionadas</p>');
                        return;
                    }

                    try {
                        // Añadir un pequeño retraso para mostrar el indicador de carga
                        await new Promise(resolve => setTimeout(resolve, 300));

                        const response = await fetch(`http://localhost:85/api/climas/ultima/`);
                        const datosClima = await response.json();
                        
                        const contenidoHTML = Array.from(balizasSeleccionadas).map(baliza => {
                            try {
                                const clima = datosClima.find(d => d.baliza_id === baliza.id);
                        
                        if (!clima) {
                            throw new Error('No se encontraron datos para esta baliza');
                        }

                                // Determinar el color de fondo basado en la temperatura
                                let fondo = 'card-templado';
                                if (atributosActivos.has('temperatura')) {
                                    if (clima.temperatura > 25) fondo = 'card-muy-calido';
                                    else if (clima.temperatura > 20) fondo = 'card-calido';
                                    else if (clima.temperatura > 10) fondo = 'card-templado';
                                    else if (clima.temperatura > 0) fondo = 'card-frio';
                                    else fondo = 'card-muy-frio';
                                }

                                // Construir los elementos del clima según los atributos activos
                                const climaItems = [];
                                
                                if (atributosActivos.has('temperatura')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="temperatura">
                                            <i class="fas fa-thermometer-half"></i>
                                            <span>${convertUnit(clima.temperatura, '°C')}${translations[currentLanguage]['°C']}</span>
                                        </div>
                                    `);
                                }
                                
                                if (atributosActivos.has('humedad')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="humedad">
                                            <i class="fas fa-tint"></i>
                                            <span>${clima.humedad}${translations[currentLanguage]['%']}</span>
                                        </div>
                                    `);
                                }
                                
                                if (atributosActivos.has('viento')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="viento">
                                            <i class="fas fa-wind"></i>
                                            <span>${convertUnit(clima.viento, 'km/h')}${translations[currentLanguage]['km/h']}</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('presion_atmosferica')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="presion_atmosferica">
                                            <i class="fas fa-compress-arrows-alt"></i>
                                            <span>${clima.presion_atmosferica}${translations[currentLanguage]['hPa']}</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('tiempo')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="tiempo">
                                            <i class="${obtenerIconoTiempo(clima.tiempo)}"></i>
                                            <span>${translateWeather(clima.tiempo)}</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('precipitaciones')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="precipitaciones">
                                            <i class="fas fa-cloud-rain"></i>
                                            <span>${convertUnit(clima.precipitaciones, 'mm')}${translations[currentLanguage]['mm']}</span>
                                        </div>
                                    `);
                        }
                        
                        return `
                            <div class="card mb-3 clima-card ${fondo}">
                                <div class="card-header">
                                    <h5 class="card-title">
                                        <i class="fas fa-map-marker-alt"></i> 
                                        ${baliza.municipio}
                                        <i class="${obtenerIconoTiempo(clima.tiempo)}" style="margin-left: 10px;"></i>
                                    </h5>
                                </div>
                                <div class="card-body">
                                            ${climaItems.length > 0 ? 
                                                `<div class="clima-info">${climaItems.join('')}</div>` : 
                                                '<p class="text-center" data-translate="No hay datos visibles">No hay datos visibles</p>'
                                            }
                                            <div class="ultima-actualizacion">
                                                <i class="far fa-clock"></i>
                                                <span data-translate="Última actualización">Última actualización</span>: ${new Date(clima.fecha).toLocaleString(currentLanguage === 'es' ? 'es-ES' : 'en-US')}
                                    </div>
                                </div>
                            </div>
                        `;
                    } catch (error) {
                                console.error(`Error procesando datos para ${baliza.municipio}:`, error);
                        return `
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h5 class="card-title">${baliza.municipio}</h5>
                                </div>
                                <div class="card-body">
                                    <p class="card-text">Error al cargar los datos</p>
                                </div>
                            </div>
                        `;
                    }
                        });
                        
                        $("#tiempo-actual").html(contenidoHTML.join(''));
                    } catch (error) {
                        console.error('Error al actualizar información climática:', error);
                        $("#tiempo-actual").html('<p>Error al cargar los datos</p>');
                    }
            }
        })
        .catch((error) => console.error("Error obteniendo datos:", error));
});

    //funcion para obtener el icono adecuado según el tiempo que haga
    function obtenerIconoTiempo(tiempo) {
        // Convertir a minúsculas para hacer la comparación insensible a mayúsculas
        const tiempoLower = tiempo.toLowerCase();
        
        const iconos = {
            'soleado': 'fas fa-sun',
            'sol': 'fas fa-sun',
            'despejado': 'fas fa-sun',
            'parcialmente nublado': 'fas fa-cloud-sun',
            'nubes dispersas': 'fas fa-cloud-sun',
            'intervalos nubosos': 'fas fa-cloud-sun',
            'nubes': 'fas fa-cloud',
            'nublado': 'fas fa-cloud',
            'muy nuboso': 'fas fa-cloud',
            'cubierto': 'fas fa-cloud',
            'lluvia': 'fas fa-cloud-rain',
            'lluvioso': 'fas fa-cloud-rain',
            'chubascos': 'fas fa-cloud-rain',
            'precipitaciones': 'fas fa-cloud-rain',
            'tormenta': 'fas fa-bolt',
            'tormentoso': 'fas fa-bolt',
            'tormenta eléctrica': 'fas fa-bolt',
            'nieve': 'fas fa-snowflake',
            'nevado': 'fas fa-snowflake',
            'aguanieve': 'fas fa-snowflake',
            'niebla': 'fas fa-smog',
            'bruma': 'fas fa-smog'
        };

        // Buscar coincidencia en el objeto de iconos
        for (let key in iconos) {
            if (tiempoLower.includes(key)) {
                return iconos[key];
            }
        }
        return 'fas fa-cloud-sun';
    }

    // Función para cargar las balizas en el selector
    async function cargarBalizas() {
        try {
            const response = await fetch('http://localhost:85/api/balizas');
            if (!response.ok) throw new Error('Error al obtener las balizas');
            
            const balizas = await response.json();
            const selector = document.getElementById('baliza-selector');
            
            // Limpiar opciones existentes
            selector.innerHTML = '<option value="" data-translate="seleccionar-baliza-placeholder">Seleccione una baliza</option>';
            
            // Añadir las balizas al selector
            balizas.forEach(baliza => {
                const option = document.createElement('option');
                option.value = baliza.id;
                option.textContent = baliza.municipio;
                selector.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar las balizas:', error);
        }
    }

    // Función para inicializar el gráfico
    function initializeGraficoChart() {
        console.log('Inicializando gráfico...');
        
        const canvas = document.getElementById('grafico-chart');
        if (!canvas) {
            console.error('No se encontró el elemento canvas del gráfico');
            return;
        }

        // Si el gráfico ya existe y está inicializado, no es necesario volver a crearlo
        if (graficoChart) {
            console.log('El gráfico ya está inicializado');
            return;
        }

        const ctx = canvas.getContext('2d');

        // Configurar fechas por defecto
        const hoy = new Date();
        const hace7Dias = new Date(hoy);
        hace7Dias.setDate(hoy.getDate() - 7);

        const formatearFecha = (fecha) => {
            return fecha.toISOString().split('T')[0];
        };

        document.getElementById('fecha-inicio-grafico').value = formatearFecha(hace7Dias);
        document.getElementById('fecha-fin-grafico').value = formatearFecha(hoy);

        // Crear el gráfico con dos datasets
        graficoChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: translations[currentLanguage]['temperatura'],
                        data: [],
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        yAxisID: 'y-temperatura',
                        tension: 0.4
                    },
                    {
                        label: translations[currentLanguage]['humedad'],
                        data: [],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        yAxisID: 'y-humedad',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 14
                            },
                            color: '#2c3e50'
                        }
                    },
                    title: {
                        display: true,
                        text: translations[currentLanguage]['grafico-atributo'],
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#2c3e50',
                        padding: 20
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: translations[currentLanguage]['fecha'],
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 14
                            }
                        }
                    },
                    'y-temperatura': {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: translations[currentLanguage]['temperatura'] + ' (' + translations[currentLanguage]['°C'] + ')',
                            color: '#e74c3c',
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 14
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value + (currentLanguage === 'en' ? '°F' : '°C');
                            }
                        }
                    },
                    'y-humedad': {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: translations[currentLanguage]['humedad'] + ' (' + translations[currentLanguage]['%'] + ')',
                            color: '#3498db',
                            font: {
                                family: "'Roboto', sans-serif",
                                size: 14
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }

    // Función para cargar datos del gráfico
    async function cargarDatosGrafico(balizaId, fechaInicio, fechaFin) {
        try {
            console.log('Cargando datos del gráfico...', { balizaId, fechaInicio, fechaFin });
            
            // Formatear las fechas para la API
            const inicio = fechaInicio + ' 00:00:00';
            const fin = fechaFin + ' 23:59:59';
            
            const response = await fetch(`http://localhost:85/api/historico/${balizaId}?inicio=${inicio}&fin=${fin}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Error al obtener datos históricos');
            }

            const datos = await response.json();
            console.log('Datos recibidos:', datos);

            if (datos.length === 0) {
                alert(translations[currentLanguage]["no-datos"]);
                return;
            }
            
            // Procesar los datos
            const fechas = datos.map(d => new Date(d.fecha).toLocaleDateString());
            const temperaturas = datos.map(d => parseFloat(d.temperatura));
            const humedades = datos.map(d => parseFloat(d.humedad));

            // Obtener el nombre de la baliza seleccionada
            const balizaSeleccionada = document.getElementById('baliza-grafico').options[
                document.getElementById('baliza-grafico').selectedIndex
            ]?.text || '';

            console.log('Actualizando gráfico con:', { fechas, temperaturas, humedades, balizaSeleccionada });

            // Actualizar el título
            graficoChart.options.plugins.title.text = `Temperatura y Humedad - ${balizaSeleccionada}`;

            // Actualizar los datos del gráfico
            graficoChart.data.labels = fechas;
            graficoChart.data.datasets[0].data = temperaturas;
            graficoChart.data.datasets[1].data = humedades;

            graficoChart.update();
        } catch (error) {
            console.error('Error:', error);
            alert(translations[currentLanguage]["error-datos"]);
        }
    }

    // Event listener para el botón de mostrar gráfico
    $(document).on('click', '#mostrar-grafico', function() {
        console.log('Click en mostrar gráfico');
        const balizaId = document.getElementById('baliza-grafico').value;
        const fechaInicio = document.getElementById('fecha-inicio-grafico').value;
        const fechaFin = document.getElementById('fecha-fin-grafico').value;

        console.log('Valores obtenidos:', { balizaId, fechaInicio, fechaFin });
        
        if (!balizaId || !fechaInicio || !fechaFin) {
            alert(translations[currentLanguage]["seleccionar-todos"]);
            return;
        }
        
        if (new Date(fechaInicio) >= new Date(fechaFin)) {
            alert(translations[currentLanguage]["error-fechas"]);
            return;
        }
        
        cargarDatosGrafico(balizaId, fechaInicio, fechaFin);
    });

    // Función para cargar las balizas en el selector
    async function cargarBalizasGrafico() {
        try {
            console.log('Cargando balizas para el gráfico...');
            const response = await fetch('http://localhost:85/api/balizas');
            if (!response.ok) throw new Error('Error al obtener las balizas');
            
            const balizas = await response.json();
            console.log('Balizas obtenidas:', balizas);
            
            const selector = document.getElementById('baliza-grafico');
            if (!selector) {
                console.error('No se encontró el selector de balizas');
                return;
            }
            
            // Limpiar opciones existentes
            selector.innerHTML = `<option value="" data-translate="seleccionar-baliza-placeholder">${translations[currentLanguage]['seleccionar-baliza-placeholder']}</option>`;
            
            // Añadir las balizas al selector
            balizas.forEach(baliza => {
                const option = document.createElement('option');
                option.value = baliza.id;
                option.textContent = baliza.municipio;
                selector.appendChild(option);
            });
            
            console.log('Selector de balizas actualizado');
        } catch (error) {
            console.error('Error al cargar las balizas:', error);
        }
    }

    // Event listener para cambios de idioma
    document.addEventListener('languageChanged', function(event) {
        console.log('Idioma cambiado a:', event.detail.language);
        
        // Si el gráfico existe, actualizar sus textos
        if (graficoChart) {
            const balizaSeleccionada = document.getElementById('baliza-grafico').options[
                document.getElementById('baliza-grafico').selectedIndex
            ]?.text || '';

            // Actualizar título del gráfico
            graficoChart.options.plugins.title.text = balizaSeleccionada ? 
                `${translations[currentLanguage]['temperatura-humedad']} - ${balizaSeleccionada}` :
                translations[currentLanguage]['grafico-atributo'];

            // Actualizar etiquetas de los ejes
            graficoChart.options.scales['y-temperatura'].title.text = translations[currentLanguage]['temperatura'] + ' (' + translations[currentLanguage]['°C'] + ')';
            graficoChart.options.scales['y-humedad'].title.text = translations[currentLanguage]['humedad'] + ' (' + translations[currentLanguage]['%'] + ')';
            
            // Actualizar etiquetas de los datasets
            graficoChart.data.datasets[0].label = translations[currentLanguage]['temperatura'];
            graficoChart.data.datasets[1].label = translations[currentLanguage]['humedad'];

            // Actualizar etiqueta del eje X
            graficoChart.options.scales.x.title.text = translations[currentLanguage]['fecha'];

            // Actualizar los ticks del eje Y de temperatura
            graficoChart.options.scales['y-temperatura'].ticks.callback = function(value) {
                return value + (currentLanguage === 'en' ? '°F' : '°C');
            };

            graficoChart.update('none'); // Actualizar sin animación para evitar parpadeos
        }

        // Actualizar la información climática si existe la función
        if (typeof actualizarInformacionClimatica === 'function') {
            actualizarInformacionClimatica();
        }
    });
});