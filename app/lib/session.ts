import { applyExchange, undoLastOperation, validateQuantityEntry } from "./math";
import { missions } from "./missions";
import type { ExchangeAction, Representation } from "./types";

export type MissionPhase = "intro" | "exchange" | "check" | "complete";

export interface SessionState {
  readonly view: "start" | "tutorial" | "mission" | "summary";
  readonly tutorialStep: "seven" | "ten" | "complete";
  readonly missionIndex: number;
  readonly phase: MissionPhase;
  readonly current: Representation;
  readonly history: readonly Representation[];
  readonly actionHistory: readonly ExchangeAction[];
  readonly checkIndex: number;
  readonly numericInput: string;
  readonly selection: string;
  readonly feedback: string;
  readonly completed: readonly string[];
  readonly summaryAnswers: Readonly<Record<string, string>>;
  readonly updateHistoryOpen: boolean;
  readonly resetDialogOpen: boolean;
}

export const initialSession: SessionState = {
  view: "start",
  tutorialStep: "seven",
  missionIndex: 0,
  phase: "intro",
  current: missions[0].initial,
  history: [],
  actionHistory: [],
  checkIndex: 0,
  numericInput: "",
  selection: "",
  feedback: "",
  completed: [],
  summaryAnswers: {},
  updateHistoryOpen: false,
  resetDialogOpen: false,
};

export type SessionAction =
  | { type: "START_TUTORIAL" }
  | { type: "NEXT_TUTORIAL" }
  | { type: "BUNDLE_TUTORIAL" }
  | { type: "START_MISSIONS" }
  | { type: "OPEN_MISSION" }
  | { type: "APPLY_EXCHANGE"; action: ExchangeAction }
  | { type: "UNDO_EXCHANGE" }
  | { type: "CHECK_EXCHANGE" }
  | { type: "SET_NUMERIC"; value: string }
  | { type: "SET_SELECTION"; value: string }
  | { type: "SUBMIT_CHECK" }
  | { type: "NEXT_MISSION" }
  | { type: "RESET_MISSION" }
  | { type: "ANSWER_SUMMARY"; questionId: string; choiceId: string }
  | { type: "OPEN_UPDATES" }
  | { type: "CLOSE_UPDATES" }
  | { type: "OPEN_RESET" }
  | { type: "CLOSE_RESET" }
  | { type: "RESTART" };

function missionState(index: number): Partial<SessionState> {
  return {
    view: "mission",
    missionIndex: index,
    phase: "intro",
    current: missions[index].initial,
    history: [],
    actionHistory: [],
    checkIndex: 0,
    numericInput: "",
    selection: "",
    feedback: "",
  };
}

function completeCheck(state: SessionState): SessionState {
  const mission = missions[state.missionIndex];
  if (state.checkIndex + 1 < mission.checks.length) {
    return { ...state, checkIndex: state.checkIndex + 1, numericInput: "", selection: "", feedback: "" };
  }
  return {
    ...state,
    phase: "complete",
    completed: state.completed.includes(mission.id)
      ? state.completed
      : [...state.completed, mission.id],
    feedback: mission.completion,
  };
}

export function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  const mission = missions[state.missionIndex];
  switch (action.type) {
    case "START_TUTORIAL":
      return { ...initialSession, view: "tutorial", tutorialStep: "seven" };
    case "NEXT_TUTORIAL":
      if (state.tutorialStep === "seven") return { ...state, tutorialStep: "ten" };
      if (state.tutorialStep === "complete") return { ...state, ...missionState(0) };
      return state;
    case "BUNDLE_TUTORIAL":
      return state.tutorialStep === "ten" ? { ...state, tutorialStep: "complete" } : state;
    case "START_MISSIONS":
      return { ...state, ...missionState(0) };
    case "OPEN_MISSION":
      return { ...state, phase: mission.requiredActions.length ? "exchange" : "check", feedback: "" };
    case "APPLY_EXCHANGE": { const result = applyExchange(state.current, action.action);
      if (!result.ok) {
        const messages = {
          "not-enough-loose": `낱개가 ${state.current.loose}개예요. 10개가 있어야 묶을 수 있어요.`,
          "no-ten-bundle": "풀 수 있는 십 묶음이 없어요.",
          "workspace-capacity": "작업대에는 낱개를 19개까지만 놓을 수 있어요.",
          "ten-bundle-limit": "십 묶음 10개는 100개예요. 더 묶지 않아요.",
        };
        return { ...state, feedback: messages[result.error] };
      }
      return {
        ...state,
        current: result.value,
        history: [...state.history, state.current],
        actionHistory: [...state.actionHistory, action.action],
        feedback: `${action.action === "bundle" ? "묶었습니다" : "풀었습니다"}. 모두 ${mission.total}개입니다.`,
      };
    }
    case "UNDO_EXCHANGE": { const undone = undoLastOperation(state.current, state.history);
      if (!state.history.length) return { ...state, feedback: "되돌릴 조작이 없어요." };
      return { ...state, current: undone.value, history: undone.history, actionHistory: state.actionHistory.slice(0, -1), feedback: "한 단계 되돌렸어요." };
    }
    case "CHECK_EXCHANGE": {
      const representationMatches = state.current.bundles === mission.goal.bundles && state.current.loose === mission.goal.loose;
      const sequenceMatches = mission.requiredActions.every((required, index) => state.actionHistory[index] === required)
        && state.actionHistory.length === mission.requiredActions.length;
      if (!representationMatches) return { ...state, feedback: "목표 모습과 아직 달라요. 묶음과 낱개를 살펴보세요." };
      if (!sequenceMatches) return { ...state, feedback: "이번 배송에서 필요한 조작 순서를 차례로 해 보세요." };
      return { ...state, phase: "check", feedback: "모양이 맞아요. 수량을 확인해 볼까요?" };
    }
    case "SET_NUMERIC":
      return /^\d{0,3}$/.test(action.value) ? { ...state, numericInput: action.value, feedback: "" } : state;
    case "SET_SELECTION":
      return { ...state, selection: action.value, feedback: "" };
    case "SUBMIT_CHECK": { const check = mission.checks[state.checkIndex];
      if (check.kind === "quantity") {
        const review = validateQuantityEntry(state.numericInput, mission.total);
        return review.status === "correct" ? completeCheck(state) : { ...state, feedback: review.message };
      }
      if (!state.selection) return { ...state, feedback: "답을 하나 골라 보세요." };
      const expected = String(check.answer);
      if (state.selection !== expected) {
        return { ...state, feedback: check.kind === "place" ? "십 묶음 하나가 10개라는 것을 떠올려 보세요." : "현재 수를 천천히 다시 읽어 보세요." };
      }
      return completeCheck(state);
    }
    case "NEXT_MISSION":
      if (state.phase !== "complete") return state;
      if (state.missionIndex === missions.length - 1) return { ...state, view: "summary", feedback: "" };
      return { ...state, ...missionState(state.missionIndex + 1) };
    case "RESET_MISSION":
      return { ...state, ...missionState(state.missionIndex), resetDialogOpen: false };
    case "ANSWER_SUMMARY":
      return { ...state, summaryAnswers: { ...state.summaryAnswers, [action.questionId]: action.choiceId } };
    case "OPEN_UPDATES": return { ...state, updateHistoryOpen: true };
    case "CLOSE_UPDATES": return { ...state, updateHistoryOpen: false };
    case "OPEN_RESET": return { ...state, resetDialogOpen: true };
    case "CLOSE_RESET": return { ...state, resetDialogOpen: false };
    case "RESTART": return initialSession;
    default: return state;
  }
}
