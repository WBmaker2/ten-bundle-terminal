import { exchangeActionLabels, getRequiredActionProgress } from "../lib/actionGuide";
import type { ExchangeAction } from "../lib/types";

export function ActionGuide({ required, history }: {
  readonly required: readonly ExchangeAction[];
  readonly history: readonly ExchangeAction[];
}) {
  const progress = getRequiredActionProgress(history, required);
  const complete = progress === required.length;
  const nextAction = required[progress];

  return (
    <section className="action-guide" aria-labelledby="action-guide-title">
      <div className="action-guide-heading">
        <p className="step-label" id="action-guide-title">이번에 할 순서</p>
        <strong id="action-guide-status" role="status" aria-live="polite">
          {complete ? "순서 완료!" : `지금 할 일: ${exchangeActionLabels[nextAction]}`}
        </strong>
      </div>
      <ol>
        {required.map((action, index) => {
          const completed = index < progress;
          const current = index === progress;
          return (
            <li key={`${action}-${index}`} className={`action-step ${completed ? "completed" : ""} ${current ? "current" : ""}`} aria-current={current ? "step" : undefined}>
              <span className="action-step-number" aria-hidden="true">{completed ? "✓" : index + 1}</span>
              <span>{exchangeActionLabels[action]}</span>
              <small>{completed ? "완료" : current ? "할 차례" : "다음"}</small>
            </li>
          );
        })}
      </ol>
      <p className="action-guide-note">
        {complete ? <>아래 <strong>묶음 확인</strong>을 눌러 다음 문제로 가세요.</> : <>강조된 <strong>{exchangeActionLabels[nextAction]}</strong> 버튼을 눌러 보세요.</>}
      </p>
    </section>
  );
}
