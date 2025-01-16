{{-- <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Mapa del Tiempo</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"/>
</head>
<body>

    <div id="mapid" style="height: 800px;width: 50%;float: left;"></div>
    <div id="prueba" style="float: left; width: 45%; padding: 20px;"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
    <script>
        // Inicializar el mapa cuando el DOM esté cargado
        document.addEventListener('DOMContentLoaded', function() {
            // Mapa del framework leaflet
            var map = L.map('mapid').setView([43.0, -2.5], 9);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Objeto que mapea municipios a códigos AEMET
            const municipiosAEMET = {
                'Bilbao': '48020',
                'Donostia': '20069',
                'Vitoria-Gasteiz': '01059',
                'Eibar': '20030',
                'Irun': '20045',
            };

            //recibe los datos de las balizas del controlador
            fetch('/datos-balizas')
                .then(response => response.json())
                .then(data => {
                    data.forEach(baliza => {
                        L.marker([baliza.latitud, baliza.longitud])
                        .bindPopup(`<b>${baliza.municipio}</b>`)
                        .on('click', function() {
                            const codigoAEMET = municipiosAEMET[baliza.municipio];
                            if (codigoAEMET) {
                                window.location.href = `/tiempo?id=${codigoAEMET}`;
                            }
                        })
                        .addTo(map);
                    });
                })
                .catch(error => console.error('Error obteniendo balizas:', error));

            const options = {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            };

            //solicita los datos del clima de X municipio al API de AEMET
            fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/{{$id}}/?api_key={{env("API_KEY")}}', options)
                .then(response => response.json())
                .then(data => {
                    if (data.datos) {
                        return fetch(data.datos, options);
                    }
                    throw new Error('No se encontró URL de datos');
                })
                .then(response => response.json())
                .then(datos => {
                    if (datos && datos[0] && datos[0].prediccion && datos[0].prediccion.dia) {
                        const prediccion = datos[0].prediccion.dia;
                        let html = `<h2>Información meteorológica para ${datos[0].nombre}</h2>`;

                        prediccion.forEach(dia => {
                            html += `
                                <div style="margin-bottom: 20px;">
                                    <p><strong>Fecha:</strong> ${new Date(dia.fecha).toLocaleDateString()}</p>
                                    <p><strong>Estado del cielo:</strong> ${dia.estadoCielo[0]?.descripcion || 'No disponible'}</p>
                                    <p><strong>Temperaturas:</strong> Máx ${dia.temperatura.maxima}°C / Mín ${dia.temperatura.minima}°C</p>
                                    <hr>
                                </div>
                            `;
                        });
                        document.getElementById('prueba').innerHTML = html;
                    } else {
                        throw new Error('Datos meteorológicos no válidos');
                    }
                })
                .catch(err => {
                    console.error('Error:', err);
                    document.getElementById('prueba').innerHTML = 'Error al cargar la información meteorológica. Por favor, inténtelo de nuevo más tarde.';
                });
        });
    </script>
</body>
</html> --}}
