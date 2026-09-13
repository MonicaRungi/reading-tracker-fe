export interface BooksByYear {
  year: number
  count: number
}

export interface GenreShare {
  genre: string
  percent: number
}

export interface Stats {
  totalBooksRead: number
  totalPagesRead: number
  booksByYear: BooksByYear[]
  genres: GenreShare[]
}
