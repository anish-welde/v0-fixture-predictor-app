"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter } from "lucide-react"

interface TeamFilterProps {
  allTeams: string[]
  visibleTeams: Set<string>
  onVisibleTeamsChange: (teams: Set<string>) => void
}

export function TeamFilter({ allTeams, visibleTeams, onVisibleTeamsChange }: TeamFilterProps) {
  const toggleTeam = (team: string) => {
    const newVisible = new Set(visibleTeams)
    if (newVisible.has(team)) {
      newVisible.delete(team)
    } else {
      newVisible.add(team)
    }
    onVisibleTeamsChange(newVisible)
  }

  const selectAll = () => {
    onVisibleTeamsChange(new Set(allTeams))
  }

  const clearAll = () => {
    onVisibleTeamsChange(new Set())
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Teams ({visibleTeams.size}/{allTeams.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-96 overflow-y-auto">
        <div className="flex gap-2 p-2">
          <Button variant="outline" size="sm" onClick={selectAll} className="flex-1 bg-transparent">
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} className="flex-1 bg-transparent">
            Clear All
          </Button>
        </div>
        <DropdownMenuSeparator />
        {allTeams.map((team) => (
          <DropdownMenuCheckboxItem
            key={team}
            checked={visibleTeams.has(team)}
            onCheckedChange={() => toggleTeam(team)}
          >
            {team}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
