"use client";

import type { SessionAction, SessionState } from "../lib/session";

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
              {selected && <p className="feedback" role="status">{selected === question.correct ? "좋은 생각이에요. " : "다시 생각해 볼 수 있어요. "}{question.explanation}</p>}
            </section>
          );
        })}
      </div>
      <div className="final-note"><strong>모양이 바뀌어도 전체 수는 그대로!</strong><span>십 묶음 수 × 10 + 낱개 수 = 모두</span></div>
      <button type="button" className="primary-button" onClick={(event) => onOpenReset(event.currentTarget)}>다시 해 보기</button>
    </main>
  );
}
