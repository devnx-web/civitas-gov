"use client";

import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

export interface ItemImportacao {
  linha: number;
  sucesso: boolean;
  mensagem?: string;
  dados?: Record<string, unknown>;
}

interface RelatorioImportacaoProps {
  itens: ItemImportacao[];
}

export function RelatorioImportacao({ itens }: RelatorioImportacaoProps) {
  const sucessos = itens.filter((i) => i.sucesso).length;
  const erros = itens.filter((i) => !i.sucesso).length;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Badge tone="sucesso">{sucessos} sucessos</Badge>
        {erros > 0 && <Badge tone="perigo">{erros} erros</Badge>}
      </div>
      {erros > 0 && (
        <div className="max-h-80 overflow-auto rounded-lg border border-ink-200">
          <Table>
            <THead>
              <TR>
                <TH className="w-16">Linha</TH>
                <TH>Status</TH>
                <TH>Mensagem</TH>
              </TR>
            </THead>
            <TBody>
              {itens.map((item, idx) => (
                <TR key={idx}>
                  <TD className="text-ink-600">{item.linha}</TD>
                  <TD>{item.sucesso ? <Badge tone="sucesso">Sucesso</Badge> : <Badge tone="perigo">Erro</Badge>}</TD>
                  <TD className={!item.sucesso ? "text-red-700" : "text-ink-600"}>{item.mensagem ?? "—"}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </div>
  );
}
