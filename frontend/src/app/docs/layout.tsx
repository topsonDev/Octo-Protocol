import { DocsSidebar } from "@/components/docs/DocsSidebar";

export const metadata = { title: "Docs — Octo" };

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <DocsSidebar />
      <main className="flex-1 px-6 py-12 sm:px-12">
        <article className="mx-auto max-w-3xl">{children}</article>
      </main>
    </div>
  );
}
