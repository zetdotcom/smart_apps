# Smart Apps Meetup Deck Spec

## Goal
Create 6-slide deck for 5-7 minute open mic tech meetup talk.

Core thesis:

`Smart app = existing app + small language model + approved actions/UI`

Talk should feel:
- practical, not academic
- demo-first, not benchmark-first
- credible, not overclaimed
- product problem first, model second

## Audience
- local tech meetup crowd
- mixed engineering/product/design background
- limited context on edge AI or small language models
- likely skeptical of vague AI claims

## Main Message
Apps can become smarter without becoming giant cloud agents. In constrained domains, small models like FunctionGemma 270M can translate user intent into approved actions and requested UI, and can run locally or on private infrastructure.

## Hard Constraints
- total slides: 6
- total speaking time: 5 to 7 minutes
- demo video: 35 to 60 seconds
- one idea per slide
- minimal text on screen
- no dense research charts
- no speculative claims that cannot be defended live

## Verified FunctionGemma Facts Safe To Use
Use these as source-backed statements:

- `FunctionGemma` is a specialized version of `Gemma 3 270M` tuned for function calling.
- It is positioned by Google as base for custom, fast, private, local agents that translate natural language into executable API actions.
- Good fit when application has defined API surface.
- Good fit when consistent behavior is needed via fine-tuning.
- Good fit for local-first deployment and compound systems.
- It is provided with open weights.
- It is licensed for responsible commercial use.
- Distribution paths shown by Google docs: Hugging Face, Kaggle, Vertex AI.

Source basis:
- Google AI for Developers, `FunctionGemma model overview`
- Google AI for Developers, `FunctionGemma model card`

## FunctionGemma Claims To Avoid Unless You Measured Them Yourself
Do not present these as facts unless you have direct demo measurements:

- exact RAM footprint
- exact model file size
- exact latency number
- exact task success percentage
- “zero latency”
- “runs on any phone”

Safer language:
- `small enough for edge-oriented deployment`
- `can be run locally or on private infrastructure`
- `lower cost and lower latency than larger cloud-first setups`
- `in my demo, response feels immediate`

## Recommended Visual Language
- dark moss / sage / cream palette from repo
- avoid crowded enterprise template look
- large type, one key diagram per slide
- demo slide should be visually clean and dominant

## Timing Model
- Slide 1: 35 sec
- Slide 2: 50 sec
- Slide 3: 65 sec
- Slide 4: 75 sec
- Slide 5: 60 sec
- Slide 6: 35 sec
- Buffer: 20 to 40 sec

Total: ~5:40 to ~6:20

---

## Slide 1

### Title
`Smart Apps`

### Subtitle
`Intent-driven UX with small language models`

### Purpose
Set frame fast. Establish that this is not generic chatbot talk.

### On-Slide Copy
Main title:

`Smart Apps`

Subtitle:

`Intent-driven UX with small language models`

Footer line:

`Example engine: FunctionGemma 270M`

### Visual Direction
- clean full-bleed background or subtle abstract UI screenshot
- one simple line diagram near bottom:
  `intent -> function -> UI`
- no bullet list here

### Speaker Notes
`Most apps are still built around navigation, menus, and forms. But users usually do not think in menus. They think in outcomes. My idea is simple: instead of forcing people to learn app structure, we can add a smart layer that understands intent and triggers approved app actions or shows requested UI. This is not about replacing apps with chat. This is about making apps behave more intelligently.`

### Delivery Notes
- say `not replacing apps with chat` early
- say `approved actions` early
- establish credibility and scope in first 20 seconds

### Build Notes
- keep typography large
- speaker name optional, small
- if title feels too generic, alt title:
  `Smart Apps, Small Models`

---

## Slide 2

### Title
`Problem: Users Know Goal, Not Path`

### Purpose
Create pain point everyone recognizes.

### On-Slide Copy
Left side or top:

`Traditional app UX`

Small sequence:

`Open menu -> choose section -> hunt feature -> fill form -> confirm`

Bottom pull quote:

`User knows outcome. App demands navigation.`

### Visual Direction
Option A:
- show maze-like click path
- arrows through multiple UI screens

Option B:
- show same request in two columns
- left: multiple clicks
- right: one intent prompt

Best choice:
- use two-column before/after visual

### Speaker Notes
`This is normal software pain. Modern apps are feature-rich, but that also makes them maze-shaped. If I want to update billing info, compare sales periods, or jump to a specific workflow, I often know exactly what I want, but I do not know the path the designer expects me to take. That gap between user intent and interface structure is where smart behavior becomes useful.`

### Delivery Notes
- keep it universal, not tied yet to your demo app
- avoid saying current UI is broken
- frame as complexity tax

### Build Notes
- keep visible text minimal
- if possible, use actual screenshot fragments from your demo app blurred/cropped

---

## Slide 3

### Title
`Idea: Add Smart Layer, Keep App`

### Purpose
Show architecture and reduce fear. This is augmentation, not rebuild.

### On-Slide Copy
Main formula:

`Existing app + small model + approved actions/UI = smart app`

Supporting labels:
- `User writes intent`
- `Model maps to known function`
- `App performs action`
- `App shows requested UI`

### Visual Direction
Use layered diagram.

Top:
- User intent input

Middle:
- Smart layer / FunctionGemma box

Bottom:
- Existing app services / components / routes

Right side:
- rendered UI card or screen mock

### Speaker Notes
`Important part: I am not proposing full rebuild. Existing backend, existing components, existing routes, existing business logic stay in place. We add small model as routing layer between natural language and approved app capabilities. User types intent. Model chooses from known actions or known UI patterns. App executes that action and shows requested interface. So intelligence is added on top of existing software investment.`

### Delivery Notes
- emphasize `known actions`, `known UI`, `constrained scope`
- this slide is architecture heart of talk

### Build Notes
- this should be cleanest diagram in deck
- use colors to distinguish layers:
  - cream: user layer
  - moss: model layer
  - sage: app/action layer

---

## Slide 4

### Title
`Why Small Models, Why FunctionGemma`

### Purpose
Make technical choice credible and specific.

### On-Slide Copy
Header line:

`Good enough beats huge when task is constrained.`

Left column heading:

`Why small models`

Bullets:
- `lower cost`
- `lower latency`
- `private deployment`
- `edge / local / private server`

Right column heading:

`Why FunctionGemma 270M`

Bullets:
- `Gemma 3 270M variant`
- `tuned for function calling`
- `open weights`
- `responsible commercial use`
- `made for natural language -> API actions`

Footer microcopy:

`Best fit when app has defined actions and predictable outputs.`

### Visual Direction
Two-column spec slide.

Left:
- simple icons for cost, shield, chip, edge

Right:
- model chip card
- small tags: `270M`, `function calling`, `local-first`, `fine-tunable`

### Speaker Notes
`Why not use giant general model for everything? Because this class of problem is constrained. I do not need model to write novel or solve research problem. I need it to understand intent and map it into known app capabilities. This is where small model becomes attractive: cheaper, lighter, easier to run close to user, and easier to keep private. In this case I use FunctionGemma 270M from Google. It is specialized version of Gemma 3 270M tuned for function calling, and Google positions it as base for fast, private, local agents that translate natural language into executable API actions. That makes it a strong fit for smart app layer.`

### Optional Expanded Notes For Q&A
- open weights
- available through Hugging Face, Kaggle, Vertex AI
- good fit when API surface is defined
- good fit when you can fine-tune for consistent behavior
- useful in compound systems where small local model handles common actions and larger model handles harder tasks

### Build Notes
- do not include exact RAM or MB unless you measured on your setup
- if you want one explicit spec block, use:
  - `Model: FunctionGemma 270M`
  - `Base family: Gemma 3`
  - `Specialization: function calling`
  - `Weights: open`
  - `Deployment: local, private, cloud`

---

## Slide 5

### Title
`Demo: Intent Becomes Action`

### Purpose
Prove claim with concrete behavior.

### On-Slide Copy
Keep text extremely light.

Top label:

`Demo`

Bottom caption:

`User types intent -> model triggers action -> app shows requested UI`

### Visual Direction
- full-screen demo video dominates slide
- no side bullets
- include thin border or browser chrome only if helpful
- if deck tool allows, autoplay muted on click

### Demo Sequence Spec
Must show in under 60 seconds:
1. app in normal state
2. user enters natural-language intent
3. model processes
4. app performs action
5. requested UI appears
6. final result stays on screen for 2 seconds

### Speaker Notes
`This is core idea in practice. User does not navigate menus. User states goal in natural language. Small model interprets intent, maps it to approved app behavior, and app responds by performing action and rendering requested interface. That is difference I care about: not chat for its own sake, but intent becoming actual product behavior.`

### Delivery Notes
- talk less during demo
- let room watch result
- if demo is smooth, do not over-explain internals here

### Backup Plan
Have static screenshot slide backup in same visual style in case video fails.

Backup caption:

`Same flow, frozen: intent -> action -> requested UI`

### Build Notes
- record at 1080p
- crop distractions
- zoom UI slightly
- no mouse wandering
- no retries

---

## Slide 6

### Title
`Takeaway`

### Purpose
End with memorable thesis and realistic implementation angle.

### On-Slide Copy
Main statement:

`Apps can become smart without becoming giant cloud agents.`

Three closing lines:
- `Start with constrained actions`
- `Keep critical logic inside app`
- `Use small model as intent layer`

Optional final line:

`Future is not chat replacing UI. Future is UI understanding intent.`

### Visual Direction
- minimal closing slide
- large typography
- optional use of repo infographic in faded background

### Speaker Notes
`My takeaway is not that every product should become autonomous agent. It is smaller and more practical than that. Many apps can become much smarter by adding constrained intent layer on top of existing software. Small models make that realistic because they are cheaper, easier to deploy privately, and good enough when action space is known. So future may not be chatbot replacing interface. It may be interface finally understanding what user wants.`

### Delivery Notes
- end on product vision, not model trivia
- pause after final sentence

---

## Speaker Script Flow Summary
Use this as high-level narrative spine:

1. `Users think in goals, apps think in menus.`
2. `That mismatch creates friction.`
3. `Add smart intent layer over existing app.`
4. `Small model is enough when actions are known.`
5. `FunctionGemma 270M is good fit because it is tuned for function calling.`
6. `Demo proves intent can become action and requested UI.`
7. `This is practical path to smarter apps.`

## Suggested Opening Script
`Most apps are still designed around navigation. But users do not think in navigation, they think in outcomes. I want to share simple idea: apps can become smart by adding small language model layer that understands intent and maps it into approved actions or UI. In my prototype, I use FunctionGemma 270M for that job.`

## Suggested Closing Script
`So my main point is simple: smart apps do not require giant cloud agent. In many cases, small model with constrained function calling is enough to make software feel much more intelligent.`

## Q&A Prep

### If Asked: Why not use larger model?
Answer:
`For open-ended reasoning, larger model helps. For constrained app control, small model can be enough and is cheaper, faster, and easier to keep private.`

### If Asked: What about hallucinations?
Answer:
`Keep action space constrained. Let model choose from approved functions and known UI outputs, not arbitrary behavior.`

### If Asked: Why FunctionGemma specifically?
Answer:
`Because it is tuned for function calling, open-weight, small, and designed for natural language to executable action workflows.`

### If Asked: Does this replace normal UI?
Answer:
`No. Normal UI remains. Intent layer becomes faster path for common outcomes.`

### If Asked: Where should it run?
Answer:
`Depends on product. On-device and private server are both valid if privacy and low latency matter.`

## Slide Construction Checklist
- each slide has one message
- no paragraph blocks on slides
- max 3 to 5 visible text chunks per slide
- demo video tested offline
- screenshot backup ready
- FunctionGemma shown as `270M`, not `327M`
- no unverified hard performance numbers
- ending line visible for 2 seconds before applause / transition

## Repo Assets To Reuse
- conceptual framing from `index.html`
- summary phrasing from `summary_final_research.html`
- visual palette from existing HTML files
- infographic as optional closing background
- demo recording you already have

## Recommended File Outputs Next
1. `slides-outline.md` with condensed version for slide-building workflow
2. exported still image from demo as fallback
3. slide-specific diagram asset for Slide 3
