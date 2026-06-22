import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { OfflineBanner } from "@/components/shared/offline-banner";

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner />
        <Breadcrumbs />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
