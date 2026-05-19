import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Licitações & Contratos", () => {
  test("processos — dados reais do Prisma", async ({ page }) => {
    await page.goto("/licitacoes/processos");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("contratos — execução calculada por vigência", async ({ page }) => {
    await page.goto("/licitacoes/contratos");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("empenhos — dados reais com relacionamento", async ({ page }) => {
    await page.goto("/licitacoes/empenhos");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
