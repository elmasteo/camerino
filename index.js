const productos = [
  { id: 1, nombre: "Kid Boo", precio: 360000, imagen: "./images/majinboo.jpeg" },
  { id: 2, nombre: "Cell", precio: 360000, imagen: "./images/cell.jpeg" },
  { id: 3, nombre: "Deadpool - Wolverine", precio: 260000, imagen: "./images/deadpool.jpeg" },
  { id: 4, nombre: "Mario Tortuga", precio: 260000, imagen: "./images/tortuga.jpeg" },
  { id: 5, nombre: "Pokebola", precio: 260000, imagen: "./images/pokebola.jpeg" },
  { id: 6, nombre: "Sunny - One Piece", precio: 260000, imagen: "./images/sunny.jpeg" },
  { id: 7, nombre: "One Piece", precio: 260000, imagen: "./images/onepiece.jpeg" },
  { id: 8, nombre: "Playstation", precio: 260000, imagen: "./images/play.jpeg" }
];
    const catalogo = document.getElementById("catalogo");
    const listaCarrito = document.getElementById("lista-carrito");
    const totalPrecio = document.getElementById("total-precio");
    const notification = document.getElementById("notification");
    let carrito = [];

    // Función reutilizable para generar la URL absoluta de una imagen
function obtenerUrlAbsoluta(ruta) {
  if (ruta.startsWith("http")) return ruta;
  const baseUrl = "https://camerinojip.com";
  return ruta.replace(/^\.?\//, `${baseUrl}/`);
}

    function renderCatalogo() {
      productos.forEach(producto => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="${producto.imagen}" alt="${producto.nombre}">
          <div class="card-content">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio.toLocaleString()}</p>
            <button class="btn" onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>
          </div>
        `;
        catalogo.appendChild(card);
      });
    }

    function agregarAlCarrito(producto) {
      mostrarCarrito(); // para mostrar el panel

      const yaEnCarrito = carrito.some(item => item.id === producto.id);
      if (yaEnCarrito) {
        mostrarNotificacion(`${producto.nombre} ya está en el carrito`);
        return;
      }
      carrito.push(producto);
      actualizarCarrito();
      mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }


    function eliminarDelCarrito(index) {
      const productoEliminado = carrito[index];
      carrito.splice(index, 1);
      actualizarCarrito();
      mostrarNotificacion(`Producto "${productoEliminado.nombre}" eliminado del carrito.`, true);
    }

    function actualizarCarrito() {
      listaCarrito.innerHTML = "";
      let total = 0;
      carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${item.nombre}</span>
          <span>$${item.precio.toLocaleString()}</span>
          <button onclick="eliminarDelCarrito(${index})" style="margin-left: 1rem; background: crimson; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 6px; cursor: pointer;">✕</button>
        `;
        listaCarrito.appendChild(li);
        total += item.precio;
      });
      totalPrecio.textContent = "$" + total.toLocaleString();
    }
    function toggleCarrito() {
      mostrarCarrito();
    }

    function mostrarCarrito() {
      document.getElementById('carrito-lateral').classList.remove('oculto');
      document.getElementById('carrito-lateral').classList.add('activo');
    }

    function cerrarCarrito() {
      document.getElementById('carrito-lateral').classList.remove('activo');
      document.getElementById('carrito-lateral').classList.add('oculto');
    }

    function mostrarNotificacion(mensaje, esEliminacion = false) {
      notification.textContent = mensaje;
      notification.classList.add('show');
      if (esEliminacion) notification.classList.add('remove');
      setTimeout(() => {
        notification.classList.remove('show', 'remove');
      }, 3000);
    }

    function pagarConBold() {
      if (carrito.length === 0) return alert("Tu carrito está vacío.");
      const descripcion = carrito.map(item => item.nombre).join(", ");
      const monto = carrito.reduce((sum, item) => sum + item.precio, 0);
      const imagenUrl = obtenerUrlAbsoluta(carrito[0].imagen);
      const mensaje = `Hola! Realicé el pago exitoso de: ${descripcion} por $${monto.toLocaleString('es-CO')} COP.`;
      const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;

      const raw = JSON.stringify({
        monto,
        descripcion,
        tipo: "CLOSE",
        image_url: imagenUrl,
        callback_url
      });

      fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw
      })
      .then(response => response.json())
      .then(result => {
        if (result.payload && result.payload.url) {
          window.location.href = result.payload.url;
        } else {
          console.error('No se recibió un enlace de pago válido.', result);
        }
      })
      .catch(error => console.error('Error al generar enlace:', error));
    }

   function realizarAbono() {
    const descripcion = "Abono para compra de tapetes personalizados"; // Descripción general
    const imagenUrl = obtenerUrlAbsoluta("./images/camerino.jpeg"); // Imagen genérica o la que prefieras

    obtenerCotizacion(descripcion, imagenUrl); // Llamamos a la función para obtener el enlace con monto abierto
}

function obtenerCotizacion(descripcion, imagenUrl) {
    const mensaje = `Hola! Realicé el pago exitoso del abono: ${descripcion}`;
    const callback_url = `https://wa.me/+573177657335?text=${encodeURIComponent(mensaje)}`;

    const raw = JSON.stringify({
        descripcion: descripcion,
        tipo: "OPEN",
        image_url: imagenUrl,
        callback_url: callback_url
    });

    fetch("/.netlify/functions/crearLinkPago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

    renderCatalogo();