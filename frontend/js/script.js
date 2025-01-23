$(document).ready(function() {
    $("#tabs").tabs();
    
    var map = L.map("mapid").setView([43.0, -2.5], 9);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
    }).addTo(map);


    //se crea un set para guardar las balizas que el usuario ha seleccionado en el mapa
    let balizasSeleccionadas = new Set();

    fetch("http://localhost:85/api/balizas")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((baliza) => {
                //se define el icono de la baliza, su tamaño, su punto de anclaje y el popup de la información
                const iconoBaliza = L.icon({
                    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png", 
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34]
                });

                const marker = L.marker([baliza.latitud, baliza.longitud], {
                    icon: iconoBaliza,
                    id: `marker-${baliza.municipio.toLowerCase().replace(/\s+/g, '-')}`
                })
                //al pasar el ratón por encima de la baliza, se muestra el popup de la información
                    .on("mouseover", function () {
                        this.openPopup();
                    })
                    //al salir del ratón por encima de la baliza, se cierra el popup
                    .on("mouseout", function () {
                        this.closePopup();
                    })
                    //al hacer click en una baliza, se selecciona o deselecciona
                    .on("click", function () {
                        //se comprueba si la baliza ya está seleccionada
                        const estaSeleccionada = balizasSeleccionadas.has(baliza);

                        //si la baliza ya está seleccionada, se deselecciona
                        if (estaSeleccionada) {
                            //deselecciona la baliza
                            balizasSeleccionadas.delete(baliza);
                            this.setIcon(L.icon({
                                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34]
                            }));

                        } else {
                            //selecciona la baliza
                            balizasSeleccionadas.add(baliza);
                            this.setIcon(L.icon({
                                iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", 
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                                popupAnchor: [1, -34]
                            }));
                        }
                        
                        actualizarInformacionClimatica();
                    })
                    .bindPopup(`<b>${baliza.municipio}</b>`)
                    .addTo(map);
            });
            
            //cada vez que se cambia de pestaña de tabs, comprueba si es la pestaña de clima(tabs-2) y actualiza la información del clima
            $("#tabs").on("tabsactivate", function(event, ui) {
                if (ui.newPanel.attr('id') === 'tabs-2') {
                    actualizarInformacionClimatica();
                }
            });
            
            //funcion para obtener la información climática de las balizas seleccionadas
            async function actualizarInformacionClimatica() {
                // Procesa todas las balizas seleccionadas de forma asíncrona:
                // 1. Convierte el Set de balizas a array usando Array.from() para poder usar métodos como .map()
                // 2. Obtiene los datos del clima para cada baliza usando .map() 
                // 3. Espera que todas las peticiones terminen con Promise.all() 
                const contenidoHTML = await Promise.all(Array.from(balizasSeleccionadas).map(async baliza => {
                    try {
                        const response = await fetch(`http://localhost:85/api/climas/ultima/`);
                        const datos = await response.json();
                        
                        //encuentra el clima correspondiente a esta baliza
                        const clima = datos.find(d => d.baliza_id === baliza.id);
                        
                        if (!clima) {
                            throw new Error('No se encontraron datos para esta baliza');
                        }

                        //asigna un color de fondo a la card según la temperatura que haga
                        let fondo = '';
                        if (clima.temperatura > 25) {
                            fondo = 'card-muy-calido';
                        } else if (clima.temperatura > 20) {
                            fondo = 'card-calido';
                        } else if (clima.temperatura > 10) {
                            fondo = 'card-templado';
                        } else if (clima.temperatura > 0) {
                            fondo = 'card-frio';
                        } else {
                            fondo = 'card-muy-frio';
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
                                    <div class="clima-info">
                                        <div class="clima-item">
                                            <i class="fas fa-thermometer-half"></i>
                                            <span>${clima.temperatura}°C</span>
                                        </div>
                                        <div class="clima-item">
                                            <i class="fas fa-tint"></i>
                                            <span>${clima.humedad}%</span>
                                        </div>
                                        <div class="clima-item">
                                            <i class="fas fa-wind"></i>
                                            <span>${clima.viento} km/h</span>
                                        </div>
                                    </div>
                                    <div class="ultima-actualizacion">
                                        <i class="far fa-clock"></i>
                                        Última actualización: ${new Date(clima.fecha).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        `;
                    } catch (error) {
                        console.error(`Error obteniendo datos para ${baliza.municipio}:`, error);
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
                }));
                
                $("#tiempo-actual").html(contenidoHTML.join('') || '<p>No hay balizas seleccionadas</p>');
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
