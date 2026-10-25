/*======================================
        HERO FADE OUT
======================================*/

setTimeout(() => {

    const textoHero = document.querySelector(".hero-texto-fade");

    if (textoHero) {

        textoHero.classList.add("fade-out");

    }

    const botonHero = document.querySelector(".boton-hero");

    if (botonHero) {

        botonHero.classList.add("semi-visible");

    }

}, 5000);


/*======================================
        HEADER + MENÚ ACTIVO
======================================*/

const header = document.getElementById("header");

const menuLinks = document.querySelectorAll("#header a");

const secciones = document.querySelectorAll("main section");

let seccionesInfo = [];

let scrollPendiente = false;

function medirSecciones() {

    seccionesInfo = Array.from(secciones).map(seccion => ({

        id: seccion.id,

        top: seccion.offsetTop - 150,

        alto: seccion.offsetHeight

    }));

}

function actualizarScroll() {

    if (header) {

        header.classList.toggle("activo", window.scrollY > 100);

    }

    let actual = "";

    seccionesInfo.forEach(seccion => {

        if (window.scrollY >= seccion.top && window.scrollY < seccion.top + seccion.alto) {

            actual = seccion.id;

        }

    });

    menuLinks.forEach(link => {

        link.classList.toggle("activo", link.getAttribute("href") === "#" + actual);

    });

    scrollPendiente = false;

}

window.addEventListener("scroll", () => {

    if (!scrollPendiente) {

        scrollPendiente = true;

        requestAnimationFrame(actualizarScroll);

    }

}, { passive: true });

window.addEventListener("resize", medirSecciones);

window.addEventListener("load", medirSecciones);

if (document.fonts) {

    document.fonts.ready.then(medirSecciones);

}

medirSecciones();

actualizarScroll();


/*======================================
        VIDEOS: CARGA DIFERIDA Y PAUSA
======================================*/

const videoModal = document.getElementById("videoCompleto");

const videosFondo = Array.from(document.querySelectorAll(".video-fondo, .card video, .collage-video video"));

const estadoVideos = new WeakMap();

const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let modalAbierto = false;

let paginaVisible = !document.hidden;

function obtenerEstado(video) {

    let estado = estadoVideos.get(video);

    if (!estado) {

        estado = { cargado: false, visible: false };

        estadoVideos.set(video, estado);

    }

    return estado;

}

function cargarVideo(video) {

    const estado = obtenerEstado(video);

    if (estado.cargado) {

        return;

    }

    const fuentes = video.querySelectorAll("source[data-src]");

    fuentes.forEach(fuente => {

        fuente.src = fuente.dataset.src;

        fuente.removeAttribute("data-src");

    });

    if (fuentes.length) {

        estado.cargado = true;

        video.preload = "auto";

        video.load();

        actualizarVideo(video);

    }

}

function puedeReproducir(video) {

    const estado = obtenerEstado(video);

    return estado.cargado && estado.visible && !modalAbierto && paginaVisible && !reducirMovimiento;

}

function actualizarVideo(video) {

    if (puedeReproducir(video)) {

        const reproduccion = video.play();

        if (reproduccion) {

            reproduccion.catch(() => {});

        }

    } else if (!video.paused) {

        video.pause();

    }

}

function actualizarVideos() {

    videosFondo.forEach(actualizarVideo);

}

/* Descarga el video recién cuando está cerca de la pantalla */

const observadorCarga = new IntersectionObserver(entradas => {

    entradas.forEach(entrada => {

        if (entrada.isIntersecting && !reducirMovimiento) {

            cargarVideo(entrada.target);

        }

    });

}, { rootMargin: "400px 0px" });

/* Reproduce únicamente mientras el video está a la vista */

const observadorVisibilidad = new IntersectionObserver(entradas => {

    entradas.forEach(entrada => {

        const estado = obtenerEstado(entrada.target);

        estado.visible = entrada.isIntersecting;

        actualizarVideo(entrada.target);

    });

}, { threshold: 0.1 });

videosFondo.forEach(video => {

    const estado = obtenerEstado(video);

    const tieneFuenteDiferida = video.querySelector("source[data-src]");

    if (tieneFuenteDiferida) {

        observadorCarga.observe(video);

    } else {

        estado.cargado = true;

    }

    observadorVisibilidad.observe(video);

});

/* Si se cambia de pestaña, no gastar recursos */

document.addEventListener("visibilitychange", () => {

    paginaVisible = !document.hidden;

    if (!paginaVisible) {

        videosFondo.forEach(video => video.pause());

        if (videoModal) {

            videoModal.pause();

        }

    } else {

        actualizarVideos();

        if (modalAbierto && videoModal) {

            const reproduccion = videoModal.play();

            if (reproduccion) {

                reproduccion.catch(() => {});

            }

        }

    }

});


/*======================================
        MODAL DE PRODUCCIONES
======================================*/

const cards = document.querySelectorAll(".card");

const modal = document.getElementById("modalVideo");

const cerrar = document.querySelector(".cerrar-modal");

function abrirModal(card) {

    modalAbierto = true;

    /* Pausa todos los videos de fondo antes de abrir el video completo */

    actualizarVideos();

    if (videoModal) {

        videoModal.src = card.dataset.video;

        videoModal.muted = true;

        const reproduccion = videoModal.play();

        if (reproduccion) {

            reproduccion.catch(() => {});

        }

    }

    if (modal) {

        modal.classList.add("activo");

    }

    document.body.style.overflow = "hidden";

}

function cerrarModal() {

    if (modal) {

        modal.classList.remove("activo");

    }

    if (videoModal) {

        videoModal.pause();

        videoModal.currentTime = 0;

        videoModal.removeAttribute("src");

        videoModal.load();

    }

    document.body.style.overflow = "";

    modalAbierto = false;

    /* Reanuda solo los videos que siguen a la vista */

    actualizarVideos();

}

cards.forEach(card => {

    card.addEventListener("click", () => {

        abrirModal(card);

    });

});

if (cerrar) {

    cerrar.addEventListener("click", cerrarModal);

}

window.addEventListener("keydown", evento => {

    if (evento.key === "Escape" && modalAbierto) {

        cerrarModal();

    }

});

if (modal) {

    modal.addEventListener("click", evento => {

        if (evento.target === modal) {

            cerrarModal();

        }

    });

}


/*======================================
        CUSTOM CURSOR
======================================*/

const cursor = document.getElementById("customCursor");

const elementosClicables = document.querySelectorAll("a, button, .card, .menu-toggle, .contacto-card, .boton-hero");

if (cursor) {

    let cursorX = 0;

    let cursorY = 0;

    let cursorPendiente = false;

    document.addEventListener("mousemove", evento => {

        cursorX = evento.clientX;

        cursorY = evento.clientY;

        if (!cursorPendiente) {

            cursorPendiente = true;

            requestAnimationFrame(() => {

                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;

                cursorPendiente = false;

            });

        }

    });

    elementosClicables.forEach(elemento => {

        elemento.addEventListener("mouseenter", () => {

            cursor.classList.add("foco");

        });

        elemento.addEventListener("mouseleave", () => {

            cursor.classList.remove("foco");

        });

    });

}


/*======================================
        MENÚ RESPONSIVE
======================================*/

const menuToggle = document.querySelector(".menu-toggle");

const menu = document.querySelector("header ul");

const icono = menuToggle ? menuToggle.querySelector("i") : null;

if (menuToggle && menu && icono) {

    menuToggle.addEventListener("click", () => {

        const abierto = menu.classList.toggle("activo");

        icono.classList.toggle("fa-bars", !abierto);

        icono.classList.toggle("fa-xmark", abierto);

        menuToggle.setAttribute("aria-expanded", abierto ? "true" : "false");

    });

    document.querySelectorAll("header ul a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("activo");

            icono.classList.remove("fa-xmark");

            icono.classList.add("fa-bars");

            menuToggle.setAttribute("aria-expanded", "false");

        });

    });

}
