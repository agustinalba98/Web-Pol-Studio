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
            HEADER
======================================*/

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 100) {

        header.classList.add("activo");

    } else {

        header.classList.remove("activo");

    }

});


/*======================================
        MODAL DE PRODUCCIONES
======================================*/

const cards = document.querySelectorAll(".card");

const modal = document.getElementById("modalVideo");

const video = document.getElementById("videoCompleto");

const cerrar = document.querySelector(".cerrar-modal");

cards.forEach(card => {

    card.addEventListener("click", () => {

        video.src = card.dataset.video;

        video.muted = true; // Arranca sin sonido

        modal.classList.add("activo");

        document.body.style.overflow = "hidden";

        video.play();

    });

});


function cerrarModal() {

    modal.classList.remove("activo");

    video.pause();

    video.currentTime = 0;

    video.src = "";

    document.body.style.overflow = "";

}


cerrar.addEventListener("click", cerrarModal);


window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        cerrarModal();

    }

});


modal.addEventListener("click", (e) => {

    if (e.target === modal) {

        cerrarModal();

    }

});


/*======================================
        MENÚ ACTIVO AL HACER SCROLL
======================================*/

const links = document.querySelectorAll("#header a");

const secciones = document.querySelectorAll("main section");

window.addEventListener("scroll", () => {

    let actual = "";

    secciones.forEach(seccion => {

        const top = seccion.offsetTop - 150;

        const alto = seccion.offsetHeight;

        if (window.scrollY >= top && window.scrollY < top + alto) {

            actual = seccion.getAttribute("id");

        }

    });

    links.forEach(link => {

        link.classList.remove("activo");

        if (link.getAttribute("href") === "#" + actual) {

            link.classList.add("activo");

        }

    });

});


/*======================================
        CUSTOM CURSOR
======================================*/

const cursor = document.getElementById("customCursor");

document.addEventListener("mousemove", (e) => {

    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

});

const clickableElements = document.querySelectorAll("a, button, .card, .menu-toggle, .contacto-card, .boton-hero");

clickableElements.forEach(el => {

    el.addEventListener("mouseenter", () => {

        cursor.classList.add("foco");

    });

    el.addEventListener("mouseleave", () => {

        cursor.classList.remove("foco");

    });

});


/*======================================
        MENÚ RESPONSIVE
======================================*/

const menuToggle = document.querySelector(".menu-toggle");

const menu = document.querySelector("header ul");

const icono = menuToggle.querySelector("i");

menuToggle.addEventListener("click",()=>{

    menu.classList.toggle("activo");

    if(menu.classList.contains("activo")){

        icono.classList.remove("fa-bars");
        icono.classList.add("fa-xmark");

    }else{

        icono.classList.remove("fa-xmark");
        icono.classList.add("fa-bars");

    }

});

document.querySelectorAll("header ul a").forEach(link=>{

    link.addEventListener("click",()=>{

        menu.classList.remove("activo");

        icono.classList.remove("fa-xmark");
        icono.classList.add("fa-bars");

    });

});