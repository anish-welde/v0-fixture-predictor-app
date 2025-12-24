"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { PositionHistory } from "@/lib/types"

interface PositionChartProps {
  positionHistory: PositionHistory
  visibleTeams: Set<string>
}

const TEAM_COLORS: Record<string, string> = {
  Liverpool: "#E31B23",
  Arsenal: "#EF0107",
  "Manchester City": "#6CABDD",
  "Newcastle United": "#241F20",
  Chelsea: "#034694",
  "Aston Villa": "#95BFE5",
  "Nottingham Forest": "#DD0000",
  "Brighton & Hove Albion": "#0057B8",
  Brentford: "#FBB800",
  Fulham: "#000000",
  "AFC Bournemouth": "#DA291C",
  "Crystal Palace": "#1B458F",
  Everton: "#003399",
  "Wolverhampton Wanderers": "#FDB913",
  "West Ham United": "#7A263A",
  "Manchester United": "#DA291C",
  "Tottenham Hotspur": "#132257",
  "Leeds United": "#FFCD00",
  Sunderland: "#EB172B",
  Burnley: "#6C1D45",
}

export function PositionChart({ positionHistory, visibleTeams }: PositionChartProps) {
  const hasData = Object.keys(positionHistory).length > 0

  const chartData = useMemo(() => {
    const startGW = 18
    const endGW = 38

    return Array.from({ length: endGW - startGW + 1 }, (_, i) => {
      const gw = startGW + i
      const dataPoint: Record<string, string | number> = { gameweek: `GW${gw}` }

      Object.entries(positionHistory).forEach(([team, positions]) => {
        if (visibleTeams.has(team)) {
          // Use index gw - 1 to access position history (0-indexed)
          dataPoint[team] = positions[gw - 1] || 20
        }
      })

      return dataPoint
    })
  }, [positionHistory, visibleTeams])

  const visibleTeamsArray = useMemo(() => {
    return Array.from(visibleTeams).sort()
  }, [visibleTeams])

  if (!hasData) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground mb-4">Loading chart data...</p>
        </div>
      </div>
    )
  }

  if (visibleTeamsArray.length > 20) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <p className="text-muted-foreground mb-4">
            Too many teams selected ({visibleTeamsArray.length}). Please select 20 or fewer teams for optimal chart
            performance.
          </p>
          <p className="text-sm text-muted-foreground">
            Use the team filter in the top-right corner to select fewer teams.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 w-full relative" style={{ height: "550px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 120, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="gameweek"
            stroke="#374151"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: "#374151" }}
            tickLine={{ stroke: "#374151" }}
            axisLine={{ stroke: "#374151" }}
            interval={1}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            reversed
            domain={[1, 20]}
            ticks={[1, 5, 10, 15, 20]}
            label={{ value: "Position", angle: -90, position: "insideLeft", fill: "#374151" }}
            stroke="#374151"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: "#374151" }}
            tickLine={{ stroke: "#374151" }}
            axisLine={{ stroke: "#374151" }}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              color: "#1f2937",
            }}
            labelFormatter={(label) => `${label}`}
            formatter={(value: number, name: string) => [`Position ${value}`, name]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: "20px" }}
          />
          {visibleTeamsArray.map((team) => (
            <Line
              key={team}
              type="monotone"
              dataKey={team}
              stroke={TEAM_COLORS[team] || "#6366f1"}
              strokeWidth={2}
              dot={false}
              name={team}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
