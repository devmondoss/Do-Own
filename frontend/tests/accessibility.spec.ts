import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("nine screens have no detected WCAG A/AA violations on mobile and desktop", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [393, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "bienvenida",
      "cuenta",
      "reflexion",
      "inicio",
      "progreso",
      "aprender",
      "registro",
      "recompensa",
      "comprobante",
    ]) {
      await page.goto(`/${route}`);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        results.violations,
        `${route} at ${width}px: ${JSON.stringify(results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })) })))}`,
      ).toEqual([]);
    }
  }
});
