import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Dashboard", () => {
  test("deve exibir KPIs reais do banco", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Bem-vindo");
    await expect(page.locator("text=Contratos vigentes")).toBeVisible();
    await expect(page.locator("text=Valor em estoque")).toBeVisible();
    await expect(page.locator("text=Patrimônio (valor atual)")).toBeVisible();
  });

  test("deve exibir contratos em acompanhamento", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("text=Contratos em acompanhamento")).toBeVisible();
  });
});
