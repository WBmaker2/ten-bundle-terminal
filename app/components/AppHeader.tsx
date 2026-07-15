"use client";

import { useRef } from "react";
import { MissionProgress } from "./MissionProgress";

interface AppHeaderProps {
  readonly currentMission: number | null;
  readonly completedCount: number;
  readonly totalMissions: number;
  readonly hasProgress: boolean;
  readonly onOpenUpdates: (button: HTMLButtonElement) => void;
  readonly onOpenReset: (button: HTMLButtonElement) => void;
}

export function AppHeader({ currentMission, completedCount, totalMissions, hasProgress, onOpenUpdates, onOpenReset }: AppHeaderProps) {
  const updatesRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="app-header">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true"><span>10</span><b>★</b></span>
        <div>
          <p className="eyebrow">수학 배송 학습소</p>
          <p className="brand-name">십 묶음 택배 터미널</p>
        </div>
      </div>
      <div className="header-actions">
        {hasProgress && (
          <MissionProgress completedCount={completedCount} currentMission={currentMission} total={totalMissions} />
        )}
        <button ref={updatesRef} className="small-button" type="button" onClick={() => updatesRef.current && onOpenUpdates(updatesRef.current)}>
          <span aria-hidden="true">📝</span> 업데이트 내역
        </button>
        {hasProgress && (
          <button ref={resetRef} className="small-button ghost" type="button" onClick={() => resetRef.current && onOpenReset(resetRef.current)}>
            <span aria-hidden="true">🏠</span> 처음으로
          </button>
        )}
      </div>
    </header>
  );
}
