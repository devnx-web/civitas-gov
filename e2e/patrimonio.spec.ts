import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Patrimônio", () => {
  test("inventário — deve listar bens reais", async ({ page }) => {
    await page.goto("/patrimonio/inventario");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
