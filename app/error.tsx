"use client";

export default function ErrorScreen({ reset }: { readonly reset: () => void }) {
  return (
    <main className="fatal-error">
      <h1>잠시 멈췄어요.</h1>
      <p>학생이 입력한 내용은 어디에도 전송되지 않았어요. 다시 시작해 주세요.</p>
      <button className="primary-button" type="button" onClick={reset}>다시 시작</button>
    </main>
  );
}
