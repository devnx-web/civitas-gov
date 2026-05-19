import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Declaração de Acessibilidade",
  description:
    "Declaração de acessibilidade do Civitas Gov — conformidade com WCAG 2.1 AA e canais de reporte.",
};

export default function AcessibilidadePage() {
  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">
          Declaração de Acessibilidade
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Civitas Gov — Plataforma de Gestão Pública Integrada
        </p>
      </div>

      <section className="space-y-3 rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">
          Compromisso com a Acessibilidade
        </h2>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          A Civitas Tecnologia está comprometida em garantir que a plataforma{" "}
          <strong>Civitas Gov</strong> seja acessível a todas as pessoas, independentemente
          de suas capacidades ou tecnologias assistivas utilizadas.
        </p>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Esta plataforma foi desenvolvida para estar em conformidade com as{" "}
          <strong>
            Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1, nível AA
          </strong>
          , conforme estabelecido pelo World Wide Web Consortium (W3C) e em
          alinhamento com o{" "}
          <strong>Modelo de Acessibilidade em Governo Eletrônico (eMAG)</strong>.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">
          Medidas Técnicas Implementadas
        </h2>
        <ul className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>Link de pular conteúdo</strong> — disponível no topo de cada página
              para usuários de leitores de tela e navegação por teclado.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>Atributo lang no HTML</strong> — definido como{" "}
              <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">pt-BR</code>{" "}
              para identificação correta do idioma por tecnologias assistivas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>Roles ARIA em tabelas</strong> — atributos{" "}
              <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">role=&quot;table&quot;</code>{" "}
              e{" "}
              <code className="rounded bg-ink-100 px-1 dark:bg-ink-800">scope=&quot;col&quot;</code>{" "}
              nos cabeçalhos para navegação estruturada.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>aria-disabled em botões</strong> — estados desabilitados comunicados
              corretamente a tecnologias assistivas.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>Contraste de cores</strong> — proporção mínima de 4,5:1 para texto
              normal e 3:1 para texto grande.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-emerald-100 text-center text-[10px] font-bold leading-4 text-emerald-600">
              ✓
            </span>
            <span>
              <strong>Suporte a tema escuro</strong> — modo escuro disponível para
              redução de fadiga visual.
            </span>
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">
          Limitações Conhecidas
        </h2>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Embora busquemos conformidade plena com WCAG 2.1 AA, algumas áreas estão em
          processo de melhoria contínua:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600 dark:text-ink-400">
          <li>Gráficos e visualizações de dados — alternativas textuais em desenvolvimento.</li>
          <li>Arquivos PDF — versões acessíveis serão disponibilizadas progressivamente.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-6 dark:border-brand-900 dark:bg-brand-900/10">
        <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">
          Canal de Reporte de Barreiras
        </h2>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Encontrou alguma barreira de acessibilidade? Informe-nos. Nos comprometemos a
          responder em até <strong>5 dias úteis</strong>.
        </p>
        <div className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
          <p>
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:acessibilidade@civitas.gov.br"
              className="text-brand-600 underline hover:text-brand-700 dark:text-brand-400"
            >
              acessibilidade@civitas.gov.br
            </a>
          </p>
          <p>
            <strong>Prazo de resposta:</strong> até 5 dias úteis
          </p>
          <p>
            <strong>Horário de atendimento:</strong> Segunda a Sexta, 08h00–17h00 (BRT)
          </p>
        </div>
        <p className="text-xs text-ink-400 dark:text-ink-500">
          Em conformidade com a{" "}
          <a
            href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Lei Brasileira de Inclusão (LBI — Lei nº 13.146/2015)
          </a>{" "}
          e o Decreto nº 5.296/2004.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-ink-200 bg-white p-6 dark:border-ink-800 dark:bg-ink-950">
        <h2 className="text-base font-semibold text-ink-800 dark:text-ink-100">
          Data desta Declaração
        </h2>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          Esta declaração foi elaborada em <strong>19 de maio de 2026</strong> e será
          revisada anualmente ou sempre que houver alterações significativas na plataforma.
        </p>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          <strong>Padrão adotado:</strong> WCAG 2.1, Nível AA
        </p>
        <p className="text-sm text-ink-600 dark:text-ink-400">
          <strong>Referência nacional:</strong> eMAG 3.1 — Modelo de Acessibilidade em
          Governo Eletrônico
        </p>
      </section>
    </main>
  );
}
