export const METRIC_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $year: Int, $season: MediaSeason) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(sort: $sort, type: ANIME, season: $season, seasonYear: $year) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      description
      averageScore
      episodes
      season
      seasonYear
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
      format
      status
      genres
      studios {
        nodes {
          name
        }
      }
      popularity
      trending
    }
  }
}
`