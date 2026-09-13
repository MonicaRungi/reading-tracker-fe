export interface BooksByYear {
  year: number;
  count: number;
}

export interface GenreShare {
  genre: string;
  percent: number;
}

export interface Stats {
  total_books_read: number;
  total_pages_read: number;
  books_by_year: BooksByYear[];
  genres: GenreShare[];
}
