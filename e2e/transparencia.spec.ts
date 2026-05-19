import { test, expect } from "@playwright/test";

test.describe("Transparência Portal", () => {
  test("página pública — sem login", async ({ page }) => {
    await page.goto("/transparencia");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("execução mensal — dados reais", async ({ page }) => {
    await page.goto("/transparencia/execucao");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
