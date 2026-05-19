import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Almoxarifado — Movimentações (smoke)", () => {
  test("entradas — deve exibir heading visível", async ({ page }) => {
    await page.goto("/almoxarifado/entradas");
    // Aguarda o heading do PageHeader ou CardHeader
    await expect(page.getByRole("heading", { name: /entradas/i }).first()).toBeVisible();
  });

  test("saidas — deve exibir heading visível", async ({ page }) => {
    await page.goto("/almoxarifado/saidas");
    await expect(page.getByRole("heading", { name: /saídas/i }).first()).toBeVisible();
  });

  test("requisicoes — deve exibir heading visível", async ({ page }) => {
    await page.goto("/almoxarifado/requisicoes");
    await expect(page.getByRole("heading", { name: /requisições/i }).first()).toBeVisible();
  });

  test("entradas — deve exibir botão de filtrar", async ({ page }) => {
    await page.goto("/almoxarifado/entradas");
    await expect(page.getByRole("button", { name: /filtrar/i })).toBeVisible();
  });

  test("saidas — deve exibir botão de filtrar", async ({ page }) => {
    await page.goto("/almoxarifado/saidas");
    await expect(page.getByRole("button", { name: /filtrar/i })).toBeVisible();
  });

  test("requisicoes — deve exibir abas Minhas e A atender", async ({ page }) => {
    await page.goto("/almoxarifado/requisicoes");
    await expect(page.getByRole("tab", { name: /minhas/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /atender/i })).toBeVisible();
  });
});
