import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";

/** Layout das rotas autenticadas. Garante sessão e monta a casca da aplicação. */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { name, email, role, cargo } = session.user;

  return (
    <AppShell
      usuario={{
        nome: name ?? "Usuário",
        email: email ?? "",
        role: role ?? "operador",
        cargo: cargo ?? "",
      }}
    >
      {children}
    </AppShell>
  );
}
