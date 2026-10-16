import { ArrowLeft, Leaf } from "lucide-react";
import { ButtonLink } from "@/components/ui/primitives";
export default function NotFound() {
  return (
    <main id="contenido" className="not-found">
      <span className="brand-mark">
        <Leaf size={30} />
      </span>
      <span className="eyebrow">UN PEQUEÑO DESVÍO</span>
      <h1>Volvamos a tu camino.</h1>
      <p>Esta página no está aquí, pero tu próximo paso sí.</p>
      <ButtonLink href="/inicio">
        <ArrowLeft size={18} />
        Volver al inicio
      </ButtonLink>
    </main>
  );
}
