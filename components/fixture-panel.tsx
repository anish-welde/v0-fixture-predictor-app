"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Minus } from "lucide-react"
import type { Fixture, Predictions } from "@/lib/types"

interface FixturePanelProps {
  fixtures: Fixture[]
  predictions: Predictions
  selectedGameweek: number
  onGameweekChange: (gw: number) => void
  onPredictionChange: (fixtureId: string, home: number, away: number) => void
}

export function FixturePanel({
  fixtures,
  predictions,
  selectedGameweek,
  onGameweekChange,
  onPredictionChange,
}: FixturePanelProps) {
  const gameweeks = useMemo(() => {
    const gws = Array.from(new Set(fixtures.map((f) => Math.floor(f.week))))
      .sort((a, b) => a - b)
      .filter((gw) => gw >= 18 && gw <= 38)
    return gws
  }, [fixtures])

  const currentFixtures = useMemo(() => {
    const filtered = fixtures.filter((f) => Math.floor(f.week) === selectedGameweek)
    console.log(`[v0] GW${selectedGameweek} fixtures:`, filtered.length)
    return filtered
  }, [fixtures, selectedGameweek])

  const gameweekDates = useMemo(() => {
    if (currentFixtures.length === 0) return ""

    const dates = currentFixtures
      .filter((f) => f.date && f.date !== "")
      .map((f) => new Date(f.date))
      .filter((d) => !isNaN(d.getTime()))

    if (dates.length === 0) return ""

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

    const formatDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })

    if (minDate.getTime() === maxDate.getTime()) {
      return formatDate(minDate)
    }
    return `${formatDate(minDate)} - ${formatDate(maxDate)}`
  }, [currentFixtures])

  return (
    <div className="flex flex-col h-full border-r border-border bg-muted/30">
      {/* Gameweek Selector */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onGameweekChange(Math.max(18, selectedGameweek - 1))}
            disabled={selectedGameweek === gameweeks[0]}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={selectedGameweek.toString()}
            onValueChange={(value) => onGameweekChange(Number.parseInt(value))}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gameweeks.map((gw) => (
                <SelectItem key={gw} value={gw.toString()}>
                  Gameweek {gw}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onGameweekChange(Math.min(38, selectedGameweek + 1))}
            disabled={selectedGameweek === gameweeks[gameweeks.length - 1]}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">{gameweekDates}</p>
      </div>

      {/* Fixture Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentFixtures.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No fixtures for this gameweek</div>
        ) : (
          currentFixtures.map((fixture) => (
            <FixtureCard
              key={fixture.id}
              fixture={fixture}
              prediction={predictions[fixture.id]}
              onPredictionChange={(home, away) => onPredictionChange(fixture.id, home, away)}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface FixtureCardProps {
  fixture: Fixture
  prediction?: { home: number; away: number }
  onPredictionChange: (home: number, away: number) => void
}

function FixtureCard({ fixture, prediction, onPredictionChange }: FixtureCardProps) {
  const isCompleted = fixture.homeScore !== null && fixture.awayScore !== null
  const homeScore = isCompleted ? (fixture.homeScore ?? 0) : (prediction?.home ?? 0)
  const awayScore = isCompleted ? (fixture.awayScore ?? 0) : (prediction?.away ?? 0)

  const getPointsImpact = () => {
    if (homeScore > awayScore) return { home: 3, away: 0 }
    if (awayScore > homeScore) return { home: 0, away: 3 }
    return { home: 1, away: 1 }
  }

  const points = getPointsImpact()

  const formatDate = () => {
    if (!fixture.date) return ""
    const date = new Date(fixture.date)
    if (isNaN(date.getTime())) return ""
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
  }

  return (
    <Card className={`p-4 ${isCompleted ? "bg-muted/50" : "bg-card"}`}>
      <div className="space-y-3">
        {/* Teams */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-right">
            <p className={`font-medium ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}>{fixture.home}</p>
          </div>

          <div className="flex items-center gap-2">
            <ScoreInput value={homeScore} onChange={(v) => onPredictionChange(v, awayScore)} disabled={isCompleted} />
            <Minus className="h-4 w-4 text-muted-foreground" />
            <ScoreInput value={awayScore} onChange={(v) => onPredictionChange(homeScore, v)} disabled={isCompleted} />
          </div>

          <div className="flex-1">
            <p className={`font-medium ${isCompleted ? "text-muted-foreground" : "text-foreground"}`}>{fixture.away}</p>
          </div>
        </div>

        {/* Points Impact */}
        {!isCompleted && (
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${points.home > 0 ? "text-primary" : "text-muted-foreground"}`}>
              +{points.home} pts
            </span>
            <span className="text-muted-foreground">Points Impact</span>
            <span className={`font-medium ${points.away > 0 ? "text-primary" : "text-muted-foreground"}`}>
              +{points.away} pts
            </span>
          </div>
        )}

        {/* Match Info */}
        <div className="text-xs text-muted-foreground text-center">
          {fixture.day}
          {formatDate() && `, ${formatDate()}`} {fixture.time && `• ${fixture.time}`}
        </div>
      </div>
    </Card>
  )
}

interface ScoreInputProps {
  value: number
  onChange: (value: number) => void
  disabled: boolean
}

function ScoreInput({ value, onChange, disabled }: ScoreInputProps) {
  const safeValue = Number.isNaN(value) ? 0 : value

  return (
    <div
      className={`flex items-center justify-center w-12 h-10 rounded-md border ${
        disabled ? "bg-muted border-border" : "bg-background border-input"
      }`}
    >
      {disabled ? (
        <span className="text-lg font-bold text-muted-foreground">{safeValue}</span>
      ) : (
        <input
          type="number"
          min={0}
          max={15}
          value={safeValue}
          onChange={(e) => {
            const newValue = Number.parseInt(e.target.value)
            onChange(Number.isNaN(newValue) ? 0 : Math.max(0, Math.min(15, newValue)))
          }}
          className="w-full h-full text-center text-lg font-bold bg-transparent border-none outline-none"
        />
      )}
    </div>
  )
}
