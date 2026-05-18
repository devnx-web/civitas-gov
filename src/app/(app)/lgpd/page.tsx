"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listarTitularesAction,
  novoTitular,
  registrarConsentimentoAction,
  revogarConsentimentoAction,
  listarRegistrosAction,
  anonimizarTitularAction,
} from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function LGPDPage() {
  const [aba, setAba] = useState<"titulares" | "consentimentos" | "registros">("titulares");
  const [titulares, setTitulares] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [t, r] = await Promise.all([listarTitularesAction(), listarRegistrosAction()]);
      setTitulares(t);
      setRegistros(r);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleNovoTitular(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await novoTitular({
      nome: fd.get("nome") as string,
      email: (fd.get("email") as string) || undefined,
      cpf: (fd.get("cpf") as string) || undefined,
      telefone: (fd.get("telefone") as string) || undefined,
    });
    if (res.sucesso) {
      setMensagem("✅ Titular cadastrado!");
      carregar();
    }
  }

  async function handleConsentimento(titularId: string) {
    const finalidade = prompt("Finalidade do tratamento:");
    if (!finalidade) return;
    const res = await registrarConsentimentoAction({
      titularId,
      finalidade,
      dadosTratados: "Dados pessoais cadastrais",
      baseLegal: "consentimento",
    });
    if (res.sucesso) {
      setMensagem("✅ Consentimento registrado!");
      carregar();
    }
  }

  async function handleAnonimizar(id: string) {
    if (!confirm("Anonimizar todos os dados deste titular? Esta ação não pode ser desfeita.")) return;
    await anonimizarTitularAction(id);
    setMensagem("✅ Titular anonimizado!");
    carregar();
  }

  return (
    <div className="space-y-6">
      <PageHeader title="LGPD" subtitle="Gestão de dados pessoais e privacidade" />

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      <div className="flex gap-2 border-b">
        {(["titulares", "consentimentos", "registros"] as const).map((a) => (
          <button key={a} onClick={() => setAba(a)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${aba === a ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
            {a === "titulares" && `Titulares (${titulares.length})`}
            {a === "consentimentos" && "Consentimentos"}
            {a === "registros" && `Registros (${registros.length})`}
          </button>
        ))}
      </div>

      {aba === "titulares" && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Novo Titular</h3>
            <form onSubmit={handleNovoTitular} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input name="nome" placeholder="Nome completo" className="rounded-md border px-3 py-2 text-sm bg-background" required />
              <input name="cpf" placeholder="CPF" className="rounded-md border px-3 py-2 text-sm bg-background" />
              <input name="email" placeholder="E-mail" className="rounded-md border px-3 py-2 text-sm bg-background" />
              <input name="telefone" placeholder="Telefone" className="rounded-md border px-3 py-2 text-sm bg-background" />
              <button type="submit" className="sm:col-span-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Cadastrar Titular</button>
            </form>
          </Card>

          {loading ? <p>Carregando...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted"><tr><th className="px-3 py-2 text-left">Nome</th><th className="px-3 py-2 text-left">CPF</th><th className="px-3 py-2 text-left">E-mail</th><th className="px-3 py-2 text-left">Consentimento</th><th className="px-3 py-2 text-right">Ações</th></tr></thead>
                <tbody>
                  {titulares.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="px-3 py-2">{t.nome}</td>
                      <td className="px-3 py-2">{t.cpf ?? "—"}</td>
                      <td className="px-3 py-2">{t.email ?? "—"}</td>
                      <td className="px-3 py-2">
                        {t.consentimentos[0]?.concedido ? <span className="text-green-600 text-xs">✅ Ativo</span> : <span className="text-red-600 text-xs">❌ Revogado</span>}
                      </td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <button onClick={() => handleConsentimento(t.id)} className="text-xs text-primary hover:underline">Consentimento</button>
                        <button onClick={() => handleAnonimizar(t.id)} className="text-xs text-red-600 hover:underline">Anonimizar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {aba === "registros" && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="px-3 py-2 text-left">Data</th><th className="px-3 py-2 text-left">Ação</th><th className="px-3 py-2 text-left">Entidade</th><th className="px-3 py-2 text-left">Dados Afetados</th><th className="px-3 py-2 text-left">Titular</th></tr></thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="px-3 py-2">{new Date(r.criadoEm).toLocaleString("pt-BR")}</td>
                  <td className="px-3 py-2 capitalize">{r.tipoAcao.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2">{r.entidade} ({r.entidadeId.slice(0, 8)}...)</td>
                  <td className="px-3 py-2">{r.dadosAfetados}</td>
                  <td className="px-3 py-2">{r.titular?.nome ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
