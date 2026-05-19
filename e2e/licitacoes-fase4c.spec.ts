import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Fase 4C — Garantias, Cláusulas-modelo, Cronograma, Restos a pagar", () => {
  test("garantias — página lista carrega", async ({ page }) => {
    await page.goto("/licitacoes/garantias");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText("Garantias contratuais")).toBeVisible();
  });

  test("clausulas-modelo — página lista carrega", async ({ page }) => {
    await page.goto("/licitacoes/clausulas");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText("Cláusulas-modelo")).toBeVisible();
  });

  test("restos-pagar — página lista carrega com filtro de exercício", async ({ page }) => {
    await page.goto("/licitacoes/restos-pagar");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.getByText("Restos a pagar")).toBeVisible();
  });

  test("garantias — botão nova garantia abre modal", async ({ page }) => {
    await page.goto("/licitacoes/garantias");
    const btn = page.getByRole("button", { name: /nova garantia/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByText("Nova garantia contratual")).toBeVisible();
  });

  test("clausulas — botão nova cláusula abre modal", async ({ page }) => {
    await page.goto("/licitacoes/clausulas");
    const btn = page.getByRole("button", { name: /nova cláusula/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByText("Nova cláusula-modelo")).toBeVisible();
  });

  test("restos-pagar — botão inscrever abre modal", async ({ page }) => {
    await page.goto("/licitacoes/restos-pagar");
    const btn = page.getByRole("button", { name: /inscrever/i });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(page.getByText("Inscrever em restos a pagar")).toBeVisible();
  });
});
