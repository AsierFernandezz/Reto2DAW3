<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.css"/>
</head>
<body>
    <div id="mapid" style="height: 800px;width: 50%;float: left;"></div>
    <p id="datos"></p>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.js"></script>
    <script>

        //mapa del framework leaflet
        var map = L.map('mapid').setView([43.0, -2.5], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        //obtiene el json del metodo 'obtenerDatos' a través de la ruta y coloca un marcador por cada baliza que exista en la base de datos
        fetch('/datos-balizas')
            .then(response => response.json())
            .then(data => {
                data.forEach(baliza => {
                    L.marker([baliza.latitud, baliza.longitud])
                    .bindPopup(`<b>${baliza.municipio}</b>`)
                    .addTo(map);
                });
            })
            .catch(error => console.error('Error fetching data:', error));

            const options = {method: 'GET'};
            const id = '20069';

                //obtiene los datos del municipio solicitado
                fetch('https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/diaria/' + id + '/?api_key=' + '{{env('API_KEY')}}', options)
                .then(response => response.json())
                .then(data => {
                    let urlDatos = data.datos;
                    return fetch(urlDatos, options)
                        .then(response => response.json())
                        .then(datos =>{
                            // document.getElementById('datos').innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;

                            // const tiempo = datos[0].prediccion.dia[0];
                            // document.write("Predicción del tiempo en: " + datos[0].nombre);

                        })
                });
    </script>
</body>
</html>
