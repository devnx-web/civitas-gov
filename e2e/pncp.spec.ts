import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("PNCP", () => {
  test("painel de integração", async ({ page }) => {
    await page.goto("/pncp");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
