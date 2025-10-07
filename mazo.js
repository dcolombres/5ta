document.addEventListener('DOMContentLoaded', () => {
    const mazoCompletoDiv = document.getElementById('mazo-completo');
    const checkerHandDiv = document.getElementById('checker-hand');
    const verifyBtn = document.getElementById('verify-quinta-btn');
    const clearBtn = document.getElementById('clear-checker-btn');
    const consoleDiv = document.getElementById('checker-console');

    if (!mazoCompletoDiv) return;

    // --- LÓGICA DEL JUEGO (Copiada y adaptada de script.js) ---

    const PALOS = ['Oros', 'Copas', 'Espadas', 'Bastos'];
    const VALORES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const PUNTOS = { '1':1,'2':1,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':1,'10':5,'11':5,'12':10 };
    const ORDEN_PALO_COBOE = { 'Copas': 0, 'Bastos': 1, 'Oros': 2, 'Espadas': 3 };
    const JOKER1_IMG = 'imagenes/01-comodin.png';
    const JOKER2_IMG = 'imagenes/02-comodin.png';
    let mazoCompleto = [];

    function inicializarMazoCompleto() {
        const palosParaNombre = { 'Copas': 'copa', 'Bastos': 'basto', 'Oros': 'oro', 'Espadas': 'espada' };
        for (const palo of PALOS) {
            for (const valor of VALORES) {
                const isEV = ['10', '11', '12'].includes(valor);
                const pts = PUNTOS[valor] || 1;
                const nombreValor = valor.toString().padStart(2, '0');
                const nombreImagen = `${nombreValor}-${palosParaNombre[palo]}.png`;
                mazoCompleto.push({ palo, valor, puntos: pts, id: `${valor}-de-${palo}`, isEV, isJoker: false, imagen: `imagenes/${nombreImagen}` });
            }
        }
        mazoCompleto.push({ palo: 'Joker', valor: 'Joker', puntos: 10, id: 'Joker-1', isEV: false, isJoker: true, imagen: JOKER1_IMG });
        mazoCompleto.push({ palo: 'Joker', valor: 'Joker', puntos: 10, id: 'Joker-2', isEV: false, isJoker: true, imagen: JOKER2_IMG });
    }

    function comprobarQuinta(cartas) {
        const cartasPresentadas = cartas;
        if (cartasPresentadas.length < 5) {
            return { valido: false, mensaje: "Una Quinta debe tener al menos 5 cartas." };
        }
        if (esQuintaReal(cartasPresentadas)) return { valido: true, tipo: 'Real', cartas: cartasPresentadas };
        if (esQuintaImperial(cartasPresentadas)) return { valido: true, tipo: 'Imperial', cartas: cartasPresentadas };
        
        const tieneElixirReal = cartasPresentadas.some(c => c.isEV && !c.isJoker);
        if (!tieneElixirReal) {
            return { valido: false, mensaje: "La jugada debe incluir un Elixir Vital (10, 11 o 12) que no sea comodín." };
        }

        let escaleraEncontrada = null;
        for (let size = cartasPresentadas.length; size >= 4; size--) {
            const combinaciones = getCombinations(cartasPresentadas, size);
            for (const combo of combinaciones) {
                if (esEscaleraCoBOE(combo)) {
                    escaleraEncontrada = combo;
                    break;
                }
            }
            if (escaleraEncontrada) break;
        }

        if (escaleraEncontrada) {
            const elixir = cartasPresentadas.find(c => c.isEV && !c.isJoker);
            const quintaCartas = [...new Set([...escaleraEncontrada, elixir])];
            if (quintaCartas.length < 5) {
                 return { valido: false, mensaje: "La combinación de la escalera y el Elixir Vital debe sumar al menos 5 cartas únicas." };
            }
            return { valido: true, tipo: 'Normal', cartas: quintaCartas };
        } else {
            return { valido: false, mensaje: "La jugada no contiene una escalera CoBOE válida de 4+ cartas." };
        }
    }

    function esEscaleraCoBOE(combinacion) {
        const normales = combinacion.filter(c => !c.isJoker);
        const numComodines = combinacion.length - normales.length;
        if (normales.length === 0 && numComodines >= 4) return true;

        const comboAsc = [...normales].sort((a, b) => parseInt(a.valor) - parseInt(b.valor));
        if (esSecuenciaValida(comboAsc, numComodines, true)) return true;

        const comboDesc = [...normales].sort((a, b) => parseInt(b.valor) - parseInt(a.valor));
        if (esSecuenciaValida(comboDesc, numComodines, false)) return true;

        return false;
    }

    function esSecuenciaValida(comboOrdenado, numComodines, esAscendente) {
        if (comboOrdenado.length === 0) return numComodines >= 4;
        let comodinesUsados = 0;
        for (let i = 0; i < comboOrdenado.length - 1; i++) {
            const c1 = comboOrdenado[i];
            const c2 = comboOrdenado[i+1];
            const v1 = parseInt(c1.valor);
            const v2 = parseInt(c2.valor);
            const p1 = ORDEN_PALO_COBOE[c1.palo];
            const p2 = ORDEN_PALO_COBOE[c2.palo];
            const diffValor = esAscendente ? v2 - v1 : v1 - v2;

            if (diffValor <= 0) return false; // No se permiten valores iguales

            const expected_p2 = (p1 + diffValor) % 4;
            if (expected_p2 !== p2) {
                return false;
            }
            comodinesUsados += diffValor - 1;
        }
        return numComodines >= comodinesUsados;
    }

    function esQuintaReal(mano) { /* ... lógica ... */ }
    function esQuintaImperial(mano) { /* ... lógica ... */ }
    function getCombinations(array, size) { /* ... lógica ... */ }

    function calcularPuntos(resultado) {
        if (!resultado.valido) return 0;
        if (resultado.tipo === 'Real') return 50;
        if (resultado.tipo === 'Imperial') return 70;

        const puntosBase = resultado.cartas.reduce((sum, card) => sum + card.puntos, 0);
        let bonusLongitud = 0;
        if (resultado.cartas.length === 5) bonusLongitud = 10;
        else if (resultado.cartas.length === 6) bonusLongitud = 30;
        else if (resultado.cartas.length >= 7) bonusLongitud = 40;
        return puntosBase + bonusLongitud;
    }

    // --- LÓGICA DE LA PÁGINA ---

    inicializarMazoCompleto();

    // Renderizar todas las cartas en el visor
    mazoCompleto.forEach(carta => {
        const cardElement = document.createElement('img');
        cardElement.src = carta.imagen;
        cardElement.className = 'card';
        cardElement.dataset.cardId = carta.id;
        mazoCompletoDiv.appendChild(cardElement);
    });

    // Hacer las áreas de drag and drop
    new Sortable(mazoCompletoDiv, { group: 'shared', sort: false });
    new Sortable(checkerHandDiv, { group: 'shared' });

    // Lógica de botones
    verifyBtn.addEventListener('click', () => {
        const cardElements = checkerHandDiv.querySelectorAll('.card');
        const cartasEnMano = Array.from(cardElements).map(el => {
            return mazoCompleto.find(c => c.id === el.dataset.cardId);
        });

        const resultado = comprobarQuinta(cartasEnMano);
        consoleDiv.innerHTML = ''; // Limpiar consola

        if (resultado.valido) {
            const puntos = calcularPuntos(resultado);
            consoleDiv.innerHTML += `<p style="color: #a7ff89;">¡QUINTA VÁLIDA!</p>`;
            consoleDiv.innerHTML += `<p>Tipo: ${resultado.tipo}</p>`;
            consoleDiv.innerHTML += `<p>Cartas: ${resultado.cartas.map(c => c.id).join(', ')}</p>`;
            consoleDiv.innerHTML += `<p>Puntos: ${puntos}</p>`;
        } else {
            consoleDiv.innerHTML += `<p style="color: #ff4d4d;">Jugada no válida.</p>`;
            consoleDiv.innerHTML += `<p>Motivo: ${resultado.mensaje}</p>`;
        }
    });

    clearBtn.addEventListener('click', () => {
        // Mover todas las cartas de vuelta al mazo principal
        const cardsToMove = Array.from(checkerHandDiv.querySelectorAll('.card'));
        cardsToMove.forEach(card => mazoCompletoDiv.appendChild(card));
        consoleDiv.innerHTML = '<p>Resultados aparecerán aquí...</p>';
    });

    // --- LÓGICA COMPLETA DE FUNCIONES COPIADAS ---
    // (Se pegan aquí las funciones completas para que todo funcione)

    function esQuintaReal(mano) {
        if (mano.length !== 7) return false;
        const required = ['6-de-Copas', '7-de-Bastos', '8-de-Oros', '9-de-Espadas', '10-de-Copas', '11-de-Bastos', '12-de-Oros'];
        const handIds = new Set(mano.map(c => c.id));
        return required.every(id => handIds.has(id));
    }

    function esQuintaImperial(mano) {
        if (mano.length !== 7) return false;
        const required = ['7-de-Copas', '6-de-Bastos', '5-de-Oros', '4-de-Espadas', '3-de-Copas', '2-de-Bastos', '1-de-Oros'];
        const handIds = new Set(mano.map(c => c.id));
        return required.every(id => handIds.has(id));
    }

    function getCombinations(array, size) {
        const result = [];
        function combine(startIndex, currentCombo) {
            if (currentCombo.length === size) { result.push([...currentCombo]); return; }
            for (let i = startIndex; i < array.length; i++) {
                currentCombo.push(array[i]);
                combine(i + 1, currentCombo);
                currentCombo.pop();
            }
        }
        combine(0, []);
        return result;
    }
});