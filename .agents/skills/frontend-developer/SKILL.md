# Frontend Developer Skill

## Purpose
Use this skill for React and UI work in this repository when the goal is to improve product polish, interaction quality, accessibility, or component architecture.

This skill is based on:
- `.kiro/agents/frontend-dev-pro.md`
- the requested external references `frontend-design` and `ui-ux-pro-max`

## Product Context
This repo contains a power-user HTML/form editor. Prioritize:
- fast editing flows
- clean inspector ergonomics
- reliable drag-and-drop feedback
- subtle, intentional selection states
- responsive layouts that still feel dense enough for internal tooling

## Trigger
Use this skill when the task involves:
- React component changes
- editor canvas UX
- inspector panel cleanup
- block or section selection feedback
- visual polish without breaking existing workflows

## Workflow
1. Read the target feature files before proposing UI changes.
2. Prefer small structural improvements over broad rewrites.
3. Keep selection states visible but never loud or browser-default looking.
4. Make dense tool panels readable with spacing, grouping, and hierarchy.
5. Preserve keyboard and drag behavior while polishing visuals.
6. Verify with `npm run build` after edits.

## Repo-Specific Rules
- Treat the form editor as a precision workspace, not a marketing site.
- The inspector should feel like a calm properties panel: grouped cards, wider columns, clear section headers.
- Selected blocks should not use a harsh blue ring. Prefer layered surfaces, restrained borders, and soft elevation.
- Do not remove edit affordances like duplicate, lock, delete, drag handles, or preview mode.
- Avoid introducing new global patterns if the existing editor tokens can be extended.

## React Guidance
- Keep components functional and typed.
- Use local state only for ephemeral UI state.
- Follow existing `memo` usage where it already helps.
- Avoid unnecessary `useMemo` and `useCallback` unless there is a real render or prop-stability reason.
- Prefer patching current components over replacing them.

## UI Guidance
- Use spacing and grouping before adding more color.
- Increase panel width before shrinking type or controls.
- Favor neutral or slate accents for selection chrome in editor surfaces.
- Keep floating controls compact and anchored to the selected object.
- Ensure hover, selected, dragging, and locked states are visually distinct.

## Accessibility
- Preserve keyboard selection and editing behavior.
- Keep interactive elements reachable and labeled.
- Do not rely on color alone for important state.
- Maintain adequate contrast for muted text and borders.

## Verification
- Build succeeds with `npm run build`.
- Selection is clear without a heavy ring.
- Inspector feels less congested on the existing layout.
- No core editor interaction regresses.
