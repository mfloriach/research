---
sidebar_position: 1
---

# AttestationRegistry (the contract)

`contracts/src/AttestationRegistry.sol` is a single `Ownable` contract that
keeps two ledgers side by side: an attestation ledger and a signature ledger.
Both are keyed by `bytes16` item IDs — the app's UUIDs with the dashes
stripped.

## Ledger layout

```text
AttestationRegistry.sol  (Ownable)
        │
        ├── attest(itemId)        →  Attested(itemId, attester)
        ├── attestationCount(itemId)
        ├── hasAttested(itemId, account)
        │
        └── recordSignature(itemId, contentHash, signature, ipfsCid)
                      →  ItemProvenance(itemId, attester, contentHash, signature, ipfsCid)
```

## Invariants

- `attest` is idempotent per wallet per item; a repeat call reverts with
  `AlreadyAttested`, so counts cannot be inflated.
- `recordSignature` is likewise one-shot per wallet per item; the
  `AlreadyRecorded` check keeps a single provenance assertion per artefact.
- Every state change emits an event indexed by `itemId` and the wallet, and the
  frontend recomputes derived state from those logs rather than caching it.

## Free reads

Reads need no transaction, which is what the cards use to render without a
wallet prompt:

- `attestationCount(itemId)` — the shield badge number.
- `hasAttested(itemId, account)` — whether the connected wallet has vouched;
  decides the filled/empty shield.
- `signatureContentHash(itemId, account)` — the hash a wallet signed.
- `itemIpfsCid(itemId, account)` — the canonical artefact location.

## The signature

When a user writes a report or an audit item, the wallet signs the exact
payload before anything is persisted. The contract call is `recordSignature`
with:

- `itemId` — the item's UUID packed into `bytes16`
- `contentHash` — the canonical hash of the payload
- `signature` — the wallet's signature over that hash
- `ipfsCid` — the CID of the pinned JSON envelope

Together, the triple (content hash, signature, CID) lets an auditor challenge
the stored document against the exact value that was signed, without trusting
the app's database.

## Local development

See Getting Started for the full walkthrough. Deploy with:

```bash
npm run contracts:deploy:anvil
```

and set `NEXT_PUBLIC_ATTESTATION_CONTRACT_ADDRESS` in `.env.local`. The
deterministic Anvil address is `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
