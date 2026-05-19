"use client";

import { useActionState, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { notify } from "@/lib/notify";
import type { Resultado } from "@/lib/actions";

interface Almoxarifado {
  id: string;
  nome: string;
}

interface Material {
  id: string;
  codigo: string;
  descricao: string;
}

interface CentroCusto {
  id: string;
  nome: string;
}

type ActionFn = (prev: Resultado | undefined, fd: FormData) => Promise<Resultado>;

export function FormNovaSaida({
  almoxarifados,
  materiais,
  centrosCusto,
  action,
}: {
  almoxarifados: Almoxarifado[];
  materiais: Material[];
  centrosCusto: CentroCusto[];
  action: ActionFn;
}) {
  const [aberto, setAberto] = useState(false);

  const [estado, formAction, pending] = useActionState(
    async (prev: Resultado | undefined, fd: FormData) => {
      const resultado = await action(prev, fd);
      if (resultado.ok) {
        notify.fromResult(resultado, "Saída registrada com sucesso!");
        setAberto(false);
      } else {
        notify.fromResult(resultado);
      }
      return resultado;
    },
    undefined
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
      >
        + Nova saída
      </button>

      <Modal
        open={aberto}
        onOpenChange={setAberto}
        title="Registrar saída"
        description="Informe os dados da saída de material do estoque."
        size="lg"
        acao={
          <button
            type="submit"
            form="form-nova-saida"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Registrando…" : "Registrar saída"}
          </button>
        }
      >
        <form id="form-nova-saida" action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Almoxarifado *</label>
              <select
                name="almoxarifadoId"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione…</option>
                {almoxarifados.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
              {estado?.campos?.almoxarifadoId && (
                <p className="mt-1 text-xs text-rose-600">{estado.campos.almoxarifadoId}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Material *</label>
              <select
                name="materialId"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione…</option>
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.codigo} — {m.descricao}
                  </option>
                ))}
              </select>
              {estado?.campos?.materialId && (
                <p className="mt-1 text-xs text-rose-600">{estado.campos.materialId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Tipo *</label>
              <select
                name="tipo"
                required
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              >
                <option value="saida_consumo_imediato">Consumo imediato</option>
                <option value="saida_requisicao">Requisição</option>
                <option value="saida_baixa">Baixa</option>
                <option value="saida_ajuste">Ajuste</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Quantidade *</label>
              <input
                type="number"
                name="quantidade"
                min="0.0001"
                step="0.0001"
                required
                placeholder="0.0000"
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              />
              {estado?.campos?.quantidade && (
                <p className="mt-1 text-xs text-rose-600">{estado.campos.quantidade}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Data do movimento
              </label>
              <input
                type="date"
                name="dataMovimento"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
              />
            </div>

            {centrosCusto.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">
                  Centro de custo
                </label>
                <select
                  name="centroCustoId"
                  className="w-full h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-900 focus:border-brand-400 focus:outline-none"
                >
                  <option value="">Nenhum</option>
                  {centrosCusto.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs font-medium text-ink-700 mb-1">Observação</label>
              <textarea
                name="observacao"
                rows={2}
                placeholder="Observações sobre a saída…"
                className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-400 focus:outline-none resize-none"
              />
            </div>
          </div>

          {estado && !estado.ok && estado.erro && (
            <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {estado.erro}
            </p>
          )}
        </form>
      </Modal>
    </>
  );
}
