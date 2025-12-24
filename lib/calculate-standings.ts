import type { Fixture, TeamStanding, Predictions } from "./types"

export function calculateStandings(
  baseStandings: TeamStanding[],
  fixtures: Fixture[],
  predictions: Predictions,
): TeamStanding[] {
  const standings = baseStandings.map((s) => ({
    ...s,
    played: s.played,
    win: s.win,
    draw: s.draw,
    loss: s.loss,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalDifference,
    points: s.points,
  }))

  const standingsMap = new Map(standings.map((s) => [s.team, s]))

  // Apply predictions to future fixtures
  fixtures.forEach((fixture) => {
    const prediction = predictions[fixture.id]
    if (prediction) {
      const homeTeam = standingsMap.get(fixture.home)
      const awayTeam = standingsMap.get(fixture.away)

      if (homeTeam && awayTeam) {
        homeTeam.played++
        awayTeam.played++

        homeTeam.goalsFor += prediction.home
        homeTeam.goalsAgainst += prediction.away
        awayTeam.goalsFor += prediction.away
        awayTeam.goalsAgainst += prediction.home

        if (prediction.home > prediction.away) {
          homeTeam.win++
          homeTeam.points += 3
          awayTeam.loss++
        } else if (prediction.home < prediction.away) {
          awayTeam.win++
          awayTeam.points += 3
          homeTeam.loss++
        } else {
          homeTeam.draw++
          awayTeam.draw++
          homeTeam.points++
          awayTeam.points++
        }

        homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst
        awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst
      }
    }
  })

  // Sort by points, then goal difference, then goals for
  const sorted = Array.from(standingsMap.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Update rank to reflect new positions
  return sorted.map((team, index) => ({
    ...team,
    rank: index + 1,
  }))
}

export function calculatePositionHistory(
  baseStandings: TeamStanding[],
  fixtures: Fixture[],
  predictions: Predictions,
): Record<string, number[]> {
  const predictionCount = Object.keys(predictions).length
  console.log("[v0] Starting position history calculation with", predictionCount, "predictions...")

  const startGW = 18
  const endGW = 38

  // Initialize position history for each team with base standings positions for all gameweeks
  const history: Record<string, number[]> = {}

  // Sort base standings to get initial positions
  const sortedBase = [...baseStandings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    return b.goalsFor - a.goalsFor
  })

  // Initialize all gameweeks with the base position
  sortedBase.forEach((team, index) => {
    const position = index + 1
    history[team.team] = new Array(38).fill(position)
  })

  // Create a working copy of standings that we'll mutate incrementally
  const workingStandings = new Map(
    baseStandings.map((s) => [
      s.team,
      {
        team: s.team,
        played: s.played,
        win: s.win,
        draw: s.draw,
        loss: s.loss,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
        goalDifference: s.goalDifference,
        points: s.points,
      },
    ]),
  )

  const fixturesByGameweek = new Map<number, Fixture[]>()
  fixtures.forEach((fixture) => {
    if (fixture.week >= startGW && fixture.week <= endGW) {
      if (!fixturesByGameweek.has(fixture.week)) {
        fixturesByGameweek.set(fixture.week, [])
      }
      fixturesByGameweek.get(fixture.week)!.push(fixture)
    }
  })

  console.log("[v0] Processing gameweeks", startGW, "to", endGW)

  for (let gw = startGW; gw <= endGW; gw++) {
    // Apply this gameweek's predictions to working standings
    const gwFixtures = fixturesByGameweek.get(gw) || []

    gwFixtures.forEach((fixture) => {
      const prediction = predictions[fixture.id]
      if (prediction) {
        const homeTeam = workingStandings.get(fixture.home)
        const awayTeam = workingStandings.get(fixture.away)

        if (homeTeam && awayTeam) {
          homeTeam.played++
          awayTeam.played++

          homeTeam.goalsFor += prediction.home
          homeTeam.goalsAgainst += prediction.away
          awayTeam.goalsFor += prediction.away
          awayTeam.goalsAgainst += prediction.home

          if (prediction.home > prediction.away) {
            homeTeam.win++
            homeTeam.points += 3
            awayTeam.loss++
          } else if (prediction.home < prediction.away) {
            awayTeam.win++
            awayTeam.points += 3
            homeTeam.loss++
          } else {
            homeTeam.draw++
            awayTeam.draw++
            homeTeam.points++
            awayTeam.points++
          }

          homeTeam.goalDifference = homeTeam.goalsFor - homeTeam.goalsAgainst
          awayTeam.goalDifference = awayTeam.goalsFor - awayTeam.goalsAgainst
        }
      }
    })

    // Sort and record positions for this gameweek
    const sorted = Array.from(workingStandings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })

    sorted.forEach((team, index) => {
      history[team.team][gw - 1] = index + 1
    })
  }

  console.log("[v0] Position history calculation complete")
  return history
}
