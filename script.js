document.addEventListener('DOMContentLoaded', () => {

    // =================================================================================
    // --- 1. DECLARACIONES DE VARIABLES Y CONSTANTES ---
    // =================================================================================

    const PALOS = ['Oros', 'Copas', 'Espadas', 'Bastos'];
    const VALORES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const PUNTOS = { '1':1,'2':1,'3':1,'4':1,'5':1,'6':1,'7':1,'8':1,'9':1,'10':5,'11':5,'12':10 };
    const ORDEN_PALO_COBOE = { 'Copas': 0, 'Bastos': 1, 'Oros': 2, 'Espadas': 3 };
    const JOKER1_IMG = 'imagenes/01-comodin.png';
    const JOKER2_IMG = 'imagenes/02-comodin.png';
    const DEBUG = true; // Activar/desactivar logs de depuración

    let mazo = [], manoJugador = [], manoOponente = [], pozo = [];
    let scoreJugador = 0, scoreOponente = 0;
    let turnoDelJugador = true, haRobado = false, esperandoPagoPozo = false, modoRobar = false,
    turnoAdicional = false;
    let mazoCompleto = [];
    let isSequenceSortAscending = true;

    // Referencias al DOM (Juego)
    const gameContainerElement = document.getElementById('game-container');
    const mazoElement = document.getElementById('deck');
    const pozoElement = document.getElementById('discard-pile');
    const pozoClickElement = document.getElementById('discard-pile-area');
    const manoJugadorElement = document.getElementById('player-hand');
    const checkQuintaButton = document.getElementById('check-quinta-button');
    const messageElement = document.getElementById('message-area');
    const playerScoreElement = document.getElementById('player-score');
    const opponentScoreElement = document.getElementById('opponent-score');
    const quintaAreaElement = document.getElementById('quinta-area');
    const playerNameDisplay = document.getElementById('player-name-display');

    // Referencias al DOM (Botones de Ordenar)
    const sortByNumberBtn = document.getElementById('sort-by-number-btn');
    const sortBySuitBtn = document.getElementById('sort-by-suit-btn');

    // Referencias al DOM (Pantalla de Inicio)
    const splashScreen = document.getElementById('splash-screen');
    const startGameButton = document.getElementById('start-game-button');
    const playerNameInput = document.getElementById('player-name-input');

    const mensajesZaldor = [
        "Creo que estoy por presentar una QUINTA.",
        "Una vez presenté una Quinta Real... fue un día glorioso.",
        "Mmm, tengo hambre ahora...",
        "Te apuesto que si gano este juego, me como una pizza entera.",
        "¿Sabías que el 12 de Oros es mi carta favorita?",
        "No te confíes, he ganado más partidas de las que puedes contar.",
        "La alquimia y las cartas tienen mucho en común: ambas requieren paciencia y estrategia.",
        "A veces me pregunto si las cartas tienen vida propia.",
        "Esta jugada me recuerda a una fórmula que intenté crear una vez.",
        "Espero que no tengas un As bajo la manga... o un Joker.",
        "La suerte favorece a la mente preparada.",
        "¿Sientes la presión? Porque yo no.",
        "Mis cálculos indican que tengo un 87.3% de probabilidades de ganar.",
        "No te tomes la derrota como algo personal. No todos pueden ser como yo.",
        "¡Casi lo tengo! O quizás no...",
        "El elixir de la victoria será mío.",
        "Observa y aprende, joven retador.",
        "¿Sabés por qué los pájaros no usan Facebook? Porque ya tienen Twitter.",
        "¿Qué le dice un jardinero a otro? ¡Disfrutemos mientras podamos!",
        "No confío en los átomos; ¡ellos lo constituyen todo!",
        "La electricidad siempre está en la corriente; ¡es el voltaje que se siente!",
        "¿Qué hace una abeja en el gimnasio? Zum-ba.",
        "La comida rápida me gusta, pero la comida lenta me enamora.",
        "¿Cómo maldice un pollito a otro? ¡¡¡Que te pongan en un caldo!!!",
        "No tengo un problema de alcohol; tengo un problema de no beberlo.",
        "¿Por qué el libro de matemáticas está estresado? Porque tiene demasiados problemas.",
        "Me dijeron que el aceite es bueno para el corazón; ¡por eso lo uso en las ensaladas!",
        "¿Qué hace una vaca en un terremoto? ¡Leche agitada!",
        "La única vez que tengo razón es cuando pienso que estoy equivocado.",
        "¿Cómo organizan una fiesta los gatos? ¡Hacen un miau-sical!",
        "Estuve en una carrera de caracoles, pero todo fue muy lento.",
        "¿Por qué los fantasmas son malos mentirosos? Porque se pueden ver a través de ellos.",
        "Si las mujeres gobiernan el mundo, ¿quién gobierna el universo? ¡Los hombres en las películas de ciencia ficción!",
        "¿Qué le dice un semáforo a otro? ¡No me mires, me estoy cambiando!",
        "La pereza es la madre de todos los vicios; ¡y como madre, debe ser respetada!",
        "Una cereza frente al espejo dice: “¿Seré esa yo?”"
    ];

    function mostrarMensajeZaldor() {
        const mensaje = mensajesZaldor[Math.floor(Math.random() * mensajesZaldor.length)];
        const mensajeElement = document.createElement('p');
        mensajeElement.className = 'zaldor-message';
        mensajeElement.textContent = `ZALDOR DICE: "${mensaje}"`;
        messageElement.prepend(mensajeElement);
    }

    // Referencias al DOM (Modal de Ejemplos)
    const exampleModalOverlay = document.getElementById('example-modal-overlay');
    const exampleModal = document.getElementById('example-modal');
    const exampleModalTitle = document.getElementById('example-modal-title');
    const exampleModalCards = document.getElementById('example-modal-cards');
    const closeExampleModalButton = exampleModal.querySelector('.close-button');

    // =================================================================================
    // --- 2. INICIALIZACIÓN ---
    // =================================================================================

    const ejemplos = {
        'example-5-cards': { title: 'Ejemplo de Quinta de 5 Cartas', tipo: 'Normal', cartas: ['4-de-Copas', '5-de-Bastos', '6-de-Oros', '7-de-Espadas', '10-de-Espadas'], descarte: ['3-de-Bastos', '6-de-Espadas', '11-de-Bastos'] },
        'example-6-cards': { title: 'Quinta inversa de 6 cartas', tipo: 'Normal', cartas: ['9-de-Bastos', '8-de-Oros', '7-de-Espadas', '6-de-Copas', '5-de-Bastos', '12-de-Oros'], descarte: ['5-de-Copas', '10-de-Bastos'] },
        'example-7-cards': { title: 'Ejemplo de Quinta de 7 Cartas', tipo: 'Normal', cartas: ['5-de-Copas', '6-de-Bastos', '7-de-Oros', '8-de-Espadas', '9-de-Copas', '10-de-Bastos', '12-de-Oros'] },
        'example-real-quinta': { title: 'Quinta Real', tipo: 'Real', cartas: ['6-de-Copas', '7-de-Bastos', '8-de-Oros', '9-de-Espadas', '10-de-Copas', '11-de-Bastos', '12-de-Oros'] },
        'example-imperial-quinta': { title: 'Quinta Imperial', tipo: 'Imperial', cartas: ['7-de-Copas', '6-de-Bastos', '5-de-Oros', '4-de-Espadas', '3-de-Copas', '2-de-Bastos', '1-de-Oros'] }
    };

    function calcularPuntosQuinta(quinta) {
        if (quinta.tipo === 'Real') return 50;
        if (quinta.tipo === 'Imperial') return 70;

        const puntosBase = quinta.cartas.reduce((sum, id) => {
            const carta = mazoCompleto.find(c => c.id === id);
            return sum + (carta ? carta.puntos : 0);
        }, 0);

        let bonusLongitud = 0;
        if (quinta.cartas.length === 5) bonusLongitud = 10;
        else if (quinta.cartas.length === 6) bonusLongitud = 30;
        else if (quinta.cartas.length >= 7) bonusLongitud = 40;

        return puntosBase + bonusLongitud;
    }

    function showExampleModal(exampleKey) {
        const ejemplo = ejemplos[exampleKey];
        if (!ejemplo) return;

        exampleModalTitle.textContent = ejemplo.title;
        exampleModalCards.innerHTML = '';

        ejemplo.cartas.forEach(id => {
            const carta = mazoCompleto.find(c => c.id === id);
            if (carta) {
                const cardView = crearVistaCarta(carta);
                exampleModalCards.appendChild(cardView);
            }
        });

        if (ejemplo.descarte) {
            const descarteTitle = document.createElement('h4');
            descarteTitle.textContent = 'Cartas descartadas';
            descarteTitle.style.width = '100%';
            descarteTitle.style.textAlign = 'center';
            descarteTitle.style.marginTop = '20px';
            exampleModalCards.appendChild(descarteTitle);

            ejemplo.descarte.forEach(id => {
                const carta = mazoCompleto.find(c => c.id === id);
                if (carta) {
                    const cardView = crearVistaCarta(carta);
                    cardView.style.opacity = '0.6';
                    exampleModalCards.appendChild(cardView);
                }
            });
        }

        const score = calcularPuntosQuinta(ejemplo);
        const scoreElement = document.createElement('p');
        scoreElement.className = 'example-modal-score';
        scoreElement.textContent = `Puntuación de la jugada: ${score} puntos`;
        exampleModalCards.appendChild(scoreElement);

        exampleModalOverlay.style.display = 'flex';
    }

    if(closeExampleModalButton) closeExampleModalButton.addEventListener('click', () => {
        if (exampleModalOverlay) exampleModalOverlay.style.display = 'none';
    });

    const scoringGuideButton = document.getElementById('scoring-guide-button');
    const scoringGuideModal = document.getElementById('scoring-guide-modal');
    if (scoringGuideModal) {
        const closeScoringModalButton = scoringGuideModal.querySelector('.close-button');

        if (scoringGuideButton) {
            scoringGuideButton.addEventListener('click', () => {
                scoringGuideModal.style.display = 'flex';
            });
        }

        if (closeScoringModalButton) {
            closeScoringModalButton.addEventListener('click', () => {
                scoringGuideModal.style.display = 'none';
            });
        }

        scoringGuideModal.addEventListener('click', (event) => {
            if (event.target === scoringGuideModal) {
                scoringGuideModal.style.display = 'none';
            }
        });
    }

    Object.keys(ejemplos).forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.addEventListener('click', () => showExampleModal(id));
    });

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

    function crearMazo() {
        mazo = [...mazoCompleto];
    }

    inicializarMazoCompleto();

    // =================================================================================
    // --- 3. LÓGICA DEL JUEGO ---
    // =================================================================================

    function barajarMazo() {
        for (let i = mazo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
        }
    }

    function mostrarMensajeSistema(texto) {
        const mensajeElement = document.createElement('p');
        mensajeElement.className = 'system-message';
        mensajeElement.innerHTML = texto;
        messageElement.prepend(mensajeElement);
    }

    function mostrarMensajeOponente(texto) {
        const mensajeElement = document.createElement('p');
        mensajeElement.className = 'opponent-action-message';
        mensajeElement.innerHTML = texto;
        messageElement.prepend(mensajeElement);
    }

    function repartir(esPrimeraPartida = false) {
        crearMazo();
        barajarMazo();
        manoJugador = mazo.splice(0, 7);
        manoOponente = mazo.splice(0, 7);
        pozo = [mazo.pop()];
        turnoDelJugador = true;
        haRobado = false;
        esperandoPagoPozo = false;
        modoRobar = false;
        turnoAdicional = false;
        actualizarVistas();
        actualizarMarcadores();
        if(checkQuintaButton) checkQuintaButton.disabled = false;

        if (esPrimeraPartida) {
            inicializarDragAndDrop();
            mostrarMensajeSistema("<b>Inicio del juego:</b><br>Se determinará quién empieza comparando la carta de Oros más alta de cada jugador. Si no tienen Oros, se usará la de Espadas.");
            
            setTimeout(() => {
                mostrarMensajeSistema("<b>¡Recuerda la fórmula secreta!</b><br>La secuencia de palos es: <b>Copas -> Bastos -> Oros -> Espadas</b>.");
            }, 1500); // Show it a little after the initial message

            setTimeout(() => determinarPrimerJugador(), 3000);
        } else {
            if(messageElement) messageElement.innerHTML = ''; // Clear messages for new round
            mostrarMensajeSistema("<b>Nueva ronda:</b><br>Roba una carta del mazo o del pozo para empezar.");
        }
    }

    function determinarPrimerJugador() {
        const cartaJugador = encontrarCartaMasAlta(manoJugador);
        const cartaOponente = encontrarCartaMasAlta(manoOponente);
        
        const msgJugador = cartaJugador ? `Tu carta más alta es el <b>${cartaJugador.id}</b>.` : "No tienes Oros ni Espadas.";
        const msgOponente = cartaOponente ? `La de Zaldor es el <b>${cartaOponente.id}</b>.` : "Zaldor no tiene Oros ni Espadas.";
        mostrarMensajeSistema(`${msgJugador}<br>${msgOponente}`);

        let jugadorEmpieza = (cartaJugador && (!cartaOponente || parseInt(cartaJugador.valor) >= parseInt(cartaOponente.valor)));
        
        setTimeout(() => {
            if (jugadorEmpieza) {
                turnoDelJugador = true;
                turnoAdicional = true;
                mostrarMensajeSistema(`<b>¡Empiezas tú, ${playerNameDisplay.textContent}!</b><br>Tienes derecho a un turno extra.`);
            } else {
                turnoDelJugador = false;
                mostrarMensajeSistema("<b>Empieza Zaldor.</b>");
                setTimeout(() => turnoOponente(), 1500);
            }
        }, 3000);
    }

    function encontrarCartaMasAlta(mano) {
        const oros = mano.filter(c => c.palo === 'Oros').sort((a, b) => parseInt(b.valor) - parseInt(a.valor));
        if (oros.length > 0) return oros[0];
        const espadas = mano.filter(c => c.palo === 'Espadas').sort((a, b) => parseInt(b.valor) - parseInt(a.valor));
        if (espadas.length > 0) return espadas[0];
        return null;
    }

    const continueGameButton = document.getElementById('continue-game-button');

    // ... (resto del código)

    function mostrarQuintaGanadora(title, cards) {
        if (!exampleModalOverlay) return;
        if (exampleModalTitle) exampleModalTitle.textContent = title;
        if (exampleModalCards) {
            exampleModalCards.innerHTML = '';
            cards.forEach(carta => {
                const cardView = crearVistaCarta(carta);
                cardView.style.pointerEvents = 'none'; // No se pueden clickear
                exampleModalCards.appendChild(cardView);
            });
        }
        exampleModalOverlay.style.display = 'flex';
    }

    function terminarRonda(ganador, resultado) {
        const quinta = resultado.cartas;
        let puntosRonda = 0;
        let puntosBase = 0;
        let bonusLongitud = 0;
        let mensajeDetallado = '';

        if (resultado.tipo === 'Real') {
            puntosRonda = 50;
            mensajeDetallado = '¡Quinta Real! Sumas &lt;b&gt;50 puntos&lt;/b&gt;.';
        } else if (resultado.tipo === 'Imperial') {
            puntosRonda = 70;
            mensajeDetallado = '¡Quinta Imperial! Sumas &lt;b&gt;70 puntos&lt;/b&gt;.';
        } else {
            puntosBase = quinta.reduce((sum, card) => sum + card.puntos, 0);
            if (quinta.length === 5) bonusLongitud = 10;
            else if (quinta.length === 6) bonusLongitud = 30;
            else if (quinta.length >= 7) bonusLongitud = 40;
            puntosRonda = puntosBase + bonusLongitud;
            mensajeDetallado = `Quinta de ${quinta.length} cartas: &lt;b&gt;${bonusLongitud} pts&lt;/b&gt; (bonus) + &lt;b&gt;${puntosBase} pts&lt;/b&gt; (cartas) = &lt;b&gt;${puntosRonda} pts&lt;/b&gt;.`;
        }

        const manoPerdedor = (ganador === 'jugador') ? manoOponente : manoJugador;
        const puntosNegativos = manoPerdedor.reduce((sum, card) => sum + card.puntos, 0);
        
        if (ganador === 'jugador') {
            scoreJugador += puntosRonda;
            scoreOponente -= puntosNegativos;
        } else {
            scoreOponente += puntosRonda;
            scoreJugador -= puntosNegativos;
            console.log("Quinta de Zaldor:", quinta);
            mostrarQuintaGanadora("Quinta presentada por Zaldor", quinta);
        }
        
        actualizarMarcadores();

        const nombreGanador = (ganador === 'jugador') ? playerNameDisplay.textContent : 'Zaldor';
        const nombrePerdedor = (ganador === 'jugador') ? 'Zaldor' : playerNameDisplay.textContent;

        const mensaje = `<b>¡Ronda para ${nombreGanador}!</b><br>
        ${mensajeDetallado}<br>
        ${nombrePerdedor} resta <b>${puntosNegativos}</b> puntos por las cartas en su mano.<br>
        <br>
        <u>Puntuación actual:</u><br>
        ${playerNameDisplay.textContent}: ${scoreJugador}<br>
        Zaldor: ${scoreOponente}`;
        
        actualizarMensaje(mensaje);

        if (scoreJugador >= 100 || scoreOponente >= 100) {
            setTimeout(() => terminarJuego(), 2000);
        } else {
            checkQuintaButton.style.display = 'none';
            continueGameButton.style.display = 'block';
        }
    }

    // ... (resto del código)

    if(continueGameButton) continueGameButton.addEventListener('click', () => {
        continueGameButton.style.display = 'none';
        checkQuintaButton.style.display = 'block';
        repartir();
    });


    function terminarJuego() {
        let mensajeFinal = "¡Fin del juego! ";
        const winnerName = playerNameDisplay.textContent;
        if (scoreJugador >= 100 && scoreJugador > scoreOponente) {
            mensajeFinal += `¡Has ganado, ${winnerName}!`;
        } else if (scoreOponente >= 100) {
            mensajeFinal += "Zaldor ha ganado.";
        } else {
            mensajeFinal += "Es un empate.";
        }
        actualizarMensaje(mensajeFinal);
        if(checkQuintaButton) checkQuintaButton.disabled = true;
    }

    // =================================================================================
    // --- 4. VALIDACIÓN DE QUINTAS ---
    // =================================================================================

    function comprobarQuinta(cartas, showMessage = true) {
        if (DEBUG) console.log("--- Comprobando Quinta --- Carts:", cartas.map(c=>c.id));
        const cartasPresentadas = cartas;
        if (cartasPresentadas.length < 5) {
            if (showMessage) actualizarMensaje("Una Quinta debe tener al menos 5 cartas.");
            return null;
        }
        if (esQuintaReal(cartasPresentadas)) return { tipo: 'Real', cartas: cartasPresentadas };
        if (esQuintaImperial(cartasPresentadas)) return { tipo: 'Imperial', cartas: cartasPresentadas };
        const tieneElixirReal = cartasPresentadas.some(c => c.isEV && !c.isJoker);
        if (!tieneElixirReal) {
            if (showMessage) actualizarMensaje("La jugada debe incluir un Elixir Vital (10, 11 o 12) que no sea comodín.");
            return null;
        }
        let escaleraEncontrada = null;
        for (let size = cartasPresentadas.length; size >= 4; size--) {
            const combinaciones = getCombinations(cartasPresentadas, size);
            for (const combo of combinaciones) {
                if (esEscaleraCoBOE(combo)) {
                    escaleraEncontrada = combo;
                    if (DEBUG) console.log("Escalera encontrada:", escaleraEncontrada.map(c=>c.id));
                    break;
                }
            }
            if (escaleraEncontrada) break;
        }
        if (escaleraEncontrada) {
            const elixir = cartasPresentadas.find(c => c.isEV && !c.isJoker);
            const quintaCartas = [...new Set([...escaleraEncontrada, elixir])];

            if (quintaCartas.length < 5) {
                if (showMessage) actualizarMensaje("La combinación de la escalera y el Elixir Vital debe sumar al menos 5 cartas únicas.");
                return null;
            }

            if (DEBUG) console.log("Quinta final:", quintaCartas.map(c=>c.id));
            return { tipo: 'Normal', cartas: quintaCartas };
        } else {
            if (showMessage) actualizarMensaje("La jugada no contiene una escalera CoBOE válida de 4+ cartas.");
            return null;
        }
    }

    function esEscaleraCoBOE(combinacion) {
        if (DEBUG) console.log("--- esEscaleraCoBOE ---", combinacion.map(c=>c.id));
        const normales = combinacion.filter(c => !c.isJoker);
        const numComodines = combinacion.length - normales.length;
        if (normales.length === 0) return true;

        const comboAsc = [...normales].sort((a, b) => parseInt(a.valor) - parseInt(b.valor));
        if (esSecuenciaValida(comboAsc, numComodines, true)) return true;

        const comboDesc = [...normales].sort((a, b) => parseInt(b.valor) - parseInt(a.valor));
        if (esSecuenciaValida(comboDesc, numComodines, false)) return true;

        return false;
    }

    function esSecuenciaValida(comboOrdenado, numComodines, esAscendente) {
        if (DEBUG) console.log(`--- esSecuenciaValida (${esAscendente ? 'asc' : 'desc'}) ---`, comboOrdenado.map(c=>c.id), `comodines: ${numComodines}`);
        
        // Check for duplicate values among non-joker cards
        for (let i = 0; i < comboOrdenado.length - 1; i++) {
            if (comboOrdenado[i].valor === comboOrdenado[i+1].valor) {
                if (DEBUG) console.log("Validación fallida: valores duplicados");
                return false;
            }
        }

        let comodinesNecesarios = 0;
        for (let i = 0; i < comboOrdenado.length - 1; i++) {
            const c1 = comboOrdenado[i];
            const c2 = comboOrdenado[i+1];
            const v1 = parseInt(c1.valor);
            const v2 = parseInt(c2.valor);
            const p1 = ORDEN_PALO_COBOE[c1.palo];
            const p2 = ORDEN_PALO_COBOE[c2.palo];

            const diffValor = esAscendente ? v2 - v1 : v1 - v2;

            if (diffValor <= 0) { // Values must be strictly increasing/decreasing
                 if (DEBUG) console.log("Validación fallida: valores no son estrictamente crecientes/decrecientes");
                 return false;
            }

            // Check suit order
            const expected_p2 = esAscendente ? (p1 + diffValor) % 4 : (p1 - diffValor % 4 + 4) % 4;
            if (expected_p2 !== p2) {
                if (DEBUG) {
                    console.log(`Validación fallida: orden de palo incorrecto para ${esAscendente ? 'asc' : 'desc'}`);
                    console.log(`Carta 1: ${c1.id}, Carta 2: ${c2.id}`);
                    console.log(`p1: ${p1}, p2: ${p2}, diffValor: ${diffValor}, expected_p2: ${expected_p2}`);
                }
                return false;
            }

            // Count jokers needed for the gap
            comodinesNecesarios += diffValor - 1;
        }

        if (DEBUG) console.log(`Comodines necesarios: ${comodinesNecesarios}, disponibles: ${numComodines}`);

        if (numComodines >= comodinesNecesarios) {
            if (DEBUG) console.log("Secuencia válida encontrada");
            return true;
        } else {
            if (DEBUG) console.log("Validación fallida: no hay suficientes comodines para los huecos");
            return false;
        }
    }

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

    // =================================================================================
    // --- 5. ACTUALIZACIÓN DE LA INTERFAZ ---
    // =================================================================================

    function actualizarMensaje(texto) { 
        if(!messageElement) return;
        const p = document.createElement('p');
        p.className = 'system-message'; // Clase por defecto
        p.innerHTML = texto;
        messageElement.prepend(p);
    }

    function actualizarMarcadores() {
        if(playerScoreElement) playerScoreElement.textContent = scoreJugador;
        if(opponentScoreElement) opponentScoreElement.textContent = scoreOponente;
    }

    function crearVistaCarta(carta) {
        const cardElement = document.createElement('img');
        cardElement.src = carta.imagen;
        cardElement.className = 'card';
        cardElement.dataset.cardId = carta.id;
        cardElement.addEventListener('click', () => gestionarClickCartaMano(carta.id));
        return cardElement;
    }

    function actualizarVistas() {
        if(manoJugadorElement) manoJugadorElement.innerHTML = '';
        if(pozoElement) pozoElement.innerHTML = '';
        const dorsoSrc = 'imagenes/dorso.png';
        if(mazoElement) mazoElement.innerHTML = `<img src="${dorsoSrc}" class="card">`;
        manoJugador.forEach(carta => {
            const cardView = crearVistaCarta(carta);
            manoJugadorElement.appendChild(cardView);
        });
        if (pozo.length > 0) {
            const topCard = pozo[pozo.length - 1];
            const cardView = crearVistaCarta(topCard);
            pozoElement.appendChild(cardView);
        }
    }

    // =================================================================================
    // --- 6. MANEJO DE ACCIONES DEL JUGADOR ---
    // =================================================================================

    function inicializarDragAndDrop() {
        const handElement = document.getElementById('player-hand');
        const discardPile = document.getElementById('discard-pile');
        const onDragEnd = (evt) => {
            if (evt.to === discardPile) {
                if (!haRobado) { evt.from.appendChild(evt.item); return; }
                const cardId = evt.item.dataset.cardId;
                const cardIndex = manoJugador.findIndex(c => c.id === cardId);
                if (cardIndex !== -1) {
                    const [cartaMovida] = manoJugador.splice(cardIndex, 1);
                    pozo.push(cartaMovida);
                    if (turnoAdicional) {
                        turnoAdicional = false; haRobado = false; turnoDelJugador = true;
                        actualizarVistas();
                        actualizarMensaje("Fin del turno adicional. Roba otra vez.");
                        return;
                    }
                    haRobado = false; turnoDelJugador = false;
                    actualizarMensaje("Turno de Zaldor...");
                    setTimeout(turnoOponente, 1000);
                }
                return;
            }
            const newHandOrderIds = [];
            handElement.querySelectorAll('.card').forEach(cardNode => newHandOrderIds.push(cardNode.dataset.cardId));
            manoJugador.sort((a, b) => newHandOrderIds.indexOf(a.id) - newHandOrderIds.indexOf(b.id));
        };
        [handElement, discardPile].forEach(el => {
            if (el) new Sortable(el, { group: 'shared', animation: 150, onEnd: onDragEnd });
        });
    }

    function robarDelMazo() {
        if (!turnoDelJugador || haRobado || esperandoPagoPozo || modoRobar) return;
        if (mazo.length === 0) {
            actualizarMensaje("El mazo se acabó. ¡Barajando el pozo!");
            if (pozo.length <= 1) { return; }
            const cartaSuperiorDelPozo = pozo.pop();
            mazo = [...pozo];
            pozo = [cartaSuperiorDelPozo];
            barajarMazo();
            actualizarVistas();
        }
        manoJugador.push(mazo.pop());
        haRobado = true;
        actualizarMensaje("Has robado una carta. Ahora, arrastra una carta de tu mano al pozo para descartar.");
        actualizarVistas();
    }

    function robarDelPozo() {
        // Si el jugador ya ha robado, o no es su turno, o está en modo ladrón, no hace nada.
        if (!turnoDelJugador || haRobado || modoRobar) return;

        // Si ya estaba esperando pagar, un nuevo clic en el pozo cancela la acción.
        if (esperandoPagoPozo) {
            esperandoPagoPozo = false;
            actualizarMensaje("Acción cancelada. Elige tu jugada.");
            return;
        }

        // Lógica para iniciar el robo del pozo
        if (pozo.length === 0) return;
        if (!manoJugador.some(c => c.isEV)) {
            actualizarMensaje("No tienes un Elixir Vital (10, 11 o 12) para pagar.");
            return;
        }
        esperandoPagoPozo = true;
        actualizarMensaje("Para tomar del pozo, paga con un Elixir Vital (10, 11 o 12) de tu mano, o <b>vuelve a clicar en el pozo para cancelar.</b>");
    }

    function gestionarClickCartaMano(cardId) {
        if (!turnoDelJugador) return;
        const cartaClicada = manoJugador.find(c => c.id === cardId);
        if (!haRobado && !esperandoPagoPozo && cartaClicada && cartaClicada.id === '12-de-Oros') {
            modoRobar = true;
            actualizarMensaje("Modo Ladrón: funcionaliad no implementada.");
            return;
        }
        if (esperandoPagoPozo) {
            const cartaPagadora = manoJugador.find(c => c.id === cardId);
            if (cartaPagadora && (cartaPagadora.isEV || ['10', '11', '12'].includes(cartaPagadora.valor))) {
                const cartaDelPozo = pozo.pop();
                manoJugador.push(cartaDelPozo);
                const indexPagadora = manoJugador.findIndex(c => c.id === cardId);
                const [cartaMovida] = manoJugador.splice(indexPagadora, 1);
                pozo.push(cartaMovida);
                esperandoPagoPozo = false;
                haRobado = false;
                turnoDelJugador = false;
                actualizarVistas();
                actualizarMensaje("Has intercambiado una carta. Turno de Zaldor...");
                setTimeout(turnoOponente, 1000);
            } else {
                actualizarMensaje("Pago rechazado. Debes usar un Elixir Vital (10, 11 o 12).");
            }
            return;
        }
    }

    // =================================================================================
    // --- 7. LÓGICA DEL OPONENTE ---
    // =================================================================================

    function getReadableCardName(card) {
        if (!card) return '';
        if (card.isJoker) return "Comodín";
        return `${card.valor} de ${card.palo}`;
    }

    function turnoOponente() {
        setTimeout(() => {
            if (Math.random() < 0.4) { // Random Zaldor chatter
                mostrarMensajeZaldor();
            }
        }, 600);

        setTimeout(() => {
            if (mazo.length === 0) {
                turnoDelJugador = true;
                actualizarMensaje("El mazo está vacío. Tu turno.");
                return;
            }

            // Zaldor draws
            const cartaRobada = mazo.pop();
            manoOponente.push(cartaRobada);
            mostrarMensajeOponente("Zaldor roba una carta del mazo.");
            actualizarVistas(); // Update view to show one less card in deck

            // Zaldor thinks...
            setTimeout(() => {
                const resultadoOponente = comprobarQuinta(manoOponente, false);
                if (resultadoOponente) {
                    terminarRonda('oponente', resultadoOponente);
                    return;
                }

                // Zaldor discards
                const cartaADescartar = manoOponente.splice(Math.floor(Math.random() * manoOponente.length), 1)[0];
                pozo.push(cartaADescartar);
                mostrarMensajeOponente(`Zaldor descarta un <b>${getReadableCardName(cartaADescartar)}</b>.`);
                
                turnoDelJugador = true;
                actualizarVistas();
                actualizarMensaje("Tu turno. Roba una carta del mazo o del pozo.");
            }, 1200); // Delay for thinking

        }, 1500); // Delay for drawing
    }

    // =================================================================================
    // --- 8. INICIALIZACIÓN DE EVENTOS ---
    // =================================================================================

    if(startGameButton) startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName && playerNameDisplay) {
            playerNameDisplay.textContent = playerName;
        }
        if(splashScreen) splashScreen.style.display = 'none';
        if(gameContainerElement) gameContainerElement.style.display = 'flex';
        repartir(true);
    });

    if(mazoElement) mazoElement.addEventListener('click', robarDelMazo);
    if(pozoClickElement) pozoClickElement.addEventListener('click', robarDelPozo);
    if(checkQuintaButton) checkQuintaButton.addEventListener('click', () => {
        if (!turnoDelJugador) { 
            actualizarMensaje("No es tu turno.");
            return; 
        }
        // Comprueba la mano completa del jugador en lugar de un área de presentación.
        const resultado = comprobarQuinta(manoJugador);
        if (resultado) {
            terminarRonda('jugador', resultado);
        }
    });

    if (sortByNumberBtn) {
        sortByNumberBtn.addEventListener('click', () => {
            manoJugador.sort((a, b) => {
                if (a.isJoker) return 1;
                if (b.isJoker) return -1;
                const diffValor = parseInt(a.valor) - parseInt(b.valor);
                if (diffValor !== 0) return diffValor;
                return ORDEN_PALO_COBOE[a.palo] - ORDEN_PALO_COBOE[b.palo];
            });
            actualizarVistas();
        });
    }

    if (sortBySuitBtn) {
        sortBySuitBtn.addEventListener('click', () => {
            manoJugador.sort((a, b) => {
                if (a.isJoker) return 1;
                if (b.isJoker) return -1;
                const diffPalo = ORDEN_PALO_COBOE[a.palo] - ORDEN_PALO_COBOE[b.palo];
                if (diffPalo !== 0) return diffPalo;
                
                if (isSequenceSortAscending) {
                    return parseInt(a.valor) - parseInt(b.valor);
                } else {
                    return parseInt(b.valor) - parseInt(a.valor);
                }
            });
            
            isSequenceSortAscending = !isSequenceSortAscending; // Toggle the state
            actualizarVistas();
        });
    }
});
