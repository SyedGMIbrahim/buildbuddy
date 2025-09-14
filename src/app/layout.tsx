"use client"

import React, { useMemo, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

// types.ts (or inline here if only used once)
type Member = {
  id: string
  name: string
  role: string
  src?: string
}

// data/members.ts
const MEMBERS: Member[] = [
  { id: "1", name: "AMAN DEOL", role: "Technical Head" },
  { id: "2", name: "RIYA KORADWAR", role: "Manager Lead" },
  { id: "3", name: "ARCHIE JAIN", role: "Publicity Lead" },
  { id: "4", name: "RAGHAV MIGLANI", role: "General Secretary" },
  { id: "5", name: "CHINMAY SINHA", role: "Chairperson" },
  { id: "6", name: "MANAN AGARWAL", role: "Vice Chairperson" },
  { id: "7", name: "MANSI SAXENA", role: "Co Secretary" },
  { id: "8", name: "Daksh Chaudhary", role: "Project Lead" },
  { id: "9", name: "PRABHAT PANDEY", role: "R&D Lead" },
  { id: "10", name: "OJAS NAHTA", role: "Android Lead" },
]

export default function Dock() {
  const railRef = useRef<HTMLDivElement | null>(null)
  const [mouseX, setMouseX] = useState<number | null>(null)
  const [selected, setSelected] = useState<Member | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!railRef.current) return
    const rect = railRef.current.getBoundingClientRect()
    setMouseX(e.clientX - rect.left)
  }, [])

  const onMouseLeave = useCallback(() => {
    setMouseX(null)
    setHoveredId(null)
  }, [])

  const centers = useMemo(() => new Map<string, number>(), [])
  const setCenter = useCallback((id: string, el: HTMLButtonElement | null) => {
    if (!el || !railRef.current) return
    const left = railRef.current.getBoundingClientRect().left
    const r = el.getBoundingClientRect()
    centers.set(id, r.left - left + r.width / 2)
  }, [centers])

  const computeScale = useCallback((id: string) => {
    if (mouseX == null) return 1
    const center = centers.get(id)
    if (center == null) return 1
    const distance = Math.abs(mouseX - center)
    const radius = 120
    const maxBoost = 0.5
    if (distance >= radius) return 1
    return Number((1 + maxBoost * (1 - distance / radius)).toFixed(3))
  }, [mouseX, centers])

  const centerItem = useCallback((btn: HTMLButtonElement | null) => {
    btn?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
  }, [])

  return (
    <div className="w-full">
      {/* Background */}
      <div className="absolute left-0 h-full md:h-[1800px] lg:h-[1945px] w-[600px] md:w-[800px] lg:w-[2000px] -z-10">
        <Image
          src="/bg-design-3.svg"
          alt="Background Design"
          fill
          className="object-contain object-left"
          priority
        />
      </div>

      {/* Heading */}
      <div className="flex justify-center">
        <Image src="/ourTeam.svg" alt="Our Team" width={800} height={130} />
      </div>

      {/* Dock Rail */}
      <div
        onMouseEnter={() => window.scrollBy({ top: 90, behavior: "smooth" })}
        className="relative mx-auto mt-20 max-w-[980px] rounded-3xl border border-white/20 bg-white/10 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.25)] backdrop-blur-md transition-all duration-1000 ease-in-out"
      >
        <div className="overflow-visible">
          <div
            ref={railRef}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            className={cn(
              "flex items-end gap-5 overflow-x-auto px-2 pb-2 pt-1",
              "md:justify-center md:overflow-visible md:px-10",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
            )}
            role="listbox"
            aria-label="Team member dock"
          >
            {MEMBERS.map((m) => (
              <MemoizedDockItem
                key={m.id}
                member={m}
                computeScale={computeScale}
                setCenter={setCenter}
                onSelect={(mem, btn) => {
                  setSelected(mem)
                  centerItem(btn)
                }}
                isActive={selected?.id === m.id}
                isHovered={hoveredId === m.id}
                onHover={setHoveredId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DockItem({
  member,
  computeScale,
  setCenter,
  onSelect,
  isActive,
  isHovered,
  onHover,
}: {
  member: Member
  computeScale: (id: string) => number
  setCenter: (id: string, el: HTMLButtonElement | null) => void
  onSelect: (m: Member, el: HTMLButtonElement | null) => void
  isActive: boolean
  isHovered: boolean
  onHover: (id: string | null) => void
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const scale = computeScale(member.id)
  const isExpanded = isHovered && scale > 1.1

  return (
    <button
      ref={(el) => {
        btnRef.current = el
        setCenter(member.id, el)
      }}
      onMouseEnter={() => onHover(member.id)}
      onFocus={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
      onBlur={() => onHover(null)}
      onClick={() => onSelect(member, btnRef.current)}
      role="option"
      aria-selected={isActive}
      aria-expanded={isExpanded}
      aria-label={`${member.name}, ${member.role}`}
      className={cn(
        "relative inline-flex flex-shrink-0 items-center justify-center",
        "aspect-square w-16 rounded-lg bg-neutral-300/90 text-black",
        "transition-transform duration-200 ease-out will-change-transform",
        "shadow-[0_6px_20px_rgba(2,6,23,0.25)] ring-1 ring-black/10",
        isActive && "ring-2 ring-fuchsia-400"
      )}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "bottom center",
        zIndex: isExpanded ? 50 : 1,
      }}
    >
      {/* Avatar */}
      <Image
        src={member.src || "/placeholder.svg?height=96&width=96&query=profile%20portrait"}
        alt={`${member.name} profile`}
        width={96}
        height={96}
        className="pointer-events-none size-11 select-none rounded-md object-cover"
      />

      {/* Expanded hover content */}
      {isExpanded && (
        <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 flex-col items-center">
          <div className="mb-2 rounded bg-neutral-900 px-3 py-1 text-[12px] font-semibold tracking-wide text-white">
            {member.role.toUpperCase()}
          </div>
          <div className="rounded-xl bg-white/95 p-2 shadow-sm">
            <Image
              src={member.src || "/placeholder.svg?height=160&width=160&query=profile%20portrait"}
              alt={`${member.name} larger profile`}
              width={160}
              height={160}
              className="size-[140px] rounded-lg object-cover"
            />
          </div>
          <div className="mt-3 w-full rounded-lg bg-white/90 px-4 py-2 text-center">
            <p className="whitespace-nowrap text-sm font-extrabold tracking-wide text-neutral-900">
              {member.name}
            </p>
          </div>
        </div>
      )}
    </button>
  )
}

const MemoizedDockItem = React.memo(DockItem)
