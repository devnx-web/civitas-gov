import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("TCE-ES — Prestação de Contas", () => {
  test("página principal — heading visível", async ({ page }) => {
    await page.goto("/tce-es");
    await expect(page.locator("h1")).toContainText("TCE-ES");
  });

  test("9 cards de geração presentes (4 inventários + 5 tabelas)", async ({ page }) => {
    await page.goto("/tce-es");

    // 4 cards de inventário
    await expect(page.getByTestId("card-INVIMO")).toBeVisible();
    await expect(page.getByTestId("card-INVMOV")).toBeVisible();
    await expect(page.getByTestId("card-INVINT")).toBeVisible();
    await expect(page.getByTestId("card-INVALM")).toBeVisible();

    // 5 cards de tabela
    await expect(page.getByTestId("card-tabela-14")).toBeVisible();
    await expect(page.getByTestId("card-tabela-15")).toBeVisible();
    await expect(page.getByTestId("card-tabela-16")).toBeVisible();
    await expect(page.getByTestId("card-tabela-17")).toBeVisible();
    await expect(page.getByTestId("card-tabela-39")).toBeVisible();
  });

  test("seletor de ano presente e funcional", async ({ page }) => {
    await page.goto("/tce-es");
    const input = page.locator("#ano-tce-es");
    await expect(input).toBeVisible();
    await input.fill("2025");
    await expect(input).toHaveValue("2025");
  });
});
