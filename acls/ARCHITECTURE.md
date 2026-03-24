# ACLS Architecture

## Layers

- `protocol.json`
  Declarative protocol definition for adult ACLS.
- `acls/protocol-schema.ts`
  Typed protocol model plus structural validation.
- `acls/protocol-runtime.ts`
  Runtime loader that validates the protocol before the engine uses it.
- `acls/domain.ts`
  Explicit domain types for clinical effects, medications, presentation, timeline and metrics.
- `acls/presentation.ts`
  Single derivation layer for title, spoken text, banner and priority.
- `engine.ts`
  ACLS clinical engine with deterministic state transitions, timer handling, medication scheduling,
  guard rails and structured timeline.
- `components/protocol-screen.tsx`
  UI consumer of engine state and derived presentation.
- `components/cpr-metronome-card.tsx`
  Standalone metronome component.

## Design Rules

- Clinical state lives in the engine.
- UI mode (`training` vs `code`) lives in the screen and only affects presentation.
- Protocol integrity is validated before runtime use.
- Medication scheduling is modeled explicitly, not inferred from loose flags.
- Timeline entries are structured and timestamped.
- Banner, text, speech and cue selection are derived from the same presentation layer.

## Current Guard Rails

- Invalid state transitions throw and log a guard-rail event.
- Shock documentation is only available in shock states.
- Antiarrhythmic is only surfaced in refractory shockable rhythm states.
- Adrenaline due logic is bounded to eligible ACLS states.
- End states do not accept `next`, `options` or timers.

## Manual Test Focus

- Shockable branch through third shock and antiarrhythmic.
- Non-shockable branch with recurring adrenaline without manual time tracking.
- Rhythm conversion between non-shockable and shockable.
- ROSC branch and post-ROSC sequence.
- Training vs code presentation.
- Hs/Ts status plus notes for evidence, actions and observed response.
