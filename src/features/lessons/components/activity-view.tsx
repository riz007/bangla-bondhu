"use client";

import type { Activity, CurriculumItem } from "@/features/curriculum/schema";
import type { ActivityResult } from "@/features/progress/model";
import { ChoiceActivityView } from "./choice-activity";
import { IntroduceCard } from "./introduce-card";
import { MatchPairsActivityView } from "./match-pairs-activity";
import { MissingCharacterActivityView } from "./missing-character-activity";
import { SequenceActivityView } from "./sequence-activity";
import type { FeedbackDetail } from "./types";

interface ActivityViewProps {
  activity: Activity;
  answered: ActivityResult | null;
  onAnswer: (result: ActivityResult, feedback: FeedbackDetail) => void;
  onContinue: () => void;
  showTransliteration: (item: CurriculumItem) => boolean;
}

export function ActivityView({
  activity,
  answered,
  onAnswer,
  onContinue,
  showTransliteration,
}: ActivityViewProps) {
  const shared = { answered, onAnswer, showTransliteration };
  switch (activity.type) {
    case "introduce":
      return (
        <IntroduceCard
          activity={activity}
          onContinue={onContinue}
          showTransliteration={showTransliteration}
        />
      );
    case "listen-and-select":
    case "image-to-word":
    case "word-to-image":
    case "read-and-choose":
    case "recall":
      return <ChoiceActivityView activity={activity} {...shared} />;
    case "match-pairs":
      return <MatchPairsActivityView activity={activity} {...shared} />;
    case "build-syllable":
    case "build-word":
    case "listen-and-order":
      return <SequenceActivityView activity={activity} {...shared} />;
    case "missing-character":
      return <MissingCharacterActivityView activity={activity} {...shared} />;
  }
}
