import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Almoxarifado", () => {
  test("estoque — deve exibir posição real", async ({ page }) => {
    await page.goto("/almoxarifado/estoque");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
