"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listarPublicacoes,
  listarProcessosPendentes,
  listarContratosPendentes,
  enviarProcessoPNCP,
  enviarContratoPNCP,
  obterConfig,
  salvarConfig,
} from "./actions";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { BASE_URL_HOMOLOGACAO, BASE_URL_PRODUCAO } from "@/lib/pncp/pncp-client";
import type { ConfigPNCP } from "@/lib/pncp/pncp-service";

export default function PNCPPage() {
  const [aba, setAba] = useState<"config" | "processos" | "contratos" | "historico">("config");
  const [config, setConfig] = useState<ConfigPNCP | null>(null);
  const [publicacoes, setPublicacoes] = useState<any[]>([]);
  const [processos, setProcessos] = useState<any[]>([]);
  const [contratos, setContratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [cfg, pub, proc, cont] = await Promise.all([
        obterConfig(),
        listarPublicacoes(),
        listarProcessosPendentes(),
        listarContratosPendentes(),
      ]);
      setConfig(cfg);
      setPublicacoes(pub);
      setProcessos(proc);
      setContratos(cont);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSalvarConfig(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ambiente = fd.get("ambiente") as string;
    const novaConfig: ConfigPNCP = {
      baseUrl: ambiente === "producao" ? BASE_URL_PRODUCAO : BASE_URL_HOMOLOGACAO,
      usuario: fd.get("usuario") as string,
      senha: fd.get("senha") as string,
      cnpjOrgao: fd.get("cnpjOrgao") as string,
      codigoUnidade: fd.get("codigoUnidade") as string,
    };
    const res = await salvarConfig(novaConfig);
    if (res.sucesso) {
      setMensagem("✅ Configuração salva com sucesso!");
      setConfig(novaConfig);
    } else {
      setMensagem("❌ Erro ao salvar configuração.");
    }
  }

  async function enviarProcesso(id: string) {
    setMensagem("Enviando processo...");
    const res = await enviarProcessoPNCP(id);
    if (res.sucesso) {
      setMensagem(`✅ Processo publicado! Controle: ${res.numeroControle}`);
      carregar();
    } else {
      setMensagem(`❌ Erro: ${res.erro}`);
    }
  }

  async function enviarContrato(id: string) {
    setMensagem("Enviando contrato...");
    const res = await enviarContratoPNCP(id);
    if (res.sucesso) {
      setMensagem(`✅ Contrato publicado! Controle: ${res.numeroControle}`);
      carregar();
    } else {
      setMensagem(`❌ Erro: ${res.erro}`);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader titulo="Integração PNCP" descricao="Portal Nacional de Contratações Públicas" />

      {mensagem && <div className="rounded-lg border bg-muted px-4 py-3 text-sm">{mensagem}</div>}

      <div className="flex gap-2 border-b">
        {(["config", "processos", "contratos", "historico"] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAba(a)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === a
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {a === "config" && "Configuração"}
            {a === "processos" && `Processos Pendentes (${processos.length})`}
            {a === "contratos" && `Contratos Pendentes (${contratos.length})`}
            {a === "historico" && `Histórico (${publicacoes.length})`}
          </button>
        ))}
      </div>

      {aba === "config" && (
        <Card className="p-6 max-w-xl">
          <h3 className="text-lg font-semibold mb-4">Credenciais PNCP</h3>
          <form onSubmit={handleSalvarConfig} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ambiente</label>
              <select
                name="ambiente"
                defaultValue={config?.baseUrl === BASE_URL_PRODUCAO ? "producao" : "homologacao"}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              >
                <option value="homologacao">Homologação (treina.pncp.gov.br)</option>
                <option value="producao">Produção (pncp.gov.br)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ do Órgão</label>
              <input
                name="cnpjOrgao"
                defaultValue={config?.cnpjOrgao ?? ""}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Código da Unidade Administrativa
              </label>
              <input
                name="codigoUnidade"
                defaultValue={config?.codigoUnidade ?? ""}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                placeholder="Ex: 120001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usuário PNCP</label>
              <input
                name="usuario"
                defaultValue={config?.usuario ?? ""}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Senha PNCP</label>
              <input
                name="senha"
                type="password"
                defaultValue={config?.senha ?? ""}
                className="w-full rounded-md border px-3 py-2 text-sm bg-background"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Salvar Configuração
            </button>
          </form>
        </Card>
      )}

      {aba === "processos" && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : processos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum processo pendente de publicação.</p>
          ) : (
            processos.map((p) => (
              <Card key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {p.numero}/{p.ano}
                  </p>
                  <p className="text-sm text-muted-foreground">{p.objeto}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {p.modalidade.replace(/_/g, " ")} • {p.itens.length} itens
                  </p>
                </div>
                <button
                  onClick={() => enviarProcesso(p.id)}
                  disabled={!config}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Publicar no PNCP
                </button>
              </Card>
            ))
          )}
        </div>
      )}

      {aba === "contratos" && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : contratos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum contrato pendente de publicação.</p>
          ) : (
            contratos.map((c) => (
              <Card key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {c.numero}/{c.ano}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.objeto}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.fornecedor?.nome} • R${" "}
                    {Number(c.valorOriginal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => enviarContrato(c.id)}
                  disabled={!config}
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Publicar no PNCP
                </button>
              </Card>
            ))
          )}
        </div>
      )}

      {aba === "historico" && (
        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : publicacoes.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma publicação realizada ainda.</p>
          ) : (
            publicacoes.map((pub) => (
              <Card key={pub.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize mr-2"
                      style={{
                        backgroundColor:
                          pub.status === "publicado"
                            ? "#dcfce7"
                            : pub.status === "erro"
                              ? "#fee2e2"
                              : "#f3f4f6",
                        color:
                          pub.status === "publicado"
                            ? "#166534"
                            : pub.status === "erro"
                              ? "#991b1b"
                              : "#374151",
                      }}
                    >
                      {pub.status}
                    </span>
                    <span className="text-sm font-medium">
                      {pub.tipo === "contratacao" ? "Contratação" : "Contrato"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pub.enviadoEm ? new Date(pub.enviadoEm).toLocaleString("pt-BR") : "—"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pub.processo?.numero && `${pub.processo.numero}/${pub.processo.ano} — `}
                  {pub.contrato?.numero && `${pub.contrato.numero}/${pub.contrato.ano} — `}
                  {pub.numeroControlePNCP
                    ? `Controle PNCP: ${pub.numeroControlePNCP}`
                    : "Sem controle"}
                </p>
                {pub.erroMensagem && (
                  <p className="text-xs text-red-600 mt-1">{pub.erroMensagem}</p>
                )}
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
