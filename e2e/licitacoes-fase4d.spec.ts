import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Fase 4d — Convênios, Fiscalização e Sanções", () => {
  test("convênios — lista carrega com tabs de tipo", async ({ page }) => {
    await page.goto("/licitacoes/convenios");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    // Tabs devem estar presentes
    await expect(page.getByText("Concedidos")).toBeVisible();
    await expect(page.getByText("Recebidos")).toBeVisible();
  });

  test("fiscalização — painel do fiscal carrega com KPIs", async ({ page }) => {
    await page.goto("/licitacoes/fiscalizacao");
    await expect(page.locator("h1").first()).toBeVisible();
    // Deve mostrar "Painel do Fiscal"
    await expect(page.getByText(/Painel do Fiscal/i)).toBeVisible();
  });

  test("fiscalização — lista de designações acessível", async ({ page }) => {
    await page.goto("/licitacoes/fiscalizacao/designacoes");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("fiscalização — lista de ocorrências acessível", async ({ page }) => {
    await page.goto("/licitacoes/fiscalizacao/ocorrencias");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("fiscalização — lista de medições acessível", async ({ page }) => {
    await page.goto("/licitacoes/fiscalizacao/medicoes");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("sanções — lista carrega com tabela de penalidades", async ({ page }) => {
    await page.goto("/licitacoes/sancoes");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText(/Sanções/i).first()).toBeVisible();
  });
});
