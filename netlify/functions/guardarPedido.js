const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  // Importar Octokit dinámicamente
  const { Octokit } = await import("@octokit/rest");

  try {
    const data = JSON.parse(event.body);
    const fecha = new Date().toISOString().replace(/[:.]/g, "-");
    const fechaISO = new Date().toISOString();
    const archivo = `pedidosform/pedido-${fecha}.json`;

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
Teléfono: ${data.telefono}
Ciudad: ${data.ciudad}
Dirección: ${data.direccion}
Total: ${data.total}

Productos:
${carritoTexto}
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ mensaje: "Pedido registrado con éxito" })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno", detalle: error.message })
    };
  }
};
