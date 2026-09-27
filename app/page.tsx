import { PageHeading } from "@/components/page-heading";
import { ReportingAuditSection } from "@/components/reporting-audit-section";
import { SiteNavbar } from "@/components/site-navbar";
import { heading, site } from "@/lib/content";

export default function Home() {
  return (
    <>
      <SiteNavbar brand={site.brand} search={site.search} avatar={site.avatar} menu={site.menu} />

      <main className="flex-1">
        <div className="mx-4 py-8 sm:py-10">
          <PageHeading title={heading.title} description={heading.description} />

          <ReportingAuditSection />
        </div>
      </main>
    </>
  );
}
