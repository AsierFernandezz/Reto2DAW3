const translations = {
    es: {
        "Panel Meteorológico": "Panel Meteorológico",
        "Mapa": "Mapa",
        "Clima": "Clima",
        "Gráfico": "Gráfico",
        "Atributos Visibles": "Atributos Visibles",
        "Atributos Ocultos": "Atributos Ocultos",
        "Temperatura": "Temperatura",
        "Humedad": "Humedad",
        "Viento": "Viento",
        "Presión Atmosférica": "Presión Atmosférica",
        "Tiempo": "Tiempo",
        "Precipitaciones": "Precipitaciones",
        "Actualizando datos": "Actualizando datos...",
        "Última actualización": "Última actualización",
        "No hay balizas seleccionadas": "No hay balizas seleccionadas",
        "Error al cargar los datos": "Error al cargar los datos",
        // Estados del tiempo
        "soleado": "soleado",
        "sol": "sol",
        "despejado": "despejado",
        "parcialmente nublado": "parcialmente nublado",
        "nubes dispersas": "nubes dispersas",
        "intervalos nubosos": "intervalos nubosos",
        "nubes": "nubes",
        "nublado": "nublado",
        "muy nuboso": "muy nuboso",
        "cubierto": "cubierto",
        "lluvia": "lluvia",
        "lluvioso": "lluvioso",
        "chubascos": "chubascos",
        "precipitaciones": "precipitaciones",
        "tormenta": "tormenta",
        "tormentoso": "tormentoso",
        "tormenta eléctrica": "tormenta eléctrica",
        "nieve": "nieve",
        "nevado": "nevado",
        "aguanieve": "aguanieve",
        "niebla": "niebla",
        "bruma": "bruma",
        // Unidades
        "°C": "°C",
        "km/h": "km/h",
        "hPa": "hPa",
        "mm": "mm",
        "%": "%",
        // Traducciones para el gráfico (tabs-3)
        'seleccionar-baliza': 'Seleccionar baliza',
        'seleccionar-baliza-placeholder': 'Seleccione una baliza',
        'fecha-inicio': 'Fecha de inicio',
        'fecha-fin': 'Fecha de fin',
        'mostrar-grafico': 'Mostrar Gráfico',
        'temperatura': 'Temperatura',
        'humedad': 'Humedad',
        'temperatura-humedad': 'Temperatura y Humedad',
        'grafico-atributo': 'Histórico de Temperatura y Humedad',
        'fecha': 'Fecha',
        'no-datos': 'No se encontraron datos para el período especificado',
        'error-datos': 'Error al obtener los datos',
        'error-fechas': 'La fecha de inicio debe ser anterior a la fecha de fin',
        'seleccionar-todos': 'Por favor, seleccione todos los campos requeridos'
    },
    en: {
        "Panel Meteorológico": "Weather Panel",
        "Mapa": "Map",
        "Clima": "Weather",
        "Gráfico": "Chart",
        "Atributos Visibles": "Visible Attributes",
        "Atributos Ocultos": "Hidden Attributes",
        "Temperatura": "Temperature",
        "Humedad": "Humidity",
        "Viento": "Wind",
        "Presión Atmosférica": "Atmospheric Pressure",
        "Tiempo": "Weather",
        "Precipitaciones": "Precipitation",
        "Actualizando datos": "Updating data...",
        "Última actualización": "Last update",
        "No hay balizas seleccionadas": "No markers selected",
        "Error al cargar los datos": "Error loading data",
        // Estados del tiempo
        "soleado": "sunny",
        "sol": "sun",
        "despejado": "clear",
        "parcialmente nublado": "partly cloudy",
        "nubes dispersas": "scattered clouds",
        "intervalos nubosos": "cloudy intervals",
        "nubes": "clouds",
        "nublado": "cloudy",
        "muy nuboso": "very cloudy",
        "cubierto": "overcast",
        "lluvia": "rain",
        "lluvioso": "rainy",
        "chubascos": "showers",
        "precipitaciones": "precipitation",
        "tormenta": "storm",
        "tormentoso": "stormy",
        "tormenta eléctrica": "thunderstorm",
        "nieve": "snow",
        "nevado": "snowy",
        "aguanieve": "sleet",
        "niebla": "fog",
        "bruma": "mist",
        // Unidades
        "°C": "°F",
        "km/h": "mph",
        "hPa": "hPa",
        "mm": "in",
        "%": "%",
        // Traducciones para el gráfico (tabs-3)
        'seleccionar-baliza': 'Select beacon',
        'seleccionar-baliza-placeholder': 'Select a marker',
        'fecha-inicio': 'Start date',
        'fecha-fin': 'End date',
        'mostrar-grafico': 'Show Chart',
        'temperatura': 'Temperature',
        'humedad': 'Humidity',
        'temperatura-humedad': 'Temperature and Humidity',
        'grafico-atributo': 'Temperature and Humidity History',
        'fecha': 'Date',
        'no-datos': 'No data found for the specified period',
        'error-datos': 'Error getting data',
        'error-fechas': 'Start date must be before end date',
        'seleccionar-todos': 'Please select all required fields'
    }
};

let currentLanguage = 'es';

// Función para actualizar las traducciones de elementos dinámicos
function updateDynamicTranslations() {
    // Actualizar placeholder del selector de baliza
    const balizaSelector = document.getElementById('baliza-grafico');
    if (balizaSelector && balizaSelector.options.length > 0) {
        balizaSelector.options[0].text = translations[currentLanguage]['seleccionar-baliza-placeholder'];
    }

    // Actualizar textos de última actualización
    const ultimaActualizacionElements = document.querySelectorAll('.ultima-actualizacion');
    ultimaActualizacionElements.forEach(element => {
        const label = element.querySelector('label');
        if (label) {
            label.textContent = translations[currentLanguage]["Última actualización"] + ':';
        }
    });

    // Actualizar todos los elementos con data-translate
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

// Función para traducir el tiempo
function translateWeather(weather) {
    const weatherLower = weather.toLowerCase();
    for (let key in translations.es) {
        if (translations.es[key].toLowerCase() === weatherLower) {
            return translations[currentLanguage][key];
        }
    }
    return weather;
}

// Función para convertir unidades
function convertUnit(value, unit) {
    if (currentLanguage === 'en') {
        switch(unit) {
            case '°C':
                return Math.round((value * 9/5) + 32); // Celsius a Fahrenheit
            case 'km/h':
                return Math.round(value * 0.621371); // km/h a mph
            case 'mm':
                return Math.round(value * 0.0393701 * 100) / 100; // mm a pulgadas
            default:
                return value;
        }
    }
    return value;
}

function translatePage() {
    document.querySelectorAll("[data-translate]").forEach(element => {
        const key = element.getAttribute("data-translate");
        if (translations[currentLanguage][key]) {
            if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
                element.placeholder = translations[currentLanguage][key];
            } else {
                element.textContent = translations[currentLanguage][key];
            }
        }
    });
}

// Exportar las funciones para que estén disponibles en otros archivos
window.translations = translations;
window.currentLanguage = currentLanguage;
window.translateWeather = translateWeather;
window.convertUnit = convertUnit;
window.updateDynamicTranslations = updateDynamicTranslations;

document.addEventListener("DOMContentLoaded", () => {
    // Cargar el idioma guardado (si existe)
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById("language-selector").value = currentLanguage;
    }

    // Traducir la página al cargar
    translatePage();
    updateDynamicTranslations();

    // Cambiar idioma al seleccionar una opción del selector
    document.getElementById("language-selector").addEventListener("change", (event) => {
        currentLanguage = event.target.value;
        localStorage.setItem("language", currentLanguage);
        translatePage();
        updateDynamicTranslations();
        
        // Disparar evento de cambio de idioma de manera correcta
        const languageEvent = new CustomEvent('languageChanged', {
            detail: { language: currentLanguage }
        });
        document.dispatchEvent(languageEvent);
    });
});
