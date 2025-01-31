$(document).ready(function() {
    $("#tabs").tabs();
    
    var map = L.map("mapid").setView([43.0, -2.5], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    //se crea un set para guardar las balizas que el usuario ha seleccionado en el mapa
    let balizasSeleccionadas = new Set();
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
                                    <span>${clima.temperatura}°C</span>
                                </div>
                            `);
                        }
                        
                        if (atributosActivos.has('humedad')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="humedad">
                                    <i class="fas fa-tint"></i>
                                    <span>${clima.humedad}%</span>
                                </div>
                            `);
                        }
                        
                        if (atributosActivos.has('viento')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="viento">
                                    <i class="fas fa-wind"></i>
                                    <span>${clima.viento} km/h</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('presion_atmosferica')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="presion_atmosferica">
                                    <i class="fas fa-compress-arrows-alt"></i>
                                    <span>${clima.presion_atmosferica} hPa</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('tiempo')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="tiempo">
                                    <i class="${obtenerIconoTiempo(clima.tiempo)}"></i>
                                    <span>${clima.tiempo}</span>
                                </div>
                            `);
                        }

                        if (atributosActivos.has('precipitaciones')) {
                            climaItems.push(`
                                <div class="clima-item" data-tipo="precipitaciones">
                                    <i class="fas fa-cloud-rain"></i>
                                    <span>${clima.precipitaciones} mm</span>
                                </div>
                            `);
                        }

                        const cardBody = card.querySelector('.card-body');
                        cardBody.innerHTML = `
                            ${climaItems.length > 0 ? 
                                `<div class="clima-info">${climaItems.join('')}</div>` : 
                                '<p class="text-center">No hay datos visibles</p>'
                            }
                            <div class="ultima-actualizacion">
                                <i class="far fa-clock"></i>
                                Última actualización: ${new Date(clima.fecha).toLocaleString()}
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
                                            <span>${clima.temperatura}°C</span>
                                        </div>
                                    `);
                                }
                                
                                if (atributosActivos.has('humedad')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="humedad">
                                            <i class="fas fa-tint"></i>
                                            <span>${clima.humedad}%</span>
                                        </div>
                                    `);
                                }
                                
                                if (atributosActivos.has('viento')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="viento">
                                            <i class="fas fa-wind"></i>
                                            <span>${clima.viento} km/h</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('presion_atmosferica')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="presion_atmosferica">
                                            <i class="fas fa-compress-arrows-alt"></i>
                                            <span>${clima.presion_atmosferica} hPa</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('tiempo')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="tiempo">
                                            <i class="${obtenerIconoTiempo(clima.tiempo)}"></i>
                                            <span>${clima.tiempo}</span>
                                        </div>
                                    `);
                                }

                                if (atributosActivos.has('precipitaciones')) {
                                    climaItems.push(`
                                        <div class="clima-item" data-tipo="precipitaciones">
                                            <i class="fas fa-cloud-rain"></i>
                                            <span>${clima.precipitaciones} mm</span>
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
                                                '<p class="text-center">No hay datos visibles</p>'
                                            }
                                            <div class="ultima-actualizacion">
                                                <i class="far fa-clock"></i>
                                                Última actualización: ${new Date(clima.fecha).toLocaleString()}
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
        const iconos = {
            'Soleado': 'fas fa-sun',
            'Parcialmente nublado': 'fas fa-cloud-sun',
            'nubes': 'fas fa-cloud',
            'nubes dispersas': 'fas fa-cloud-sun',
            'muy nuboso': 'fas fa-cloud',
            'Lluvioso': 'fas fa-cloud-rain',
            'Tormentoso': 'fas fa-bolt',
            'Nieve': 'fas fa-snowflake'
        };
        return iconos[tiempo] || 'fas fa-cloud-sun';
    }
});
