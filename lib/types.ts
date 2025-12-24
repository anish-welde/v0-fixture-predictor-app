export interface Fixture {
  id: string
  week: number
  day: string
  date: string
  time: string
  home: string
  homeScore: number | null
  away: string
  awayScore: number | null
  attendance: number | null
  venue: string
  referee: string
}

export interface TeamStanding {
  rank: number
  team: string
  played: number
  win: number
  draw: number
  loss: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  last5: string
  topScorer: string
  keeper: string
}

export interface Predictions {
  [fixtureId: string]: {
    home: number
    away: number
  }
}

export interface PositionHistory {
  [team: string]: number[]
}
