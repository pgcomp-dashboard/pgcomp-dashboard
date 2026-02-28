export interface Area {
  id: number;
  name: string;
  students_count: number;
}

export interface Course {
  id: number;
  name: string;
}

export interface StratumQualis {
  id: number;
  type: string;
  code: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Publisher {
  id: number;
  initials: string | null;
  name: string;
  publisher_type: string;
  issns: string[];
  percentile: string | null;
  update_date: string | null;
  tentative_date: string | null;
  logs: string | null;
  stratum_qualis_id: number | null;
  created_at: string;
  updated_at: string;
  stratum_qualis: StratumQualis | null;
  is_approved?: boolean;
}

export interface Production {
  id: number;
  title: string;
  year: number;
  created_at: string;
  updated_at: string;
  publisher_type: string | null;
  publisher_id: number | null;
  last_qualis: string | null;
  stratum_qualis_id: number | null;
  sequence_number: number | null;
  doi: string | null;
  home_page: string | null;
  nature: string | null;
  publisher: Publisher | null;
  source: string;
}

export type RankingProduction = Pick<
  Production,
  "title" | "year" | "publisher_type"
> & {
  id: number;
  code: string;
  score: number;
};

export type Ranking = {
  user_id: number;
  name: string;
  category: string;
  total_score: number;
  lattes_url: string;
  productions: RankingProduction[];
};
