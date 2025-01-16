{{-- <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    <div id="datosMunicipio"></div>


    <script>
        fetch('/tiempo/{{$name}}')
            .then(response => response.json())
            .then(data => {
                const datosMunicipio = document.getElementById('datosMunicipio');
                let html = '<h2>Datos del clima para {{$name}}</h2>';
                html += '<table border="1">';
                html += '<tr><th>Fecha</th><th>Temperatura (°C)</th><th>Presión (hPa)</th><th>Precipitaciones (mm)</th><th>Viento (km/h)</th><th>Tiempo</th></tr>';

                data.forEach(registro => {
                    html += `<tr>
                        <td>${new Date(registro.fecha).toLocaleString()}</td>
                        <td>${registro.temperatura}</td>
                        <td>${registro.presion_atmosferica}</td>
                        <td>${registro.precipitaciones}</td>
                        <td>${registro.viento}</td>
                        <td>${registro.tiempo}</td>
                    </tr>`;
                });

                html += '</table>';
                datosMunicipio.innerHTML = html;
            })
            .catch(error => {
                document.getElementById('datosMunicipio').innerHTML =
                    '<p style="color: red;">Error al obtener los datos del municipio</p>';
                console.error('Error obteniendo datos:', error);
            });
    </script>
</body>
</html> --}}
