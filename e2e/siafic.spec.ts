import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("SIAFIC", () => {
  test("painel orçamentário — abas principais", async ({ page }) => {
    await page.goto("/siafic");
    await expect(page.locator("h1, h2").first()).toBeVisible();
    await expect(page.locator("text=Resumo")).toBeVisible();
  });
});
