import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Fase 9 — LGPD / Reversibilidade / Help Desk", () => {
  test("LGPD — titulares e consentimentos", async ({ page }) => {
    await page.goto("/lgpd");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Reversibilidade — planos de reversão", async ({ page }) => {
    await page.goto("/reversibilidade");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("Help Desk — tickets", async ({ page }) => {
    await page.goto("/help-desk");
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });
});
