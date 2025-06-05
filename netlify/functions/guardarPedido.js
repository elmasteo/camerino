const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const { Octokit } = await import("@octokit/rest");

  try {
    const data = JSON.parse(event.body);

    if (!data.payment_link) {
      return {
        statusCode: 400,
        body: "Falta el campo 'referencia' en el pedido.",
      };
    }

    const payment_link = data.payment_link;
    const fechaISO = new Date().toISOString();
    const archivo = `pedidosform/${payment_link}.json`;

    data.fecha = fechaISO;

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const contenido = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_USER,
      repo: process.env.GITHUB_REPO,
      path: archivo,
      message: `Nuevo pedido de ${data.nombre}`,
      content: contenido,
      committer: {
        name: "Pedido Bot",
        email: "pedidos@netlify.com"
      },
      author: {
        name: "Pedido Bot",
        email: "pedidos@netlify.com"
      }
    });

    const carritoTexto = Array.isArray(data.carrito)
      ? data.carrito.map(p => `- ${p.nombre} x${p.cantidad}`).join("\n")
      : "No hay productos";

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Tienda CamerinoJip" <${process.env.MAIL_USER}>`,
      to: "sago980302@hotmail.com, Johnalexanderpatino@gmail.com",
      subject: `Nuevo pedido de ${data.nombre}`,
      text: `
📦 Pedido nuevo:

Nombre: ${data.nombre}
Teléfono: ${data.telefonoCompleto}
Ciudad: ${data.ciudad}
Dirección: ${data.direccion}
Total: ${data.total}

Productos:
${carritoTexto}

Referencia: ${payment_link}
      `
    });

    const mensajeAdmin = `
📢 Nueva intención de pago recibida

👤 ${data.nombre}
📞 ${data.telefonoCompleto}
🏙️ ${data.ciudad}
📍 ${data.direccion}
💰 Total: $${data.total.toLocaleString("es-CO")}

🧾 Productos:
${carritoTexto}

Referencia: ${payment_link}
`;

await fetch('https://ip-172-31-35-225.taile4b68d.ts.net/message/sendText/CamerinoJIP', {
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
      body: JSON.stringify({ mensaje: "Pedido registrado con éxito", payment_link })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno", detalle: error.message })
    };
  }
};
