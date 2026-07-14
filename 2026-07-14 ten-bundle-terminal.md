# 십 묶음 택배 터미널 MVP 구현 계획

**목표:** 초등 1~2학년 학생이 0과 100까지의 수를 `십 묶음`과 `낱개`로 나타내고, 낱개 10개를 십 묶음 1개로 묶거나 다시 푸는 과정에서도 전체 수가 변하지 않음을 이해하며, 수를 읽고 숫자로 쓸 수 있는 서버 없는 교육용 웹앱을 구현합니다.

**아키텍처:** 별도 저장소 `ten-bundle-terminal`에 Vite, React, TypeScript 기반 정적 앱을 구성합니다. 고정된 9개 미션과 버튼 기반 조작만 제공하며 드래그, 런타임 무작위 출제, 서버 저장을 사용하지 않습니다. 수량 계산·묶기·풀기·수량표 판정·문제은행 검증은 UI와 분리된 순수 함수로 만들고, 모든 조작에서 `전체 수 = 십 묶음 수 × 10 + 낱개 수`가 보존되는지 검증합니다.

**기술 스택:** Vite, React, TypeScript, CSS, SVG, Vitest, React Testing Library, Playwright, Node.js

**현재 상태:** 이 문서는 구현 계획만 정의합니다. 별도 구현 요청 전에는 새 저장소 생성, 패키지 설치, 코드 작성, 테스트 실행, 커밋, 배포, HVC 등록을 하지 않습니다.

## 1. 확인 자료와 교육과정 근거

### 확인 자료

- 기존 앱 비교: [`docs/vibehong-webapp-catalog.md`](../../vibehong-webapp-catalog.md), 2026-07-11 기준 56개
- 기존 계획 비교: `등호 수사대`, `AI 데이터 품질검사소`, `생활도구 리디자인 클리닉`, `팩트체크 편집국`, `한 방울의 귀환`, `깜빡이 회로 수리센터`, `공정 배분 실험실`
- 성취기준 원문: `★(초)2022개정교육과정교과별성취수준(1~2학년군).pdf`
- PDF 텍스트 추출과 페이지 렌더링을 함께 확인했습니다.
- 성취기준 표는 PDF 뷰어 32쪽·문서 인쇄 28쪽, 예시 평가 개요는 PDF 뷰어 53쪽·문서 인쇄 49쪽입니다.

### 핵심 연결 성취기준

| 역할 | 성취기준 | 앱에서 지원하는 활동 | 연결 한계 | 원문 위치 |
|---|---|---|---|---|
| 핵심 | `[2수01-01] 수의 필요성을 인식하면서 0과 100까지의 수 개념을 이해하고, 수를 세고 읽고 쓸 수 있다.` | 택배 수를 십 묶음과 낱개로 나타내고, `배송 수량표(모두 몇 개)`를 쓰며, 검수된 읽기 카드를 고릅니다. 마지막에는 수량을 숫자로 나타내는 까닭을 돌아봅니다. | 택배 터미널 한 가지 맥락이므로 여러 실생활 상황에서 수의 필요성을 말하는 능력 전체를 평가하지 않습니다. | 1~2학년군 PDF 32쪽·53쪽 |
| 보조·부분 | `[2수01-02] 일, 십, 백, 천의 자릿값과 위치적 기수법을 이해하고, 네 자리 이하의 수를 읽고 쓸 수 있다.` | 0~99에서 십의 자리 숫자가 나타내는 값과 일의 자리 숫자가 나타내는 값을 연결하고, 100을 다음 자리 경계로 관찰합니다. | 일·십 자리의 기초만 지원합니다. 백·천의 자릿값과 네 자리 이하의 수 전체를 가르치거나 성취했다고 주장하지 않습니다. | 1~2학년군 PDF 32쪽 |

### 성취수준 적용 원칙

| 성취수준 원문의 핵심 | 앱의 지원 | 과도한 평가 방지 |
|---|---|---|
| C: 구체물을 세어 0과 50까지 또는 100까지의 수 개념을 이해하고 읽고 씀 | 시각 택배, 항상 보이는 수량 문장, 한 단계 조작, 0·9·10 경계 미션을 제공합니다. | C를 학생 등급으로 표시하지 않고 구체적 조작과 안내 문구의 설계 근거로만 사용합니다. |
| B: 실생활 상황을 말하고 10개씩 묶음과 낱개로 수를 이해하며 읽고 씀 | 배송 수량표 맥락, 묶기·풀기, 숫자 입력, 읽기 카드 선택을 연결합니다. | 단일 맥락과 화면 선택만으로 실생활 의사소통 능력 전체를 판정하지 않습니다. |
| A: 여러 실생활 상황에서 수의 필요성을 말하고 10개씩 묶음과 낱개로 나타내며 읽고 씀 | `왜 10개씩 묶으면 편리할까요?`, `수량표의 수는 무엇을 나타낼까요?`라는 점수 없는 정리 질문을 제공합니다. | 자유 설명과 실제 말하기는 교사 관찰 영역으로 남기며 앱이 A 수준을 인증하지 않습니다. |

- A·B·C를 학생용 점수, 난이도 이름, 등급으로 노출하지 않습니다.
- PDF 예시 평가가 강조하는 `10개씩 묶어 세기`, `수를 쓰고 읽기`, `묶어 세는 편리함 설명`을 MVP 학습 흐름에 반영합니다.
- 한자어 수사 표기는 `영`, `구`, `십`, `십구`, `이십`, `사십이`, `사십`, `구십구`, `백`처럼 검수된 카드로 제공합니다.
- 물건을 세는 고유어 표현은 자동 오답으로 판정하지 않으며 MVP 자유 한글 입력 범위에서 제외합니다.

## 2. 제품 접근 비교와 결정

| 접근 | 방식 | 장점 | 위험 | 결정 |
|---|---|---|---|---|
| 안내형 버튼 터미널 | 고정 수량에서 `10개 묶기`, `1묶음 풀기`, `되돌리기`, 단계별 확인 버튼으로 미션 수행 | 드래그 없이 접근 가능하고 총량 보존·경계값·학습 순서를 결정적으로 검증 가능 | 자유 조작 범위가 작음 | **MVP 채택** |
| 자유 조작 샌드박스 | 학생이 원하는 수를 만들고 묶기·풀기를 자유롭게 반복 | 탐색성이 높고 교사 시범에 유용 | 목표 없이 조작만 반복하거나 화면 수량이 과도해질 수 있음 | 후속 검토 |
| 그림-숫자 퀴즈 | 묶음 그림을 보고 정답 숫자만 선택 | 구현과 채점이 가장 단순함 | 묶기·풀기의 보존 관계를 직접 조작하지 못함 | 사용하지 않음 |
| 드래그 교구 | 낱개를 끌어 상자에 넣고 묶음을 끌어 풀기 | 직접 조작 느낌이 큼 | 키보드·운동 접근성, 작은 화면, 터치 오작동, 자동화 검증 부담이 큼 | MVP 제외 |

### 추천안의 핵심 이유

- 학생이 낱개를 하나씩 선택하지 않고 한 번의 버튼 조작으로 정확히 10개를 묶어 인지 부담을 줄입니다.
- 묶기·풀기 전후 전체 수를 같은 화면에서 비교하여 `묶으면 수가 줄어든다`는 오개념을 바로 다룹니다.
- 문제·순서·보기·피드백을 모두 검수된 정적 데이터로 두어 저학년 수업에서 결과가 안정적입니다.
- 서버, 로그인, 외부 API, 음성 인식 없이 한 기기에서 10~15분 안에 완료할 수 있습니다.
- 드래그를 보조 기능으로도 넣지 않아 터치와 키보드가 동일한 학습 흐름을 갖습니다.

## 3. 기존 앱과 계획의 차별화

카탈로그 56개와 기존 계획에는 십 묶음과 낱개를 버튼으로 상호 변환하고 총량 보존·자리값·수 읽기·쓰기를 함께 확인하는 앱이 없습니다.

| 기존 앱·계획 | 겹칠 수 있는 요소 | 십 묶음 택배 터미널의 차별화 기준 |
|---|---|---|
| 뚝딱! 분수 조각 탐험대 | 시각적 수학 교구 | 슬라이더와 분수 조각이 아니라 자연수 낱개 10개와 십 묶음 1개의 동치를 조작합니다. |
| 째깍째깍 시간 탐험대 | 저학년 반복 미션 | 시곗바늘 조작이 아니라 0~100의 묶음·낱개와 자리값을 다룹니다. |
| 요리조리 도형 변신 마법사 | 직접 조작 | 꼭짓점 드래그가 아니라 네이티브 버튼만으로 수 표현을 바꿉니다. |
| 뚝딱뚝딱 문장 만들기 공장 | 블록과 저학년 활동 | 단어 드래그와 문장 규칙이 아니라 수량 보존과 위치적 기수법을 다룹니다. |
| 디지털 팔레트: 색깔 혼합 실험실 | 버튼으로 수량 변화 관찰 | 색 비율을 만들지 않고 같은 전체 수의 두 표현을 교환합니다. |
| 등호 수사대 계획 | 수학 오개념 교정과 정적 미션 | 식의 양쪽 동치가 아니라 `십 묶음 n개 + 낱개 m개`와 숫자의 자리값 관계를 다룹니다. |
| 한 방울의 귀환 계획 | 토큰 보존 시뮬레이션 | 물의 상태·수확량 모형이 아니라 10진 묶음 교환과 자릿값을 학습합니다. |

### 차별화 유지 규칙

- 핵심 순환은 `택배 수 확인 → 필요한 경우 묶기·풀기 → 전체 수 보존 확인 → 미션별 수량 쓰기·읽기·자리 관계 한 가지 확인`입니다.
- 덧셈·뺄셈 계산 훈련, 분수, 시각, 도형, 색 혼합을 넣지 않습니다.
- 드래그, 슬라이더, 캔버스 포인터 판정, 스와이프, 길게 누르기를 넣지 않습니다.
- 문제 자동 생성, 랜덤 숫자, 제한 시간, 점수·별·순위·연속 정답을 넣지 않습니다.
- 최종 화면은 시험 점수표가 아니라 `해 본 활동`을 정리한 읽기 전용 `배송 정리표`입니다.

## 4. MVP 제품 계약

### 기본 정보

| 항목 | 결정 |
|---|---|
| 앱 이름 | 십 묶음 택배 터미널 |
| 대상 | 초등 1~2학년, 특히 1학년 후반의 0~100 수 개념 학습 |
| 1회 활동 시간 | 10~15분 |
| 문제 구성 | 고정 순서 9개 미션과 마지막 점수 없는 정리 질문 2개 |
| 수 범위 | 0~99 조작 중심, 100은 `십 묶음 10개` 경계 미션으로 포함 |
| 핵심 조작 | `낱개 10개 묶기`, `십 묶음 1개 풀기`, `한 단계 되돌리기`, `묶음 확인` |
| 숫자 쓰기 | 지정 미션에서 화면 숫자 키패드와 물리 키보드 숫자 키 사용, 최대 3자리 |
| 수 읽기 | 검수된 한자어 수사 카드 선택, 자유 한글 채점 없음 |
| 피드백 | 정오만 표시하지 않고 현재 묶음·낱개·전체와 다음 확인 행동 안내 |
| 결과 | 점수 없는 읽기 전용 `배송 정리표` |
| 저장 | React 메모리만 사용하며 새로고침 시 시작 화면으로 초기화 |
| 네트워크 | 초기 정적 자원 외 API·외부 요청 없음 |
| 개인정보 | 이름·학번·학급·음성·사진·자유 서술 입력 없음 |

### 학생 학습 목표

학생은 활동 후 다음을 할 수 있어야 합니다.

1. 낱개 10개가 십 묶음 1개와 같은 수량임을 설명합니다.
2. 십 묶음 수와 낱개 수를 보고 모두 몇 개인지 나타냅니다.
3. 같은 전체 수를 묶기 전과 묶은 뒤의 서로 다른 모습으로 확인합니다.
4. 0~99에서 십의 자리 숫자와 일의 자리 숫자가 나타내는 값을 구분합니다.
5. 끝자리가 0인 수에서 낱개가 0개임을 확인합니다.
6. 100은 십 묶음 10개이고 백 1개와 같은 수량이며, 숫자 `100`의 십의 자리 숫자가 `10`인 것은 아님을 구분합니다.
7. 여러 미션에 나누어 0~100의 검수된 수를 숫자로 쓰고 한자어 수사 카드로 읽습니다.
8. 물건이 많을 때 10개씩 묶어 세는 방법이 편리한 이유를 선택형 문장으로 정리합니다.

### 학생 활동 흐름

1. **시작:** `10개가 모이면 십 묶음 1개예요.`라는 한 문장과 학습 범위를 확인합니다.
2. **짧은 연습:** 낱개 7개와 낱개 10개를 비교하고 버튼으로 처음 묶어 봅니다.
3. **미션 확인:** 배송할 전체 수와 만들어야 할 모습을 한 문장으로 읽습니다.
4. **묶기·풀기:** 버튼으로 수 표현을 바꾸고 현재 상태 문장을 확인합니다.
5. **목표 확인:** 필요한 조작 기록과 목표 모습이 맞는지 확인합니다.
6. **미션별 한 가지 확인:** 화면 키패드로 `배송 수량표`를 쓰거나, 읽기 카드 또는 자리 관계 카드 한 가지를 고릅니다.
7. **경계 카드:** 100 미션에서만 `십 묶음 10개 = 100개 = 백 1개`와 백·십·일 `1·0·0`을 읽기 전용으로 관찰합니다.
8. **즉시 피드백:** 맞으면 표현 관계를 다시 읽고, 다르면 상태를 지우지 않은 채 다음 단서를 확인합니다.
9. **다음 미션:** 자동 전환하지 않고 학생이 `다음 배송`을 누릅니다.
10. **배송 정리표:** 해 본 활동, `왜 10개씩 묶을까요?`, `수량표의 수는 무엇을 나타낼까요?`를 점수 없이 정리합니다.

### 학생용 용어 계약

- 항상 `십 묶음`, `낱개`, `모두`, `10개 묶기`, `1묶음 풀기`를 사용합니다.
- `교환`, `변환`, `정규형`, `캐리`, `리그룹`, `표현식`은 학생용 화면에서 사용하지 않습니다.
- `십 묶음 4개는 40개예요. 낱개 2개를 더하면 모두 42개예요.`처럼 묶음 수와 묶음이 나타내는 값을 함께 말합니다.
- 0은 빈칸이나 `없음`만으로 표시하지 않고 `낱개가 없어요(0개)`, `영`을 함께 제공합니다.
- 10은 `십`, 20은 `이십`, 40은 `사십`, 100은 `백`으로 표시하며 `일십`, `사십 영`, `일백`을 정답 카드로 사용하지 않습니다.

### MVP에서 제외

- 드래그 앤 드롭, 포인터로 10개 선택, 슬라이더, 스와이프, 길게 누르기
- 학생이 전체 수를 늘리거나 줄이는 `+1`, `-1`, 자유 수 만들기 기능
- 덧셈·뺄셈 세로셈, 받아올림·받아내림 계산 훈련
- 백 묶음 만들기·풀기와 천의 자리 학습
- 자유 한글 읽기 입력, 음성 인식, TTS 자동 재생, 발음 채점
- 런타임 문제 생성, 난이도 자동 상승, 무작위 문제 순서
- 제한 시간, 생명, 벌점, 점수, 별, 배지, 순위, 연속 정답 효과
- 로그인, 학급 코드, 교사 대시보드, 분석 로그, 브라우저 저장소
- 저장, 다운로드, 인쇄, 공유, 배포, HVC 등록

## 5. 조작 모형과 고정 미션

### 수량 모형

- 화면의 조작물은 `십 묶음 수`와 `낱개 수`입니다. 이를 십의 자리 숫자와 혼동하지 않습니다.
- 모든 상태는 `전체 수 = 십 묶음 수 × 10 + 낱개 수`를 만족합니다.
- `낱개 10개 묶기`는 낱개를 10 줄이고 십 묶음을 1 늘립니다.
- `십 묶음 1개 풀기`는 십 묶음을 1 줄이고 낱개를 10 늘립니다.
- 성공한 조작 전후 전체 수는 반드시 같습니다.
- 한 미션의 전체 수는 잠겨 있으며 조작으로 택배가 생성되거나 사라지지 않습니다.
- 작업대의 비표준 낱개는 최대 19개로 제한하여 100개 낱개를 한 화면에 늘어놓지 않습니다.
- 낱개가 10개 미만이면 묶기를, 십 묶음이 0개이거나 풀면 낱개가 19개를 넘으면 풀기를 차단하고 이유를 가까운 문장으로 표시합니다.

### 배송 준비 완료 모습

- 0~99의 표준 모습은 `십 묶음 = Math.floor(전체 수 / 10)`, `낱개 = 전체 수 % 10`입니다.
- 100의 경계 모습은 `십 묶음 10개 + 낱개 0개`입니다.
- 100 미션에서는 이를 `십의 자리 숫자 10`으로 표현하지 않습니다.
- 숫자 `100`은 완료 직후 읽기 전용 경계 카드에 `십 묶음 10개 = 100개 = 백 1개`, 백·십·일 `1·0·0`을 함께 보여 줍니다. 백 묶음을 만들거나 푸는 조작은 후속 학습으로 남기며, 이 카드는 `[2수01-02]` 전체 학습이 아닌 100 경계 관찰로 설명합니다.
- 같은 총량이라도 미션이 `풀었다가 다시 묶기`를 요구하면 최종 모습만 맞추는 것으로 완료하지 않고 검수된 조작 순서도 확인합니다.

### 고정 9개 미션

| 순서 | 내부 ID | 전체 수 | 시작 모습 | 목표 모습·필수 조작 | 능동 확인 | 완료 피드백·관찰 | `conceptTags` |
|---:|---|---:|---|---|---|---|---|
| 1 | `zero-depot` | 0 | 0묶음·0낱개 | 조작 없음 | 수량 `0` 쓰기 → 읽기 `영` 고르기 | 0묶음·0낱개 | `zero` |
| 2 | `single-nine` | 9 | 0묶음·9낱개 | 조작 없음 | 수량 `9` 쓰기 → 읽기 `구` 고르기 | 십 묶음 0개·낱개 9개, 숫자는 한 자리 `9` | `one-digit` |
| 3 | `first-ten` | 10 | 0묶음·10낱개 | `묶기` → 1묶음·0낱개 | 수량 `10` 쓰기 | 읽기 `십` | `bundle-ten` |
| 4 | `nineteen` | 19 | 0묶음·19낱개 | `묶기` → 1묶음·9낱개 | 읽기 `십구` 고르기 | 수량 `19` | `bundle-ten`, `remainder-after-bundle` |
| 5 | `twenty` | 20 | 1묶음·10낱개 | `묶기` → 2묶음·0낱개 | 수량 `20` 쓰기 | 읽기 `이십`, 낱개 0개 | `bundle-ten`, `trailing-zero` |
| 6 | `reverse-forty-two` | 42 | 4묶음·2낱개 | 조작 없음 | 수량 `42` 쓰기 → `십 묶음 4개는 40개` 고르기 | 읽기 `사십이`, 낱개 2개 | `digit-order` |
| 7 | `unpack-forty` | 40 | 4묶음·0낱개 | `풀기 → 묶기` → 4묶음·0낱개 | 읽기 `사십` 고르기 | 전후 모두 40 | `unbundle-one`, `bundle-ten`, `equivalent-representation`, `trailing-zero` |
| 8 | `ninety-nine` | 99 | 8묶음·19낱개 | `묶기` → 9묶음·9낱개 | 수량 `99` 쓰기 | `90 + 9`, 읽기 `구십구` | `bundle-ten`, `ninety-nine-boundary` |
| 9 | `hundred-gate` | 100 | 9묶음·10낱개 | `묶기` → 10묶음·0낱개 | 수량 `100` 쓰기 | `십 묶음 10개 = 100개 = 백 1개`, 백·십·일 `1·0·0`, 읽기 `백` | `bundle-ten`, `hundred-boundary` |

- 조작이 없는 미션은 별도의 `그대로 확인` 버튼을 요구하지 않고 첫 능동 확인으로 바로 이동합니다.
- 조작이 있는 미션은 조작 단계와 능동 확인 1개, 조작이 없는 미션은 능동 확인 최대 2개로 제한합니다.
- 한 화면에는 능동 확인 하나만 표시하므로 학생은 한 미션에서 동시에 여러 새 관계를 답하지 않습니다.

### 배송 수량표와 읽기 확인

- 수량 쓰기가 지정된 미션에서만 `배송 수량표(모두 몇 개)`를 완성합니다.
- 숫자 입력은 이름 있는 `<input type="text" inputMode="numeric" pattern="[0-9]*">`와 `0~9`, `지우기`, `수량 확인` 네이티브 버튼을 사용합니다.
- 물리 키보드 숫자·Backspace·Enter는 수량 입력에 초점이 있을 때만 처리하며 문서 전역 키 이벤트로 라디오·모달·브라우저 단축키를 가로채지 않습니다.
- 화면 키패드와 물리 키 입력은 같은 제어 입력값을 갱신하고, 오류 문구는 `aria-describedby`로 연결하며 오류 상태에는 `aria-invalid="true"`를 적용합니다.
- 입력은 최대 3자리이며 `0~100` 정수만 허용합니다.
- `04` 같은 선행 0은 자동 정답 처리하지 않고 `04는 4로 써요. 앞의 0을 지워 보세요.`라고 안내합니다.
- 읽기 확인은 자유 한글 입력 대신 정답 1개와 같은 범위의 검수된 방해 카드 2개를 제공합니다.
- 42 미션은 수량표에서 `42`와 `24`의 순서를 확인한 뒤, 별도 한 문항에서 `십 묶음 4개는 40개`만 능동 선택합니다. `사십이`와 낱개 2개는 완료 피드백으로 보여 줍니다.
- 100 미션에는 십의 자리 답으로 `10`을 고르는 UI 자체를 만들지 않습니다.

### 정리 질문

배송 정리표에서 다음 두 질문을 한 번에 하나씩 제시합니다.

1. `왜 택배를 10개씩 묶으면 편리할까요?`
   - `묶음 수와 낱개 수를 보면 빠르게 셀 수 있어요.`
   - `묶을 때 택배가 없어져서 수가 작아져요.`
   - `묶음마다 들어 있는 개수가 달라도 빠르게 셀 수 있어요.`
2. `배송 수량표의 42는 무엇을 나타내나요?`
   - `지금 배송할 택배가 모두 42개라는 뜻이에요.`
   - `42번 택배 상자의 이름이라는 뜻이에요.`
   - `십 묶음이 42개 있다는 뜻이에요.`

각 질문의 첫 문장이 학습 목표에 맞는 선택입니다. 벌점이나 점수를 주지 않고, 선택 뒤 각각 `10개씩 같은 크기로 묶는 편리함`과 `수량을 숫자로 기록하는 필요성`을 짧게 설명합니다.

## 6. 오개념과 피드백 계약

| 오개념·오류 | 앱의 확인 방식 | 학생 피드백 |
|---|---|---|
| 34의 `3`을 3개로만 생각함 | `십 묶음 3개 = 30개`를 묶음 안 10칸과 수식으로 병치 | `3은 십 묶음 수예요. 3묶음은 30개예요.` |
| 42와 24를 뒤바꿈 | 십의 자리·일의 자리 라벨과 40·2 값을 따로 선택 | `십 묶음 수부터 살펴보세요.` |
| 묶으면 전체가 줄어든다고 생각함 | 조작 전후 전체 수를 나란히 표시 | `모양은 바뀌었지만 전에도 지금도 모두 40개예요.` |
| 끝자리 0을 무시함 | 20·40에서 낱개 0개 카드와 숫자 0을 함께 표시 | `낱개가 없다는 뜻으로 일의 자리에 0을 써요.` |
| 십 묶음 1개를 택배 1개로 셈 | 각 묶음에 2×5 칸과 숫자 `10`을 표시 | `이 묶음 안에는 낱개 10개가 있어요.` |
| 낱개가 10개 미만인데 묶으려 함 | 도메인과 버튼에서 동시에 차단 | `낱개가 7개예요. 3개가 더 있어야 묶을 수 있어요.` |
| 100의 십의 자리 숫자를 10이라고 생각함 | `십 묶음 10개 = 100개 = 백 1개`와 숫자 `100`의 자리 카드 `1·0·0`을 연결해 보여 줌 | `십 묶음은 10개이고 백 1개와 같아요. 100의 십의 자리 숫자는 0이에요.` |
| 0을 빈칸으로 생각함 | 0묶음·0낱개·숫자0·읽기 영을 함께 표시 | `아무것도 없는 수량도 0으로 나타내요.` |

### 피드백 원칙

- `틀렸어요`, 실패음, 화면 흔들기보다 첫 미완료 요소와 다음 행동을 안내합니다.
- 미완성 상태에서 `묶음 확인`이나 `수량 확인`을 눌러도 현재 묶음·낱개·수량 입력을 지우지 않습니다.
- 묶음 모습은 맞고 숫자만 다르면 조작을 다시 시키지 않고 배송 수량표에만 초점을 옮깁니다.
- 숫자는 맞고 읽기 카드만 다르면 현재 수를 한자어 수사로 다시 읽는 카드만 안내합니다.
- 오답 피드백은 정답을 자동 입력하거나 조작을 대신 완료하지 않고, 현재 상태에서 확인할 한 가지 관계만 안내합니다.
- 완료 피드백은 `잘 묶었어요. 모양은 바뀌어도 모두 19개예요.`처럼 조작과 수학 관계를 함께 말합니다.

## 7. 드래그 없는 상호작용과 접근성

### 핵심 조작 계약

- 모든 학습 행동은 실제 `<button>`, `<fieldset>`·`<legend>`와 같은 `name`의 네이티브 라디오 그룹, 숫자 입력만으로 완료합니다.
- `draggable`, HTML Drag and Drop API, 드래그 라이브러리, 캔버스 히트 테스트, 포인터 이동량 판정을 사용하지 않습니다.
- 주 조작은 `낱개 10개 묶기`, `십 묶음 1개 풀기`, `한 단계 되돌리기`, `묶음 확인` 네 개로 제한하고 수량 입력 제출은 `수량 확인`으로 구분합니다.
- 한 번의 묶기 버튼은 시스템이 낱개 10개를 자동으로 선택하여 묶습니다.
- 모든 클릭·터치 대상은 저학년 사용을 위해 최소 48×48 CSS px로 만듭니다.
- Enter와 Space로 버튼을 실행하고 Tab 순서는 `미션 안내 → 현재 상태 → 조작 → 되돌리기 → 수량표 또는 선택 문항 → 확인`으로 둡니다.
- 라디오 그룹은 방향키로 보기를 이동하고 Space로 선택하는 네이티브 동작을 보존하며 사용자 지정 키 처리로 덮어쓰지 않습니다.
- 조작한 버튼이 계속 활성이고 같은 단계가 이어질 때만 그 버튼에 초점을 유지합니다. 버튼이 비활성으로 바뀌면 다음 필수 조작 버튼으로, 조작 단계가 끝나면 `tabIndex={-1}`인 다음 단계 제목으로 초점을 옮깁니다.
- 새 미션에서는 미션 제목으로 초점을 옮기며, 실제 `disabled` 버튼에 초점을 강제로 남기거나 `aria-disabled`로 흉내 내지 않습니다.

### 시각·텍스트 등가 표현

- 십 묶음은 `2×5` 상자, 굵은 묶음 테두리, 숫자 `10`, `십 묶음` 라벨을 함께 사용합니다.
- 낱개는 분리된 상자로 나타내되 최대 19개만 렌더링하며 10개마다 줄바꿈합니다.
- 수십 개의 시각 상자는 `aria-hidden="true"`로 두고 하나의 요약 문장을 접근성 트리에 제공합니다.
- 요약 예시는 `십 묶음 2개, 낱개 4개, 모두 24개입니다.`입니다.
- 색상 외에도 테두리 모양, 라벨, 숫자, 공간 구분으로 묶음과 낱개를 구분합니다.
- 현재 관계를 `20 + 4 = 24`와 `십 묶음 2개 + 낱개 4개 = 모두 24개` 두 방식으로 표시합니다.

### 상태 알림과 초점

- 조작 결과는 한 개의 `role="status" aria-live="polite" aria-atomic="true"`에서 한 번만 알립니다.
- 예: `묶었습니다. 십 묶음 2개, 낱개 4개, 모두 24개입니다.`
- 비활성 버튼만 보여 주지 않고 가까운 설명 영역에 왜 실행할 수 없는지 지속적으로 표시합니다.
- 버튼 이름은 수량에 따라 바꾸지 않고 행동 중심으로 고정하며 현재 수량은 설명 관계로 전달합니다.
- 업데이트 내역과 초기화 대화상자는 이름, 초점 가두기, Escape 닫기, 호출 버튼 초점 복귀를 지원합니다.
- 자동 접근성 검사는 `@axe-core/playwright`를 보조 게이트로 사용하고, 최종 수동 검수에서는 macOS VoiceOver로 시작·묶기·수량 입력·읽기 라디오·다음 미션·업데이트 내역 모달 흐름의 실제 낭독과 초점을 확인합니다.

### 반응형·모션 기준

- 320px와 375px에서는 한 열로 배치하고 묶음 선반, 낱개 작업대, 수식, 버튼에 고정 너비를 두지 않습니다.
- 넓은 화면에서도 미션 문장과 조작판을 지나치게 벌리지 않고 읽기 폭을 제한합니다.
- 화면 하단 고정 버튼이나 콘텐츠를 덮는 플로팅 패널을 사용하지 않습니다.
- 사용자 확대를 막는 viewport 설정을 쓰지 않고 200% 확대에서 텍스트·수량·초점 테두리를 보존합니다.
- `prefers-reduced-motion: reduce`에서는 묶기 이동·확대 애니메이션을 제거하고 상태를 즉시 표시합니다.
- 기본 묶기 애니메이션은 300ms 이하이며 자동 반복, 번쩍임, 필수 소리를 사용하지 않습니다.
- forced-colors 환경에서도 묶음 경계와 초점 표시가 남아야 합니다.

## 8. 데이터·도메인·상태 계약

### 주요 타입

```ts
type ExchangeAction = 'bundle-ten' | 'unbundle-one';
type MissionStage = 'support' | 'core' | 'challenge';
type MissionPhase = 'intro' | 'exchange' | 'check' | 'completion';
type ConceptTag =
  | 'zero'
  | 'one-digit'
  | 'bundle-ten'
  | 'unbundle-one'
  | 'remainder-after-bundle'
  | 'trailing-zero'
  | 'digit-order'
  | 'equivalent-representation'
  | 'ninety-nine-boundary'
  | 'hundred-boundary';
type PlaceQuestionKind =
  | 'tens-digit'
  | 'tens-value'
  | 'ones-digit'
  | 'ones-value';
type FeedbackCode =
  | 'representation-mismatch'
  | 'operation-sequence-missing'
  | 'quantity-empty'
  | 'quantity-leading-zero'
  | 'quantity-out-of-range'
  | 'quantity-mismatch'
  | 'reading-mismatch'
  | 'place-value-mismatch'
  | 'mission-complete';
type SummaryQuestionId = 'why-bundle-ten' | 'what-quantity-means';

interface ParcelRepresentation {
  readonly tenBundleCount: number;
  readonly looseParcelCount: number;
}

interface OperationRequirement {
  readonly sequence: readonly ExchangeAction[];
}

interface PlaceQuestionSpec {
  readonly kind: PlaceQuestionKind;
  readonly optionValues: readonly number[];
}

interface ReadingCard {
  readonly id: string;
  readonly numeral: number;
  readonly label: string;
}

type MissionCheck =
  | { readonly kind: 'quantity-entry' }
  | {
      readonly kind: 'reading-card';
      readonly optionIds: readonly string[];
    }
  | {
      readonly kind: 'place-relation';
      readonly question: Readonly<PlaceQuestionSpec>;
    };

type PlaceValueReading =
  | {
      readonly kind: 'ones-tens';
      readonly numeral: number;
      readonly tenBundleCount: number;
      readonly tensDigit: number;
      readonly tensValue: number;
      readonly onesDigit: number;
      readonly onesValue: number;
    }
  | {
      readonly kind: 'hundred-boundary';
      readonly numeral: 100;
      readonly tenBundleCount: 10;
      readonly equivalentHundredBundleCount: 1;
      readonly hundredsDigit: 1;
      readonly tensDigit: 0;
      readonly onesDigit: 0;
    };

interface TerminalMission {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly order: number;
  readonly stage: MissionStage;
  readonly title: string;
  readonly prompt: string;
  readonly conceptTags: readonly ConceptTag[];
  readonly targetTotal: number;
  readonly initial: Readonly<ParcelRepresentation>;
  readonly goal: Readonly<ParcelRepresentation>;
  readonly requirement: Readonly<OperationRequirement>;
  readonly requiredChecks: readonly Readonly<MissionCheck>[];
  readonly completionCard: 'standard' | 'hundred-boundary';
  readonly hintIds: readonly string[];
}

interface OperationRecord {
  readonly action: ExchangeAction;
  readonly before: Readonly<ParcelRepresentation>;
  readonly after: Readonly<ParcelRepresentation>;
}

interface TutorialAttempt {
  readonly step: 'compare-seven' | 'bundle-ten' | 'complete';
  readonly current: Readonly<ParcelRepresentation>;
  readonly history: readonly OperationRecord[];
}

interface MissionAttemptData {
  readonly missionId: string;
  readonly current: Readonly<ParcelRepresentation>;
  readonly history: readonly OperationRecord[];
  readonly numericInput: string;
  readonly selectedReadingCardId: string | null;
  readonly selectedPlaceValue: number | null;
}

type WorkingFeedbackCode = Exclude<FeedbackCode, 'mission-complete'>;

type MissionAttempt = MissionAttemptData &
  (
    | {
        readonly phase: Extract<MissionPhase, 'intro' | 'exchange'>;
        readonly checkIndex: 0;
        readonly feedbackCode: WorkingFeedbackCode | null;
        readonly status: 'working';
      }
    | {
        readonly phase: Extract<MissionPhase, 'check'>;
        readonly checkIndex: number;
        readonly feedbackCode: WorkingFeedbackCode | null;
        readonly status: 'working';
      }
    | {
        readonly phase: Extract<MissionPhase, 'completion'>;
        readonly checkIndex: number;
        readonly feedbackCode: 'mission-complete';
        readonly status: 'complete';
      }
  );

interface SummaryChoice {
  readonly id: string;
  readonly label: string;
  readonly supportsLearningGoal: boolean;
}

interface SummaryQuestion {
  readonly id: SummaryQuestionId;
  readonly prompt: string;
  readonly choices: readonly Readonly<SummaryChoice>[];
}

interface SessionProgress {
  readonly completedMissionIds: readonly string[];
  readonly summaryAnswers: Readonly<Record<SummaryQuestionId, string | null>>;
}

interface SessionShellState {
  readonly updateHistoryOpen: boolean;
  readonly resetDialogOpen: boolean;
}

type SessionState = SessionShellState &
  SessionProgress &
  (
    | { readonly view: 'welcome' }
    | {
        readonly view: 'tutorial';
        readonly tutorial: Readonly<TutorialAttempt>;
      }
    | {
        readonly view: 'mission';
        readonly missionIndex: number;
        readonly attempt: Readonly<MissionAttempt>;
      }
    | { readonly view: 'summary' }
  );
```

### 순수 함수 경계

- `calculateTotal(representation)`: `십 묶음 × 10 + 낱개`를 반환합니다.
- `validateRepresentation(representation)`: 정수·비음수·최대 수량과 작업대 용량을 확인합니다.
- `canonicalizeTotal(total)`: 0~99의 표준 묶음·낱개 모습과 100의 경계 모습을 반환합니다.
- `canBundle(representation)`: 낱개 10개 이상과 십 묶음 상한을 확인합니다.
- `canUnbundle(representation)`: 십 묶음 1개 이상과 풀기 뒤 낱개 19개 이하를 확인합니다.
- `applyExchange(representation, action)`: 입력을 바꾸지 않고 성공 상태 또는 실패 코드를 반환합니다.
- `undoLastOperation(attempt)`: 마지막 조작 전 상태와 조작 기록을 함께 복원합니다.
- `validateQuantityEntry(input, target)`: 숫자 범위·선행 0·정답을 구분합니다.
- `derivePlaceValueReading(target)`: 0~99의 일·십 관계와 100의 `십 묶음 10개 = 백 1개`, 자리 카드 `1·0·0`을 판별 유니온으로 한 곳에서 계산합니다.
- `derivePlaceQuestionAnswer(target, kind)`: 0~99의 지정된 자리 숫자 또는 그 자리가 나타내는 값을 계산합니다.
- `reviewMissionAttempt(mission, attempt)`: 목표 모습, 필수 조작 순서, 현재 `requiredChecks[checkIndex]` 응답의 첫 미완료 요소만 반환합니다.
- `validateMission(mission)`: 초기·목표·총량·도달 가능성·보기·힌트 참조를 확인합니다.
- `validateMissionBank(missions)`: 9개 순서와 필수 경계·개념 포함을 검증합니다.
- `validateSummaryQuestions(questions)`: 두 정리 질문의 ID·보기와 목표 부합 선택이 각각 정확히 하나인지 확인합니다.
- `reviewSummaryAnswer(question, choiceId)`: 점수를 만들지 않고 선택에 맞는 묶기 편리함 또는 수량 기록 필요성 설명을 반환합니다.

### 교환 결과 계약

- 묶기 성공: `{tenBundleCount + 1, looseParcelCount - 10}`
- 풀기 성공: `{tenBundleCount - 1, looseParcelCount + 10}`
- 불가능한 조작은 상태를 바꾸지 않고 `not-enough-loose`, `no-ten-bundle`, `workspace-capacity`, `ten-bundle-limit` 중 하나를 반환합니다.
- 성공한 조작은 `before`를 history에 넣고 `after`를 새 불변 객체로 만듭니다.
- 빠른 연속 탭에서도 reducer가 매 action마다 현재 상태의 선행 조건을 다시 확인합니다.
- 성공·실패 모두 입력 객체와 문제은행 데이터를 변경하지 않습니다.

### 문제은행 검증 규칙

- 미션 ID·order는 중복되지 않고 order는 1~9가 연속되어야 합니다.
- 모든 수량은 유한한 0 이상의 정수이며 전체 수는 0~100입니다.
- 초기와 목표의 전체 수는 `targetTotal`과 같아야 합니다.
- 초기·조작 중·목표의 낱개는 19개 이하이고 십 묶음은 0~10개입니다.
- 목표는 허용된 묶기·풀기와 필수 조작 순서로 도달 가능해야 합니다.
- 필수 조작 순서는 undo되지 않고 남은 operation history에서 정확히 확인합니다.
- 0, 9, 10, 19, 20, 40, 42, 99, 100이 정확히 한 번씩 포함되어야 합니다.
- 묶기, 풀었다 다시 묶기, 한 자리 수, 끝자리 0, 42/24 역전, 99, 100 경계 개념이 포함되어야 합니다.
- `conceptTags`는 중복되지 않고 실제 `targetTotal`, 필수 조작, 확인 문항, 완료 카드에서 확인되는 개념과 일치해야 하며 장식용 태그를 허용하지 않습니다.
- 수량표의 정답은 항상 `targetTotal`에서, 0~99의 묶음·낱개와 자리값 정답은 순수 함수에서 파생하며 미션 데이터에 같은 정답 필드를 중복 선언하지 않습니다.
- 읽기 카드 ID는 중복되지 않고, 카드 레지스트리에서 `numeral === targetTotal`인 정답이 정확히 한 개여야 합니다.
- 자리 관계 선택지는 중복 없는 유한 정수이고 파생 정답을 정확히 한 번 포함해야 하며, 선택한 값도 해당 미션의 `optionValues` 안에 있어야 합니다.
- `targetTotal < 10`인 미션은 십의 자리 숫자·값 문항을 만들 수 없고, 화면에는 `십 묶음 0개`와 한 자리 숫자만 표시합니다.
- 조작 단계가 있으면 `requiredChecks`는 정확히 1개, 조작 단계가 없으면 1~2개이며 한 미션의 능동 응답 단계 합계는 최대 2개입니다.
- 100만 `hundred-boundary` 완료 카드를 사용하고 다른 수는 `standard`를 사용합니다. 100 완료 카드는 반드시 `derivePlaceValueReading(100)` 결과만 렌더링합니다.
- 정리 질문 2개의 ID와 보기 ID는 중복되지 않고 각 질문에 `supportsLearningGoal: true`인 선택이 정확히 하나 있어야 합니다.
- 문제은행은 `Math.random`, 날짜, 기기 정보, 이전 시도 횟수에 의존하지 않습니다.
- 유효하지 않은 콘텐츠를 자동 보정하지 않고 이름 있는 `학습 자료 오류` 화면으로 중단합니다.

### 세션 상태 전이

- `START_TUTORIAL`은 `TutorialAttempt`의 `compare-seven` 상태를 만들고 기존 세션 응답을 지웁니다.
- 튜토리얼은 `compare-seven → bundle-ten → complete` 순서만 따르며 미션 응답이나 완료 ID를 만들지 않습니다.
- `START_MISSIONS`는 첫 미션의 `intro` 상태를 만들고, `OPEN_MISSION`은 필수 조작이 있으면 `exchange`, 없으면 첫 `check`로 이동합니다.
- `APPLY_EXCHANGE`와 `UNDO_EXCHANGE`는 `exchange` 단계에서만 동작하며 history와 current를 함께 갱신합니다.
- `CHECK_EXCHANGE`는 목표 모습과 필수 조작 순서가 모두 맞을 때만 첫 `check`로 이동하고, 아니면 첫 미완료 요소만 안내합니다.
- `SUBMIT_CHECK`는 현재 `requiredChecks[checkIndex]`만 검토합니다. 틀리면 `check` 단계에 머물러 피드백만 갱신하고, 맞으면 다음 check로 이동합니다. 마지막 check까지 맞으면 같은 리듀서 전이에서 `phase: completion`, `status: complete`, 완료 ID 추가를 원자적으로 처리합니다.
- 미션을 임의로 완료시키는 별도 `COMPLETE_MISSION` action을 두지 않으며 완료 ID는 중복 추가하지 않습니다.
- `RESET_MISSION`은 현재 미션의 `intro`, 초기 표현, 빈 응답, 빈 history로 돌아갑니다.
- `NEXT_MISSION`은 현재 attempt가 `complete`일 때만 고정 order의 다음 미션으로 이동하며 자동 건너뛰기를 허용하지 않습니다.
- 마지막 미션 완료 뒤 `summary`에서 두 정리 질문 선택을 저장하되 점수·통과 조건을 만들지 않습니다.
- `RESTART_SESSION`은 확인 뒤 같은 첫 화면과 같은 미션 순서로 돌아갑니다.
- 업데이트 내역·초기화 모달을 열고 닫아도 학습 상태가 달라지지 않습니다.
- 시도 횟수, 속도, 오답 수, 점수, 연속 정답은 상태에 저장하지 않습니다.
- `localStorage`, `sessionStorage`, IndexedDB, 쿠키, URL 파라미터, 서버 전송을 사용하지 않습니다.

## 9. 화면 설계

### 공통 앱 셸

- 상단에 앱 이름, 현재 미션 `n/9`, 작은 `업데이트 내역` 버튼을 문서 흐름 안에 둡니다.
- `업데이트 내역`의 보이는 크기는 작게 유지하되 실제 터치 영역은 48×48px 이상입니다.
- 헤더는 화면을 덮는 고정 요소로 만들지 않고 좁은 화면에서는 자연스럽게 두 줄로 바뀝니다.
- 앱 설명과 업데이트 내역을 제외한 학습 화면은 한 번에 하나의 주 질문만 보여 줍니다.

### 화면별 계약

| 화면 | 핵심 내용 | 학생 행동 | 완료 조건 |
|---|---|---|---|
| 시작 | 한 문장 목표, 실제 물건 추가·삭제가 아닌 생각 교구 안내 | `연습 시작` | 버튼 선택 |
| 짧은 연습 | 낱개 7개, 낱개 10개, 첫 십 묶음 | 묶기 버튼 한 번, 상태 문장 듣기 | 10개와 1묶음 관계 확인 |
| 미션 안내 | 전체 수, 시작 모습, 이번 미션의 한 가지 목표 | `미션 열기` | 조작 필요 시 작업대, 아니면 첫 확인으로 이동 |
| 택배 작업대 | 십 묶음·낱개 시각화, 전체 수, 조작 버튼, undo | 묶기·풀기·되돌리기·`묶음 확인` | 목표 모습과 필수 조작 충족 |
| 배송 수량표 | 이름 있는 숫자 입력, 화면 키패드, 현재 표현 요약 | 숫자 쓰기·`수량 확인` | 지정 미션에서 0~100 정답 입력 |
| 수 읽기 | 검수 읽기 카드 3개를 한 네이티브 라디오 그룹으로 표시 | 방향키 이동·Space 선택·확인 | 지정 미션의 읽기 응답 완료 |
| 자리 관계 | 42의 `십 묶음 4개는 몇 개` 한 문항만 표시 | 라디오 선택·확인 | 파생 정답 40 선택 |
| 완료 피드백 | 이번 미션의 수학 관계와 읽기 전용 관찰 | `다음 배송` | 완료 상태에서만 학생이 이동 |
| 배송 정리표 | 해 본 활동, 묶기 편리함, 수량 숫자의 뜻 | 질문 2개를 점수 없이 선택·다시 시작 | 선택별 설명 후 세션 종료 |
| 업데이트 내역 | 개발·개선 날짜, 버전, 변경 요약 | 닫기 | 이전 초점 복귀 |

### 오류·복구 화면

- 유효하지 않은 문제 데이터는 임의로 고치지 않고 `학습 자료를 확인해 주세요.`와 다시 시작 버튼을 표시합니다.
- 예상하지 못한 렌더 오류는 오류 경계가 잡고 학생 입력이나 오류 상세를 외부로 전송하지 않습니다.
- `처음으로`와 `현재 미션 다시 하기`는 서로 다른 버튼으로 제공하며 전체 초기화만 확인 대화상자를 사용합니다.
- 미션 중 브라우저를 새로고침하면 저장 복구를 가장하지 않고 시작 화면으로 돌아갑니다.

## 10. 예정 파일 구조

구현 요청을 받은 뒤 아래 독립 저장소를 새 Codex 작업공간으로 열어 작성합니다.

```text
ten-bundle-terminal/
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── playwright.config.ts
├── tsconfig.app.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── scripts/
│   ├── check-content.mjs
│   └── check-file-lengths.mjs
├── docs/
│   ├── curriculum-alignment.md
│   └── learning-model.md
├── src/
│   ├── main.tsx
│   ├── app/
│   │   ├── App.tsx
│   │   ├── session-reducer.ts
│   │   └── session-selectors.ts
│   ├── components/
│   │   ├── AppErrorBoundary.tsx
│   │   ├── AppHeader.tsx
│   │   ├── BundleShelf.tsx
│   │   ├── DeliverySummary.tsx
│   │   ├── ExchangeControls.tsx
│   │   ├── LooseParcelGrid.tsx
│   │   ├── MissionFeedback.tsx
│   │   ├── MissionIntro.tsx
│   │   ├── PlaceValueQuestion.tsx
│   │   ├── QuantityKeypad.tsx
│   │   ├── ReadingCardQuestion.tsx
│   │   ├── ResetDialog.tsx
│   │   ├── StartScreen.tsx
│   │   ├── TerminalBoard.tsx
│   │   ├── TutorialScreen.tsx
│   │   └── UpdateHistoryDialog.tsx
│   ├── content/
│   │   ├── changelog.ts
│   │   ├── feedback-copy.ts
│   │   ├── hints.ts
│   │   ├── reading-cards.ts
│   │   ├── summary-questions.ts
│   │   └── missions/
│   │       ├── boundary-missions.ts
│   │       ├── core-missions.ts
│   │       ├── index.ts
│   │       └── support-missions.ts
│   ├── domain/
│   │   ├── exchange.ts
│   │   ├── mission-review.ts
│   │   ├── mission-validator.ts
│   │   ├── place-value.ts
│   │   ├── quantity-review.ts
│   │   ├── summary-review.ts
│   │   └── types.ts
│   ├── styles/
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── layout.css
│   │   └── motion.css
│   └── test/
│       └── setup.ts
├── tests/
│   ├── components/
│   │   ├── DeliverySummary.test.tsx
│   │   ├── ExchangeControls.test.tsx
│   │   ├── QuantityKeypad.test.tsx
│   │   ├── StartScreen.test.tsx
│   │   ├── TerminalBoard.test.tsx
│   │   ├── TutorialScreen.test.tsx
│   │   └── UpdateHistoryDialog.test.tsx
│   ├── domain/
│   │   ├── exchange.test.ts
│   │   ├── mission-review.test.ts
│   │   ├── mission-validator.test.ts
│   │   ├── place-value.test.ts
│   │   ├── quantity-review.test.ts
│   │   └── summary-review.test.ts
│   └── state/
│       └── session-reducer.test.ts
└── e2e/
    ├── accessibility.spec.ts
    ├── learning-flow.spec.ts
    └── safety-and-network.spec.ts
```

### 파일 크기 원칙

- TypeScript, TSX, CSS, MJS, HTML 코드 파일은 모두 500줄 미만으로 유지합니다.
- 컴포넌트·도메인 파일은 250~300줄을 넘기기 전에 역할별로 분리합니다.
- `App.tsx`는 화면 조립과 상태 연결만 담당하고 200줄 미만을 목표로 합니다.
- 미션을 한 파일에 모두 넣지 않고 지원·핵심·경계 파일로 분리합니다.
- 수량 계산, 교환 연산, 미션 검토, 수량표 검토, 정리 질문 검토를 한 도메인 파일에 합치지 않습니다.
- `scripts/check-file-lengths.mjs`가 500줄 이상 코드 파일을 발견하면 품질 게이트를 실패 처리합니다.

## 11. 구현 작업 계획

아래 명령과 변경은 모두 **별도 구현 요청을 받은 뒤** 독립 저장소에서 실행합니다.

### Task 1: 정적 앱 뼈대와 품질 도구

**Files:**

- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/package.json`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/index.html`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/vite.config.ts`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/vitest.config.ts`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/playwright.config.ts`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/scripts/check-file-lengths.mjs`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/scripts/check-content.mjs`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/src/main.tsx`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/src/app/App.tsx`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/src/components/AppErrorBoundary.tsx`
- Create: `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal/src/test/setup.ts`

- [ ] **1.1 별도 작업공간에서 Vite React TypeScript 정적 앱과 Git 저장소를 구성합니다.**
- [ ] **1.2 Vitest, Testing Library, Playwright, `@axe-core/playwright`, ESLint와 `lint`, `typecheck`, `test`, `test:e2e`, `build`, `check:lines`, `check:content` 명령을 구성합니다.**
- [ ] **1.3 한국어 문서 언어, 정적 base path, `noscript`, 오류 경계, 모바일 viewport를 설정하되 사용자 확대를 막지 않습니다.**
- [ ] **1.4 외부 CDN·웹폰트·분석 도구·서비스 워커·브라우저 저장소가 기본 골격에 없음을 검사합니다.**
- [ ] **1.5 500줄 이상 코드 파일과 드래그·점수·타이머·외부 요청 사용을 검출하는 실패 검사를 먼저 확인합니다.**
- [ ] **1.6 린트·타입·빌드·검사 명령을 통과시키고 첫 커밋을 만듭니다.**

Run: `npm run lint && npm run typecheck && npm run build && npm run check:lines && npm run check:content`

Expected: 정적 앱 골격이 서버 기능과 드래그 기능 없이 빌드되고 모든 코드 파일이 500줄 미만입니다.

Commit: `chore: scaffold ten bundle terminal`

### Task 2: 자리값·묶기·풀기 도메인

**Files:**

- Create: `src/domain/types.ts`
- Create: `src/domain/place-value.ts`
- Create: `src/domain/exchange.ts`
- Test: `tests/domain/place-value.test.ts`
- Test: `tests/domain/exchange.test.ts`

- [ ] **2.1 8절의 표현·조작 타입과 오류 코드를 정의합니다.**
- [ ] **2.2 `calculateTotal`, `canonicalizeTotal`, 정수·범위·작업대 용량 검증의 실패 테스트를 작성합니다.**
- [ ] **2.3 `{0묶음,10낱개} → 묶기 → {1,0}`, `{1,0} → 풀기 → {0,10}` 테스트를 작성합니다.**
- [ ] **2.4 `{9,10} → 묶기 → {10,0}`에서 총량 100이 보존되고 `derivePlaceValueReading(100)`이 `십 묶음 10개 = 백 1개`, 자리 카드 `1·0·0`을 반환하는지 검증합니다.**
- [ ] **2.5 낱개 9개 묶기, 0묶음 풀기, 풀기 뒤 낱개 20개, 음수·소수·101 초과가 거부되고 입력이 바뀌지 않는지 검증합니다.**
- [ ] **2.6 0~100 모든 수의 표준 모습을 전수 계산하여 다시 같은 전체 수로 복원되는지 테스트합니다.**
- [ ] **2.7 가능한 모든 묶기·풀기에서 전후 총량이 같고 반대 조작으로 원래 상태가 복원되는지 전수 검사합니다.**
- [ ] **2.8 실패를 확인한 뒤 최소 순수 함수를 구현하고 도메인 테스트·타입 검사를 통과시킵니다.**

Run: `npm test -- place-value exchange && npm run typecheck`

Expected: 0·100 경계와 모든 교환 연산에서 총량·정수·불변성 계약을 만족합니다.

Commit: `feat: add place value exchange model`

### Task 3: 고정 미션 은행과 콘텐츠 검증

**Files:**

- Create: `src/domain/mission-validator.ts`
- Create: `src/content/reading-cards.ts`
- Create: `src/content/hints.ts`
- Create: `src/content/feedback-copy.ts`
- Create: `src/content/missions/support-missions.ts`
- Create: `src/content/missions/core-missions.ts`
- Create: `src/content/missions/boundary-missions.ts`
- Create: `src/content/missions/index.ts`
- Test: `tests/domain/mission-validator.test.ts`

- [ ] **3.1 중복 ID·순서, 총량 불일치, 도달 불가능 목표, 19개 초과 낱개, 잘못된 100 완료 카드의 실패 테스트를 작성합니다.**
- [ ] **3.2 정확히 9개 미션과 `0·9·10·19·20·40·42·99·100`의 고정 순서를 검증합니다.**
- [ ] **3.3 각 목표가 필수 조작으로 도달 가능하고 `conceptTags`가 실제 수·조작·확인·완료 카드와 일치하며 묶기·풀었다 다시 묶기·끝자리 0·역전·100 경계를 모두 포함하는지 검사합니다.**
- [ ] **3.4 수량표 정답은 `targetTotal`에서, 자리 관계 정답은 순수 함수에서 파생되고, 읽기 카드의 정답이 하나이며 방해 카드가 중복되지 않는지 검사합니다.**
- [ ] **3.5 100에 `십의 자리=10`, 0에 빈 읽기, 10에 `일십`, 100에 `일백` 문구가 들어가면 실패하게 합니다.**
- [ ] **3.6 한 자리 수에 십의 자리 문항이 있거나, 조작 포함 미션에 능동 확인이 2개 이상이거나, 전체 능동 응답 단계가 2개를 넘으면 실패하게 합니다.**
- [ ] **3.7 검수된 미션·읽기 카드·자리 관계 보기·힌트·피드백을 작성합니다.**
- [ ] **3.8 문제은행이 런타임 시간·난수·기기 정보와 무관한지 테스트합니다.**
- [ ] **3.9 콘텐츠·타입·검증 테스트를 통과시키고 커밋합니다.**

Run: `npm test -- mission-validator && npm run check:content && npm run typecheck`

Expected: 교육과정·경계값·오개념 계약을 만족하는 고정 9개 미션만 로드됩니다.

Commit: `feat: define reviewed terminal missions`

### Task 4: 미션 검토와 세션 리듀서

**Files:**

- Create: `src/domain/quantity-review.ts`
- Create: `src/domain/mission-review.ts`
- Create: `src/app/session-reducer.ts`
- Create: `src/app/session-selectors.ts`
- Test: `tests/domain/quantity-review.test.ts`
- Test: `tests/domain/mission-review.test.ts`
- Test: `tests/state/session-reducer.test.ts`

- [ ] **4.1 `TutorialAttempt`와 `intro → exchange/check → completion` 미션 단계를 판별 유니온 상태로 구성하는 실패 테스트를 작성합니다.**
- [ ] **4.2 수량 입력의 선행 0·빈 입력·범위 초과·42/24 역전과 `requiredChecks[checkIndex]` 한 항목 검토를 테스트합니다.**
- [ ] **4.3 묶기·풀기 성공 전 상태가 history에 추가되고 실패 조작은 history와 표현을 바꾸지 않는지 검증합니다.**
- [ ] **4.4 되돌리기가 표현·조작 기록·관련 피드백을 정확히 복원하는지 검증합니다.**
- [ ] **4.5 40 미션이 최종 모습만 같아서는 완료되지 않고 `풀기 → 묶기` 기록을 요구하는지 검증합니다.**
- [ ] **4.6 미완료 제출은 학생 작업을 유지하고, 마지막 확인 성공만 완료 상태·완료 ID를 원자적으로 만들며 임의 완료나 미완료 상태의 다음 이동을 거부하는지 검증합니다.**
- [ ] **4.7 업데이트 내역 모달과 초기화 모달이 학습 상태를 바꾸지 않고, 새로고침 복구용 저장 구조가 없는지 확인합니다.**
- [ ] **4.8 실패 테스트를 통과하는 검토 함수·리듀서·selector를 구현하고 타입 검사를 통과시킵니다.**

Run: `npm test -- quantity-review mission-review session-reducer && npm run typecheck`

Expected: 학생 작업을 지우지 않으면서 목표와 첫 미완료 요소를 결정적으로 검토합니다.

Commit: `feat: add terminal session state`

### Task 5: 앱 셸, 시작 화면과 짧은 연습

**Files:**

- Update: `src/app/App.tsx`
- Update: `src/components/AppErrorBoundary.tsx`
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/StartScreen.tsx`
- Create: `src/components/TutorialScreen.tsx`
- Create: `src/components/MissionIntro.tsx`
- Create: `src/components/ResetDialog.tsx`
- Create: `src/styles/base.css`
- Create: `src/styles/layout.css`
- Create: `src/styles/components.css`
- Test: `tests/components/StartScreen.test.tsx`
- Test: `tests/components/TutorialScreen.test.tsx`

- [ ] **5.1 시작 화면의 한 문장 목표, 개인정보 비수집, 새로고침 초기화, 업데이트 내역 진입을 찾는 테스트를 작성합니다.**
- [ ] **5.2 앱 셸과 오류 경계를 구현하되 `App.tsx`에 수량 계산·미션 정답·교환식을 넣지 않습니다.**
- [ ] **5.3 낱개 7개와 10개를 비교하고 첫 묶기를 버튼으로 수행하는 짧은 연습을 구현합니다.**
- [ ] **5.4 연습에서도 드래그·개별 낱개 선택 없이 Enter·Space·터치로 묶을 수 있게 합니다.**
- [ ] **5.5 단계 이동 뒤 제목 초점, 전체 초기화 확인, 48px 터치 영역을 검증합니다.**
- [ ] **5.6 컴포넌트 테스트, 린트, 타입 검사를 통과시키고 커밋합니다.**

Run: `npm test -- StartScreen TutorialScreen && npm run lint && npm run typecheck`

Expected: 저학년 학생이 한 문장 안내와 한 번의 버튼 조작으로 핵심 관계를 미리 경험합니다.

Commit: `feat: add terminal onboarding`

### Task 6: 택배 작업대와 드래그 없는 교환 조작

**Files:**

- Create: `src/components/TerminalBoard.tsx`
- Create: `src/components/BundleShelf.tsx`
- Create: `src/components/LooseParcelGrid.tsx`
- Create: `src/components/ExchangeControls.tsx`
- Create: `src/styles/motion.css`
- Test: `tests/components/TerminalBoard.test.tsx`
- Test: `tests/components/ExchangeControls.test.tsx`

- [ ] **6.1 시각 상자, 숫자, 수식, 접근성 요약이 모두 같은 selector 결과를 쓰는 실패 테스트를 작성합니다.**
- [ ] **6.2 묶기·풀기·되돌리기 버튼을 구현하고 UI와 reducer가 각각 조작 선행 조건을 검사하게 합니다.**
- [ ] **6.3 비활성 이유, 빠른 연속 탭, 작업대 19개 상한, 입력 객체 불변성을 검증합니다.**
- [ ] **6.4 조작 뒤 버튼이 계속 활성일 때는 초점을 유지하고, 비활성화되거나 단계가 끝나면 다음 필수 조작 또는 다음 단계 제목으로 초점을 옮기며 live region이 새 상태를 한 번만 읽는지 검증합니다.**
- [ ] **6.5 시각 택배는 중복 낭독되지 않고 색·모션 없이도 묶음·낱개·전체를 이해할 수 있게 합니다.**
- [ ] **6.6 `prefers-reduced-motion`에서는 애니메이션 없이 같은 상태를 즉시 표시합니다.**
- [ ] **6.7 드래그·스와이프·pointermove listener와 외부 이미지가 없음을 검사합니다.**
- [ ] **6.8 컴포넌트 테스트와 빌드를 통과시키고 커밋합니다.**

Run: `npm test -- TerminalBoard ExchangeControls && npm run build && npm run check:content`

Expected: 네이티브 버튼과 키보드만으로 모든 묶기·풀기 미션을 안정적으로 수행합니다.

Commit: `feat: add button based parcel exchange`

### Task 7: 배송 수량표, 읽기·자리 관계와 피드백

**Files:**

- Create: `src/components/QuantityKeypad.tsx`
- Create: `src/components/ReadingCardQuestion.tsx`
- Create: `src/components/PlaceValueQuestion.tsx`
- Create: `src/components/MissionFeedback.tsx`
- Test: `tests/components/QuantityKeypad.test.tsx`
- Update: `tests/domain/quantity-review.test.ts`
- Update: `tests/domain/mission-review.test.ts`

- [ ] **7.1 `<input type="text" inputMode="numeric">`와 화면 키패드가 같은 입력 action을 만들고 최대 3자리·0~100·선행 0을 정확히 검토하는지 테스트합니다.**
- [ ] **7.2 물리 숫자·Backspace·Enter는 수량 입력에 초점이 있을 때만 처리하고 전역 listener가 라디오·모달·브라우저 키를 가로채지 않는지 검증합니다.**
- [ ] **7.3 42/24, 끝자리 0, 100 경계 카드에 오류별 다음 단서가 나오고 입력 오류가 `aria-describedby`·`aria-invalid`로 연결되는지 검증합니다.**
- [ ] **7.4 읽기·자리 관계는 `fieldset`·`legend`와 네이티브 라디오로 만들고 Tab 진입, 방향키 이동, Space 선택을 보존하며 자유 한글·음성 입력이나 고유어 수사 오답 판정을 만들지 않습니다.**
- [ ] **7.5 현재 조작 모습이 맞으면 수량·읽기 오류가 묶음 상태를 초기화하지 않게 합니다.**
- [ ] **7.6 현재 한 가지 확인으로 초점을 옮기고 피드백을 `aria-live="polite"`로 한 번만 알립니다.**
- [ ] **7.7 오답 피드백이 정답을 자동 입력하거나 조작을 대신하지 않고, 마지막 필수 확인 성공만 미션을 완료하게 합니다.**
- [ ] **7.8 컴포넌트·도메인·키보드 테스트와 타입 검사를 통과시키고 커밋합니다.**

Run: `npm test -- QuantityKeypad quantity-review mission-review && npm run typecheck`

Expected: 수 쓰기·읽기·자리 관계 응답이 조작 상태와 분리되어 친절하게 검토됩니다.

Commit: `feat: add parcel quantity review`

### Task 8: 배송 정리표, 업데이트 내역과 접근성 마감

**Files:**

- Create: `src/components/DeliverySummary.tsx`
- Create: `src/components/UpdateHistoryDialog.tsx`
- Create: `src/content/changelog.ts`
- Create: `src/content/summary-questions.ts`
- Create: `src/domain/summary-review.ts`
- Test: `tests/components/DeliverySummary.test.tsx`
- Test: `tests/domain/summary-review.test.ts`
- Test: `tests/components/UpdateHistoryDialog.test.tsx`

- [ ] **8.1 배송 정리표에 `10개 묶기`, `1묶음 풀기`, `숫자 쓰기`, `수 읽기`, `100 경계`의 해 본 활동을 표시합니다.**
- [ ] **8.2 묶기 편리함과 `배송 수량표의 42` 의미에 관한 검수된 정리 질문 2개를 작성하고, 각 질문에 목표 부합 선택이 정확히 하나인지 검증합니다.**
- [ ] **8.3 선택별 설명을 제공하되 점수·시간·시도 횟수·연속 정답·통과 조건 없이 대표 묶기 전후 관계만 다시 보여 줍니다.**
- [ ] **8.4 작은 `업데이트 내역` 버튼과 이름 있는 모달을 구현하고 실제 터치 영역을 48×48px 이상으로 만듭니다.**
- [ ] **8.5 첫 구현 날짜는 구현 당일 KST 날짜로 확정하고 `첫 공개: 십 묶음·낱개 버튼 조작, 0~100 고정 미션, 배송 수량표 학습 추가`를 기록합니다.**
- [ ] **8.6 이후 미션·수량 모형·피드백·접근성 변경마다 날짜·버전·간단한 개선 내용을 최신순으로 추가합니다.**
- [ ] **8.7 업데이트 내역과 초기화 모달의 Escape, 초점 가두기, 호출 버튼 복귀를 검증합니다.**
- [ ] **8.8 320px·375px·768px·1280px, 200% 확대, 키보드, forced-colors, 모션 감소를 수동 검수합니다.**
- [ ] **8.9 접근성·컴포넌트·정리 질문 테스트와 타입 검사를 통과시키고 커밋합니다.**

Run: `npm test -- DeliverySummary summary-review UpdateHistoryDialog && npm run typecheck`

Expected: 점수 없는 학습 정리와 개발·개선 이력을 모든 화면 크기에서 확인할 수 있습니다.

Commit: `feat: add delivery summary and update history`

### Task 9: E2E, 교육 문서와 최종 품질 게이트

**Files:**

- Create: `e2e/learning-flow.spec.ts`
- Create: `e2e/accessibility.spec.ts`
- Create: `e2e/safety-and-network.spec.ts`
- Create: `docs/curriculum-alignment.md`
- Create: `docs/learning-model.md`
- Update: `README.md`
- Update: 필요 시 앞 단계의 테스트·스타일 파일

- [ ] **9.1 Playwright로 대표 전체 흐름과 회귀 테스트를 작성합니다.**

필수 E2E 사례:

1. 시작·짧은 연습부터 고정 9개 미션과 점수 없는 정리 질문 2개까지 완료합니다.
2. 드래그 없이 Tab·Shift+Tab·Enter·Space·방향키와 숫자·Backspace 키만으로 전체 흐름을 완료합니다.
3. `0묶음·10낱개 → 묶기 → 1묶음·0낱개`에서 전체 10이 보존됩니다.
4. `0묶음·19낱개 → 묶기 → 1묶음·9낱개`에서 전체 19가 보존됩니다.
5. 40 미션에서 `4묶음·0낱개 → 풀기 → 3묶음·10낱개 → 묶기 → 4묶음·0낱개`가 모두 40입니다.
6. `8묶음·19낱개 → 묶기 → 9묶음·9낱개`가 99이고 읽기 `구십구`와 일치합니다.
7. `9묶음·10낱개 → 묶기 → 10묶음·0낱개`가 100이며 경계 카드가 `십 묶음 10개 = 100개 = 백 1개`, 자리 `1·0·0`이고 십의 자리 답 `10`이 없습니다.
8. 낱개 9개, 십 묶음 0개, 풀기 뒤 낱개 20개에서 조작이 차단되고 이유 문구가 보입니다.
9. 빠른 연속 탭에서도 십 묶음·낱개가 음수가 되지 않고 전체 수가 바뀌지 않습니다.
10. 한 단계 되돌리기가 직전 표현·조작 기록·상태 안내를 정확히 복구합니다.
11. 미완성 제출과 잘못된 수량·읽기 선택이 현재 택배 상태를 지우지 않고 한 화면에 현재 확인 하나만 유지합니다.
12. 42에서 수량 24를 입력하면 순서를 안내하고, 수정 뒤 별도 한 문항에서 `십 묶음 4개 = 40개`를 확인합니다.
13. 9는 한 자리 `9`로 표시하고 십의 자리 문항을 내지 않으며, 0·10·20·40의 0은 빈칸이 아닌 수량으로 표시합니다.
14. 조작 후 live region은 새 상태를 한 번만 알리고, 비활성화된 조작 버튼의 초점은 다음 필수 조작 또는 다음 단계 제목으로 이동하며 시각 상자는 중복 낭독되지 않습니다.
15. 320×568, 375×812, 768×1024, 1280×800의 reflow 자동 검사에서 가로 스크롤·겹침·잘림이 없습니다. 실제 200% 확대는 수동 검수합니다.
16. `@axe-core/playwright` 검사에 심각한 위반이 없고 reduced-motion과 forced-colors에서도 동일한 수량·조작·초점 정보를 제공합니다.
17. 업데이트 내역 모달의 Escape·초점 가두기·호출 버튼 복귀가 동작합니다.
18. 드래그·점수·타이머·랜덤·브라우저 저장소·외부 요청·개인정보 입력·문서 전역 숫자 키 가로채기·콘솔 오류가 없습니다.

- [ ] **9.2 `learning-model.md`에 총량 공식, 묶기·풀기, 작업대 상한, 100 경계, 수량 쓰기·읽기 검토를 기록합니다.**
- [ ] **9.3 `curriculum-alignment.md`에 `[2수01-01]` 핵심 연결, 수량을 숫자로 기록하는 필요성 질문, `[2수01-02]` 부분 연결 한계, 성취수준 적용, 고유어 수사 비채점을 기록합니다.**
- [ ] **9.4 README에 대상, 10~15분 흐름, 실행·테스트 명령, 개인정보 비수집, 드래그 없음, 파일 길이 기준을 기록합니다.**
- [ ] **9.5 실제 Chrome 계열 브라우저에서 320px·375px·768px·1280px, 200% 확대, 키보드, 터치, 모션 감소, 고대비를 수동 확인하고, macOS VoiceOver로 시작→묶기→수량 입력→읽기 라디오→다음 미션→업데이트 내역 모달의 실제 낭독·초점 흐름을 통과합니다.**
- [ ] **9.6 초등 수학 관점에서 9개 미션의 수 범위·한자어 읽기·오개념 피드백, 한 화면 한 질문, 미션당 능동 응답 단계 최대 2개를 다시 검수합니다.**
- [ ] **9.7 전체 품질 게이트를 실행합니다.**

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
npm run check:lines
npm run check:content
git diff --check
git status --short
```

Expected:

- 린트·타입·단위·컴포넌트·E2E·정적 빌드가 모두 통과합니다.
- 단위·컴포넌트 테스트는 50개 이상, E2E는 18개 이상입니다.
- 0~100 표준 모습 전수 검사와 가능한 묶기·풀기의 총량 보존 검사가 통과합니다.
- 9개 미션과 수량·읽기·자리 관계 정답, 정리 질문 2개가 검수된 정적 데이터와 일치합니다.
- 모든 코드 파일이 500줄 미만입니다.
- 드래그, 외부 요청, 브라우저 저장, 학생 개인정보, 점수·타이머·랜덤 출제가 없습니다.
- 100을 `십의 자리 숫자 10`으로 나타내는 데이터나 문구가 없습니다.
- 계획과 구현에 필요한 파일만 변경되어 있습니다.

- [ ] **9.8 검수 결과와 알려진 제한을 README에 반영하고 구현 완료 커밋을 만듭니다.**

Commit: `docs: complete ten bundle quality checks`

## 12. 구현 역할과 진행 규칙

- `gpt-5.6-sol`은 계획 확정, 작업 분할, 교육과정 범위, 저학년 오개념 판단, 최종 오케스트레이션에만 사용합니다.
- 실제 코드 작성, 테스트 실행, 구현 리뷰는 `gpt-5.6-terra`가 담당합니다.
- 구현·리뷰 과정에서 하위 에이전트를 구성하면 `gpt-5.6-luna`를 사용합니다.
- 구현자는 Task 1부터 순서대로 진행하며 한 Task의 테스트와 검사가 끝나기 전 다음 Task로 넘어가지 않습니다.
- 현재 `vibecoding-lab` 저장소에는 이 계획 문서만 두고 실제 앱은 독립 저장소에서 구현합니다.
- 새 저장소를 만들기 전에 `/Users/kimhongnyeon/Dev/codex/ten-bundle-terminal`을 별도 Codex 작업공간으로 열거나 명시적 쓰기 권한을 확보합니다.
- 교육과정 연결, 수량 모형, 100 경계, 미션 값, 읽기 카드가 달라지면 구현보다 이 계획과 교육 문서를 먼저 갱신합니다.
- 수량 계산, 교환, 수량표 검토, 정리 질문 검토, 세션 상태, UI 모션을 한 파일이나 상태에 결합하지 않습니다.
- 실제 학생 데이터, 자동 난이도, 자유 수 만들기, 덧셈·뺄셈 확장은 MVP 범위 변경으로 보고 별도 교육 검토를 거칩니다.
- 각 커밋 전 `git diff --check`, 관련 테스트, `npm run check:lines`, `npm run check:content`를 실행합니다.
- 배포와 HVC 등록은 구현 완료와 별도의 승인 단계로 남깁니다.

## 13. 완료 조건

### 교육과정·학습

- [ ] `[2수01-01]`의 0~100 수 개념, 10개씩 묶음과 낱개, 읽기·쓰기를 직접 지원합니다.
- [ ] `[2수01-02]`는 일·십 자리의 부분 연결로만 설명하고 전체 달성을 주장하지 않습니다.
- [ ] 낱개 10개와 십 묶음 1개의 동치를 시각·숫자·문장으로 제공합니다.
- [ ] 묶기·풀기 전후 전체 수가 항상 보존됩니다.
- [ ] 0, 한 자리 수, 10, 19, 끝자리 0, 42/24, 99, 100 경계를 다룹니다.
- [ ] 숫자 쓰기와 검수된 한자어 읽기를 확인하되 자유 말하기·고유어 수사를 자동 채점하지 않습니다.
- [ ] `왜 10개씩 묶으면 편리한가`와 `수량표의 수는 무엇을 나타내는가`를 점수 없는 정리 질문으로 확인합니다.

### 오개념·콘텐츠

- [ ] 십 묶음 수와 십의 자리 숫자를 같은 용어로 표시하지 않습니다.
- [ ] 100을 `십의 자리 숫자 10`으로 표현하지 않고 `십 묶음 10개 = 100개 = 백 1개`와 자리 카드 `1·0·0`을 연결하되 조작물 수와 자리 숫자를 구분합니다.
- [ ] 한 자리 수 9에는 십의 자리 문항을 내지 않고 `십 묶음 0개, 낱개 9개, 한 자리 숫자 9`로 나타냅니다.
- [ ] 0을 빈칸으로 처리하지 않고 숫자·수량·읽기 `영`으로 표시합니다.
- [ ] 10·20·40·100을 `일십`, `이십 영`, `사십 영`, `일백`으로 읽지 않습니다.
- [ ] 문항 하나에서 묶기, 계산, 크기 비교 같은 여러 새 개념을 동시에 평가하지 않습니다.
- [ ] 한 화면에 능동 확인 하나만 표시하고 한 미션의 능동 응답 단계는 최대 2개입니다.
- [ ] 덧셈·뺄셈 계산, 백·천 묶음 조작, 자유 수 만들기가 없습니다.

### 조작·상태

- [ ] 모든 핵심 기능을 드래그 없이 버튼·키보드·터치로 완료합니다.
- [ ] 묶기·풀기는 정수·비음수·0~100·낱개 19개 작업대 불변식을 만족합니다.
- [ ] 불가능한 조작과 빠른 연속 탭이 상태를 바꾸지 않습니다.
- [ ] 되돌리기와 미션 초기화가 표현·조작 기록·피드백을 일관되게 복원합니다.
- [ ] 튜토리얼과 미션 하위 단계가 판별 유니온으로 구분되고, 마지막 확인 성공만 미션 완료와 완료 ID를 원자적으로 만듭니다.
- [ ] 미완료 확인과 수량·읽기 오류가 학생의 올바른 조작 상태를 지우지 않습니다.
- [ ] 고정 9개 미션이 같은 순서·값·피드백으로 재현됩니다.

### 사용성·접근성

- [ ] 모든 터치 대상이 48×48px 이상이고 버튼은 Enter·Space, 라디오는 방향키·Space로 동작합니다.
- [ ] 수량 입력은 이름 있는 텍스트 입력에서만 숫자·Backspace·Enter를 처리하고 전역 키를 가로채지 않습니다.
- [ ] 시각 택배와 같은 정보를 담은 숫자·수식·요약 문장이 있습니다.
- [ ] live region은 조작 결과를 한 번만 읽고 장식 택배는 중복 낭독되지 않습니다.
- [ ] 색·모션·소리 없이 묶음·낱개·전체·피드백을 이해할 수 있습니다.
- [ ] 320px·375px·768px·1280px·200% 확대에서 가로 스크롤이나 정보 손실이 없습니다.
- [ ] 모션 감소, 고대비, 모달 초점, 새 미션 초점 흐름이 올바릅니다.
- [ ] `@axe-core/playwright` 보조 검사와 macOS VoiceOver 실제 흐름 검수를 모두 통과합니다.

### 기술·운영

- [ ] 서버, 외부 API, 런타임 CDN, 브라우저 저장소 없이 정적 빌드로 동작합니다.
- [ ] 단위·컴포넌트 테스트 50개 이상과 E2E 18개 이상이 통과합니다.
- [ ] TypeScript, ESLint, 정적 빌드, 콘텐츠 검사, 파일 길이 검사, `git diff --check`가 통과합니다.
- [ ] 모든 코드 파일이 500줄 미만입니다.
- [ ] 실제 구현 날짜와 첫 공개 내용을 `업데이트 내역`에 기록하고 개선 때마다 최신순으로 추가합니다.
- [ ] 배포·HVC 등록은 별도 요청 전 수행하지 않습니다.

## 14. 후속 확장 후보

아래 항목은 MVP 완료 후 별도 교육 검토를 거치며 현재 구현 범위에 넣지 않습니다.

1. **자유 수 만들기:** 교사가 제시한 수를 버튼으로 구성하는 별도 샌드박스
2. **백 묶음 터미널:** 십 묶음 10개를 백 묶음 1개로 만들며 백의 자리까지 확장
3. **같은 수 여러 모습:** 53을 `5십 3일`, `4십 13일`, `3십 23일`로 비교하는 심화 모드
4. **받아올림·받아내림 연결:** 묶기·풀기를 두 자리 수 덧셈·뺄셈 원리와 연결
5. **교사용 미션 선택:** 서버 없이 검수된 미션 일부를 골라 수업 순서 구성
6. **인쇄용 교사 카드:** 앱 정답표가 아니라 묶음 교구 질문과 관찰 포인트 제공

후속 확장도 `총량 보존`, `드래그 없는 동등 조작`, `100 자리 표기 안전`, `실제 학생 자료 비수집`, `500줄 미만 파일`, `업데이트 내역 기록` 원칙을 유지해야 합니다.
