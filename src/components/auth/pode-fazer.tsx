"use client";

/**
 * Renderiza `children` apenas se `pode` for verdadeiro.
 * A verificação de permissão ocorre no Server Component pai via
 * `checarPermissao(escopo, operacao)` — o resultado é passado como prop.
 *
 * @example
 *   // No servidor:
 *   const podeExcluir = await checarPermissao("contratos", "excluir");
 *
 *   // No JSX (pode ser server ou client component):
 *   <PodeFazer pode={podeExcluir}>
 *     <button>Excluir contrato</button>
 *   </PodeFazer>
 */
export function PodeFazer({
  pode,
  children,
  fallback = null,
}: {
  pode: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (!pode) return <>{fallback}</>;
  return <>{children}</>;
}
