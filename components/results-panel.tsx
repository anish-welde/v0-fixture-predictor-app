"use client"

import { Button } from "@/components/ui/button"
import { LeagueTable } from "@/components/league-table"
import { PositionChart } from "@/components/position-chart"
import { TeamFilter } from "@/components/team-filter"
import { BarChart3, Table2 } from "lucide-react"
import type { TeamStanding, PositionHistory } from "@/lib/types"

interface ResultsPanelProps {
  standings: TeamStanding[]
  baseStandings: TeamStanding[]
  positionHistory: PositionHistory
  viewMode: "table" | "chart"
  visibleTeams: Set<string>
  onViewModeChange: (mode: "table" | "chart") => void
  onVisibleTeamsChange: (teams: Set<string>) => void
}

export function ResultsPanel({
  standings,
  baseStandings,
  positionHistory,
  viewMode,
  visibleTeams,
  onViewModeChange,
  onVisibleTeamsChange,
}: ResultsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Controls */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="gap-2"
            >
              <Table2 className="h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === "chart" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("chart")}
              className="gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Chart
            </Button>
          </div>

          <TeamFilter
            allTeams={standings.map((s) => s.team)}
            visibleTeams={visibleTeams}
            onVisibleTeamsChange={onVisibleTeamsChange}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === "table" ? (
          <LeagueTable standings={standings} baseStandings={baseStandings} visibleTeams={visibleTeams} />
        ) : (
          <PositionChart positionHistory={positionHistory} visibleTeams={visibleTeams} />
        )}
      </div>
    </div>
  )
}
