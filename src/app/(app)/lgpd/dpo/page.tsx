"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { salvarDpoAction } from "./actions";

type DPO = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  empresa: string | null;
  criadoEm: string;
  atualizadoEm: string;
};

async function carregarDpo(): Promise<DPO | null> {
  const res = await fetch("/api/lgpd/dpo");
  if (!res.ok) return null;
  return res.json();
}

export default function DpoPage() {
  const [dpo, setDpo] = useState<DPO | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    const d = await carregarDpo();
    setDpo(d);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await salvarDpoAction(undefined, fd);
    if (res.ok) {
      setMensagem("Encarregado de Dados (DPO) cadastrado/atualizado com sucesso.");
      setEditando(false);
      carregar();
    } else {
      setMensagem(res.erro ?? "Erro ao salvar DPO.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Encarregado de Dados (DPO)"
        descricao="Designação do responsável pelo tratamento de dados pessoais — Art. 41 LGPD"
      />

      <Link href="/lgpd" className="text-sm text-muted-foreground hover:text-foreground">
        ← Voltar para LGPD
      </Link>

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          {dpo && !editando ? (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Encarregado Cadastrado</h3>
                <button
                  onClick={() => setEditando(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Editar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{dpo.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{dpo.email}</p>
                </div>
                {dpo.telefone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{dpo.telefone}</p>
                  </div>
                )}
                {dpo.empresa && (
                  <div>
                    <p className="text-xs text-muted-foreground">Empresa/Organização</p>
                    <p className="font-medium">{dpo.empresa}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Designado em</p>
                  <p className="font-medium">
                    {new Date(dpo.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Última atualização</p>
                  <p className="font-medium">
                    {new Date(dpo.atualizadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <h3 className="font-semibold mb-4">
                {dpo ? "Atualizar Encarregado de Dados" : "Designar Encarregado de Dados"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nome completo *</label>
                    <input
                      name="nome"
                      defaultValue={dpo?.nome ?? ""}
                      placeholder="Ex: Maria da Silva"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">E-mail *</label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={dpo?.email ?? ""}
                      placeholder="dpo@organizacao.gov.br"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Telefone</label>
                    <input
                      name="telefone"
                      defaultValue={dpo?.telefone ?? ""}
                      placeholder="(27) 99999-0000"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Empresa/Organização</label>
                    <input
                      name="empresa"
                      defaultValue={dpo?.empresa ?? ""}
                      placeholder="Ex: Consultoria XYZ Ltda (se terceirizado)"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    {dpo ? "Atualizar" : "Designar"} Encarregado
                  </button>
                  {dpo && (
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </Card>
          )}

          <Card className="p-4 bg-muted/40">
            <h4 className="text-sm font-semibold mb-2">Sobre o Encarregado de Dados (DPO)</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Obrigatório por força do Art. 41 da Lei nº 13.709/2018 (LGPD)</li>
              <li>Aceitar reclamações e comunicações dos titulares</li>
              <li>Prestar esclarecimentos e adotar providências</li>
              <li>Orientar funcionários sobre boas práticas de proteção de dados</li>
              <li>Interagir com a Autoridade Nacional de Proteção de Dados (ANPD)</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
