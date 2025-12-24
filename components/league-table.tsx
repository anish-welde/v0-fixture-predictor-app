"use client"

import { useMemo } from "react"
import { ChevronUp, ChevronDown, Minus } from "lucide-react"
import type { TeamStanding } from "@/lib/types"

interface LeagueTableProps {
  standings: TeamStanding[]
  baseStandings: TeamStanding[]
  visibleTeams: Set<string>
}

export function LeagueTable({ standings, baseStandings, visibleTeams }: LeagueTableProps) {
  const filteredStandings = useMemo(() => {
    return standings.filter((s) => visibleTeams.has(s.team))
  }, [standings, visibleTeams])

  const getPositionChange = (team: string) => {
    const oldPos = baseStandings.find((s) => s.team === team)?.rank ?? 0
    const newPos = standings.find((s) => s.team === team)?.rank ?? 0
    return oldPos - newPos // positive = moved up
  }

  const getZoneColor = (pos: number) => {
    if (pos <= 4) return "border-l-4 border-l-chart-3" // Champions League
    if (pos === 5) return "border-l-4 border-l-chart-2" // Europa League
    if (pos >= 18) return "border-l-4 border-l-destructive" // Relegation
    return ""
  }

  return (
    <div className="overflow-auto h-full">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-muted border-b border-border">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Pos</th>
            <th className="text-left py-3 px-4 font-semibold">Team</th>
            <th className="text-center py-3 px-2 font-semibold">P</th>
            <th className="text-center py-3 px-2 font-semibold">W</th>
            <th className="text-center py-3 px-2 font-semibold">D</th>
            <th className="text-center py-3 px-2 font-semibold">L</th>
            <th className="text-center py-3 px-2 font-semibold">GF</th>
            <th className="text-center py-3 px-2 font-semibold">GA</th>
            <th className="text-center py-3 px-2 font-semibold">GD</th>
            <th className="text-center py-3 px-4 font-semibold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {filteredStandings.map((standing) => {
            const posChange = getPositionChange(standing.team)
            const rank = standing.rank || 0
            const played = standing.played || 0
            const win = standing.win || 0
            const draw = standing.draw || 0
            const loss = standing.loss || 0
            const goalsFor = standing.goalsFor || 0
            const goalsAgainst = standing.goalsAgainst || 0
            const goalDifference = standing.goalDifference || 0
            const points = standing.points || 0

            return (
              <tr
                key={standing.team}
                className={`border-b border-border hover:bg-muted/50 transition-colors ${getZoneColor(rank)}`}
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold w-6 text-center">{rank}</span>
                    {posChange > 0 && (
                      <div className="flex items-center text-chart-3 text-xs">
                        <ChevronUp className="h-3 w-3" />
                        <span>{posChange}</span>
                      </div>
                    )}
                    {posChange < 0 && (
                      <div className="flex items-center text-destructive text-xs">
                        <ChevronDown className="h-3 w-3" />
                        <span>{Math.abs(posChange)}</span>
                      </div>
                    )}
                    {posChange === 0 && <Minus className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">{standing.team}</td>
                <td className="text-center py-3 px-2 text-muted-foreground">{played}</td>
                <td className="text-center py-3 px-2">{win}</td>
                <td className="text-center py-3 px-2">{draw}</td>
                <td className="text-center py-3 px-2">{loss}</td>
                <td className="text-center py-3 px-2">{goalsFor}</td>
                <td className="text-center py-3 px-2">{goalsAgainst}</td>
                <td className="text-center py-3 px-2 font-medium">
                  {goalDifference > 0 ? "+" : ""}
                  {goalDifference}
                </td>
                <td className="text-center py-3 px-4 font-bold">{points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
