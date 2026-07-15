interface MissionProgressProps {
  readonly completedCount: number;
  readonly currentMission: number | null;
  readonly total: number;
}

export function MissionProgress({ completedCount, currentMission, total }: MissionProgressProps) {
  const remainingCount = Math.max(0, total - Math.max(completedCount, currentMission ?? 0));
  const allComplete = completedCount === total;
  const label = allComplete
    ? `전체 ${total}개 미션 완료`
    : currentMission === null
      ? `짧은 연습 중, 이후 전체 ${total}개 미션 시작`
    : `전체 ${total}개 미션 중 ${completedCount}개 완료, 현재 ${currentMission}번째 미션, ${remainingCount}개 남음`;

  return (
    <div
      className="mission-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={completedCount}
    >
      <span className="progress-copy">
        {allComplete
          ? <><strong>{completedCount}개 완료</strong><small>모든 배송을 마쳤어요</small></>
          : currentMission === null
            ? <><strong>짧은 연습 중</strong><small>곧 {total}개 미션 시작</small></>
          : <><strong>{completedCount} 완료 · {currentMission}번째</strong><small>{remainingCount}개 남음</small></>}
      </span>
      <span className="progress-dots" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => {
          const number = index + 1;
          const state = number <= completedCount ? "completed" : number === currentMission ? "current" : "upcoming";
          return <i key={number} className={state}>{number <= completedCount ? "✓" : number}</i>;
        })}
      </span>
    </div>
  );
}
