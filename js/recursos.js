(() => {
    const grid = document.getElementById("recursosGrid");
    const filtros = document.getElementById("recursosFiltros");
    const estado = document.getElementById("recursosEstado");

    if (!grid || !filtros || !estado) return;

    const categorias = {
        tipografias: { label: "Tipografías", singular: "TIPOGRAFÍA", icon: "fa-font" },
        presets: { label: "Presets", singular: "PRESET", icon: "fa-sliders" },
        overlays: { label: "Overlays", singular: "OVERLAY", icon: "fa-clone" },
        recursos: { label: "Otros recursos", singular: "RECURSO", icon: "fa-box-open" },
        tutoriales: { label: "Tutoriales", singular: "TUTORIAL", icon: "fa-circle-play" },
        novedades: { label: "Novedades", singular: "NOVEDAD", icon: "fa-bolt" }
    };

    const arteEditorial = {
        "marco-editorial": { estilo: "marco", texto: "YOUR\nFRAME", firma: "POL STUDIO · 01" },
        "luz-de-atardecer": { estilo: "luz", texto: "01 / GOLDEN HOUR" },
        "grano-analogico": { estilo: "grano", texto: "TEXTURA 03" }
    };

    const baseSitio = new URL(".", document.baseURI);
    let recursos = [];

    function crearElemento(tag, clase, texto) {
        const elemento = document.createElement(tag);
        if (clase) elemento.className = clase;
        if (texto !== undefined) elemento.textContent = texto;
        return elemento;
    }

    function rutaLocalSegura(valor) {
        if (typeof valor !== "string" || !valor.trim()) return null;

        let ruta;
        try {
            ruta = decodeURIComponent(valor.trim());
        } catch {
            return null;
        }

        if (
            ruta.startsWith("/") ||
            ruta.includes("\\") ||
            ruta.includes(":") ||
            ruta.includes("?") ||
            ruta.includes("#") ||
            ruta.includes("%") ||
            ruta.split("/").some(segmento => !segmento || segmento === "." || segmento === "..")
        ) return null;

        try {
            const url = new URL(ruta, baseSitio);
            if (url.origin !== baseSitio.origin || !url.pathname.startsWith(baseSitio.pathname) || url.pathname.endsWith("/")) return null;
            return url;
        } catch {
            return null;
        }
    }

    function urlExternaSegura(valor) {
        if (typeof valor !== "string" || !/^https:\/\//i.test(valor.trim())) return null;

        try {
            const url = new URL(valor.trim());
            if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
            return url;
        } catch {
            return null;
        }
    }

    function prepararDescarga(recurso) {
        if (recurso.download_type === "local") {
            const url = rutaLocalSegura(recurso.local_path);
            return url
                ? { url, local: true }
                : { error: "Descarga no disponible: revisá la ruta del archivo." };
        }

        if (recurso.download_type === "external") {
            const url = urlExternaSegura(recurso.external_url);
            return url
                ? { url, local: false }
                : { error: "Descarga no disponible: agregá un enlace público HTTPS válido." };
        }

        if (recurso.download_type === "none") return { error: "Este contenido no incluye una descarga." };
        return { error: "Descarga no disponible: falta un tipo de descarga válido." };
    }

    function recursoValido(recurso) {
        return recurso &&
            typeof recurso === "object" &&
            typeof recurso.slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(recurso.slug) &&
            typeof recurso.title === "string" && recurso.title.trim() &&
            typeof recurso.description === "string" && recurso.description.trim() &&
            Object.prototype.hasOwnProperty.call(categorias, recurso.category) &&
            typeof recurso.published === "boolean" &&
            ["local", "external", "none"].includes(recurso.download_type);
    }

    function extensiones(recurso) {
        const ruta = recurso.download_type === "local" ? recurso.local_path : "";
        const extension = typeof ruta === "string" ? ruta.split("/").pop().split(".").pop() : "";
        const etiquetas = { svg: "SVG", zip: "ZIP", otf: "OTF", ttf: "TTF", woff: "WOFF", woff2: "WOFF2", cube: "CUBE", xmp: "XMP", png: "PNG", jpg: "JPG", pdf: "PDF" };
        return etiquetas[extension.toLowerCase()] || "";
    }

    function crearVista(recurso) {
        const vista = crearElemento("div", "recurso-vista", undefined);
        vista.setAttribute("aria-hidden", "true");
        const arte = arteEditorial[recurso.slug];
        vista.classList.add(arte ? `recurso-vista-${arte.estilo}` : "recurso-vista-generica");

        const imagenSegura = rutaLocalSegura(recurso.cover_image);
        if (imagenSegura) {
            const imagen = document.createElement("img");
            imagen.className = "recurso-portada";
            imagen.src = imagenSegura.href;
            imagen.alt = "";
            imagen.loading = "lazy";
            imagen.decoding = "async";
            imagen.addEventListener("error", () => imagen.remove(), { once: true });
            vista.append(imagen);
            return vista;
        }

        const etiqueta = crearElemento("span", "recurso-vista-etiqueta", arte ? arte.texto : categorias[recurso.category].label.toUpperCase());
        vista.append(etiqueta);
        if (arte?.firma) vista.append(crearElemento("i", "recurso-vista-firma", arte.firma));
        return vista;
    }

    function crearTarjeta(recurso, indice) {
        const tarjeta = crearElemento("article", "recurso-card");
        tarjeta.dataset.category = recurso.category;
        if (indice === 0) tarjeta.classList.add("recurso-card-destacado");
        tarjeta.append(crearVista(recurso));

        const info = crearElemento("div", "recurso-info");
        const formato = extensiones(recurso);
        const categoria = categorias[recurso.category].singular;
        info.append(crearElemento("span", "recurso-tipo", formato ? `${categoria} · ${formato}` : categoria));
        info.append(crearElemento("h3", "", recurso.title.trim()));
        info.append(crearElemento("p", "", recurso.description.trim()));

        if (typeof recurso.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(recurso.date) && !Number.isNaN(Date.parse(`${recurso.date}T00:00:00Z`))) {
            const fecha = document.createElement("time");
            fecha.className = "recurso-fecha";
            fecha.dateTime = recurso.date;
            fecha.textContent = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${recurso.date}T00:00:00Z`));
            info.append(fecha);
        }

        const descarga = prepararDescarga(recurso);
        if (descarga.url) {
            const enlace = crearElemento("a", "recurso-descarga", typeof recurso.button_label === "string" && recurso.button_label.trim() ? recurso.button_label.trim() : "Descargar gratis");
            enlace.href = descarga.url.href;
            if (descarga.local) {
                enlace.setAttribute("download", "");
                let comprobando = false;
                enlace.addEventListener("click", async evento => {
                    evento.preventDefault();
                    if (comprobando) return;
                    comprobando = true;
                    enlace.setAttribute("aria-busy", "true");

                    try {
                        const respuesta = await fetch(descarga.url.href, { method: "HEAD", cache: "no-cache" });
                        if (!respuesta.ok) throw new Error("Archivo no disponible");

                        const descargaTemporal = document.createElement("a");
                        descargaTemporal.href = descarga.url.href;
                        descargaTemporal.download = "";
                        descargaTemporal.hidden = true;
                        document.body.append(descargaTemporal);
                        descargaTemporal.click();
                        descargaTemporal.remove();
                    } catch {
                        enlace.replaceWith(crearElemento("p", "recurso-descarga-mensaje", "Descarga no disponible: no encontramos el archivo en el sitio."));
                    } finally {
                        comprobando = false;
                        enlace.removeAttribute("aria-busy");
                    }
                });
            } else {
                enlace.target = "_blank";
                enlace.rel = "noopener noreferrer";
            }
            const icono = crearElemento("i", "fa-solid fa-download");
            icono.setAttribute("aria-hidden", "true");
            enlace.append(icono);
            info.append(enlace);
        } else {
            info.append(crearElemento("p", "recurso-descarga-mensaje", descarga.error));
        }

        tarjeta.append(info);
        return tarjeta;
    }

    function aplicarFiltro(categoria) {
        const coincidencias = recursos.filter(recurso => categoria === "all" || recurso.category === categoria);
        grid.replaceChildren(...coincidencias.map(crearTarjeta));

        if (!coincidencias.length) {
            grid.append(crearElemento("p", "recursos-vacio", "Todavía no hay recursos publicados en esta categoría."));
        }

        filtros.querySelectorAll(".recurso-filtro").forEach(boton => {
            const activo = boton.dataset.filter === categoria;
            boton.classList.toggle("activo", activo);
            boton.setAttribute("aria-pressed", String(activo));
        });
    }

    function crearFiltros(items) {
        const categoriasPresentes = [...new Set(items.map(recurso => recurso.category))];
        filtros.replaceChildren();

        const crearBoton = (id, texto, icono) => {
            const boton = crearElemento("button", "recurso-filtro", texto);
            boton.type = "button";
            boton.dataset.filter = id;
            boton.setAttribute("aria-pressed", "false");
            if (icono) {
                const elementoIcono = crearElemento("i", `fa-solid ${icono}`);
                elementoIcono.setAttribute("aria-hidden", "true");
                boton.prepend(elementoIcono);
            }
            boton.addEventListener("click", () => aplicarFiltro(id));
            filtros.append(boton);
        };

        crearBoton("all", "Todos");
        categoriasPresentes.forEach(id => crearBoton(id, categorias[id].label, categorias[id].icon));
    }

    async function iniciarCatalogo() {
        estado.textContent = "Cargando recursos…";
        const urlCatalogo = new URL("content/recursos.json", baseSitio);

        try {
            const respuesta = await fetch(urlCatalogo, { cache: "no-cache" });
            if (!respuesta.ok) throw new Error("No se pudo cargar el catálogo.");
            const datos = await respuesta.json();
            if (!Array.isArray(datos)) throw new Error("El catálogo no tiene el formato esperado.");

            const slugs = new Set();
            let omitidos = 0;
            recursos = datos.filter(recurso => {
                if (!recursoValido(recurso) || slugs.has(recurso.slug)) {
                    omitidos++;
                    return false;
                }
                slugs.add(recurso.slug);
                return recurso.published;
            });

            recursos.sort((a, b) => {
                const fechaA = /^\d{4}-\d{2}-\d{2}$/.test(a.date || "") ? Date.parse(`${a.date}T00:00:00Z`) : 0;
                const fechaB = /^\d{4}-\d{2}-\d{2}$/.test(b.date || "") ? Date.parse(`${b.date}T00:00:00Z`) : 0;
                return fechaB - fechaA;
            });

            crearFiltros(recursos);
            aplicarFiltro("all");
            estado.textContent = omitidos ? `Se omitieron ${omitidos} publicaciones con datos incompletos o repetidos.` : recursos.length ? "" : "Todavía no hay recursos publicados.";
        } catch {
            estado.textContent = "No se pudo actualizar el catálogo. Se mantienen visibles los recursos guardados en esta página.";
            filtros.querySelectorAll(".recurso-filtro").forEach(boton => { boton.disabled = true; });
        } finally {
            grid.setAttribute("aria-busy", "false");
        }
    }

    iniciarCatalogo();
})();
