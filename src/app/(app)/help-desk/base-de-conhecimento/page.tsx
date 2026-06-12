import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion, ArrowLeft, BookOpen, Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition, FadeIn } from "@/components/motion";
import { listarArtigosAction } from "../actions";

export const metadata: Metadata = { title: "Base de Conhecimento" };

export default async function BaseDeConhecimentoPage() {
  const artigos = await listarArtigosAction();

  return (
    <PageTransition>
      <PageHeader
        titulo="Base de Conhecimento"
        descricao="Artigos, tutoriais e respostas para dúvidas frequentes."
        acao={
          <Link href="/help-desk">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos tickets
            </Button>
          </Link>
        }
      />

      <div className="mt-6 space-y-4">
        {artigos.length === 0 ? (
          <FadeIn>
            <Card>
              <CardBody className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-10 w-10 text-ink-300" />
                <p className="mt-3 text-sm font-medium text-ink-700">Nenhum artigo cadastrado</p>
                <p className="mt-1 text-xs text-ink-400">
                  A base de conhecimento está vazia no momento.
                </p>
              </CardBody>
            </Card>
          </FadeIn>
        ) : (
          artigos.map((a, i) => (
            <FadeIn key={a.id} delay={i * 0.03}>
              <Card className="group transition-shadow hover:shadow-md">
                <CardBody>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileQuestion className="h-4 w-4 text-brand-500" />
                        <h4 className="font-semibold text-ink-900 group-hover:text-brand-600 transition-colors">
                          {a.titulo}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge tone="info" className="text-[10px]">
                          {a.categoria}
                        </Badge>
                        <span className="text-[11px] text-ink-400 flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {a.visualizacoes} visualizações
                        </span>
                      </div>
                      <p className="text-sm text-ink-500 line-clamp-2">{a.conteudo}</p>
                      {a.tags && a.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {a.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] text-ink-500"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </FadeIn>
          ))
        )}
      </div>
    </PageTransition>
  );
}
