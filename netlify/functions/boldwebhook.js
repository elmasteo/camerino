exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    console.log('Webhook recibido:', JSON.stringify(data, null, 2));

    if (!data || data.type !== 'SALE_APPROVED') {
      return { statusCode: 200, body: 'Evento ignorado: no es SALE_APPROVED' };
    }

    const referencia = data.data?.metadata?.reference;
    if (!referencia) {
      return { statusCode: 400, body: 'Referencia (payment_link) no encontrada' };
    }

    console.log('Referencia recibida:', referencia);

    const repoOwner = 'elmasteo';
    const repoName = 'camerino';
    const filePath = `pedidosform/${referencia}.json`;
    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;

    const headers = {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3.raw',
    };

    const pedidoRes = await fetch(githubApiUrl, { headers });

    if (!pedidoRes.ok) {
      return {
        statusCode: 404,
        body: 'No se encontró el archivo del pedido original',
      };
    }

    const pedido = await pedidoRes.json();

    const telefono = pedido.telefonoCompleto?.replace(/\D/g, '');
    if (!telefono) {
      return {
        statusCode: 400,
        body: 'Número de teléfono no encontrado en el pedido',
      };
    }

    const productosTexto = pedido.carrito
      .map((p) => `- ${p.nombre} x${p.cantidad}`)
      .join('\n');

    const mensaje = `Hola ${pedido.nombre}, tu pago fue aprobado ✅

📦 Detalles de tu pedido:
${productosTexto}

💰 Total: $${pedido.total.toLocaleString('es-CO')}

Pronto te contactaremos para coordinar el envío.
Gracias por comprar en *CamerinoJip*!`;

    const evoRes = await fetch(
      'https://ubuntu.tail55c7a1.ts.net/message/sendText/CamerinoJIP',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: `${process.env.EVOLUTION_API_TOKEN}`,
        },
        body: JSON.stringify({
          number: pedido.telefonoCompleto.startsWith('+') ? pedido.telefonoCompleto : `+${pedido.telefonoCompleto}`,
          text: mensaje,
        }),
      }
    );

    if (!evoRes.ok) {
      const errText = await evoRes.text();
      throw new Error(`Error en Evolution API: ${errText}`);
    }

    const mensajeAdmin = `
    ✅ PAGO APROBADO

    👤 ${pedido.nombre}
    📞 ${pedido.telefonoCompleto}
    🏙️ ${pedido.ciudad}
    📍 ${pedido.direccion}
    💰 Total: $${pedido.total.toLocaleString('es-CO')}

    🧾 Productos:
    ${productosTexto}

    Referencia: ${referencia}
    `;

    await fetch('https://ubuntu.tail55c7a1.ts.net/message/sendText/CamerinoJIP', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: `${process.env.EVOLUTION_API_TOKEN}`,
      },
      body: JSON.stringify({
        number: '573177657335',
        text: mensajeAdmin,
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Mensaje de WhatsApp enviado correctamente' }),
    };
  } catch (error) {
    console.error('Error procesando webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, stack: error.stack }),
    };
  }
};
