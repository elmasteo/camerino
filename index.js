function obtenerDatos(monto, descripcion) {
    var raw = JSON.stringify({
        monto: monto,
        descripcion: descripcion,
        tipo: "CLOSE"
    });

    fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: raw
    })
    .then(response => response.json())
    .then(result => {
        if (result.payload && result.payload.url) {
            window.location.href = result.payload.url;
        } else {
            console.error('Error: No se recibió un enlace de pago válido.', result);
        }
    })
    .catch(error => console.log('error', error));
}

function obtenerCotizacion(descripcion) {
    var raw = JSON.stringify({
        descripcion: descripcion,
        tipo: "OPEN"
    });

    fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: raw
    })
    .then(response => response.json())
    .then(result => {
        if (result.payload && result.payload.url) {
            window.location.href = result.payload.url;
        } else {
            console.error('Error: No se recibió un enlace de pago válido.', result);
        }
    })
    .catch(error => console.log('error', error));
}
