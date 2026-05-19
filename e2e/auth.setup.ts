import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");
  // Limpa e preenche campos com select all + type
  const email = page.locator('input[type="email"]');
  await email.focus();
  await email.fill("");
  await email.fill("admin@civitas.gov.br");

  const password = page.locator('input[type="password"]');
  await password.focus();
  await password.fill("");
  await password.fill("civitas123");

  await page.locator('button[type="submit"]').click();
  await page.waitForURL("/dashboard", { timeout: 15000 });
  await expect(page.locator("text=Bem-vindo")).toBeVisible();
  await page.context().storageState({ path: authFile });
});
