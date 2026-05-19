"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { salvarConfiguracoesBatchAction } from "@/lib/actions/configuracoes";

interface ParametroPadrao {
  chave: string;
  nome: string;
  valor: string;
}

interface ConfiguracaoItem {
  id: string;
  tenantId: string;
  chave: string;
  valor: string;
  tipo: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

interface Props {
  configuracoes: ConfiguracaoItem[];
  parametrosPadrao: ParametroPadrao[];
}

export function TabParametrosClient({ configuracoes, parametrosPadrao }: Props) {
  // Inicializa com valores do banco, com fallback nos defaults
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of parametrosPadrao) {
      const doDb = configuracoes.find((c) => c.chave === p.chave);
      init[p.chave] = doDb?.valor ?? p.valor;
    }
    return init;
  });

  const [isPending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState("");

  function handleSalvarTodos() {
    startTransition(async () => {
      const items = Object.entries(valores).map(([chave, valor]) => ({
        chave,
        valor,
      }));
      const res = await salvarConfiguracoesBatchAction(items);
      if (res.sucesso) {
        setMensagem("Parâmetros salvos com sucesso!");
        setTimeout(() => setMensagem(""), 3000);
      }
    });
  }

  return (
    <Card>
      <CardHeader title="Parâmetros do sistema" />
      <CardBody className="space-y-2.5">
        {mensagem && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
            {mensagem}
          </div>
        )}

        {parametrosPadrao.map((p) => (
          <div key={p.chave} className="flex items-center justify-between gap-4 text-sm">
            <span className="shrink-0 text-ink-500">{p.nome}</span>
            <input
              type="text"
              value={valores[p.chave] ?? ""}
              onChange={(e) => setValores((prev) => ({ ...prev, [p.chave]: e.target.value }))}
              className="min-w-0 flex-1 rounded-md border px-2 py-1 text-right text-sm bg-background font-medium text-ink-800"
            />
          </div>
        ))}

        <button
          onClick={handleSalvarTodos}
          disabled={isPending}
          className="mt-2 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Salvando..." : "Salvar parâmetros"}
        </button>
      </CardBody>
    </Card>
  );
}
