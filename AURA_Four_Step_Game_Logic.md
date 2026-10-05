# AURA – Four-Step Game Logic

## Scope

This document defines the logic for the four AURA gameplay steps on `aura-secure.se`.

It contains only:
- gameplay flow
- required inputs
- correct solutions
- success/error states
- implementation notes relevant to game logic

No visual or design instructions are included.

---

# Global game logic

- Each team must have its own independent session/progress state.
- Teams do not cooperate and must not share progress.
- A team may only access the current unlocked step.
- Successful completion of a step unlocks the next step.
- Progress should persist if the page is refreshed.
- Inputs should ignore leading/trailing spaces.
- Text answers should be case-insensitive.
- Game date: **2026-10-22**
- All historical timestamps use **Europe/Stockholm**.

---

# STEP 1 – OPERATOR AUTHENTICATION

## Purpose

The players must log in as Elias Norberg and restore access to the dormant AURA system.

The login requires two fields:

1. User ID
2. Activation Key

## Correct User ID

`ELNOR0417`

## Correct Activation Key

`ORION-17-NX`

The key is reconstructed from physical clues distributed across several rooms.

### Key components

- `ORION`
  - Project/environment identifier.

- `17`
  - Verification Group 17.

- `NX`
  - Elias's habitual password/code suffix.

### Order clue

A torn note from Elias explains the order:

> Projektet först.  
> Gruppen därefter.  
> Min vanliga avslutning sist.

This produces:

`ORION-17-NX`

## Credential history

Elias last changed this AURA credential on:

`2026-03-27 18:04:31`

## Success state

When both values are correct:

```text
OPERATOR AUTHENTICATED

ELIAS NORBERG
SECURITY ARCHITECT

Secondary identity verification required.
```

Unlock Step 2.

## Failure state

Incorrect User ID or Activation Key:

```text
AUTHENTICATION FAILED

Invalid operator credentials.
```

Do not specify which field was incorrect.

---

# STEP 2 – IDENTITY VERIFICATION

## Purpose

AURA requires three personal security questions before accepting the user as Elias.

Questions should be completed individually.

## Security Question 1

**Question:**

`What is your daughter’s first name?`

**Correct answer:**

`ALMA`

Accepted input:
- `ALMA`

## Security Question 2

**Question:**

`What is your dream car?`

**Correct answer:**

`HONDANSX`

Accepted input:
- `HONDANSX`
- optionally normalize `HONDA NSX` to the same value

## Security Question 3

**Question:**

`What is your favourite drink?`

**Correct answer:**

`REDBULL`

Accepted input:
- `REDBULL`
- optionally normalize `RED BULL` to the same value

## Validation

Wrong answer:

```text
IDENTITY RESPONSE REJECTED
```

Correct answer:

```text
IDENTITY RESPONSE VERIFIED
```

After all three are correct:

```text
IDENTITY VERIFIED

E. NORBERG

Previous operator session detected.
Continuity recovery required.
```

Unlock Step 3.

---

# STEP 3 – CONTINUITY RECOVERY

## Purpose

AURA detects that Elias's final operator session was interrupted.

The players must reconstruct a four-digit legacy Continuity Token.

This is not presented as a security question.

## AURA prompt

```text
INTERRUPTED SESSION DETECTED

CONTINUITY RECOVERY REQUIRED

Legacy operator token:
[ _ ] [ _ ] [ _ ] [ _ ]
```

## Puzzle logic

The token is based on an unconscious habit Elias has had for years.

When bored, thinking, or distracted, Elias repeatedly doodles the same four digits in notebook margins and on scraps of paper.

The digits appear in several different physical clues across multiple rooms.

A technical AURA document explains that the recovery fallback uses:

```text
CONTINUITY FALLBACK: ENABLED
TOKEN TYPE: OPERATOR HABIT
FORMAT: 4 NUMERIC
```

The digits must not be explicitly labelled as a password.

Other dates, numbers, version numbers and codes should exist as decoys.

## Correct Continuity Token

`7314`

## Success state

```text
CONTINUITY TOKEN ACCEPTED

Restoring interrupted operator session...
```

Then:

```text
INTERRUPTED SEQUENCE RESUMED
```

Immediately after this:

```text
WARNING

UNAUTHORIZED FINANCIAL TRANSFER ACTIVE

CORPORATE ACCOUNTS COMPROMISED
```

A countdown begins.

### Countdown

Working default:

`15:00`

The countdown duration should be configurable.

Do not reveal the final transfer amount yet.

Example:

```text
FULL TRANSFER VALUE: [REDACTED]
```

Unlock Step 4.

## Failure state

Incorrect token:

```text
CONTINUITY TOKEN REJECTED
```

The players may try again.

---

# STEP 4 – MANUAL OVERRIDE

## Purpose

The players must stop the illegal transfer before the countdown expires.

AURA requests a Manual Master Code.

## AURA prompt

```text
CRITICAL FINANCIAL EVENT

TRANSFER ACTIVE

MANUAL MASTER CODE REQUIRED
```

## Deliberate false solution

A physical Post-it on Elias's desk reads:

```text
MASTER CODE AURA
AURA1
```

This is intentionally an outdated code.

If the players enter:

`AURA1`

AURA must return:

```text
CODE REJECTED

This master code is no longer valid.

Password changed 204 days ago.
Last modification: 2026-04-01.

Current master code required.
```

This special response is only triggered by the old code `AURA1`.

## Real override puzzle

The correct code is reconstructed through a simple cross-room connection.

One Elias note refers to the emergency command:

`ABORT`

A technical document explains the Master Override format:

```text
[COMMAND][SYSTEM]
```

The system name is:

`AURA`

Therefore:

`ABORT` + `AURA`

produces:

## Correct Master Code

`ABORTAURA`

Accepted input:
- `ABORTAURA`
- optionally normalize `ABORT AURA` to the same value

## Generic wrong-code response

For any incorrect code other than `AURA1`:

```text
MASTER CODE REJECTED
```

Do not provide additional hints.

## Success state

When `ABORTAURA` is entered:

```text
MASTER OVERRIDE ACCEPTED

TRANSFER ABORTED

AURA EMERGENCY SHUTDOWN INITIATED
```

Then display:

```text
RECOVERED TRANSACTION DATA

FULL TRANSFER AMOUNT:
2 850 000 SEK
```

The amount must be shown exactly as:

`2 850 000 SEK`

This is the end of the four-step AURA website sequence.

---

# Admin / implementation additions

## Team state

Each team should have:
- independent progress
- current unlocked step
- timestamp for completion of each step
- countdown state for Step 4

## Admin-configurable values

Prefer making these easy to change:
- countdown duration
- whether normalized variants of codes/answers are accepted

## Fixed values

```text
USER ID: ELNOR0417
ACTIVATION KEY: ORION-17-NX

SECURITY QUESTION 1: What is your daughter’s first name?
ANSWER 1: ALMA

SECURITY QUESTION 2: What is your dream car?
ANSWER 2: HONDANSX

SECURITY QUESTION 3: What is your favourite drink?
ANSWER 3: REDBULL

CONTINUITY TOKEN: 7314

OLD MASTER CODE: AURA1
OLD MASTER CODE DATE: 2026-04-01
DAYS SINCE CHANGE ON GAME DATE: 204

CURRENT MASTER CODE: ABORTAURA

TRANSFER AMOUNT: 2 850 000 SEK

GAME DATE: 2026-10-22
```
