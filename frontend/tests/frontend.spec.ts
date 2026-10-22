import { test, expect, type Page } from "@playwright/test";

const routes = [
  "bienvenida",
  "inicio",
  "progreso",
  "aprender",
  "registro",
  "recompensa",
  "comprobante",
  "cuenta",
  "reflexion",
  "historial",
  "constancia",
  "mis-recompensas",
];

/** H6: the reward is only delivered after the person reviews and accepts it. */
async function claimReward(page: Page) {
  await page.getByRole("button", { name: "Recibir mi recompensa" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirma tu recompensa" });
  await expect(dialog).toContainText("Costo para ti");
  await dialog.getByRole("button", { name: "Aceptar y recibir" }).click();
  await expect(dialog).toBeHidden();
}

async function completeLesson(page: Page, repeat = false) {
  // The featured lesson is the recommended one; a finished lesson is
  // repeated from "Más lecciones".
  await page
    .getByRole("button", {
      name: repeat
        ? "Repasar: ¿Qué es un Antojo?"
        : /Comenzar lección|Repasar lección/,
    })
    .click();
  const dialog = page.getByRole("dialog", { name: "Microlección de Antojos" });
  await dialog.getByRole("button", { name: "Continuar", exact: true }).click();
  await dialog.getByRole("button", { name: "Continuar", exact: true }).click();
  const next = dialog.getByRole("button", { name: "Siguiente pregunta" });
  await expect(next).toBeDisabled();
  await dialog
    .getByRole("button", { name: /Que hiciste algo incorrecto/ })
    .click();
  await expect(next).toBeDisabled();
  await dialog
    .getByRole("button", { name: /Que fue una decisión guiada/ })
    .click();
  await next.click();
  const finish = dialog.getByRole("button", { name: "Completar microlección" });
  await expect(finish).toBeDisabled();
  await dialog.getByRole("button", { name: /Para ver con el tiempo/ }).click();
  await finish.click();
  // F04: closing summary with the quiz result and today's progress.
  await expect(dialog).toContainText(/completad[oa]!/);
  await expect(dialog).toContainText("al primer intento");
  await expect(dialog).toContainText("Tu avance de hoy");
  await dialog.getByRole("button", { name: "Cerrar", exact: true }).click();
  await expect(dialog).not.toBeVisible();
}

test("twelve routes render without JavaScript errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    await page.goto(`/${route}`);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1").last()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(await page.locator("main").innerText()).not.toMatch(
      /Stellar|Testnet/,
    );
  }
  expect(errors).toEqual([]);
});

test("welcome needs no financial data but does require a name", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/bienvenida$/);
  await page.getByRole("button", { name: "Comenzar mi recorrido" }).click();
  await expect(page).toHaveURL(/\/bienvenida$/);
  await expect(page.locator("#welcome-name-error")).toContainText(
    "Escribe tu nombre",
  );
  await page.getByLabel(/Cómo te llamamos/).fill("   ");
  await page.getByRole("button", { name: "Comenzar mi recorrido" }).click();
  await expect(page).toHaveURL(/\/bienvenida$/);
  await page.getByLabel(/Cómo te llamamos/).fill("Rodrigo");
  await page.getByRole("button", { name: "Comenzar mi recorrido" }).click();
  // F01: the first stop after the welcome is registering a purchase.
  await expect(page).toHaveURL(/\/registro$/);
  await page.getByRole("link", { name: "Volver" }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.locator("main")).toContainText("Rodrigo");
});

test("photo, validated decision, immediate reward and weekly reflection share state", async ({
  page,
}) => {
  await page.goto("/registro");
  const photo = page.getByLabel("Agregar foto de tu decisión");
  await photo.setInputFiles({
    name: "no.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("test"),
  });
  await expect(page.locator(".photo-capture [role=alert]")).toContainText(
    "JPG, PNG o WebP",
  );
  await photo.setInputFiles("public/icons/icon-192.png");
  await expect(page.getByAltText("Vista previa de tu decisión")).toBeVisible();
  await page.getByLabel("Monto en pesos mexicanos").fill("-2");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page.locator("#amount-error")).toContainText("mayor a 0");
  await page.getByLabel("Monto en pesos mexicanos").fill("350,50");
  await page.getByLabel(/qué compraste/i).fill("Despensa de la semana");
  await page.getByRole("radio", { name: "Guardé Ahorro" }).check();
  await page.getByRole("radio", { name: "Rutina Neutro" }).check();
  await page
    .getByLabel(/¿Alguna nota rápida/)
    .fill("Registro de prueba semanal");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page).toHaveURL(/\/recompensa$/);
  await claimReward(page);
  await expect(
    page.getByRole("button", { name: "Recompensa demo reclamada" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await expect(page.locator(".balance-number")).toHaveText("126créditos");
  await page
    .getByRole("link", { name: "Ver recompensas", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Recompensa demo reclamada" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await page
    .getByRole("link", { name: "Explorar mi reflexión semanal" })
    .click();
  const record = page
    .locator(".record-card")
    .filter({ hasText: "Registro de prueba semanal" });
  await expect(record).toContainText("$350.50 MXN");
  await expect(record).toContainText("Rutina");
  await expect(record).toContainText("Foto adjunta en esta sesión");
  await page.reload();
  await expect(page.getByText("Registro de prueba semanal")).toHaveCount(0);
});

test("a lesson earns an additional reward, while repeating it earns none", async ({
  page,
}) => {
  await page.goto("/registro");
  await page.getByLabel(/qué compraste/i).fill("Un café");
  await page
    .getByLabel("Agregar foto de tu decisión")
    .setInputFiles("public/icons/icon-192.png");
  await page.getByLabel("Monto en pesos mexicanos").fill("45");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await claimReward(page);
  await page
    .getByRole("link", { name: "Aprender y sumar otra recompensa" })
    .click();
  await completeLesson(page);
  await page.getByRole("link", { name: /Ver mi recompensa →/ }).click();
  await claimReward(page);
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await expect(page.locator(".balance-number")).toHaveText("127créditos");
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Aprende" })
    .click();
  // After finishing Antojos, the recommendation moves to a lesson not done yet.
  await expect(page.locator(".featured-lesson h2")).not.toHaveText(
    "¿Qué es un Antojo?",
  );
  await completeLesson(page, true);
  await page.getByRole("link", { name: /Ver mi recompensa →/ }).click();
  await expect(
    page.getByRole("button", { name: "Recibir mi recompensa" }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await expect(page.locator(".balance-number")).toHaveText("127créditos");
});

test("an unearned reward cannot be claimed", async ({ page }) => {
  await page.goto("/recompensa");
  await expect(
    page.getByRole("button", { name: "Recibir mi recompensa" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Registrar una decisión" }),
  ).toBeVisible();
});

test("transfer checks destination and balance, confirms before changing the demo", async ({
  page,
}) => {
  await page.goto("/cuenta");
  await page.getByLabel("Cuenta de destino").fill("invalid");
  await page.getByRole("button", { name: "Revisar envío" }).click();
  await expect(page.locator("#transfer-error")).toContainText(
    "distinta de la tuya",
  );
  await page.getByRole("button", { name: "Usar cuenta de ejemplo" }).click();
  await page.getByLabel("Cantidad de créditos").fill("126");
  await page.getByRole("button", { name: "Revisar envío" }).click();
  await expect(page.locator("#transfer-error")).toContainText(
    "no supere tu saldo",
  );
  await page.getByLabel("Cantidad de créditos").fill("10");
  await page.getByRole("button", { name: "Revisar envío" }).click();
  const dialog = page.getByRole("dialog", { name: "Confirmación del envío" });
  await expect(dialog).toContainText("DEMO-DESTINO-001");
  await expect(page.locator(".balance-number")).toHaveText("125créditos");
  await dialog.getByRole("button", { name: "Editar", exact: true }).click();
  await expect(page.locator(".balance-number")).toHaveText("125créditos");
  await page.getByRole("button", { name: "Revisar envío" }).click();
  await dialog
    .getByRole("button", { name: "Confirmar envío simulado" })
    .click();
  await expect(dialog).toContainText("¡Listo en tu demo!");
  await expect(
    dialog.getByRole("button", { name: "Confirmar envío simulado" }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Volver a mi cuenta" }).click();
  await expect(page.locator(".balance-number")).toHaveText("115créditos");
  await expect(page.locator(".movement-row")).toHaveCount(1);
});

test("proof keeps technical details optional and copies the complete example", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/comprobante");
  await expect(
    page.getByRole("button", { name: "Ver en Stellar Explorer" }),
  ).not.toBeVisible();
  await page.getByText("Ver detalles de verificación", { exact: true }).click();
  await page.getByRole("button", { name: "Copiar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Copiado", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "0x8fa3f8471e98bb41c",
  );
  await page.getByRole("button", { name: "Ver en Stellar Explorer" }).click();
  await expect(page.getByRole("status")).toContainText("transacción real");
});

test("mobile and desktop layouts, local images and screenshots", async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [360, 430, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await page.goto(`/${route}`);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${route} at ${width}`,
      ).toBeLessThanOrEqual(width);
      for (const image of await page.locator("img").all()) {
        await expect
          .poll(() => image.evaluate((el: HTMLImageElement) => el.naturalWidth))
          .toBeGreaterThan(0);
      }
      await page.screenshot({
        path: `test-results/screenshots/${route}-${width}.png`,
        fullPage: true,
      });
    }
  }
});

test("manifest, service worker and offline fallback", async ({
  page,
  context,
}) => {
  await page.goto("/bienvenida");
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.start_url).toBe("/bienvenida");
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons)
    expect((await page.request.get(icon.src)).ok()).toBeTruthy();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBeTruthy();
  await context.setOffline(true);
  await page.goto("/ruta-sin-cache");
  await expect(
    page.getByRole("heading", { name: "Una pequeña pausa." }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("history, constancy and rewards explain the person's own records", async ({
  page,
}) => {
  await page.goto("/registro");
  await page.getByLabel(/qué compraste/i).fill("Tacos con amigos");
  await page
    .getByLabel("Agregar foto de tu decisión")
    .setInputFiles("public/icons/icon-192.png");
  await page.getByLabel("Monto en pesos mexicanos").fill("120");
  await page.getByRole("radio", { name: /Alegría/ }).check();
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page).toHaveURL(/\/recompensa$/);

  // Demo mode keeps state in memory, so navigate with links (no reloads).
  await claimReward(page);
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await page.getByRole("link", { name: /Ver mi historial completo/ }).click();
  await expect(
    page.locator(".history-item").filter({ hasText: "Tacos con amigos" }),
  ).toContainText("$120.00");
  await page.getByRole("button", { name: "Guardé", exact: true }).click();
  await expect(
    page.locator(".history-item").filter({ hasText: "Tacos con amigos" }),
  ).toHaveCount(0);

  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Mi progreso" })
    .click();
  await page.getByRole("link", { name: /Ver mi constancia/ }).click();
  await page.getByRole("tab", { name: "Mes" }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  await page.getByRole("tab", { name: "Día" }).click();
  await expect(
    page.locator(".check-done").filter({ hasText: "Registrar una decisión" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Ver mis recompensas →" }).click();
  await expect(page.locator(".reward-claimed").first()).toBeVisible();
  await expect(page.getByText("Bono semanal · 3")).toBeVisible();
  await expect(page.getByText("¿Cómo se calculan?")).toBeVisible();
});

test("a record needs photo and amount, and can be in dollars", async ({
  page,
}) => {
  await page.goto("/registro");
  await page.getByLabel(/qué compraste/i).fill("Libro");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page).toHaveURL(/\/registro$/);
  await expect(page.getByText("Agrega una foto de tu compra")).toBeVisible();
  await expect(page.locator("#amount-error")).toContainText("cuánto gastaste");

  await page
    .getByLabel("Agregar foto de tu decisión")
    .setInputFiles("public/icons/icon-192.png");
  await page.getByRole("radio", { name: /USD/ }).check();
  await page.getByLabel("Monto en dólares estadounidenses").fill("12.5");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page).toHaveURL(/\/recompensa$/);

  // "Ahora no" keeps the reward pending: nothing is delivered without consent.
  await page.getByRole("button", { name: "Recibir mi recompensa" }).click();
  await page
    .getByRole("dialog", { name: "Confirma tu recompensa" })
    .getByRole("button", { name: "Ahora no" })
    .click();
  await expect(
    page.getByRole("button", { name: "Recibir mi recompensa" }),
  ).toBeEnabled();
  await claimReward(page);
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await page.getByRole("link", { name: /Ver mi historial completo/ }).click();
  await expect(
    page.locator(".history-item").filter({ hasText: "Libro" }),
  ).toContainText("$12.50 USD");
});

test("all registered amounts stay visible, and the balance is always at hand", async ({
  page,
}) => {
  await page.goto("/registro");
  await page.getByLabel(/qué compraste/i).fill("Gasolina");
  await page.getByLabel("Monto en pesos mexicanos").fill("500");
  // A reload (e.g. Android closing the page while the camera is open)
  // keeps what was already written.
  await page.reload();
  await expect(page.getByLabel(/qué compraste/i)).toHaveValue("Gasolina");
  await expect(page.getByLabel("Monto en pesos mexicanos")).toHaveValue("500");
  await page
    .getByLabel("Agregar foto de tu decisión")
    .setInputFiles("public/icons/icon-192.png");
  await page.getByRole("button", { name: "Guardar decisión" }).click();
  await expect(page).toHaveURL(/\/recompensa$/);
  await claimReward(page);
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await expect(page.locator(".amounts-summary")).toContainText("Gasolina");

  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Historial" })
    .click();
  const summary = page.locator(".amounts-summary");
  await expect(summary).toContainText("Total registrado");
  await expect(
    page.locator(".history-item").filter({ hasText: "Gasolina" }),
  ).toContainText("$500.00 MXN");
  await expect(page.locator(".balance-chip")).toContainText("créditos");
  await page.locator(".balance-chip").click();
  await expect(page).toHaveURL(/\/mis-recompensas$/);
});

test("the same purchase is kept in the history but rewarded only once", async ({
  page,
}) => {
  async function register() {
    await page.getByLabel(/qué compraste/i).fill("Café");
    await page
      .getByLabel("Agregar foto de tu decisión")
      .setInputFiles("public/icons/icon-192.png");
    await page.getByLabel("Monto en pesos mexicanos").fill("45");
    await page.getByRole("button", { name: "Guardar decisión" }).click();
  }
  await page.goto("/registro");
  await register();
  await expect(page).toHaveURL(/\/recompensa$/);
  // Demo mode keeps state in memory: move with links, never reload.
  await page.getByRole("link", { name: "Volver a mi progreso" }).click();
  await page
    .getByRole("navigation", { name: "Navegación principal" })
    .getByRole("link", { name: "Registro" })
    .click();
  await register();
  await expect(page).toHaveURL(/\/historial$/);
  await expect(
    page.locator(".history-item").filter({ hasText: "Sin recompensa" }),
  ).toContainText("Esta foto ya se usó");
});
