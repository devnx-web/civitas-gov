"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listarPlanosAction,
  novoPlano,
  novoItem,
  concluirItem,
  mudarStatusPlano,
} from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function ReversibilidadePage() {
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const p = await listarPlanosAction();
      setPlanos(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleNovoPlano(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await novoPlano({
      titulo: fd.get("titulo") as string,
      descricao: (fd.get("descricao") as string) || undefined,
      responsavel: (fd.get("responsavel") as string) || undefined,
      dataInicio: (fd.get("dataInicio") as string) || undefined,
      dataFimPrevista: (fd.get("dataFimPrevista") as string) || undefined,
    });
    if (res.sucesso) {
      setMensagem("✅ Plano de reversão criado!");
      carregar();
    }
  }

  async function handleNovoItem(planoId: string) {
    const tipo = prompt("Tipo (migracao_dados, devolucao_bens, rescisao_contrato, treinamento, transferencia_documentos, limpeza_ambiente):");
    if (!tipo) return;
    const descricao = prompt("Descrição do item:");
    if (!descricao) return;
    await novoItem(planoId, { tipo, descricao });
    setMensagem("✅ Item adicionado!");
    carregar();
  }

  async function handleConcluirItem(itemId: string) {
    await concluirItem(itemId);
    setMensagem("✅ Item concluído!");
    carregar();
  }

  async function handleMudarStatus(planoId: string, status: string) {
    await mudarStatusPlano(planoId, status);
    setMensagem("✅ Status atualizado!");
    carregar();
  }

  const statusCor: Record<string, string> = {
    planejamento: "bg-gray-100 text-gray-700",
    em_execucao: "bg-blue-100 text-blue-700",
    concluida: "bg-green-100 text-green-700",
    cancelada: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reversibilidade" subtitle="Planos de reversão e encerramento de contratos" />

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      <Card className="p-4">
        <h3 className="font-semibold mb-3">Novo Plano de Reversão</h3>
        <form onSubmit={handleNovoPlano} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input name="titulo" placeholder="Título do plano" className="rounded-md border px-3 py-2 text-sm bg-background" required />
          <input name="responsavel" placeholder="Responsável" className="rounded-md border px-3 py-2 text-sm bg-background" />
          <input name="dataInicio" type="date" className="rounded-md border px-3 py-2 text-sm bg-background" />
          <input name="dataFimPrevista" type="date" className="rounded-md border px-3 py-2 text-sm bg-background" />
          <input name="descricao" placeholder="Descrição" className="rounded-md border px-3 py-2 text-sm bg-background sm:col-span-2" />
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Criar Plano</button>
        </form>
      </Card>

      {loading ? <p>Carregando...</p> : (
        <div className="space-y-4">
          {planos.map((plano) => (
            <Card key={plano.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{plano.titulo}</h4>
                  <p className="text-sm text-muted-foreground">{plano.descricao}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCor[plano.status] ?? "bg-gray-100"}`}>{plano.status.replace(/_/g, " ")}</span>
                  <select onChange={(e) => handleMudarStatus(plano.id, e.target.value)} className="rounded-md border px-2 py-1 text-xs bg-background">
                    <option value="">Mudar status</option>
                    <option value="planejamento">Planejamento</option>
                    <option value="em_execucao">Em execução</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Itens do plano</p>
                  <button onClick={() => handleNovoItem(plano.id)} className="text-xs text-primary hover:underline">+ Adicionar item</button>
                </div>
                {plano.itens.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum item ainda.</p>
                ) : (
                  <ul className="space-y-1">
                    {plano.itens.map((item: any) => (
                      <li key={item.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={item.concluido} readOnly className="h-4 w-4" />
                          <span className={item.concluido ? "line-through text-muted-foreground" : ""}>{item.descricao}</span>
                          <span className="text-xs text-muted-foreground capitalize">({item.tipo.replace(/_/g, " ")})</span>
                        </div>
                        {!item.concluido && (
                          <button onClick={() => handleConcluirItem(item.id)} className="text-xs text-green-600 hover:underline">Concluir</button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
