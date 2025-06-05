export async function handler(event) {
  const body = JSON.parse(event.body || '{}');

  const monto = body.monto;
  const descripcion = body.descripcion;
  const tipo = body.tipo || "CLOSE";
  const image_url = body.image_url;
  const callback_url = body.callback_url;

  let payload;

  if (tipo === "CLOSE") {
    payload = {
      amount_type: "CLOSE",
      amount: {
        currency: "COP",
        total_amount: monto
      },
      description: descripcion
    };
  } else {
    payload = {
      amount_type: "OPEN",
      description: descripcion
    };
  }

  if (image_url) {
    payload.image_url = image_url;
  }

  if (callback_url) {
    payload.callback_url = callback_url;
  }

  const respuesta = await fetch("https://integrations.api.bold.co/online/link/v1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "x-api-key VqsSOqWAFpzpOkqo546IxtmCYMr2uduqNJoqtY5TNAc"
    },
    body: JSON.stringify(payload)
  });

  const data = await respuesta.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      url: data.payload.url,
      payment_link: data.payload.payment_link
    })
  };
}
