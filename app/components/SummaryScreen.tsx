"use client";

import type { SessionAction, SessionState } from "../lib/session";
import { missions } from "../lib/missions";

const questions = [
  {
    id: "why-bundle-ten",
    prompt: "왜 택배를 10개씩 묶으면 편리할까요?",
    choices: [
      ["fast-count", "묶음 수와 낱개 수를 보면 빠르게 셀 수 있어요."],
      ["disappear", "묶을 때 택배가 없어져서 수가 작아져요."],
      ["different", "묶음마다 들어 있는 개수가 달라도 빨라요."],
    ],
    correct: "fast-count",
    explanation: "10개씩 같은 크기로 묶으면 묶음 수와 낱개 수만 보고 전체를 빠르게 알 수 있어요.",
  },
  {
    id: "what-quantity-means",
    prompt: "배송 수량표의 42는 무엇을 나타내나요?",
    choices: [
      ["total", "지금 배송할 택배가 모두 42개라는 뜻이에요."],
      ["name", "42번 택배 상자의 이름이라는 뜻이에요."],
      ["bundles", "십 묶음이 42개 있다는 뜻이에요."],
    ],
    correct: "total",
    explanation: "수량표의 숫자는 물건이 모두 몇 개인지 누구나 같은 방법으로 기록해 줘요.",
  },
  {
    id: "transfer-twenty-three",
    prompt: "23개는 십 묶음과 낱개로 어떻게 나타낼까요?",
    choices: [
      ["two-three", "십 묶음 2개와 낱개 3개"],
      ["three-two", "십 묶음 3개와 낱개 2개"],
      ["twenty-three", "십 묶음 23개와 낱개 0개"],
    ],
    correct: "two-three",
    explanation: "십 묶음 2개는 20개이고 낱개 3개를 더하면 모두 23개예요.",
  },
] as const;

const bonusQuestions = [
  { id: "bonus-30", total: 30, prompt: "30개는 어떻게 나타낼까요?", choices: [["3-0", "3묶음 0낱개"], ["0-3", "0묶음 3낱개"], ["2-10", "2묶음 10낱개"]], correct: "3-0" },
  { id: "bonus-58", total: 58, prompt: "58개는 어떻게 나타낼까요?", choices: [["5-8", "5묶음 8낱개"], ["8-5", "8묶음 5낱개"], ["4-8", "4묶음 8낱개"]], correct: "5-8" },
  { id: "bonus-70", total: 70, prompt: "70개는 어떻게 나타낼까요?", choices: [["7-0", "7묶음 0낱개"], ["0-7", "0묶음 7낱개"], ["6-1", "6묶음 1낱개"]], correct: "7-0" },
] as const;

export function SummaryScreen({ state, dispatch, onOpenReset }: {
  readonly state: SessionState;
  readonly dispatch: React.Dispatch<SessionAction>;
  readonly onOpenReset: (button: HTMLButtonElement) => void;
}) {
  return (
    <main className="screen summary-screen">
      <p className="eyebrow">배송 정리표</p>
      <h1>오늘 해 본 활동</h1>
      <div className="activity-grid" aria-label="완료한 활동">
        {["10개 묶기", "1묶음 풀기", "숫자 쓰기", "수 읽기", "100 경계"].map((item) => <span key={item}>✓ {item}</span>)}
      </div>
      <details className="review-panel">
        <summary>완료한 미션 다시 보기</summary>
        <p>헷갈렸던 배송만 골라 다시 연습할 수 있어요. 복습 결과는 저장하지 않아요.</p>
        <div className="mission-review-grid">
          {missions.map((mission, index) => (
            <button key={mission.id} type="button" onClick={() => dispatch({ type: "REPLAY_MISSION", missionIndex: index })}>
              <span>{index + 1}번째 · {mission.total}개</span>
              <strong>{mission.title}</strong>
              <small>{mission.concept}</small>
            </button>
          ))}
        </div>
      </details>
      <div className="summary-questions">
        {questions.map((question, index) => {
          const selected = state.summaryAnswers[question.id];
          return (
            <section className="summary-question" key={question.id}>
              <p className="step-label">생각 정리 {index + 1}</p>
              <fieldset className="choice-fieldset">
                <legend>{question.prompt}</legend>
                <div className="choice-list">
                  {question.choices.map(([id, label]) => (
                    <label key={id} className={`choice-card ${selected === id ? "selected" : ""}`}>
                      <input type="radio" name={question.id} checked={selected === id} onChange={() => dispatch({ type: "ANSWER_SUMMARY", questionId: question.id, choiceId: id })} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {selected && (
                <p className={`feedback ${selected === question.correct ? "" : "warning"}`} role="status">
                  {selected === question.correct ? `좋은 생각이에요. ${question.explanation}` : "한 번 더 생각해 보세요. 십 묶음과 낱개를 다시 살펴보고 다른 답을 골라도 괜찮아요."}
                </p>
              )}
            </section>
          );
        })}
      </div>
      <details className="bonus-panel">
        <summary>보너스 연습 3개</summary>
        <p>점수 없이 다른 수도 십 묶음과 낱개로 나타내 보세요.</p>
        <div className="bonus-grid">
          {bonusQuestions.map((question) => {
            const selected = state.bonusAnswers[question.id];
            return (
              <fieldset className="bonus-question" key={question.id}>
                <legend>{question.prompt}</legend>
                {question.choices.map(([id, label]) => (
                  <label key={id} className={selected === id ? "selected" : ""}>
                    <input type="radio" name={question.id} checked={selected === id} onChange={() => dispatch({ type: "ANSWER_BONUS", questionId: question.id, choiceId: id })} />
                    <span>{label}</span>
                  </label>
                ))}
                {selected && <p className={selected === question.correct ? "bonus-correct" : "bonus-retry"} role="status">{selected === question.correct ? `${question.total}개를 정확히 나타냈어요.` : "묶음 수에 10을 곱한 뒤 낱개를 더해 보세요."}</p>}
              </fieldset>
            );
          })}
        </div>
      </details>
      <div className="final-note"><strong>모양이 바뀌어도 전체 수는 그대로!</strong><span>십 묶음 수 × 10 + 낱개 수 = 모두</span></div>
      <button type="button" className="primary-button" onClick={(event) => onOpenReset(event.currentTarget)}>다시 해 보기</button>
    </main>
  );
}
