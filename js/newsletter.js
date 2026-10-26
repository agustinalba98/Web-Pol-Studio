(() => {
    const embed = document.getElementById("newsletterEmbed");
    const message = document.getElementById("newsletterMessage");

    if (!embed || !message) return;

    const formUrl = embed.dataset.brevoFormUrl.trim();
    if (!formUrl) return;

    let url;
    try {
        url = new URL(formUrl);
    } catch {
        message.textContent = "No pudimos cargar el formulario de suscripción. Revisá el enlace de inserción de Brevo.";
        return;
    }

    const hostBrevo = url.hostname === "sibforms.com" || url.hostname.endsWith(".sibforms.com");
    if (url.protocol !== "https:" || !hostBrevo || url.username || url.password) {
        message.textContent = "El enlace del formulario no es válido. Usá la URL HTTPS del iframe generado por Brevo.";
        return;
    }

    const alturaIngresada = Number.parseInt(embed.dataset.brevoFormHeight, 10);
    const alturaBase = Number.isFinite(alturaIngresada) ? Math.min(900, Math.max(600, alturaIngresada)) : 600;
    const altura = window.matchMedia("(max-width: 600px)").matches ? 500 : alturaBase;
    const iframe = document.createElement("iframe");
    iframe.className = "brevo-form-frame";
    iframe.title = "Formulario de suscripción al newsletter de POL Studio";
    iframe.src = url.href;
    iframe.width = "100%";
    iframe.height = String(altura);
    iframe.scrolling = "auto";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";

    embed.replaceChildren(iframe, message);
    message.hidden = true;
})();
