let balizasSeleccionadas = new Set(), datosClimaCache = {}, graficoChart = null, 
    isOverTooltip = false, isOverMunicipio = false;
let atributosActivos = new Set(['temperatura', 'humedad', 'viento', 'presion_atmosferica', 'tiempo', 'precipitaciones']);

$(document).ready(async function() {
    $("#tabs").tabs({
        activate: (e, ui) => {
            if (ui.newPanel.attr('id') === 'tabs-3') {
                cargarBalizasGrafico().then(() => {
                    if (!graficoChart) inicializarGraficoChart();
                    updateDynamicTranslations();
                });
            } else if (ui.newPanel.attr('id') === 'tabs-2') actualizarInformacionClimatica();
        }
    });

    const map = L.map("mapid").setView([43.0, -2.5], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    await inicializarEstado();
    cargarBalizas(map);
    inicializarDragAndDrop();
});

// Funciones de estado
function cargarAtributosActivos() {
    const guardados = localStorage.getItem('atributosActivos');
    return guardados ? new Set(JSON.parse(guardados)) : new Set(['temperatura', 'humedad', 'viento', 'presion_atmosferica', 'tiempo', 'precipitaciones']);
}

function guardarEstado() {
    localStorage.setItem('atributosActivos', JSON.stringify(Array.from(atributosActivos)));
    localStorage.setItem('balizasSeleccionadas', JSON.stringify(Array.from(balizasSeleccionadas)));
    localStorage.setItem('datosClimaCache', JSON.stringify(datosClimaCache));
}

async function inicializarEstado() {
    try {
        atributosActivos = cargarAtributosActivos();
        const balizasGuardadas = localStorage.getItem('balizasSeleccionadas');
        if (balizasGuardadas) {
            balizasSeleccionadas = new Set(JSON.parse(balizasGuardadas));
            const datosGuardados = localStorage.getItem('datosClimaCache');
            if (datosGuardados) datosClimaCache = JSON.parse(datosGuardados);
            if (balizasSeleccionadas.size > 0) await actualizarDatosClima();
        }
    } catch (error) { console.error('Error al inicializar estado:', error); }
}

// Funciones de UI
function crearIcono(tipo = 'blue') {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${tipo}.png`,
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
    });
}

function inicializarDragAndDrop() {
    const atributos = document.querySelectorAll('.atributo');
    const listasAtributos = document.querySelectorAll('.lista-atributos');
    const [listaActivos, listaOcultos] = ['atributos-activos-lista', 'atributos-lista'].map(id => document.getElementById(id));

    atributos.forEach(atributo => {
        const tipoAtributo = atributo.getAttribute('data-tipo');
        (atributosActivos.has(tipoAtributo) ? listaActivos : listaOcultos).appendChild(atributo);
        atributo.draggable = true;
        atributo.addEventListener('dragstart', e => e.target.classList.add('dragging'));
        atributo.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    });

    listasAtributos.forEach(lista => {
        lista.addEventListener('dragover', e => { e.preventDefault(); lista.classList.add('drag-over'); });
        lista.addEventListener('dragleave', e => { e.preventDefault(); lista.classList.remove('drag-over'); });
        lista.addEventListener('drop', handleDrop);
    });
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    const atributo = document.querySelector('.dragging');
    if (!atributo) return;
    
    const tipo = atributo.getAttribute('data-tipo');
    this.id === 'atributos-activos-lista' ? atributosActivos.add(tipo) : atributosActivos.delete(tipo);
    this.appendChild(atributo);
    guardarEstado();
    mostrarNotificacion();
    actualizarInformacionClimatica();
}

function mostrarNotificacion(error = false) {
    const notification = document.getElementById('notification');
    if (error) {
        notification.querySelector('.notification-content').innerHTML = 
            '<i class="fas fa-exclamation-circle"></i><span>Error al actualizar los datos</span>';
    }
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), error ? 3000 : 500);
}

// Funciones de datos
async function actualizarDatosClima() {
    try {
        const response = await fetch('http://localhost:85/api/climas/ultima/');
        const datos = await response.json();
        balizasSeleccionadas.forEach(baliza => {
            const clima = datos.find(d => d.baliza_id === baliza.id);
            if (clima) datosClimaCache[baliza.id] = clima;
        });
        guardarEstado();
        return true;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function cargarBalizas(map) {
    try {
        const response = await fetch('http://localhost:85/api/balizas');
        const balizas = await response.json();
        
        balizas.forEach(baliza => {
            const estaSeleccionada = Array.from(balizasSeleccionadas).some(b => b.id === baliza.id);
            L.marker([baliza.latitud, baliza.longitud], {
                icon: crearIcono(estaSeleccionada ? 'red' : 'blue')
            })
            .on('mouseover', function() { this.openPopup(); })
            .on('mouseout', function() { this.closePopup(); })
            .on('click', async function() {
                const estaSeleccionada = Array.from(balizasSeleccionadas).some(b => b.id === baliza.id);
                        if (estaSeleccionada) {
                    balizasSeleccionadas.forEach(b => {
                        if (b.id === baliza.id) {
                            balizasSeleccionadas.delete(b);
                            delete datosClimaCache[b.id];
                        }
                    });
                    this.setIcon(crearIcono('blue'));
                } else {
                    balizasSeleccionadas.add(baliza);
                    this.setIcon(crearIcono('red'));
                    await actualizarDatosClima();
                }
                guardarEstado();
                        actualizarInformacionClimatica();
                    })
                    .bindPopup(`<b>${baliza.municipio}</b>`)
                    .addTo(map);
            });
    } catch (error) { console.error('Error:', error); }
}
 
// Eventos de tooltip
$(document).on({
    'mouseenter': async function(e) {
        e.preventDefault();
        const elemento = $(this);
        isOverMunicipio = true;
        if (elemento.data('tooltip-activo')) return;
        
        elemento.data('tooltip-activo', true)
        .tooltip({
            items: '.municipio-nombre',
            content: '<div class="loading-tooltip"><i class="fas fa-spinner fa-spin"></i> Cargando pronóstico...</div>',
            position: { my: "center bottom", at: "center top-10" },
            tooltipClass: "pronostico-tooltip-container",
            show: { effect: "fadeIn", duration: 200 },
            hide: { effect: "fadeOut", duration: 200 },
            close: () => elemento.data('tooltip-activo', false)
        }).tooltip("open");

        try {
            const baliza = Array.from(balizasSeleccionadas)
                .find(b => b.municipio === elemento.data('municipio'));
            if (!baliza) throw new Error(translations[currentLanguage]['baliza-no-encontrada']);
            
            const forecast = await obtenerForecast(baliza);
            if (elemento.data('tooltip-activo')) {
                elemento.tooltip('option', 'content', 
                    `<div class="pronostico-tooltip"><div class="pronostico-detalles">
                        <p style="white-space: pre-line;">${forecast}</p></div></div>`);
            }
        } catch (error) {
            console.error('Error:', error);
            if (elemento.data('tooltip-activo')) {
                elemento.tooltip('option', 'content', 
                    `<div class="error-tooltip"><i class="fas fa-exclamation-circle"></i>
                    ${error.message || translations[currentLanguage]['error-pronostico']}</div>`);
            }
        }
    },
    'mouseleave': function() {
        const elemento = $(this);
        isOverMunicipio = false;
        setTimeout(() => {
            if (!isOverTooltip && !isOverMunicipio) {
                elemento.tooltip('close');
                elemento.data('tooltip-activo', false);
            }
        }, 100);
    }
}, '.municipio-nombre');

$(document).on({
    'mouseenter': () => isOverTooltip = true,
    'mouseleave': function() {
        isOverTooltip = false;
        const elemento = $('.municipio-nombre[data-tooltip-activo]');
        setTimeout(() => {
            if (!isOverTooltip && !isOverMunicipio) {
                elemento.tooltip('close');
                elemento.data('tooltip-activo', false);
            }
        }, 100);
    }
}, '.ui-tooltip');

// Funciones del gráfico
async function cargarBalizasGrafico() {
    try {
        const response = await fetch('http://localhost:85/api/balizas');
        if (!response.ok) throw new Error('Error al obtener las balizas');
        
        const balizas = await response.json();
        const selector = document.getElementById('baliza-grafico');
        if (!selector) return;
        
        selector.innerHTML = `<option value="" data-translate="seleccionar-baliza-placeholder">
            ${translations[currentLanguage]['seleccionar-baliza-placeholder']}</option>`;
        
        balizas.forEach(baliza => {
            const option = document.createElement('option');
            option.value = baliza.id;
            option.textContent = baliza.municipio;
            selector.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
}

function inicializarGraficoChart() {
    const canvas = document.getElementById('grafico-chart');
    if (!canvas || graficoChart) return;

    const ctx = canvas.getContext('2d');
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hoy.getDate() - 7);

    document.getElementById('fecha-inicio-grafico').value = hace7Dias.toISOString().split('T')[0];
    document.getElementById('fecha-fin-grafico').value = hoy.toISOString().split('T')[0];

    graficoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: translations[currentLanguage]['temperatura'],
                data: [],
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                yAxisID: 'y-temperatura',
                tension: 0.4
            }, {
                label: translations[currentLanguage]['humedad'],
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                yAxisID: 'y-humedad',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: "'Roboto', sans-serif", size: 14 },
                        color: '#2c3e50'
                    }
                },
                title: {
                    display: true,
                    text: translations[currentLanguage]['grafico-atributo'],
                    font: { family: "'Roboto', sans-serif", size: 16, weight: 'bold' },
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
                        font: { family: "'Roboto', sans-serif", size: 14 }
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
                        font: { family: "'Roboto', sans-serif", size: 14 }
                    },
                    ticks: {
                        callback: value => value + (currentLanguage === 'en' ? '°F' : '°C')
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
                        font: { family: "'Roboto', sans-serif", size: 14 }
                    },
                    ticks: { callback: value => value + '%' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

async function cargarDatosGrafico(balizaId, fechaInicio, fechaFin) {
    try {
        const response = await fetch(`http://localhost:85/api/historico/${balizaId}?inicio=${fechaInicio} 00:00:00&fin=${fechaFin} 23:59:59`);
        if (!response.ok) throw new Error('Error al obtener datos históricos');

                        const datos = await response.json();
        if (datos.length === 0) {
            alert(translations[currentLanguage]["no-datos"]);
            return;
        }

        const fechas = datos.map(d => new Date(d.fecha).toLocaleDateString());
        const temperaturas = datos.map(d => parseFloat(d.temperatura));
        const humedades = datos.map(d => parseFloat(d.humedad));
        const balizaSeleccionada = document.getElementById('baliza-grafico').options[
            document.getElementById('baliza-grafico').selectedIndex
        ]?.text || '';

        graficoChart.options.plugins.title.text = `${translations[currentLanguage]['temperatura-humedad']} - ${balizaSeleccionada}`;
        graficoChart.data.labels = fechas;
        graficoChart.data.datasets[0].data = temperaturas;
        graficoChart.data.datasets[1].data = humedades;
        graficoChart.update();
    } catch (error) {
        console.error('Error:', error);
        alert(translations[currentLanguage]["error-datos"]);
    }
}

// Función para obtener el pronóstico
async function obtenerForecast(baliza) {
    try {
        const CIUDADES = {
            1: { nombre: 'donostia', zona: 'donostialdea' },
            2: { nombre: 'irun', zona: 'coast_zone' },
            3: { nombre: 'eibar', zona: 'cantabrian_valleys' },
            4: { nombre: 'bilbao', zona: 'great_bilbao' },
            5: { nombre: 'gasteiz', zona: 'vitoria_gasteiz' }
        };

        const ciudad = CIUDADES[baliza.id];
        if (!ciudad) throw new Error(translations[currentLanguage]['ciudad-no-encontrada']);

        const fechaMañana = new Date();
        fechaMañana.setDate(fechaMañana.getDate() + 1);
        const fechaHoy = new Date().toISOString().split('T')[0].split('-');
        const fechaMañanaStr = fechaMañana.toISOString().split('T')[0].replace(/-/g, '');

        const response = await fetch(
            `https://api.euskadi.eus/euskalmet/weather/regions/basque_country/zones/${ciudad.zona}/locations/${ciudad.nombre}/forecast/at/${fechaHoy[0]}/${fechaHoy[1]}/${fechaHoy[2]}/for/${fechaMañanaStr}`,
            {
                headers: {
                    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZXQwMS5hcGlrZXkiLCJpc3MiOiJJRVMgUExBSUFVTkRJIEJISSBJUlVOIiwiZXhwIjoyMjM4MTMxMDAyLCJ2ZXJzaW9uIjoiMS4wLjAiLCJpYXQiOjE3MzM5ODgyMTAsImVtYWlsIjoiaWtjdHNAcGxhaWF1bmRpLm5ldCJ9.tbwG0cjPse3hTlZTiIYsC0GAw1JlcUCiCBaIMuFGsmxOeBdpPcI1J5nLS6vl805S8XhpSZvLLVpWt0G_jxaHFVH9D7fFFWmwcRP4OQM2XRrZH_7vMIcd5SR7AyjVWuiIb8NRt8JOE_WY4TStKwFfG5eClHZZ_AReJ1Xx4usuLVr2a9Opu2rbc3Vmzwl_VnX-5qHVaJFVe_Qf6CsDhAzpcqsLsWUiCq0soWIMEjfGtX1taFW6WOgy3ru0YD0hviLUOEHloNMxwum-bRXa2ukcsGl4eCjgu7fGxT3soR3_wxa0F4M6aPjp5haeA31_KqVDuwOviUmCrKScy5vyVUCMng'
                }
            }
        );

        if (!response.ok) throw new Error(`${translations[currentLanguage]['error-api']}: ${response.status}`);

        const buffer = await response.arrayBuffer();
        const data = JSON.parse(new TextDecoder('iso-8859-1').decode(buffer));

        if (!data?.forecastText?.SPANISH) throw new Error(translations[currentLanguage]['formato-invalido']);

        const forecast = data.forecastText.SPANISH
            .replace(/&[aeiou]acute;/g, match => 'áéíóú'['aeiou'.indexOf(match[1])])
            .replace(/&[AEIOU]acute;/g, match => 'ÁÉÍÓÚ'['AEIOU'.indexOf(match[1])])
            .replace(/&ntilde;/g, 'ñ')
            .replace(/&Ntilde;/g, 'Ñ')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&[lg]t;/g, match => match[1] === 'l' ? '<' : '>')
            .replace(/&#39;/g, "'")
            .replace(/\n/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();

        return `📅 ${baliza.municipio}\n\n${forecast}`;
    } catch (error) {
        console.error('Error:', error);
        return translations[currentLanguage]['pronostico-no-disponible'];
    }
}

// Event listeners
$(document).on('click', '#mostrar-grafico', function() {
    const balizaId = document.getElementById('baliza-grafico').value;
    const fechaInicio = document.getElementById('fecha-inicio-grafico').value;
    const fechaFin = document.getElementById('fecha-fin-grafico').value;

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

// Event listener para cambios de idioma
document.addEventListener('languageChanged', function(event) {
    if (graficoChart) {
        const balizaSeleccionada = document.getElementById('baliza-grafico').options[
            document.getElementById('baliza-grafico').selectedIndex
        ]?.text || '';

        graficoChart.options.plugins.title.text = balizaSeleccionada ? 
            `${translations[currentLanguage]['temperatura-humedad']} - ${balizaSeleccionada}` :
            translations[currentLanguage]['grafico-atributo'];

        graficoChart.options.scales['y-temperatura'].title.text = 
            translations[currentLanguage]['temperatura'] + ' (' + translations[currentLanguage]['°C'] + ')';
        graficoChart.options.scales['y-humedad'].title.text = 
            translations[currentLanguage]['humedad'] + ' (' + translations[currentLanguage]['%'] + ')';
        
        graficoChart.data.datasets[0].label = translations[currentLanguage]['temperatura'];
        graficoChart.data.datasets[1].label = translations[currentLanguage]['humedad'];
        graficoChart.options.scales.x.title.text = translations[currentLanguage]['fecha'];
        graficoChart.options.scales['y-temperatura'].ticks.callback = 
            value => value + (currentLanguage === 'en' ? '°F' : '°C');

        graficoChart.update('none');
    }

    if (typeof actualizarInformacionClimatica === 'function') {
        actualizarInformacionClimatica();
    }
});

// Función para actualizar la información climática
async function actualizarInformacionClimatica() {
    if (balizasSeleccionadas.size === 0) {
        $("#tiempo-actual").html(`<p>${translations[currentLanguage]['No hay balizas seleccionadas']}</p>`);
        return;
    }

    try {
        // Usar los datos en caché si están disponibles
        let datosClima;
        if (Object.keys(datosClimaCache).length > 0) {
            datosClima = Object.values(datosClimaCache);
                        } else {
            const response = await fetch('http://localhost:85/api/climas/ultima/');
            datosClima = await response.json();
        }
        
        const contenidoHTML = Array.from(balizasSeleccionadas).map(baliza => {
            try {
                const clima = datosClima.find(d => d.baliza_id === baliza.id);
                if (!clima) throw new Error(translations[currentLanguage]['No se encontraron datos para esta baliza']);

                const climaItems = [];
                const atributosConfig = {
                    temperatura: {
                        icon: 'fas fa-thermometer-half',
                        value: () => `${convertUnit(clima.temperatura, '°C')}${translations[currentLanguage]['°C']}`
                    },
                    humedad: {
                        icon: 'fas fa-tint',
                        value: () => `${clima.humedad}${translations[currentLanguage]['%']}`
                    },
                    viento: {
                        icon: 'fas fa-wind',
                        value: () => `${convertUnit(clima.viento, 'km/h')}${translations[currentLanguage]['km/h']}`
                    },
                    presion_atmosferica: {
                        icon: 'fas fa-compress-arrows-alt',
                        value: () => `${clima.presion_atmosferica}${translations[currentLanguage]['hPa']}`
                    },
                    tiempo: {
                        icon: obtenerIconoTiempo(clima.tiempo),
                        value: () => translateWeather(clima.tiempo)
                    },
                    precipitaciones: {
                        icon: 'fas fa-cloud-rain',
                        value: () => `${convertUnit(clima.precipitaciones, 'mm')}${translations[currentLanguage]['mm']}`
                    }
                };

                const itemsHTML = Object.entries(atributosConfig)
                    .filter(([tipo]) => atributosActivos.has(tipo))
                    .map(([tipo, config]) => `
                        <div class="clima-item" data-tipo="${tipo}">
                            <i class="${config.icon}"></i>
                            <span>${config.value()}</span>
                        </div>
                    `).join('');

                return `
                    <div class="card mb-3 clima-card" data-tiempo="${clima.tiempo.toLowerCase()}">
                        <div class="card-header">
                            <h5 class="card-title">
                                <i class="fas fa-map-marker-alt"></i> 
                                <span class="municipio-nombre" data-municipio="${baliza.municipio}">${baliza.municipio}</span>
                                <i class="${obtenerIconoTiempo(clima.tiempo)}" style="margin-left: 10px;"></i>
                            </h5>
                        </div>
                        <div class="card-body">
                            ${atributosActivos.size === 0 ? 
                                `<p class="text-center" style="margin: 20px 0; color: rgba(255,255,255,0.8);">
                                    <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
                                    ${translations[currentLanguage]['No se ha seleccionado información'] || 'No se ha seleccionado información'}
                                </p>` :
                                itemsHTML ? 
                                    `<div class="clima-info">${itemsHTML}</div>` : 
                                    `<p class="text-center" data-translate="No hay datos visibles">${translations[currentLanguage]['No hay datos visibles']}</p>`
                            }
                            <div class="ultima-actualizacion">
                                <i class="far fa-clock"></i>
                                <span data-translate="Última actualización">${translations[currentLanguage]['Última actualización']}</span>: 
                                ${new Date(clima.fecha).toLocaleString(currentLanguage === 'es' ? 'es-ES' : 'en-US')}
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
                            <p class="card-text">${translations[currentLanguage]['Error al cargar los datos']}</p>
                        </div>
                    </div>
                `;
            }
        });
        
        $("#tiempo-actual").html(contenidoHTML.join(''));
    } catch (error) {
        console.error('Error al actualizar información climática:', error);
        $("#tiempo-actual").html(`<p>${translations[currentLanguage]['Error al cargar los datos']}</p>`);
    }
}

// Función para obtener el icono del tiempo
    function obtenerIconoTiempo(tiempo) {
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

    for (let key in iconos) {
        if (tiempoLower.includes(key)) return iconos[key];
    }
    return 'fas fa-cloud-sun';
}