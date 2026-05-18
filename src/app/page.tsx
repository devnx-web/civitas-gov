import { redirect } from "next/navigation";

/** Ponto de entrada — encaminha para o painel (protegido pelo middleware). */
export default function Home() {
  redirect("/dashboard");
}
