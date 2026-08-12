import { Signature } from "@/components/signature";

/**
 * Placeholder. The real home arrives with the Phase 0 tasks — see
 * docs/tasks/TASK-fase-0.md. The design system that used to live here moved to /sistema.
 */
export default function Home() {
  return (
    <>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <Signature variant="header" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-20">
        <h1 className="font-display text-3xl tracking-tight text-balance">
          Apartamentos da Cury no Rio, explicados por inteiro.
        </h1>
        <p className="max-w-prose text-ink-muted">
          O site está sendo construído. Enquanto isso, a conversa continua onde ela já
          acontece.
        </p>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Signature variant="footer" />
        </div>
      </footer>
    </>
  );
}
