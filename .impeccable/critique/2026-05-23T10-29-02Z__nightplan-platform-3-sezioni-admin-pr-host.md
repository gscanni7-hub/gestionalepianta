---
target: Nightplan platform — studio completo post-fix
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-05-23T10-29-02Z
slug: nightplan-platform-3-sezioni-admin-pr-host
---
# Studio completo Nightplan — post-fix UX (run 2)

Score 27/40. Trend 24 -> 27 dopo i fix P1 (conferme distruttive), P2 (lingua IT pianta), P3 (dati ranking).

## Cosa va
- Sezione Ingresso/host: scanner QR, ricerca, undo, progress. La più matura.
- Pianta Konva: selezione, pannello desktop + bottom-sheet mobile, permessi PR.
- Brand coeso, dark intenzionale, accento come segnale.
- Azioni distruttive ora con conferma a due step.

## Cosa non va (verso "perfetto")
- [P1] Feedback assente su Approva (item sparisce, niente toast/undo).
- [P1] Due vocabolari form per la stessa azione (BookingModal vs QuickAdd).
- [P2] Jargon inglese in UI italiana: Occupancy, Revenue, Check-in rate, PAX, Min Spend.
- [P2] Side-stripe border-l-4 (toast App.tsx:1930, card prenotazione App.tsx:2485).
- [P2] Nessun onboarding: PR nuovo non sa generare link; sistema lettere A/B/C/T/P non spiegato.
- [P3] Tipografia 8px in contesto buio.
- [P3] catch generici svuotano liste senza segnalare errori rete.
- [P3] Palette ⌘K desktop-only.

## Heuristics
Status 3, RealWorld 3, Control 3, Consistency 2, Prevention 3, Recognition 3, Flexibility 3, Aesthetic 3, Recovery 2, Help 2 = 27/40.
