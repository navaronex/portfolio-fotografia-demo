"use strict";

// 1. DOM: elementos que conectan nuestro HTML con JavaScript.
const tarjetasFoto = Array.from(document.querySelectorAll(".tarjeta-foto"));
const botonesFoto = tarjetasFoto.map((tarjeta) =>
    tarjeta.querySelector(".abrir-foto"),
);
const filtros = document.querySelectorAll("[data-filtro]");
const visorFoto = document.querySelector("#visor-foto");
const imagenVisor = visorFoto.querySelector("img");
const botonAnterior = document.querySelector("#foto-anterior");
const botonSiguiente = document.querySelector("#foto-siguiente");

// 2. Estado: categoría visible, lista del visor y posición actual.
let botonesVisibles = [...botonesFoto];
let fotosVisor = [];
let indiceActual = 0;
let botonOrigen = null;

function mostrarFoto(indice) {
    if (fotosVisor.length === 0) return;
    indiceActual = (indice + fotosVisor.length) % fotosVisor.length;
    const boton = fotosVisor[indiceActual];
    const tarjeta = boton.closest(".tarjeta-foto");
    const imagenSeleccionada = boton.querySelector("img");
    imagenVisor.src = imagenSeleccionada.src;
    imagenVisor.alt = imagenSeleccionada.alt;
    document.querySelector("#titulo-visor").textContent =
        tarjeta.querySelector("h3").textContent;
    document.querySelector("#descripcion-visor").textContent =
        tarjeta.querySelector(".texto-tarjeta p").textContent;
    document.querySelector("#categoria-visor").textContent =
        tarjeta.querySelector(".texto-tarjeta>span").textContent;
    document.querySelector("#contador-fotos").textContent =
        `${indiceActual + 1} de ${fotosVisor.length}`;
    botonAnterior.disabled = fotosVisor.length < 2;
    botonSiguiente.disabled = fotosVisor.length < 2;
}

botonesFoto.forEach((boton) =>
    boton.addEventListener("click", () => {
        fotosVisor = [...botonesVisibles];
        botonOrigen = boton;
        mostrarFoto(fotosVisor.indexOf(boton));
        visorFoto.showModal();
        document.body.classList.add("visor-abierto");
    }),
);
botonAnterior.addEventListener("click", () => mostrarFoto(indiceActual - 1));
botonSiguiente.addEventListener("click", () => mostrarFoto(indiceActual + 1));
visorFoto.addEventListener("keydown", (evento) => {
    if (
        !visorFoto.open ||
        evento.altKey ||
        evento.ctrlKey ||
        evento.metaKey ||
        evento.shiftKey
    )
        return;
    if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
        evento.preventDefault();
        mostrarFoto(indiceActual + (evento.key === "ArrowRight" ? 1 : -1));
    }
});
visorFoto.addEventListener("click", (evento) => {
    if (evento.target !== visorFoto) return;
    const marco = visorFoto.getBoundingClientRect();
    const fuera =
        evento.clientX < marco.left ||
        evento.clientX > marco.right ||
        evento.clientY < marco.top ||
        evento.clientY > marco.bottom;
    if (fuera) visorFoto.close();
});
visorFoto.addEventListener("close", () => {
    document.body.classList.remove("visor-abierto");
    if (botonOrigen && !botonOrigen.closest(".tarjeta-foto").hidden)
        botonOrigen.focus();
});

// 3. Filtrar a partir de los atributos data-* del HTML.
filtros.forEach((filtro) =>
    filtro.addEventListener("click", () => {
        const categoria = filtro.dataset.filtro;
        filtros.forEach((otro) =>
            otro.setAttribute("aria-pressed", String(otro === filtro)),
        );
        tarjetasFoto.forEach((tarjeta) => {
            tarjeta.hidden =
                categoria !== "todas" &&
                tarjeta.dataset.categoria !== categoria;
            if (!tarjeta.hidden) tarjeta.classList.add("visible");
        });
        botonesVisibles = tarjetasFoto
            .filter((tarjeta) => !tarjeta.hidden)
            .map((tarjeta) => tarjeta.querySelector(".abrir-foto"));
        const nombre =
            categoria === "todas"
                ? "todas las categorías"
                : filtro.textContent.trim().toLowerCase();
        const cantidad = botonesVisibles.length;
        const unidad = cantidad === 1 ? "fotografía" : "fotografías";
        document.querySelector("#resumen-galeria").textContent =
            `${cantidad} ${unidad} · ${nombre}`;
    }),
);
document.querySelector(".filtros").hidden = false;

// 4. Menú móvil; el HTML mantiene la navegación disponible sin JavaScript.
const botonMenu = document.querySelector(".menu-toggle");
const menu = document.querySelector("#menu-principal");
const pantallaMovil = window.matchMedia("(max-width: 700px)");
function cerrarMenu() {
    menu.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", "false");
}
function ajustarMenu() {
    botonMenu.hidden = !pantallaMovil.matches;
    if (pantallaMovil.matches && menu.contains(document.activeElement))
        botonMenu.focus();
    cerrarMenu();
}
botonMenu.addEventListener("click", () => {
    const abierto = botonMenu.getAttribute("aria-expanded") === "true";
    botonMenu.setAttribute("aria-expanded", String(!abierto));
    menu.classList.toggle("abierto", !abierto);
});
document.querySelectorAll('a[href^="#"]').forEach((enlace) =>
    enlace.addEventListener("click", () => {
        const destino = document.querySelector(enlace.getAttribute("href"));
        if (menu.contains(enlace)) cerrarMenu();
        if (destino) destino.focus({ preventScroll: true });
    }),
);
document.addEventListener("keydown", (evento) => {
    if (
        evento.key === "Escape" &&
        !visorFoto.open &&
        botonMenu.getAttribute("aria-expanded") === "true"
    ) {
        cerrarMenu();
        botonMenu.focus();
    }
});
pantallaMovil.addEventListener("change", ajustarMenu);
ajustarMenu();

// 5. Formulario: validar datos y preparar un borrador local, sin enviarlo.
const formularioContacto = document.querySelector("#formulario-contacto");
const resumenConsulta = document.querySelector("#resumen-consulta");
const avisoContacto = document.querySelector("#aviso-contacto");
const botonCopiar = document.querySelector("#copiar-consulta");
const estadoCopia = document.querySelector("#estado-copia");
const campoFecha = formularioContacto.elements.fecha;
const hoy = new Date();
// Construimos la fecha local: toISOString() usa UTC y puede cambiar el día.
campoFecha.min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
formularioContacto.hidden = false;

formularioContacto.addEventListener("input", () => {
    formularioContacto.elements.nombre.setCustomValidity("");
    formularioContacto.elements.lugar.setCustomValidity("");
    resumenConsulta.hidden = true;
    avisoContacto.textContent = "";
    estadoCopia.textContent = "";
});
formularioContacto.addEventListener("submit", (evento) => {
    evento.preventDefault();
    // required evita valores vacíos; trim también detecta solo espacios.
    for (const nombreCampo of ["nombre", "lugar"]) {
        const campo = formularioContacto.elements[nombreCampo];
        campo.setCustomValidity(
            campo.value.trim() ? "" : "Escribe algo más que espacios.",
        );
    }
    if (!formularioContacto.reportValidity()) return;

    const datos = new FormData(formularioContacto);
    const fecha = datos.get("fecha");
    const fechaLegible = fecha
        ? new Date(`${fecha}T12:00:00`).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Por confirmar";
    const mensaje = datos.get("mensaje").trim();
    const borrador = [
        `Hola, Julio. Soy ${datos.get("nombre").trim()}.`,
        "",
        `Me gustaría consultar disponibilidad para: ${datos.get("evento")}.`,
        `Fecha: ${fechaLegible}.`,
        `Lugar: ${datos.get("lugar").trim()}.`,
        `Mi correo: ${datos.get("correo").trim()}.`,
        ...(mensaje ? ["", mensaje] : []),
    ];
    // textContent muestra el texto del usuario sin interpretarlo como HTML.
    document.querySelector("#texto-consulta").textContent = borrador.join("\n");
    resumenConsulta.hidden = false;
    estadoCopia.textContent = "";
    avisoContacto.textContent =
        "Consulta preparada. No se ha enviado ningún mensaje.";
    resumenConsulta.focus();
});
// La API del portapapeles es asíncrona y puede no estar disponible en archivos locales.
botonCopiar.addEventListener("click", async () => {
    const texto = document.querySelector("#texto-consulta");
    const borradorCopiado = texto.textContent;
    botonCopiar.disabled = true;
    try {
        if (!navigator.clipboard) throw new Error("Portapapeles no disponible");
        await navigator.clipboard.writeText(borradorCopiado);
        if (resumenConsulta.hidden || texto.textContent !== borradorCopiado) return;
        estadoCopia.textContent = "Borrador copiado. Ya puedes pegarlo donde quieras.";
    } catch {
        // La selección manual permite copiar aunque el navegador deniegue la API.
        if (resumenConsulta.hidden || texto.textContent !== borradorCopiado) return;
        const seleccion = window.getSelection();
        const rango = document.createRange();
        rango.selectNodeContents(texto);
        if (seleccion) {
            seleccion.removeAllRanges();
            seleccion.addRange(rango);
        }
        estadoCopia.textContent = "Selecciona el borrador y pulsa ⌘C en Mac o Ctrl+C para copiarlo.";
    } finally {
        botonCopiar.disabled = false;
    }
});
document.body.classList.add("mejorado");

// 6. Animación al entrar en pantalla; se desactiva con movimiento reducido.
const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
);
const elementosRevelar = document.querySelectorAll(".revelar");
let observador = null;
function ajustarAnimaciones() {
    if (observador) observador.disconnect();
    document.body.classList.remove("animaciones-listas");
    if (movimientoReducido.matches || !("IntersectionObserver" in window)) {
        elementosRevelar.forEach((elemento) =>
            elemento.classList.add("visible"),
        );
        return;
    }
    observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible");
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.08 },
    );
    elementosRevelar.forEach((elemento) => {
        if (!elemento.classList.contains("visible"))
            observador.observe(elemento);
    });
    document.body.classList.add("animaciones-listas");
}
movimientoReducido.addEventListener("change", ajustarAnimaciones);
ajustarAnimaciones();
