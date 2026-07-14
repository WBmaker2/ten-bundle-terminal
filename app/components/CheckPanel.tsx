"use client";

import type { Mission, MissionCheck } from "../lib/types";

interface CheckPanelProps {
  readonly mission: Mission;
  readonly check: MissionCheck;
  readonly numericInput: string;
  readonly selection: string;
  readonly feedback: string;
  readonly onNumericChange: (value: string) => void;
  readonly onSelectionChange: (value: string) => void;
  readonly onSubmit: () => void;
}

export function CheckPanel(props: CheckPanelProps) {
  const { mission, check, numericInput, selection, feedback, onNumericChange, onSelectionChange, onSubmit } = props;
  if (check.kind === "quantity") {
    return (
      <section className="question-card" aria-labelledby="quantity-title">
        <p className="step-label">배송 수량표</p>
        <h2 id="quantity-title">{check.prompt}</h2>
        <label className="quantity-label" htmlFor="quantity-input">모두 몇 개?</label>
        <input
          id="quantity-input"
          className="quantity-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={3}
          value={numericInput}
          aria-label="배송 수량표"
          aria-invalid={Boolean(feedback)}
          aria-describedby={feedback ? "mission-feedback" : undefined}
          onChange={(event) => onNumericChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") onSubmit(); }}
          autoFocus
        />
        <div className="keypad" role="group" aria-label="화면 숫자 키패드">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
            <button key={digit} type="button" onClick={() => onNumericChange(`${numericInput}${digit}`.slice(0, 3))}>{digit}</button>
          ))}
          <button type="button" className="key-delete" onClick={() => onNumericChange(numericInput.slice(0, -1))}>지우기</button>
        </div>
        {feedback && <p id="mission-feedback" className="feedback warning" role="status">{feedback}</p>}
        <button type="button" className="primary-button" onClick={onSubmit}>수량 확인</button>
      </section>
    );
  }

  return (
    <section className="question-card">
      <p className="step-label">{check.kind === "reading" ? "수 읽기" : "자리 관계"}</p>
      <fieldset className="choice-fieldset">
        <legend>{check.prompt}</legend>
        <div className="choice-list">
          {check.options.map((option) => {
            const value = String(option);
            return (
              <label key={value} className={`choice-card ${selection === value ? "selected" : ""}`}>
                <input type="radio" name={`check-${mission.id}`} value={value} checked={selection === value} onChange={() => onSelectionChange(value)} />
                <span>{check.kind === "place" ? `${value}개` : value}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {feedback && <p id="mission-feedback" className="feedback warning" role="status">{feedback}</p>}
      <button type="button" className="primary-button" onClick={onSubmit}>선택 확인</button>
    </section>
  );
}
