"use strict";

// Set an HTTPS endpoint here to enable real submissions. See README.md.
// Leave empty to prepare a draft in the visitor's email application.
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "atiliogmaculus@gmail.com";

const form = document.querySelector("#interest-form");
const roleField = document.querySelector("#role");
const status = document.querySelector("#form-status");
const submitButton = form.querySelector("button[type='submit']");
const validRoles = new Set(["conductor", "inversor", "otro"]);
const roleLabels = { conductor: "Conductor", inversor: "Inversor", otro: "Otro" };

document.querySelectorAll("[data-role]").forEach((link) => {
  link.addEventListener("click", () => {
    const role = link.dataset.role;
    if (validRoles.has(role)) {
      roleField.value = role;
      setStatus("");
    }
  });
});

function setStatus(message, state = "info") {
  status.textContent = message;
  status.dataset.state = state;
}

// A prepared draft must not keep stale contact details after an edit.
form.addEventListener("input", () => setStatus(""));

function makeMailto(data) {
  const subject = `Interés en Leasy — ${roleLabels[data.rol]}`;
  const body = [
    "Hola Ato, me interesa conocer el proyecto Leasy.",
    "",
    `Nombre: ${data.nombre}`,
    `Email: ${data.email}`,
    `WhatsApp: ${data.whatsapp || "No informado"}`,
    `Rol: ${roleLabels[data.rol]}`,
    "",
    "Entiendo que Leasy está en etapa de proyecto y que esta consulta no implica una reserva ni un compromiso de inversión.",
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function showEmailFallback(data, message) {
  const mailto = makeMailto(data);
  setStatus(message);
  const link = document.createElement("a");
  link.href = mailto;
  link.textContent = "Abrir el borrador de email";
  status.append(" ", link, ".");
  return mailto;
}

if (FORM_ENDPOINT) {
  submitButton.firstChild.textContent = "Enviar mi interés ";
  document.querySelector("#form-note").textContent =
    "Usaremos estos datos sólo para responderte sobre Leasy. Registrar tu interés no implica una reserva ni un compromiso de inversión.";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (submitButton.disabled) return;

  form.querySelectorAll("input").forEach((input) => {
    input.value = input.value.trim();
  });
  if (!form.reportValidity() || !validRoles.has(roleField.value)) return;

  const data = {
    nombre: form.elements.nombre.value,
    email: form.elements.email.value,
    whatsapp: form.elements.whatsapp.value,
    rol: roleField.value,
  };

  if (!FORM_ENDPOINT) {
    const mailto = showEmailFallback(
      data,
      "Tu consulta está lista para enviarla desde tu aplicación de correo. Si no se abre automáticamente, usá este enlace. Todavía no recibimos tus datos.",
    );
    window.location.href = mailto;
    return;
  }

  submitButton.disabled = true;
  form.setAttribute("aria-busy", "true");
  setStatus("Enviando tu interés…");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const endpoint = new URL(FORM_ENDPOINT, window.location.href);
    if (endpoint.protocol !== "https:" && endpoint.origin !== window.location.origin) {
      throw new Error("The form endpoint must use HTTPS or the same origin.");
    }
    const response = await fetch(endpoint.href, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("The endpoint did not accept the submission.");
    setStatus("Recibimos tu interés. Gracias por acercarte a Leasy.", "success");
    form.reset();
  } catch {
    showEmailFallback(
      data,
      "No pudimos confirmar el envío. Conservamos los datos en el formulario: podés volver a intentar o enviarlos por email.",
    );
    status.dataset.state = "error";
  } finally {
    window.clearTimeout(timeout);
    submitButton.disabled = false;
    form.removeAttribute("aria-busy");
  }
});
