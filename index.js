function obtenerDatos(monto,descripcion) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "x-api-key nJ9FF127-QcCmd0tcpB5Y-HDzmYu_BhJliqyz3D4T6E");

    var raw = JSON.stringify({
         "amount_type" : "CLOSE",
         "amount": {
          "currency": "COP",
          "total_amount": monto
        },
        "description": descripcion
      });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://integrations.api.bold.co/online/link/v1", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.payload && result.payload.url) {
                window.location.href = result.payload.url; // Redirige directamente al enlace de pago
            } else {
                console.error('Error: No se recibió un enlace de pago válido.', result);
            }
        })
        .catch(error => console.log('error', error));
}

function obtenerCotizacion(descripcion) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "x-api-key nJ9FF127-QcCmd0tcpB5Y-HDzmYu_BhJliqyz3D4T6E");

    var raw = JSON.stringify({
        "amount_type": "OPEN",
        "description": descripcion // En este caso pasamos la descripción del producto o servicio
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://integrations.api.bold.co/online/link/v1", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.payload && result.payload.url) {
                window.location.href = result.payload.url; // Redirige directamente al enlace de pago
            } else {
                console.error('Error: No se recibió un enlace de pago válido.', result);
            }
        })
        .catch(error => console.log('error', error));
}
