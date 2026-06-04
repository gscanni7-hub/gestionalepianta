---
target: Nightplan platform — 3 sezioni admin/PR/host
total_score: 24
p0_count: 0
p1_count: 2
timestamp: 2026-05-23T09-19-30Z
slug: nightplan-platform-3-sezioni-admin-pr-host
---
# Critique — Nightplan (3 sezioni: admin / PR / host)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Approva/Rifiuta non danno toast: l'elemento sparisce e basta. Spinner al posto di skeleton. |
| 2 | Match System / Real World | 2 | Legenda pianta in inglese ("Confirmed", "Free") accanto a italiano; "Stato" mostra enum grezzi (free/confirmed/blocked). |
| 3 | User Control and Freedom | 2 | "Libera tavolo", "Approva tutte", "Rifiuta" senza conferma né undo. Check-in ha undo, le approvazioni no. |
| 4 | Consistency and Standards | 2 | Due form prenotazione diversi (BookingModal squadrato/maiuscolo vs QuickAdd arrotondato). Sidebar 7 voci vs bottom-bar mobile 5. |
| 5 | Error Prevention | 2 | Nessuna conferma su azioni distruttive/bulk. QuickAdd non valida telefono. |
| 6 | Recognition Rather Than Recall | 3 | Icone+label, command palette, breadcrumb. Sistema lettere A/B/C/T/P da imparare. |
| 7 | Flexibility and Efficiency | 3 | ⌘K, "Approva tutte", scanner QR, copia link. Ma palette solo desktop; admin mobile perde Venue+Prenotazioni. |
| 8 | Aesthetic and Minimalist | 3 | Estetica dark coesa e densa, accento usato bene. Sfondi #000 duri; font 8px al limite leggibilità. |
| 9 | Error Recovery | 2 | Scan-errors gestiti bene. Nessun undo su approva/rifiuta. catch generici che ingoiano errori in silenzio. |
| 10 | Help and Documentation | 2 | Empty state presenti ma non insegnano. Nessun onboarding/tooltip. PR nuovo non sa come generare link. |
| **Total** | | **24/40** | **Competente ma grezzo** |

## Anti-Patterns Verdict
LLM: estetica forte e riconoscibile, NON sembra slop generico. Detector: 17 findings — 13 pure-black (#000), 2 side-tab border-l (App.tsx:1930 toast, FloorPlanViewer note), 2 overused-font (Inter, falso positivo per product register). Nessun browser overlay (contesto VSCode senza automazione).

## Priority Issues
- [P1] Azioni distruttive senza conferma/undo: "Libera", "Approva tutte", "Rifiuta". Rischio perdita dati irreversibile durante la serata.
- [P1] Gap navigazione admin su mobile: bottom-bar non include Venue né Prenotazioni; la palette ⌘K è desktop-only. Su telefono l'admin non raggiunge quelle sezioni.
- [P2] Inconsistenza linguistica: legenda inglese + enum grezzi mostrati all'utente.
- [P2] Due vocabolari form per lo stesso task (prenotazione): squadrato/maiuscolo vs arrotondato/sentence-case.
- [P3] Tipografia 8px in contesto locale buio: sotto i limiti di leggibilità WCAG.

## Minor
- Bar chart PRStats: track #1C1C1E uguale allo sfondo card → parte vuota invisibile.
- PRRankingView conta TUTTE le prenotazioni (incluse pending/rejected) nell'incasso.
- catch generici svuotano le liste senza segnalare errori di rete.
