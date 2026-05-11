export type CurrencyOption = {
  code: string;
  name: string;
};

export type AnalyzeRequest = {
  base: string;
  symbols: string[];
  start_date: string;
  end_date: string;
};

export type CurrencyStat = {
  code: string;
  latest_rate: number | null;
  average_rate: number | null;
  min_rate: number | null;
  max_rate: number | null;
  data_points: number;
};

export type AnalyzeResponse = {
  base: string;
  start_date: string;
  end_date: string;
  strongest_currency: string | null;
  weakest_currency: string | null;
  stats: CurrencyStat[];
  series: Record<string, Record<string, number>>;
};