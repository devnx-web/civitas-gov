import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Cadastros", () => {
  test("fornecedores — listagem", async ({ page }) => {
    await page.goto("/fornecedores/cadastro");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("materiais — listagem", async ({ page }) => {
    await page.goto("/materiais");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
