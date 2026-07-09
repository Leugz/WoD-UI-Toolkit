# World of Darkness UI Toolkit

<p align="center">
<img src="docs/images/DarkPack_Logo_Color.png" alt="Dark Pack Logo" width="320">
</p>

> _Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved._ 
_For more information please visit **[worldofdarkness.com](https://worldofdarkness.com)**._

This is an **unofficial, fan-made** plugin for managing World of Darkness character sheets directly inside your Obsidian vault, created under the [Dark Pack Agreement](https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement). 
**Non-commercial and not affiliated with Paradox Interactive AB.**

The toolkit renders interactive, state-aware character sheet blocks inside your notes. Unlike static templates, every block responds to user input, saves state automatically across sessions, and adapts its appearance to the active game system.

**Key behaviors:**
- State is saved per note, survives reloads and Obsidian restarts.
- Health reads from the Stamina attribute; Willpower reads from Composure + Resolve.
- Deleting or renaming a note automatically cleans up its stored data.

---

## Supported Games

| Game | Prefix |
| :--- | :----- |
| Vampire: The Masquerade V5 | `vtm-` |
| Werewolf: The Apocalypse W5 | `wta-` |

---

## Installation

> _Work in Progress_

---

## Configuration

Open **Settings > WoD UI Toolkit**.

**Active Game System** — Controls how generic `wod-*` blocks behave and which theme colours are applied. 
Changing this requires a reload (`Ctrl/Cmd+P > Reload app without saving`).

---

## How blocks work

Every block comes in two flavours:

**Generic (`wod-*`)** adapts to whatever game is active in settings. Use these if you want a single character sheet that works across games.

**Game-specific (`vtm-*`, `wta-*`)** always render using that game's rules, regardless of the active setting. Use these when you want explicit, permanent control.

---

## Block Reference

### Trackers

All tracker blocks take no content just an empty code block.
All the Attributes below can be found on the block, located on the same note.

---

#### Health

````
```wod-health
```
````

Renders a row of damage boxes. Box count is **3 + Stamina**.
Defaults to 4 boxes if no Attributes block is present.

Automatically updates when Stamina changes.

| Interaction | Effect |
| :---------- | :----- |
| Click an empty box | Fill all boxes up to this one with Superficial (/) damage |
| Click a Superficial box | Upgrade all boxes up to this one to Aggravated (X) |
| Click an Aggravated box | Clear this box and all boxes to the right |
| Right-click any box | Clear this box and all boxes to the right |

*Game-specific: `vtm-health`, `wta-health`*

---

#### Willpower

Renders damage boxes equal to **Composure + Resolve**.
Automatically updates when Composure or Resolve changes.

| Interaction | Effect |
| :---------- | :----- |
| Click an empty box | Fill all boxes up to this one with Superficial (/) damage |
| Click a Superficial box | Upgrade all boxes up to this one to Aggravated (X) |
| Click an Aggravated box | Clear this box and all boxes to the right |
| Right-click any box | Clear this box and all boxes to the right |
| ↻ button | Clear all Willpower damage |

*Game-specific: `vtm-willpower`, `wta-willpower`*

---

#### Resource (Hunger / Rage)

````
```wod-resource
```
````

Renders up to 5 hexagonal icons representing the current resource level. 
Each level shows a label and flavour description.

| Interaction | Effect |
| :---------- | :----- |
| Click an icon | Set resource to that level |
| Click the only filled icon when at 1 | Set resource to 0 |
| ↻ button | Reset to 1 |

*Game-specific: `vtm-hunger`, `wta-rage`*

---

#### Morality (Humanity / Harmony)

````
```wod-morality
```
````

Renders 10 diamond icons. Current level shows a label and description. 
For VTM, a Stains section is shown below.

| Interaction | Effect |
| :---------- | :----- |
| Click a diamond | Set Morality to that value |
| Click the only active diamond | Set to 0 |
| ↻ button | Reset to 7 and clear all Stains |

**Stains (VTM — Humanity only):** Shown as small squares below the diamonds. Available stain slots equal `11 − Humanity`. 
When all slots are filled, an impairment warning appears listing the mechanical penalties. 
The **Snap Out** button costs 1 Humanity and clears all Stains.

*Game-specific: `vtm-humanity`, `wta-harmony`*

---

#### Advantage (Blood Potency / Renown)

````
```wod-advantage
```
````

**For VTM:** Renders 10 dots (0–10) and a derived stats panel showing Blood Surge, Mend Amount, Power Bonus, Feeding restriction, and Bane Severity.
 _all recalculated from V5 rules as you adjust the rating._

**For WTA:** Renders three columns Glory, Honor, and Wisdom each with 5 dots.

| Interaction | Effect |
| :---------- | :----- |
| Click a dot | Set to that value |
| Click the only active dot when at 1 | Set to 0 |
| ↻ button | Reset to 1 |

*Game-specific: `vtm-blood-potency`, `wta-renown`*

---

#### Experience

````
```wod-exp
```
````

Shows three cards: Total XP, Spent XP, and Available XP (calculated). 
Controls allow adding or subtracting in increments of 1 and 10.

*Game-specific: `vtm-exp`, `wta-exp`*

---

### Grids

#### Attributes

````
```wod-attributes
```
````

Renders a three-column grid (Physical / Social / Mental) with 5-dot ratings for each attribute. 
_Attributes default to a minimum of 1._

| Interaction | Effect |
| :---------- | :----- |
| Click a dot | Set that attribute to that value |
| Click the only active dot | Reduce by 1 (minimum 0) |
| Right-click any dot | Reset to 1 |

*Game-specific: `vtm-attributes`, `wta-attributes`*

---

#### Skills

````
```wod-skills
```
````

Renders a three-column grid (Physical / Social / Mental) with 5-dot ratings for each skill. 
_Skills start at 0._

| Interaction | Effect |
| :---------- | :----- |
| Click a dot | Set that skill to that value |
| Click the only active dot | Set to 0 |
| Right-click any dot | Reset to 0 |

*Game-specific: `vtm-skills`, `wta-skills`*

---

### Power Blocks

#### Disciplines / Gifts header

````
```wod-powers
Animalism
Auspex
Blood Sorcery
```
````

One power/discipline/gift name per line. Each entry renders as a card with an automatically resolved icon and a 5-dot rating that is tracked and saved.

Icons are resolved from the name using the game's icon map and embedded assets. 
_Unrecognised names fall back to a placeholder symbol._

| Interaction | Effect |
| :---------- | :----- |
| Click a dot | Set rating to that value |
| Click the only active dot when at 1 | Set to 0 |

*Game-specific: `vtm-disciplines`, `wta-gifts`*

---

#### Power / Gift list

````
```vtm-power-list
- name: Soaring Leap
  discipline: Potence
  tags: [Cost: Free, Duration: Passive]
  pool: Strength + Athletics
  description: Leap higher and further than humanly possible.
```
````

````
```wta-gift-list
- name: Halt the Coward's Flight
  icon: Black Furies
  tags: [Cost: 1 Rage Check, Duration: 1 Scene]
  pool: Resolve + Honor
  description: Reduce a fleeing target's movement to walking speed.
```
````

Renders detailed cards for individual powers or gifts. 
**Accepts a YAML list.**

| Property | Required | Description |
| :------- | :------: | :---------- |
| `name` | ✓ | Name of the power or gift |
| `discipline` | VTM | Determines the card icon based on the Discipline |
| `icon` | WTA / override | Tribe or Auspice name for icon resolution |
| `tags` | — | List of short reference labels. Use `Key: Value` format for styled tags (e.g. `Cost: 1 Rage`) |
| `pool` | — | Dice pool shown at the bottom of the card |
| `description` | — | Full description text |

*Generic: `wod-power-list` <br> Game-specific: `vtm-power-list`, `wta-gift-list`*

---

#### Merits & Flaws

````
```wod-merits
- name: Iron Gullet
  type: merit
  rating: 2
  description: Can feed on spoiled blood or from animals without penalty.

- name: Obvious Predator
  type: flaw
  rating: 2
  description: Mortals feel deeply unsettled in your presence.
```
````

Renders a two-column layout with Merits on the left and Flaws on the right. 
**Accepts a YAML list. Each entry must declare its `type`.**

| Property | Required | Description |
| :------- | :------: | :---------- |
| `name` | ✓ | Name of the Merit or Flaw |
| `type` | ✓ | `merit` or `flaw` |
| `rating` | — | Dot rating (1–5). Interactive — click dots to adjust |
| `description` | — | Description text |

*Game-specific: `vtm-merits`, `wta-merits`*

---

## Full Example

A complete VTM character sheet:

````
## Character Name

### Attributes & Skills

```wod-attributes
```

```wod-skills
```

### Vital Statistics

```vtm-hunger
```

```wod-health
```

```wod-willpower
```

```vtm-humanity
```

```vtm-blood-potency
```

### Disciplines

```vtm-disciplines
Animalism
Auspex
Blood Sorcery
```

### Powers

```vtm-power-list
- name: Sense the Beast
  discipline: Animalism
  tags: [Cost: Free, Pool: Wits + Empathy]
  description: Detect the supernatural nature of nearby creatures.
- name: Soaring Leap
  discipline: Potence
  tags: [Cost: Free, Duration: Passive]
  description: Leap with supernatural force and distance.
```

### Merits & Flaws

```vtm-merits
- name: Iron Gullet
  type: merit
  rating: 2
  description: Can feed on spoiled blood or from animals.
- name: Obvious Predator
  type: flaw
  rating: 2
  description: Mortals are instinctively unsettled by your presence.
```

### Experience

```vtm-exp
```
````

---

## Notes

- **State is per-note.** Moving a block to a different note will show a fresh state; the data stays on the original note until that note is deleted.
- **Attribute links are per-note.** Health and Willpower read from the Attributes block on the **same note**. 
_They default to minimum values if no Attributes block is present._
- **Reload after changing game system.** Use `Ctrl/Cmd+P > Reload app without saving`.
- **Data cleanup is automatic.** Deleting a note removes its stored character data. Renaming or moving a note preserves it.
