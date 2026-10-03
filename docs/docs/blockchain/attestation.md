---
sidebar_position: 3
---

# Attestation

Attestation is a separate, public act: any connected wallet may vouch for an
existing item by calling `attest`. Counts per item are derivable without
exactly-once bookkeeping because one item → wallet pair can only ever be
attested once.

```text
Wallet (UI)  ── attest(itemId) ──► AttestationRegistry
                                           │
                                           │ attester != 0, count += 1
                                           ▼
                                     Attested(itemId, attester)
                                           │
        AttestationRegistry ── attestationCount(itemId) ──► count + 1 ──► shield badge
```

- `attest` is idempotent per wallet per item; a repeat call reverts with
  `AlreadyAttested`, so counts cannot be inflated.
- `attestationCount(itemId)` is the running total; `hasAttested(itemId,
  account)` lets the UI show a filled shield when the connected wallet has
  vouched, and an empty one otherwise.
- Both functions are free reads, which is how the cards render the count
  without prompting for a wallet signature.

The shield badge on every audit card is a live read of `attestationCount`,
refreshed whenever the user switches items, so the number you see is the
number of distinct wallets that have attested that item.
