export interface BooksByYear {
  year: number;
  count: number;
}

export interface BooksByMonth {
  month: number; // 0-11
  count: number;
}

export interface GenreShare {
  genre: string;
  percent: number;
}

export interface ActivityDay {
  date: string;
  pages: number;
}

export interface ActivityWeek {
  label: string; // es. "8/9"
  pages: number;
}

export interface Stats {
  total_books_read: number;
  total_pages_read: number;
  total_in_reading: number;
  avg_rating: string | null;
  books_by_year: BooksByYear[];
  books_by_month: BooksByMonth[];
  genres: GenreShare[];
  activity_last7: ActivityDay[];
  activity_last6weeks: ActivityWeek[];
}
