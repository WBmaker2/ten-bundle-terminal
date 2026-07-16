export interface BonusAnswerFeedback {
  readonly isCorrect: boolean;
  readonly isPreferred: boolean;
  readonly message: string;
}

function parseRepresentation(choiceId: string): { bundles: number; loose: number } | null {
  const match = /^(\d+)-(\d+)$/.exec(choiceId);
  if (!match) return null;
  return { bundles: Number(match[1]), loose: Number(match[2]) };
}

export function evaluateBonusAnswer(total: number, choiceId: string, preferredId: string): BonusAnswerFeedback {
  const selected = parseRepresentation(choiceId);
  const preferred = parseRepresentation(preferredId);
  if (!selected || !preferred || (selected.bundles * 10) + selected.loose !== total) {
    return {
      isCorrect: false,
      isPreferred: false,
      message: "묶음 수에 10을 곱한 뒤 낱개를 더해 보세요.",
    };
  }

  if (choiceId === preferredId) {
    return {
      isCorrect: true,
      isPreferred: true,
      message: `${total}개를 가장 간단한 묶음 모습으로 나타냈어요.`,
    };
  }

  return {
    isCorrect: true,
    isPreferred: false,
    message: `${selected.bundles}묶음 ${selected.loose}낱개도 모두 ${total}개예요. 낱개를 다시 묶으면 ${preferred.bundles}묶음 ${preferred.loose}낱개로 더 간단히 정리할 수 있어요.`,
  };
}
