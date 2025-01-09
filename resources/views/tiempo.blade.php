<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <table id="tiempoBody"></table>
    <div id="mapid" style="height: 800px;width: 50%;float: left;"></div>
    <script>
        //Mapa en OpenStreetMap
        var map = L.map('mapid').setView([43.0, -2.5], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
        }).addTo(map);
</body>
</html>
