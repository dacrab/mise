import { Link } from "@tanstack/react-router";

export interface DashboardTab {
  id: string;
  label: string;
}

export function DashboardTabs({ tabs, activeTab }: { tabs: DashboardTab[]; activeTab: string }) {
  return (
    <nav className="flex gap-6 mb-8" aria-label="Dashboard sections">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          to="/dashboard"
          search={{ tab: tab.id }}
          aria-current={activeTab === tab.id ? "page" : undefined}
          className={`text-sm font-medium pb-2 border-b-2 ${activeTab === tab.id ? "border-charcoal text-charcoal" : "border-transparent text-stone hover:text-charcoal-light"}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
