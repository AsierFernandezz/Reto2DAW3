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
    <table id="tiempoBody"></table>
    <div id="mapid" style="height: 800px;width: 50%;float: left;"></div>


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

    </script>
</body>
</html>
