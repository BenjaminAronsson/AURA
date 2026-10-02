# THE BREACH — AURA Interactive Security System

## 1. Purpose

**The Breach** is a physical escape-game experience supported by an interactive webpage representing an artificial security system called **AURA**.

The webpage is not intended to be the primary source of the story or puzzles. Instead, AURA acts as an interactive **security system and verification layer** that connects the physical puzzles and discoveries made by the players.

The players should primarily cooperate with each other and investigate the physical environment. AURA should support and validate their progress without solving puzzles for them or intentionally misleading them.

---

## 2. Game Premise

A security IT developer has installed an advanced security system called **AURA** at his office.

Shortly after the installation, the developer disappears and the office is left in **lockdown mode**.

The players receive a backstory explaining that:

* The developer is missing.
* The office is locked down.
* AURA has been installed as the office security system.
* AURA may provide access to security information, including security footage.
* Clues relating to the developer's disappearance may still exist within the office.

The players begin by interacting with AURA.

As the game progresses, most of the storyline is revealed through **physical objects, documents, photographs, notes, logs, and other clues found around the office**.

AURA provides access to information and verifies the discoveries made by the team.

---

## 3. Role of AURA

AURA should feel like a **real corporate IT/security system**, not a character or game host.

AURA should be:

* Professional
* Procedural
* Precise
* Neutral
* Security-oriented
* Intelligent but restrained

AURA should **not**:

* Behave like a human player
* Attempt to mislead the players
* Solve puzzles for the players
* Constantly provide hints
* Become overly conversational
* Become the main source of the story

The primary function of AURA is:

> **Ask → Receive information → Verify → Grant access → Ask for the next required action**

AURA should feel as though the players are interacting with an authentic security system rather than a chatbot.

---

## 4. Core Gameplay Principle

The central gameplay loop is:

**Physical discovery → Team discussion → AURA interaction → Verification → New access/information → Physical investigation**

The players should spend most of their time:

* Searching the physical environment
* Reading documents
* Examining objects
* Connecting clues
* Discussing theories
* Working together
* Solving puzzles

The webpage should provide the structure that links these discoveries together.

---

## 5. Interaction Model

AURA should use a mixture of structured interaction and limited free-text input.

### Structured interaction

AURA can ask the players for:

* Codes
* Passwords
* Names
* Identification numbers
* Serial numbers
* Answers to specific questions
* Results from physical puzzles
* Information discovered in documents or photographs

Example:

> **AURA SECURITY INITIALIZATION**
>
> Authentication required.
>
> Enter administrator access code:

The players then submit the answer.

### Limited free-text interaction

Players should also be able to ask simple questions such as:

> "What happened to the administrator?"

> "What information do you need?"

> "Can you repeat the last instruction?"

> "What systems are currently locked?"

Free-text interaction should remain secondary.

The primary progression should still be controlled through AURA's defined questions and verification steps.

---

## 6. Team Cooperation

The game should encourage players to cooperate with one another rather than allowing a single person to sit at the computer and solve everything.

The webpage should therefore require information that is primarily obtained **outside the webpage**.

For example:

1. One player finds a printed photograph.
2. Another player discovers a document containing a relevant date.
3. Another player notices a number on a physical object.
4. The team combines these observations.
5. They determine the answer.
6. They enter it into AURA.
7. AURA verifies it and unlocks the next stage.

The webpage should therefore function as a **shared team tool**, not as the entire game.

---

# 7. Game Structure

The experience is intended to consist of approximately **4–5 major sections/stages**.

The exact puzzles and story progression are still to be defined.

A possible high-level structure is:

### Part 1 — Initial Authentication

Purpose:

* Introduce AURA
* Establish the lockdown situation
* Teach players how the system works
* Require the first physical discovery

Example interaction:

> **FACILITY STATUS: LOCKDOWN**
>
> Administrator: Elias Voss
> Status: Missing
>
> Security footage access requires administrator authentication.
>
> Enter administrator access code.

The team searches the physical environment for the required information.

Successful verification unlocks the next system capability.

---

### Part 2 — Investigation

Purpose:

* Allow the team to investigate what happened to the missing developer.
* Use AURA to access information related to the investigation.
* Connect physical clues with digital verification.

For example:

> **SECURITY FOOTAGE ACCESS**
>
> Select available incident:
>
> `18:03 — SERVER ROOM`
> `18:17 — DEVELOPER OFFICE`
> `18:31 — MAIN ENTRANCE`

The webpage may refer to **physical printed security footage/photos** instead of displaying actual video.

The photographs themselves become physical puzzle components.

The storyline is therefore discovered mainly through the physical material.

---

### Part 3 — System Investigation

Purpose:

* Expand the investigation from the missing developer toward something unusual within the security system.
* Require the players to identify information from several physical clues.
* Use AURA to verify their conclusions.

Examples of questions could include:

> "What device was connected to the terminal?"

> "Enter the serial number of the identified device."

> "Which event occurred first?"

> "Enter the employee identifier found in the recovered document."

AURA should verify the answers rather than explain how to find them.

---

### Part 4 — Security Incident / Containment

Purpose:

* Reveal that the situation is more serious than simply a missing employee.
* Lead the team toward discovering what happened with AURA or the office's confidential information.
* Require multiple physical clues to identify the correct containment procedure.

The exact story and puzzles are still intentionally undefined.

AURA should continue to operate as a security system and verification mechanism.

---

### Part 5 — Final Shutdown

Purpose:

* Bring together information discovered throughout the game.
* Require the team to obtain the final authorization or shutdown information.
* Use AURA as the final security gate.

The final section should require information accumulated from earlier stages rather than introducing an entirely new puzzle system.

Possible final interaction:

> **AURA CORE**
>
> Shutdown procedure requires:
>
> Administrator override
> Root authorization
> Containment confirmation
>
> Enter required credentials.

Once the correct information has been assembled and submitted, AURA can complete the final shutdown sequence.

---

# 8. Physical vs. Digital Content

The division of responsibility should be approximately:

### Physical environment

Primary source of:

* Story
* Clues
* Evidence
* Documents
* Photographs
* Objects
* Puzzle information
* Narrative discoveries

### AURA webpage

Primary source of:

* Questions
* Authentication
* Verification
* Access control
* Progression
* System status
* Controlled information retrieval
* Security messages
* Stage transitions

This separation is important because the escape game should remain a **physical team investigation**, with AURA enhancing the experience rather than replacing it.

---

# 9. AURA Personality and Presentation

AURA should communicate using concise, technical language.

Example:

> `AUTHENTICATION SUCCESSFUL.`
> `ACCESS LEVEL: 02`
> `SECURITY FOOTAGE MODULE: AVAILABLE`

Rather than:

> "Great job! You found the code! Let's see what happens next!"

The system should feel like enterprise security software.

Its language can occasionally create atmosphere without becoming emotional or theatrical.

Preferred:

> `UNAUTHORIZED INFORMATION REQUEST.`

> `VERIFICATION FAILED.`

> `REQUIRED DATA NOT FOUND.`

> `ACCESS GRANTED.`

Avoid:

> "Nice work!"

> "You're getting close!"

> "I think you should look over there."

---

# 10. Error Handling

Incorrect answers should primarily result in a security-system response rather than an explicit solution.

Example:

> `VERIFICATION FAILED.`
> `INVALID CREDENTIALS.`

The system should not immediately reveal the correct answer.

Hints, if included, should be carefully controlled and should not replace team investigation.

The desired experience is that players think:

> "We need to figure this out."

rather than:

> "Let's just ask AURA how to solve it."

---

# 11. Narrative Philosophy

The **physical game world is the storyteller**.

AURA provides context, system access, and validation.

The players should gradually construct the story themselves from the evidence they discover.

The broader hidden story is that AURA is ultimately **not a trustworthy security solution** and is connected to an attempt to sell confidential office information to competitors.

This reveal should primarily come through the physical evidence and progression of the investigation rather than AURA simply announcing the truth.

The exact reveal sequence remains to be designed.

---

# 12. Design Goals

The AURA system should achieve the following:

1. Feel like a believable IT/security system.
2. Encourage physical investigation and teamwork.
3. Provide clear progression without giving away solutions.
4. Connect physical clues to digital interactions.
5. Make each successful AURA interaction feel meaningful.
6. Support a 4–5 part game structure.
7. Keep the story primarily in the physical environment.
8. Avoid turning AURA into a conventional chatbot.
9. Make the final stages depend on information collected throughout the game.

---

# 13. Open Design Questions

The following decisions remain to be defined:

* The exact number of stages: 4 or 5.
* The specific puzzle in each stage.
* How hints are handled.
* The exact moment when the players discover AURA's true purpose.
* Whether AURA itself ever reveals contradictory information.
* What the final shutdown mechanism requires.
* The exact visual style of the security interface.
* Whether the webpage should simulate multiple internal security modules such as logs, cameras, personnel, network, and system status.

