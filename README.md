# World of Darkness UI Toolkit

<p align="center">
<img src="docs/images/DarkPack_Logo_Color.png" alt="Dark Pack Logo" width="300" >
</p>

> _Portions of the materials are the copyrights and trademarks of Paradox Interactive AB, and are used with permission. All rights reserved. For more information please visit **[worldofdarkness.com](https://worldofdarkness.com)**._

This is **an unofficial, fan-made plugin** for managing **World of Darkness** character sheets directly inside your Obsidian vault, created and shared under the [**Dark Pack Agreement**](https://www.paradoxinteractive.com/games/world-of-darkness/community/dark-pack-agreement).
It is a **non-commercial project** and is **not affiliated with, endorsed, or sponsored by Paradox Interactive AB**.

---

The toolkit allows storytellers and players to manage complete character sheets directly within Obsidian. It provides interactive, state-aware components for tracking vital statistics such as Health, Willpower, Hunger, and Rage, along with structured views for Attributes, Skills, and Powers.

Unlike static text templates, this plugin offers a functional interface that responds to user input and automatically adapts its visual style to reflect the identity and mechanics of each supported game line.

### Supported Games

Currently supported:

- **Vampire: The Masquerade 5th edition**
- **Werewolf: The Apocalypse 5th edition**

<br>

> _Support for additional World of Darkness games may be added in the future._

## Documentation

### Key Features

- **Interactive Resource Trackers**
  <br>
  Manage dynamic stats like Health, Willpower, and Experience with clickable trackers that persist their state.

- **Game-Specific Mechanics**
  <br>
  Dedicated support for unique systems such as Hunger and Humanity for Vampire, and Rage, Harmony, and Renown for Werewolf.

- **Context-Aware Theming**
  <br>
  The interface automatically switches color palettes and iconography based on the selected game system.

- **Embedded Asset Library**
  <br>
  Includes essential icons for Clans, Tribes, Disciplines, and Gifts, removing the need for manual image management.

- **Structured Data Views**
  <br>
  Clean, grid-based layouts for Attributes, Skills, and Merits that remain readable even on complex sheets.

## Usage Guide

The plugin uses **custom code blocks** to render character sheet elements.
You can choose between **context-aware generic blocks** or **game-specific blocks**, depending on how much control you want.

### Block Types Overview

#### 1. Generic Blocks (`wod-*`)

These blocks automatically adapt their **appearance and mechanics** based on your current plugin settings.

Use these if you want your character sheet to **update automatically** when switching game systems.

**Available Generic Blocks**

* `wod-resource` — Hunger (VTM) or Rage (WTA)
* `wod-morality` — Humanity (VTM) or Harmony (WTA)
* `wod-advantage` — Blood Potency (VTM) or Renown (WTA)
* `wod-powers` — Section header for Disciplines or Gifts
* `wod-power-list` — Individual power cards
* `wod-attributes` — Physical / Social / Mental grid
* `wod-skills` — Complete skills list
* `wod-health` — Health tracker (Superficial / Aggravated)
* `wod-willpower` — Willpower tracker
* `wod-xp` — Experience tracker
* `wod-merits` — Merits & Flaws list

#### 2. Game-Specific Blocks (`vtm-*`, `wta-*`)

These blocks **force a specific game system**, regardless of your plugin settings.

Use these when you want **explicit control** over mechanics or presentation.

#### Vampire: The Masquerade (V5)

* `vtm-hunger` — Hunger Dice tracker
* `vtm-humanity` — Humanity tracker with Stains
* `vtm-blood-potency` — Blood Potency tracker
* `vtm-disciplines` — Disciplines section header
* `vtm-power-list` — Discipline powers list
* `vtm-attributes`
* `vtm-skills`
* `vtm-health`
* `vtm-willpower`
* `vtm-experience`
* `vtm-merits`

#### Werewolf: The Apocalypse (W5)

* `wta-rage` — Rage Dice tracker
* `wta-harmony` — Harmony tracker
* `wta-renown` — Renown tracker (Glory, Honor, Wisdom)
* `wta-gifts` — Gifts section header
* `wta-gift-list` — Gifts / Rites list
* `wta-attributes`
* `wta-skills`
* `wta-health`
* `wta-willpower`
* `wta-experience`
* `wta-merits`

## Example Usage

### Vital Statistics

Track health and willpower using standard trackers.

````
```wod-health
```

```wod-willpower
```
````

### Attributes and Skills

These blocks automatically populate based on the active game system.

````
```wod-attributes
```

```wod-skills
```
````

### Disciplines

Use the `wod-powers` or `vtm-disciplines` block to define **Discipline sections** for *Vampire: The Masquerade*.

````
```wod-powers
Animalism
Auspex
Blood Sorcery
```
````

> *Currently supported for Vampire: The Masquerade only.*

### Powers and Abilities

Use `wod-power-list`, `vtm-power-list`, or `wta-gift-list` to list individual **Discipline powers** or **Gifts**.

When used in a Vampire context, entries are treated as **Discipline powers**, and icons are automatically resolved based on the specified Discipline.

````
```vtm-power-list
- name: Soaring Leap
  discipline: Potence
  tags: [Cost: Free, Duration: Passive]
  pool:
  description: Leap higher and further than usual.
```
````

When used in a Werewolf context, entries are rendered using **W5 mechanics and styling**.
Icons are resolved automatically, but can be overridden using the `icon` field.

````
```wta-gift-list
- name: Pack Instinct
  icon:
  tags: [Cost: Free, Duration: Passive]
  pool:
  description: You act in perfect concert with your pack, ignoring penalties for close quarters.
```
````
