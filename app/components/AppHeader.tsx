"use client";

import { useRef } from "react";

interface AppHeaderProps {
  readonly missionNumber: number | null;
  readonly onOpenUpdates: (button: HTMLButtonElement) => void;
  readonly onOpenReset: (button: HTMLButtonElement) => void;
}

export function AppHeader({ missionNumber, onOpenUpdates, onOpenReset }: AppHeaderProps) {
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
        {missionNumber !== null && <span className="mission-progress" aria-label={`현재 미션 ${missionNumber}, 전체 9개`}><b aria-hidden="true">⭐</b> {missionNumber} / 9</span>}
        <button ref={updatesRef} className="small-button" type="button" onClick={() => updatesRef.current && onOpenUpdates(updatesRef.current)}>
          <span aria-hidden="true">📝</span> 업데이트 내역
        </button>
        <button ref={resetRef} className="small-button ghost" type="button" onClick={() => resetRef.current && onOpenReset(resetRef.current)}>
          <span aria-hidden="true">🏠</span> 처음으로
        </button>
      </div>
    </header>
  );
}
