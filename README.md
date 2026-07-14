# 십 묶음 택배 터미널

초등 1~2학년 학생이 0부터 100까지의 수를 십 묶음과 낱개로 나타내고, 묶거나 풀어도 전체 수가 변하지 않음을 확인하는 서버 없는 교육용 웹앱입니다.

## 학습 흐름

10~15분 동안 짧은 연습 뒤 고정된 9개 미션을 순서대로 수행합니다. 드래그 없이 버튼과 키보드로 묶기·풀기·되돌리기·숫자 쓰기·읽기 카드 선택을 완료하고, 마지막에는 점수 없는 배송 정리표를 확인합니다.

## 실행과 검증

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run check:lines
npm run check:content
```

## 운영 원칙

- 학생 이름, 학번, 학급, 음성, 사진을 받지 않습니다.
- 브라우저 저장소, 서버, 외부 API, 분석 도구를 사용하지 않습니다.
- 제한 시간, 점수, 별, 순위, 무작위 문제를 사용하지 않습니다.
- 모든 TypeScript, TSX, CSS, MJS, HTML 코드 파일은 500줄 미만으로 유지합니다.
- 실제 개선 때마다 화면의 `업데이트 내역`에 날짜, 버전, 간단한 내용을 최신순으로 기록합니다.

## 문서

- [전체 구현 계획](./2026-07-14%20ten-bundle-terminal.md)
- [학습 모형](./docs/learning-model.md)
- [교육과정 연결](./docs/curriculum-alignment.md)
