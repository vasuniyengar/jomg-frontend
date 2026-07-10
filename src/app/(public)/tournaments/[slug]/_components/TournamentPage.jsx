"use client";

import { useEffect, useState } from "react";
import TopChrome from "./TopChrome";
import TournamentBanner from "./TournamentBanner";
import InfoBar from "./InfoBar";
import TabNav from "./TabNav";
import DetailsTab from "./tabs/DetailsTab";
import FormatTab from "./tabs/FormatTab";
import PointsAdvanceTab from "./tabs/PointsAdvanceTab";
import DivisionsTab from "./tabs/DivisionsTab";
import SponsorsTab from "./tabs/SponsorsTab";
import RefundTab from "./tabs/RefundTab";
import LivePlayTab from "./tabs/LivePlayTab";
import ScrollToTopButton from "./ScrollToTopButton";

const DESKTOP_ONLY_TABS = new Set(["sponsors", "refund"]);
const MOBILE_QUERY = "(max-width: 760px)";

export default function TournamentPage({ data, slug, preview = false }) {
  const [activeTab, setActiveTab] = useState("details");
  const livePlayEnabled = data.tabs.livePlay.enabled;

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const syncTabForViewport = () => {
      if (media.matches && DESKTOP_ONLY_TABS.has(activeTab)) {
        setActiveTab("details");
      }
    };

    syncTabForViewport();
    media.addEventListener("change", syncTabForViewport);
    return () => media.removeEventListener("change", syncTabForViewport);
  }, [activeTab]);

  return (
    <>
      <TopChrome
        brandTitle={data.brandTitle}
        brandSubtitle={data.brandSubtitle}
        brandLogoUrl={data.brandLogoUrl}
      />
      <div className="wrap">
        {preview ? (
          <div className="live-banner" style={{ marginTop: 12 }}>
            <span className="live-banner-t">
              Draft preview — this page is visible to organizers only until the tournament is published.
            </span>
          </div>
        ) : null}
        <TournamentBanner bannerUrl={data.bannerUrl} />
        <InfoBar items={data.infoBar} />

        <section className="sec" style={{ paddingTop: 20 }}>
          <TabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            livePlayEnabled={livePlayEnabled}
          />

          {activeTab === "details" ? (
            <DetailsTab
              data={data.tabs}
              venue={data.venue}
              organizer={data.organizer}
            />
          ) : null}
          {activeTab === "format" ? (
            <FormatTab data={data.tabs.format} />
          ) : null}
          {activeTab === "pointsAdvance" ? (
            <PointsAdvanceTab data={data.tabs.pointsAdvance} />
          ) : null}
          {activeTab === "divisions" ? (
            <DivisionsTab data={data.tabs.divisions} slug={slug} preview={preview} />
          ) : null}
          {activeTab === "sponsors" ? (
            <SponsorsTab data={data.tabs.sponsors} />
          ) : null}
          {activeTab === "refund" ? (
            <RefundTab data={data.tabs.refund} />
          ) : null}
          {activeTab === "livePlay" && livePlayEnabled ? (
            <LivePlayTab data={data.tabs.livePlay} />
          ) : null}
        </section>
      </div>
      <ScrollToTopButton />
    </>
  );
}
