---
sidebar_position: 2
---

# IPFS

Created or seeded content is serialized into a canonical JSON envelope and
pinned to the local Kubo node via `lib/ipfs.ts`. The pin returns a CID that is
immune to content change — any edit to the document changes its CID. That CID
is what gets stored in MongoDB and, more importantly, what gets written
on-chain. If you want to verify a record, the CID in the contract event points
you straight back to the exact JSON that produced it.

```text
Report / audit item
        │
        ▼
lib/ipfs.ts  ──►  KuboRPCClient  ──►  canonical JSON envelope  ──►  CID
        │                                                        │
        └──── MongoDB export ◄──────────────────────────────────┘
```

## Client surface

Server-side IPFS access lives in `lib/ipfs.ts` behind a `KuboRPCClient`,
wrapped in `IpfsUnavailableError` so a failed pin reads as a controlled error
rather than an unhandled RPC rejection. It never leaks into client components.

The browser only needs the gateway helper `ipfsGatewayUrl(cid)`, which maps a
CID to the local gateway URL.

## Why on-chain

Writing the CID on-chain makes the stored artefact tamper-evident: a record
whose content has been edited in MongoDB will no longer hash to the CID the
contract recorded for that wallet. Verification is then trustless — pull the
JSON from the gateway, compute its CID, compare against the event.
