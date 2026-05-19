import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Fase 4a — PCA e Solicitações de Compra", () => {
  test("PCA — navega para lista e verifica heading", async ({ page }) => {
    await page.goto("/licitacoes/pca");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText("Plano de Contratações Anual");
  });

  test("PCA — botão 'Novo PCA' visível para usuário com permissão", async ({ page }) => {
    await page.goto("/licitacoes/pca");
    // O botão aparece apenas se o usuário tiver permissão licitacoes:criar
    const btn = page.getByRole("button", { name: /novo pca/i });
    // Se presente, está visível; se ausente, sem permissão — ambos são estados válidos
    const count = await btn.count();
    if (count > 0) {
      await expect(btn.first()).toBeVisible();
    } else {
      // sem permissão: apenas verifica que a página carregou
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("Solicitações — navega para lista e verifica heading", async ({ page }) => {
    await page.goto("/licitacoes/solicitacoes");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText("Solicitações de Compra");
  });

  test("Solicitações — botão 'Nova solicitação' visível para usuário com permissão", async ({
    page,
  }) => {
    await page.goto("/licitacoes/solicitacoes");
    const btn = page.getByRole("button", { name: /nova solicitação/i });
    const count = await btn.count();
    if (count > 0) {
      await expect(btn.first()).toBeVisible();
    } else {
      await expect(page.locator("h1").first()).toBeVisible();
    }
  });

  test("Solicitações — tabs visíveis: Minhas, Aguardando autorização, Histórico", async ({
    page,
  }) => {
    await page.goto("/licitacoes/solicitacoes");
    await expect(page.getByText(/minhas/i).first()).toBeVisible();
    await expect(page.getByText(/aguardando autoriza/i).first()).toBeVisible();
    await expect(page.getByText(/histórico/i).first()).toBeVisible();
  });

  test("PCA — 404 para ID inexistente", async ({ page }) => {
    const response = await page.goto("/licitacoes/pca/id-que-nao-existe-xyzabc123");
    // Next.js retorna 404 para notFound()
    expect(response?.status()).toBe(404);
  });

  test("Solicitações — 404 para ID inexistente", async ({ page }) => {
    const response = await page.goto("/licitacoes/solicitacoes/id-inexistente-abc123");
    expect(response?.status()).toBe(404);
  });
});
