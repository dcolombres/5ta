document.addEventListener('DOMContentLoaded', () => {
    const mazoCompletoDiv = document.getElementById('mazo-completo');
    if (!mazoCompletoDiv) return;

    // Lógica para crear el mazo (copiada y simplificada de script.js)
    const palos = ['Oros', 'Copas', 'Espadas', 'Bastos'];
    const valores = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const mazo = [];
    const palosParaNombre = { 'Copas': 'copa', 'Bastos': 'basto', 'Oros': 'oro', 'Espadas': 'espada' };

    for (const palo of palos) {
        for (const valor of valores) {
            const nombreValor = valor.toString().padStart(2, '0');
            const nombreImagen = `${nombreValor}-${palosParaNombre[palo]}.png`;
            mazo.push({ imagen: `imagenes/${nombreImagen}` });
        }
    }
    mazo.push({ imagen: `imagenes/01-comodin.png` });
    mazo.push({ imagen: `imagenes/02-comodin.png` });
    mazo.push({ imagen: `imagenes/dorso.png` });

    // Renderizar todas las cartas
    mazo.forEach(carta => {
        const cardElement = document.createElement('img');
        cardElement.src = carta.imagen;
        cardElement.title = carta.imagen; // Añadir título para ver el nombre del archivo al pasar el ratón
        mazoCompletoDiv.appendChild(cardElement);
    });
});
