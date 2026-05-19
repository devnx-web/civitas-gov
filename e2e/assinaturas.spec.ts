import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Assinaturas Digitais", () => {
  test("listagem de documentos assináveis", async ({ page }) => {
    await page.goto("/assinaturas");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("verificação pública — sem login", async ({ page }) => {
    await page.goto("/verificar-assinatura");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
