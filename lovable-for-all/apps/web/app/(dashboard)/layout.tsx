export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-3">
        <span className="font-semibold">Hatchery Studio</span>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
