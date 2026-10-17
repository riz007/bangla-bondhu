import type { CurriculumItem } from "@/features/curriculum/schema";
import type { ActivityResult } from "@/features/progress/model";

export interface FeedbackDetail {
  headline?: string;
  answerText?: string;
  answerItemId?: string;
  chosenText?: string;
  chosenItemId?: string;
}

export interface ActivityViewProps<A> {
  activity: A;
  answered: ActivityResult | null;
  onAnswer: (result: ActivityResult, feedback: FeedbackDetail) => void;
  showTransliteration: (item: CurriculumItem) => boolean;
}
