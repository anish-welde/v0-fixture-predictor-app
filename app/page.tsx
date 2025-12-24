"use client"

import { useState, useMemo, useEffect } from "react"
import { FixturePanel } from "@/components/fixture-panel"
import { ResultsPanel } from "@/components/results-panel"
import { calculateStandings, calculatePositionHistory } from "@/lib/calculate-standings"
import type { Fixture, TeamStanding, Predictions } from "@/lib/types"

export default function Home() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [baseStandings, setBaseStandings] = useState<TeamStanding[]>([])
  const [predictions, setPredictions] = useState<Predictions>({})
  const [selectedGameweek, setSelectedGameweek] = useState<number>(1)
  const [viewMode, setViewMode] = useState<"table" | "chart">("table")
  const [visibleTeams, setVisibleTeams] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [fixturesRes, standingsRes] = await Promise.all([fetch("/fixtures.csv"), fetch("/standings.csv")])

        const fixturesText = await fixturesRes.text()
        const standingsText = await standingsRes.text()

        const parsed1 = parseCSV(fixturesText)
        const parsed2 = parseCSV(standingsText)

        let parsedFixtures: Fixture[]
        let parsedStandings: TeamStanding[]

        if (detectFixturesCSV(parsed1)) {
          parsedFixtures = processFixturesData(parsed1)
          parsedStandings = processStandingsData(parsed2)
        } else {
          parsedFixtures = processFixturesData(parsed2)
          parsedStandings = processStandingsData(parsed1)
        }

        console.log("[v0] Parsed fixtures count:", parsedFixtures.length)
        console.log("[v0] Parsed standings count:", parsedStandings.length)

        // Validation checks
        if (parsedFixtures.length !== 380) {
          console.error("[v0] ERROR: Expected 380 fixtures, got", parsedFixtures.length)
        }
        if (parsedStandings.length !== 20) {
          console.error("[v0] ERROR: Expected 20 standings, got", parsedStandings.length)
        }

        setFixtures(parsedFixtures)
        setBaseStandings(parsedStandings)
        setVisibleTeams(new Set(parsedStandings.map((s) => s.team)))

        setSelectedGameweek(18)
      } catch (error) {
        console.error("[v0] Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Calculate projected standings based on predictions
  const projectedStandings = useMemo(() => {
    return calculateStandings(baseStandings, fixtures, predictions)
  }, [baseStandings, fixtures, predictions])

  const positionHistory = useMemo(() => {
    if (viewMode !== "chart") {
      return {}
    }

    const predictionCount = Object.keys(predictions).length
    console.log("[v0] Chart mode active, predictions count:", predictionCount)

    if (predictionCount === 0) {
      console.log("[v0] No predictions yet, skipping position history calculation")
      return {}
    }

    console.log("[v0] Calculating position history for chart...")
    const start = performance.now()
    const result = calculatePositionHistory(baseStandings, fixtures, predictions)
    const end = performance.now()
    console.log("[v0] Position history calculated in", Math.round(end - start), "ms")
    return result
  }, [baseStandings, fixtures, predictions, viewMode])

  const handlePredictionChange = (fixtureId: string, home: number, away: number) => {
    setPredictions((prev) => ({
      ...prev,
      [fixtureId]: { home, away },
    }))
  }

  const handleViewModeChange = (mode: "table" | "chart") => {
    console.log("[v0] Switching view mode to:", mode)
    setViewMode(mode)

    if (mode === "chart") {
      const top6Teams = projectedStandings.slice(0, 6).map((s) => s.team)
      console.log("[v0] Limiting to top 6 teams:", top6Teams)
      setVisibleTeams(new Set(top6Teams))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fixtures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Premier League Fixture Predictor</h1>
          <p className="text-sm text-muted-foreground mt-1">Predict scores and see how they affect the table</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(400px,1fr)_2fr] h-full">
          {/* Fixture Panel - LHS */}
          <FixturePanel
            fixtures={fixtures}
            predictions={predictions}
            selectedGameweek={selectedGameweek}
            onGameweekChange={setSelectedGameweek}
            onPredictionChange={handlePredictionChange}
          />

          {/* Results Panel - RHS */}
          <ResultsPanel
            standings={projectedStandings}
            baseStandings={baseStandings}
            positionHistory={positionHistory}
            viewMode={viewMode}
            visibleTeams={visibleTeams}
            onViewModeChange={handleViewModeChange}
            onVisibleTeamsChange={setVisibleTeams}
          />
        </div>
      </div>
    </div>
  )
}

function parseCSV(csv: string): string[][] {
  return csv
    .trim()
    .split("\n")
    .map((line) => line.split(","))
}

function detectFixturesCSV(data: string[][]): boolean {
  const headers = data[0].map((h) => h.toLowerCase().trim())
  return headers.includes("league") && headers.includes("home") && headers.includes("away")
}

function processFixturesData(data: string[][]): Fixture[] {
  const headers = data[0]

  const fixturesWithDates = data.slice(1).map((row, index) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header.toLowerCase().trim()] = row[i]?.trim() || ""
    })

    // Parse date format YYYYMMDD
    const dateStr = obj.date || ""
    const year = dateStr.slice(0, 4)
    const month = dateStr.slice(4, 6)
    const day = dateStr.slice(6, 8)
    const formattedDate = `${year}-${month}-${day}`

    return {
      id: `fixture-${index}`,
      date: formattedDate,
      dateValue: Number.parseInt(dateStr) || 0,
      day: obj.day || "",
      time: obj.time || "",
      home: obj.home || "",
      homeScore: null, // No scores yet for 2025-26 season
      away: obj.away || "",
      awayScore: null,
      attendance: null,
      venue: "",
      referee: "",
      week: 0, // Will be calculated below
    }
  })

  // Sort by date and assign gameweeks (10 fixtures per gameweek)
  fixturesWithDates.sort((a, b) => a.dateValue - b.dateValue)
  const fixturesPerGameweek = 10
  return fixturesWithDates.map((fixture, index) => ({
    ...fixture,
    week: Math.floor(index / fixturesPerGameweek) + 1,
  }))
}

function processStandingsData(data: string[][]): TeamStanding[] {
  const headers = data[0]

  return data.slice(1).map((row, index) => {
    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header.toLowerCase().trim()] = row[i]?.trim() || ""
    })

    const played = Number.parseInt(obj.played) || 0
    const win = Number.parseInt(obj.won) || 0
    const draw = Number.parseInt(obj.drawn) || 0
    const loss = Number.parseInt(obj.lost) || 0
    const goalsFor = Number.parseInt(obj["goals for"]) || 0
    const goalsAgainst = Number.parseInt(obj["goals against"]) || 0
    const goalDifference = Number.parseInt(obj["goal difference"]) || 0
    const points = Number.parseInt(obj.points) || 0

    return {
      rank: index + 1, // Use position in array
      team: obj.team || "",
      played,
      win,
      draw,
      loss,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
      last5: obj.form || "", // Map "Form" column to last5
      topScorer: "",
      keeper: "",
    }
  })
}
