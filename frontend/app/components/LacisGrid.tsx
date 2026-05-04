'use client'

import { useEffect, useRef } from 'react'

// ── Types ──────────────────────────────────────────────
interface NavCell {
    idx: string
    title: string
}

// ── Constants ──────────────────────────────────────────
const COLS = 5
const ROWS = 4

/** Fixed nav cards by "col-row" key (0-indexed). Never shift. */
const NAV_CELLS: Record<string, NavCell> = {
    '0-3': { idx: '01', title: 'Sobre o LACIS' },
    '1-1': { idx: '02', title: 'Projetos' },
    '3-2': { idx: '03', title: 'Revista Cultural' },
    '4-0': { idx: '04', title: 'Publicações & Pesquisas' },
}

/** Milliseconds between each shift, per column. */
const COL_INTERVALS = [3200, 4600, 5400, 3900, 6200] as const

/** Picsum seeds — varied subjects for cultural placeholders. */
const SEEDS = [
    10, 14, 19, 23, 27, 30, 35, 42, 47, 51,
    56, 63, 68, 72, 78, 84, 89, 93, 99, 104,
    112, 118, 125, 131, 140, 148, 155, 162, 170, 180,
]

// ── Helpers ────────────────────────────────────────────

/** Return sorted row indices that are image cells (not nav) for a given column. */
function getImgRows(col: number): number[] {
    const rows: number[] = []
    for (let r = 0; r < ROWS; r++) {
        if (!NAV_CELLS[`${col}-${r}`]) rows.push(r)
    }
    return rows
}

function picsumUrl(seed: number) {
    return `https://picsum.photos/seed/${seed}/300/220`
}

// ── Component ──────────────────────────────────────────
export function LacisGrid() {
    const gridRef = useRef<HTMLDivElement>(null)

    /**
     * All DOM manipulation lives in a single useEffect so we can safely
     * imperatively build and animate the grid (mirrors the original vanilla JS).
     */
    useEffect(() => {
        const grid = gridRef.current
        if (!grid) return

        // ── Build image queues per column ──
        const imageQueues: number[][] = Array.from({ length: COLS }, () => [])
        const imagePtrs: number[] = Array(COLS).fill(0)

        let seedIdx = 0
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                if (!NAV_CELLS[`${c}-${r}`]) {
                    imageQueues[c].push(SEEDS[seedIdx % SEEDS.length])
                    seedIdx++
                }
            }
            // Extra seeds for rotation freshness
            for (let extra = 0; extra < 8; extra++) {
                imageQueues[c].push(SEEDS[(seedIdx + c * 3 + extra) % SEEDS.length])
                seedIdx++
            }
        }

        // ── Create cell elements ──
        // cells[col][row] → HTMLElement
        const cells: HTMLElement[][] = Array.from({ length: COLS }, () =>
            Array(ROWS).fill(null)
        )

        function makeCellEl(c: number, r: number): HTMLElement {
            const key = `${c}-${r}`
            const nav = NAV_CELLS[key]

            if (nav) {
                const a = document.createElement('a')
                a.className = 'cell-nav cell relative flex flex-col justify-end overflow-hidden cursor-pointer no-underline bg-umber transition-colors duration-[400ms] hover:bg-bark'
                a.href = '#'
                a.style.gridColumn = String(c + 1)
                a.style.gridRow = String(r + 1)
                a.innerHTML = `
          <svg class="nav-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 13L13 3M13 3H6M13 3V10" stroke="#d6cdb8" stroke-width="1"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="nav-idx font-serif italic text-warm mb-1 leading-none"
               style="font-size:0.7rem;letter-spacing:0.05em;">${nav.idx}</div>
          <div class="nav-title font-serif font-medium text-cream leading-[1.2]"
               style="font-size:1.15rem;letter-spacing:0.01em;">${nav.title}</div>
        `
                // padding applied inline to avoid Tailwind purge issues on dynamic elements
                a.style.padding = '1.1rem 1rem 1rem'
                return a
            }

            const div = document.createElement('div')
            div.className = 'cell-img cell relative overflow-hidden bg-cream min-h-0'
            div.style.gridColumn = String(c + 1)
            div.style.gridRow = String(r + 1)
            const seed = imageQueues[c][imagePtrs[c]++ % imageQueues[c].length]
            div.innerHTML = `<img src="${picsumUrl(seed)}" alt="" loading="lazy"><div class="shimmer"></div>`
            return div
        }

        // Append in row-major order so CSS grid places them correctly
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const el = makeCellEl(c, r)
                cells[c][r] = el
                grid.appendChild(el)
            }
        }

        // ── Shift logic ──
        function shiftColumn(c: number) {
            const imgRows = getImgRows(c)
            if (imgRows.length < 2) return

            const topRow = imgRows[0]
            const topCell = cells[c][topRow]

            // 1. Animate top cell upward + fade out
            topCell.style.transition = 'transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.38s ease'
            topCell.style.transform = 'translateY(-110%)'
            topCell.style.opacity = '0'
            topCell.style.zIndex = '3'

            setTimeout(() => {
                // Collect current srcs in order
                const srcs = imgRows
                    .map(r => (cells[c][r].querySelector('img') as HTMLImageElement | null)?.src)
                    .filter((s): s is string => Boolean(s))

                // Remove top src, add a fresh one at the bottom
                srcs.shift()
                const newSeed = imageQueues[c][imagePtrs[c] % imageQueues[c].length]
                imagePtrs[c]++
                srcs.push(picsumUrl(newSeed))

                // Reset top cell instantly — becomes the visual bottom
                topCell.style.transition = 'none'
                topCell.style.transform = 'translateY(0)'
                topCell.style.opacity = '1'
                topCell.style.zIndex = ''

                // Redistribute srcs with shimmer
                imgRows.forEach((r, i) => {
                    const cell = cells[c][r]
                    const img = cell.querySelector('img') as HTMLImageElement | null
                    if (!img) return

                    cell.classList.add('shifting')
                    setTimeout(() => {
                        img.src = srcs[i]
                        const onLoad = () => {
                            cell.classList.remove('shifting')
                            img.removeEventListener('load', onLoad)
                        }
                        img.addEventListener('load', onLoad)
                        // Fallback
                        setTimeout(() => cell.classList.remove('shifting'), 400)
                    }, 80)
                })
            }, 350)
        }

        function animateSlide(c: number) {
            const imgRows = getImgRows(c)
            imgRows.forEach(r => {
                const cell = cells[c][r]
                cell.style.transition = 'transform 0.36s cubic-bezier(0.4,0,0.2,1)'
                cell.style.transform = 'translateY(-4px)'
                setTimeout(() => {
                    cell.style.transition = 'transform 0.3s ease-out'
                    cell.style.transform = 'translateY(0)'
                }, 360)
            })
            shiftColumn(c)
        }

        // ── Start timers with staggered init ──
        const timers: ReturnType<typeof setInterval>[] = []
        const initTimers: ReturnType<typeof setTimeout>[] = []

        COL_INTERVALS.forEach((interval, c) => {
            const t = setTimeout(() => {
                const iv = setInterval(() => animateSlide(c), interval)
                timers.push(iv)
            }, c * 700 + 400)
            initTimers.push(t)
        })

        // Cleanup on unmount
        return () => {
            initTimers.forEach(clearTimeout)
            timers.forEach(clearInterval)
            // Remove all child nodes (cells)
            while (grid.firstChild) grid.removeChild(grid.firstChild)
        }
    }, [])

    return (
        <main
            className="
        grid-mask-top grid-mask-bottom
        relative overflow-hidden bg-paper
        flex-1
      "
        >
            <div
                ref={gridRef}
                className="grid h-full w-full"
                style={{
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gridTemplateRows: 'repeat(4, 1fr)',
                    gap: '2px',
                }}
            />
        </main>
    )
}