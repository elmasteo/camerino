export async function handler(event, context) {
  const body = JSON.parse(event.body || '{}');

  const monto = body.monto;
  const descripcion = body.descripcion;
  const tipo = body.tipo || "CLOSE"; // Por defecto, cierre

  const payload = tipo === "CLOSE"
    ? {
        "amount_type": "CLOSE",
        "amount": {
          "currency": "COP",
          "total_amount": monto
        },
        "description": descripcion
      }
    : {
        "amount_type": "OPEN",
        "description": descripcion
      };

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
    body: JSON.stringify(data)
  };
}
