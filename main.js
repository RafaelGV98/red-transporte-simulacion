// Clase para representar las ciudades
class Ciudad {
    constructor(nombre) {
        this.nombre = nombre;
    }

    toString() {
        return this.nombre;
    }
}

// Clase para representar las rutas entre ciudades
class Ruta {
    constructor(origen, destino, distancia, velocidad = 60, tiempoMinimo = 5) {
        this.origen = origen;
        this.destino = destino;
        this.distancia = distancia;
        this.velocidad = velocidad;
        this.tiempoMinimo = tiempoMinimo;
        this.tiempo = this.calcularTiempo(); // Time in minutes
    }

    calcularTiempo() {
        const tiempocalculado = (this.distancia / this.velocidad) * 60; // Convert hours to minutes
        const tiempofinal = Math.max(tiempocalculado, this.tiempoMinimo);

        return tiempofinal;

   
    }
}

// Clase para el grafo de transporte
class GrafoTransporte {
    constructor() {
        this.grafo = new Map();
    }

    agregarCiudad(ciudad) {
        if (!this.grafo.has(ciudad)) {
            this.grafo.set(ciudad, []);
        }
    }

    agregarRuta(origen, destino, distancia) {
        this.grafo.get(origen).push(new Ruta(origen, destino, distancia));
    }

    obtenerRutasDesde(ciudad) {
        return this.grafo.get(ciudad);
    }

    obtenerCiudades() {
        return Array.from(this.grafo.keys());
    }

    // Algoritmo de Dijkstra para encontrar la ruta más corta
    dijkstra(origen, destino) {
        const distancias = new Map();
        const tiempos = new Map();
        const previo = new Map();
        const visitados = new Set();
        const queue = [origen];

        // Inicializar distancias
        this.grafo.forEach((_, ciudad) => {
            distancias.set(ciudad, Infinity);
            tiempos.set(ciudad, Infinity);  
        });
        distancias.set(origen, 0);
        tiempos.set(origen, 0)

        while (queue.length > 0) {
            // Obtener la ciudad con la distancia más corta
            const ciudadActual = queue.reduce((prev, curr) => {
                return distancias.get(curr) < distancias.get(prev) ? curr : prev;
            });

            queue.splice(queue.indexOf(ciudadActual), 1);
            visitados.add(ciudadActual);

            if (ciudadActual === destino) break; // Si llegamos al destino, salimos

            const rutas = this.obtenerRutasDesde(ciudadActual);
            rutas.forEach(ruta => {
                if (!visitados.has(ruta.destino)) {
                    const nuevaDistancia = distancias.get(ciudadActual) + ruta.distancia;
                    const nuevoTiempo = tiempos.get(ciudadActual) + ruta.tiempo

                    if (nuevaDistancia < distancias.get(ruta.destino)) {
                        distancias.set(ruta.destino, nuevaDistancia);
                        tiempos.set(ruta.destino, nuevoTiempo);
                        previo.set(ruta.destino, ciudadActual);
                        if (!queue.includes(ruta.destino)) {
                            queue.push(ruta.destino);
                        }
                    }
                }
            });
        }

        const totalTiempo = tiempos.get(destino);
        const horas = Math.floor(totalTiempo / 60);
        const minutos = Math.floor(totalTiempo % 60);
        const tiempoFormateado = `${horas}h ${minutos}m`;


        // Reconstruir la ruta más corta
        const rutaFinal = [];
        let ciudadActual = destino;
        while (ciudadActual) {
            rutaFinal.unshift(ciudadActual);
            ciudadActual = previo.get(ciudadActual);
        }

        return { ruta: rutaFinal, distancia: distancias.get(destino), tiempo: tiempoFormateado };
    }
}

// Función para dibujar el grafo en el canvas
function dibujarGrafo(grafo, rutaCorta = []) {
    const canvas = document.getElementById('miCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ciudades = grafo.obtenerCiudades();
    const posiciones = new Map();
    const radio = 200; // Radio para las posiciones circulares
    const centroX = canvas.width / 2;
    const centroY = canvas.height / 2;
    const numeroCiudades = ciudades.length;

    // Dibujar las ciudades en círculo
    ciudades.forEach((ciudad, index) => {
        const x = centroX + radio * Math.cos(2 * Math.PI * index / numeroCiudades);
        const y = centroY + radio * Math.sin(2 * Math.PI * index / numeroCiudades);
        posiciones.set(ciudad, { x: x, y: y });

        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(ciudad.toString(), x - 10, y - 20);
    });

    // Dibujar las rutas entre las ciudades
    ciudades.forEach((ciudad) => {
        const rutas = grafo.obtenerRutasDesde(ciudad);
        const { x: xOrigen, y: yOrigen } = posiciones.get(ciudad);

        rutas.forEach((ruta) => {
            const { x: xDestino, y: yDestino } = posiciones.get(ruta.destino);

            // Dibujar línea de conexión
            ctx.strokeStyle = "black";
            ctx.beginPath();
            ctx.moveTo(xOrigen, yOrigen);
            ctx.lineTo(xDestino, yDestino);
            ctx.stroke();

            // Dibujar la distancia en el medio
            const midX = (xOrigen + xDestino) / 2;
            const midY = (yOrigen + yDestino) / 2;
            ctx.fillStyle = "red";
            ctx.fillText(ruta.distancia, midX, midY);
        });
    });

    // Resaltar la ruta más corta
    if (rutaCorta.length > 0) {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 3;
        for (let i = 0; i < rutaCorta.length - 1; i++) {
            const { x: xOrigen, y: yOrigen } = posiciones.get(rutaCorta[i]);
            const { x: xDestino, y: yDestino } = posiciones.get(rutaCorta[i + 1]);

            ctx.beginPath();
            ctx.moveTo(xOrigen, yOrigen);
            ctx.lineTo(xDestino, yDestino);
            ctx.stroke();
        }
        ctx.lineWidth = 1; // Resetear el ancho de línea
    }
}

// Función principal
function main() {
    // Crear el grafo y agregar ciudades
    const grafo = new GrafoTransporte();
    const ciudadA = new Ciudad("EL CARMEN");
    const ciudadB = new Ciudad("SAN JACINTO");
    const ciudadC = new Ciudad("CARTAGENA");
    const ciudadD = new Ciudad("COROZAL");
    const ciudadE = new Ciudad("SINCELEJO");
    const ciudadF = new Ciudad("MAGANGUE");

    grafo.agregarCiudad(ciudadA);
    grafo.agregarCiudad(ciudadB);
    grafo.agregarCiudad(ciudadC);
    grafo.agregarCiudad(ciudadD);
    grafo.agregarCiudad(ciudadE);
    grafo.agregarCiudad(ciudadF);

    // Agregar rutas entre las ciudades
    grafo.agregarRuta(ciudadA, ciudadB, 250);
    grafo.agregarRuta(ciudadB, ciudadC, 140)  ;
    grafo.agregarRuta(ciudadA, ciudadC, 500);
    grafo.agregarRuta(ciudadC, ciudadD, 80);
    grafo.agregarRuta(ciudadD, ciudadA, 200);
    grafo.agregarRuta(ciudadA, ciudadF, 70);
    grafo.agregarRuta(ciudadF, ciudadB, 50);
    grafo.agregarRuta(ciudadB, ciudadF, 30);
    grafo.agregarRuta(ciudadE, ciudadA, 110);
    grafo.agregarRuta(ciudadE, ciudadF, 75);
    grafo.agregarRuta(ciudadE, ciudadD, 100);
    grafo.agregarRuta(ciudadA, ciudadE, 45);
    grafo.agregarRuta(ciudadB, ciudadA, 90);
    // Dibujar el grafo en el canvas
    dibujarGrafo(grafo);

    // Manejar el evento de calcular ruta
    document.getElementById('calcularRuta').addEventListener('click', () => {
        const origenNombre = document.getElementById('origen').value.trim();
        const destinoNombre = document.getElementById('destino').value.trim();
        const origen = grafo.obtenerCiudades().find(c => c.nombre === origenNombre);
        const destino = grafo.obtenerCiudades().find(c => c.nombre === destinoNombre);

        if (origen && destino) {
            const { ruta, distancia, tiempo} = grafo.dijkstra(origen, destino);
            document.getElementById('resultado').innerText = `Ruta más corta: ${ruta.map(c => c.toString()).join(' -> ')} (Distancia: ${distancia} KM, tiempo estimado; ${tiempo})`;
            dibujarGrafo(grafo, ruta); // Redibujar el grafo con la ruta más corta resaltada
        } else {
            document.getElementById('resultado').innerText = 'Por favor, ingrese ciudades válidas.';
        }
    });
}

// Ejecutar la función principal al cargar la página
window.onload = main;