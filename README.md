# Leasy · Landing

Una página estática en español rioplatense. HTML, CSS y JavaScript nativos; sin dependencias, compilación, fuentes externas, cookies, analítica ni backend. Todos los recursos visuales son SVG originales hechos en código. El dibujo del vehículo es conceptual, no una representación técnica del JMEV Easy 3.

**Sitio:** <https://atomaculus.github.io/leasy-landing/>

**Repositorio:** <https://github.com/atomaculus/leasy-landing>

## Correr localmente

Desde la raíz de este repositorio (la carpeta `landing/` en el proyecto local), con Python instalado:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Abrir <http://127.0.0.1:4173/>. Para detenerlo, `Ctrl+C`. También funciona abrir `index.html` directamente, aunque un servidor local es preferible para probar una futura integración de formulario.

## Formulario: funcionamiento actual

Los CTAs seleccionan el rol en el formulario. Nombre, email y rol son obligatorios; WhatsApp es opcional. Se valida el email y se eliminan espacios al principio/final. No se guardan datos ni se envían a un servidor.

Al tocar **Preparar mi consulta**, se arma un `mailto:` con los campos y se intenta abrir la aplicación de correo. La persona debe completar el envío. El sitio aclara que aún no recibió sus datos y ofrece un enlace para reabrir el borrador; el contacto directo está siempre visible. No hay confirmación falsa de recepción. El borrador depende de que la persona tenga un cliente de correo configurado.

Sin JavaScript se usa el formulario HTML con `action="mailto:…"`, `method="post"` y `enctype="text/plain"`; su comportamiento depende del navegador y del cliente de correo. Sigue disponible el enlace directo al email.

### Conectar Formspree

1. Crear un formulario en Formspree y verificar el email de destino.
2. En `app.js`, reemplazar `const FORM_ENDPOINT = "";` por el endpoint HTTPS que te dé el servicio, por ejemplo `const FORM_ENDPOINT = "https://formspree.io/f/TU_ID_REAL";`. Este ejemplo **no es un endpoint operativo**. No colocar claves secretas en el frontend.
3. El handler envía JSON mediante `POST`, con `Accept: application/json`. El proveedor debe aceptar los campos `nombre`, `email`, `whatsapp` y `rol`. Configurar las notificaciones usando esos nombres; para el remitente/respuesta, usar `email`.
4. Cambiar también el `action` del formulario al endpoint real y quitar `enctype="text/plain"` para permitir el envío HTML sin JavaScript. Actualizar el texto de `<noscript>` para explicar ese envío. El código actualiza el botón y la nota de privacidad al detectar un endpoint configurado.
5. Probar un envío real, confirmar su recepción, y revisar límites, tratamiento de datos y protección contra spam del proveedor antes de publicar.

El handler bloquea envíos simultáneos, aplica un timeout de 15 segundos y sólo confirma recepción ante una respuesta HTTP exitosa. Ante fallo, conserva los campos y ofrece el borrador por email.

### Conectar una función serverless

Usar un endpoint HTTPS o relativo del mismo origen, por ejemplo `/api/interes`, en `FORM_ENDPOINT`. La función debe aceptar:

```json
{
  "nombre": "Nombre de la persona",
  "email": "persona@ejemplo.com",
  "whatsapp": "+54 9…",
  "rol": "conductor"
}
```

`rol` admite `conductor`, `inversor` u `otro`; `whatsapp` puede ser una cadena vacía. Validar nuevamente del lado del servidor: nombre no vacío (máximo 100 caracteres), email válido (máximo 254), WhatsApp opcional (máximo 40) y rol permitido. Responder `2xx` **sólo después de aceptar/persistir la consulta**; `4xx/5xx` si falla. Permitir CORS sólo para el origen de la landing cuando sea necesario, configurar protección contra spam y mantener credenciales de email en variables de entorno del servidor.

Si se requiere envío sin JavaScript, aceptar también datos HTML `application/x-www-form-urlencoded`, cambiar el `action`, quitar `enctype="text/plain"` y devolver una confirmación accesible. La función y la persistencia **no están implementadas** en esta entrega.

## Estado y datos públicos

Leasy está en etapa de proyecto, con un piloto de 3 autos en preparación. La propuesta prevé la compra del vehículo en pesos, un canon fijo en pesos durante 36 meses y un retorno objetivo del inversor del **11% anual en USD**. El rango de canon de ARS 390.000–400.000 es un objetivo, no una tarifa comercial vigente. El esquema requiere revalidación financiera y operativa; la opción simbólica y las condiciones contractuales finales deben definirse antes del piloto. La expansión hacia unos 50 autos está condicionada a los resultados.

La comparación energética muestra aproximadamente ARS 1.900 en casa, ARS 8.855 en carga pública y ARS 5.600 con GNC cada 100 km. Supuestos del 27/9/2026: 11,5 kWh/100 km + 10% de pérdidas, ARS 150/kWh residencial, ARS 700/kWh pública, GNC 8 m³/100 km a ARS 700/m³. Son **estimaciones del modelo, sujetas a validación en el piloto**, no tarifas verificadas a la fecha de publicación. Las barras comparan costos de energía, no el costo total ni ingresos del conductor.

Este repositorio contiene únicamente el sitio y su documentación técnica. No incluye archivos financieros ni documentación interna del proyecto. La mención a Claude es un plan de uso, no una integración actual ni una relación con Anthropic.

## Deploy gratuito

La publicación usa GitHub Pages desde la rama `main`, carpeta `/ (root)`, sin compilación. Cada push a `main` actualiza el sitio. `.nojekyll` permite servir los archivos estáticos directamente. El repositorio contiene únicamente la landing; los demás documentos del proyecto local quedan fuera.

Para actualizar desde la carpeta `landing/`:

```powershell
git add index.html styles.css app.js assets README.md .gitignore .nojekyll
git commit -m "Actualizar landing de Leasy"
git push origin main
```

También es posible usar otros proveedores de hosting estático. Verificá los límites vigentes de sus planes gratuitos antes de usarlos.

### Netlify

Cargar los archivos del sitio en el flujo de despliegue manual de Netlify, sin incluir `.git`. Al conectar este repositorio, usar la raíz como carpeta de publicación, sin comando de build. Para actualizaciones manuales, volver a subir los archivos.

Referencia: [documentación oficial de Netlify](https://docs.netlify.com/manage/projects/add-new-project/).

### Vercel

Importar este repositorio y usar su raíz como **Root Directory**. Elegir **Framework Preset: Other**, sin comando de build y publicar la raíz. No hace falta Node ni instalar paquetes.

Referencia: [configuración oficial de builds de Vercel](https://vercel.com/docs/builds/configure-a-build).

### GitHub Pages

En Settings → Pages, usar el despliegue desde la rama `main`, carpeta `/ (root)`. Los recursos usan rutas relativas y funcionan bajo `/leasy-landing/`.

Referencia: [configuración oficial de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

### Antes de compartir el enlace público

- `canonical` y `og:url` ya apuntan a `https://atomaculus.github.io/leasy-landing/`. Actualizarlos si cambia el dominio o la URL.
- Open Graph incluye título, descripción, tipo, locale y nombre del sitio. No incluye imagen social: no se pidió una imagen de preview y no existe una imagen de marca verificada.
- Revalidar el esquema financiero con canon fijo en pesos y retorno del 11%; mantener visibles las advertencias mientras no se valide.
- Si se conecta un backend, revisar y ajustar el texto sobre tratamiento de datos y probar recepción real y errores.
- Las credenciales del fundador son las proporcionadas por él. No hay foto, logos de instituciones ni testimonios para completar.

## Revisión

Revisar a 390×844 y 1440×1000, y comprobar desbordamiento a 320 px. Recorrer todos los bloques; probar CTAs y preselección de rol, navegación por teclado, validación del formulario, versión sin JavaScript y `prefers-reduced-motion`. El sitio no hace peticiones de terceros durante la lectura. Las fuentes son del sistema y los SVG son locales.

Verificado localmente el 9/10/2026 en Chromium: revisión visual de escritorio (1440×1000) y celular (390×844); sin desbordamiento horizontal a 320, 390, 768, 900, 1024 y 1440 px. Se probaron ambos roles desde los CTAs, campos obligatorios, email inválido, generación del borrador con datos ficticios (sin enviar un mensaje), acceso por teclado, contraste del texto y movimiento reducido. Se comprobó también el fallback HTML con JavaScript deshabilitado. Sin errores de consola durante esos recorridos; sintaxis de JS, enlaces internos y recursos locales comprobados. La recepción mediante un backend real queda pendiente de su conexión.
