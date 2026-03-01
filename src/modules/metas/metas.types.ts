export interface MonthlyGoal {
  id: string;
  user_id: string;
  month: string;
  name: string;
  essential_percent: number;
  leisure_percent: number;
  investment_percent: number;
  achieved: number | null;
  reason: string | null;
  created_at: string;
}

export interface CreateGoalDTO {
  month: string;
  name: string;
  essentialPercent: number;
  leisurePercent: number;
  investmentPercent: number;
}

export interface UpdateGoalDTO {
  name?: string;
  essentialPercent?: number;
  leisurePercent?: number;
  investmentPercent?: number;
}

export interface EvaluateGoalDTO {
  achieved: boolean;
  reason?: string;
}
