import { ContentTab, Article, CollapsibleItem } from "./types";

export const site = {
  brand: "Epistimology",
  title: "Epistimology — structured Bitcoin argument analysis",
  description:
    "Bitcoin reporting read side by side with a structured audit of arguments about money, decentralisation, financial risk and monetary policy.",
  search: {
    placeholder: "Search the dossier",
    label: "Search articles, evidence and sources",
  },
  avatar: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "Signed-in user avatar",
  },
  breadcrumbs: {
    /** Label introducing the dossier topic as the first crumb. */
    topicLabel: "Topic",
  },
};

/**
 * Human labels for route segments, used by the breadcrumbs.
 */
export const ROUTE_LABELS: Readonly<Record<string, string>> = {
  debate: "Debate",
  provenance: "Provenance",
  contraarguments: "Contraargument",
  evidences: "Evidences",
  fallacies: "Fallacies",
  interpretations: "Interpretation",
  sources: "Sources",
  create: "Create",
};

/**
 * Canonical argument labels.
 */
export const ARGUMENT_LABELS: readonly string[] = [
  "Bitcoin",
  "Money",
  "Finance",
  "Technology",
  "Policy",
];

export const argument = {
  title: "Bitcoin, audited",
  description:
    "Current reporting on Bitcoin and monetary systems, read against a structured audit of the argument — counterarguments, fallacies, evidence, sources and interpretation.",
  labels: ARGUMENT_LABELS,
};

export const reportingCard = {
  title: "Reporting",
  tabs: [
    {
      id: "eeb8779d-3258-42e5-97ca-1a7acf80110e",
      label: "Bitcoin",
      items: [
        {
          id: "175e9066-9d97-4fdd-b329-f24812aae5f4",
          title: "Bitcoin's scarcity is designed, not naturally given",
          labels: ["Bitcoin", "Technology"],
          author: "L. Brandt",
          date: "2024-06-18",
          authorAddress: "0x1111111111111111111111111111111111111111",
          openCount: 12,
          paragraphs: [
            {
              id: "6939462c-7850-4d71-923e-4ccb4817bf55",
              text: "Bitcoin's monetary supply is governed by rules enforced by its network rather than by a central monetary authority. New bitcoin are issued according to the protocol and the issuance rate decreases over time, creating a predictable supply schedule.",
              auditItemIds: [
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
                "78ce1754-4931-4b6b-b06e-a612446e59c4",
              ],
            },
            {
              id: "f87951a0-9441-4526-908c-14238bd1d79b",
              text: "The distinction between protocol scarcity and economic scarcity matters. Bitcoin can limit the number of native coins while the broader financial system continues creating other assets, claims and substitutes. A fixed supply therefore does not automatically create a fixed market value.",
              auditItemIds: [
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
                "9689838d-e4c2-4417-82fa-327960d4eebb",
              ],
            },
            {
              id: "737f2e04-79d4-4d04-8511-1d2354e1aeda",
              text: "The strongest claim supported by predictable issuance is that Bitcoin's monetary policy is transparent and difficult to change without broad network agreement. Whether that policy produces better economic outcomes is a separate question.",
              auditItemIds: [
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
              ],
            },
            {
              id: "c31aa796-c9aa-407d-8886-161c713dc882",
              text: "The practical consequence is that Bitcoin can be scarce without being stable. A scarce asset can still experience large changes in price when demand, liquidity or expectations change. Scarcity and purchasing-power stability should therefore be evaluated separately.",
              auditItemIds: [
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
                "b0120fad-6943-4990-be0a-d5cbae6e8010",
                "ada13922-a89f-4367-aff6-d78e6025ef82",
                "48dcabaf-4e9f-423b-a34d-37a6e7a7c0ba",
              ],
            },
            {
              id: "4553a178-86e9-41b3-aae6-14cf7dc8669d",
              text: "The honest summary is that Bitcoin offers unusually predictable monetary issuance, but predictable supply does not resolve the harder questions about volatility, utility, distribution, energy use and long-term demand.",
              auditItemIds: [
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
                "55ad631b-796e-4358-8359-564955c39730",
                "37efaf51-315b-4ee9-9d10-44c5488ec087",
              ],
            },
          ],
        },
        {
          id: "7a5d525e-fef3-45ce-9cf8-d8be8ed01fa6",
          title:
            "Bitcoin's network can operate without a central payment operator",
          labels: ["Bitcoin", "Technology"],
          author: "Bitcoin Research Desk",
          date: "2021-06-30",
          authorAddress: "0x4444444444444444444444444444444444444444",
          openCount: 34,
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
          paragraphs: [
            {
              id: "d31372cc-bc2c-46bd-a5f4-4da512790d02",
              text: "Bitcoin uses a distributed network of nodes to verify transactions according to publicly defined rules. Instead of relying on one institution to maintain the ledger, participants independently verify the transaction history and reach agreement through the network's consensus mechanism.",
              auditItemIds: [
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "78ce1754-4931-4b6b-b06e-a612446e59c4",
              ],
            },
            {
              id: "145f1c81-8d59-4039-a8fd-e21c0f80e2ab",
              text: "This architecture changes where trust is placed. Users do not need to trust a single bank to maintain the ledger, but they still depend on software rules, cryptography, network participants and their own custody practices.",
              auditItemIds: [
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
                "9689838d-e4c2-4417-82fa-327960d4eebb",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "244c085d-2c2f-4452-9e6e-b7135c91f035",
      label: "Money",
      items: [
        {
          id: "3f65ba15-cd01-426a-b3ef-c63b922f9e73",
          title: "What Bitcoin can and cannot tell us about money",
          labels: ["Money"],
          author: "A. Rossi",
          date: "2024-08-05",
          authorAddress: "0x2222222222222222222222222222222222222222",
          openCount: 8,
          paragraphs: [
            {
              id: "88446851-8bde-40cb-97cd-8d282af83859",
              text: "Money performs several functions: medium of exchange, unit of account and store of value. Bitcoin is clearly transferable and can be used for settlement, but its usefulness as a unit of account is limited when its price changes substantially against the goods and currencies people use every day.",
              auditItemIds: [
                "48dcabaf-4e9f-423b-a34d-37a6e7a7c0ba",
                "1be30ad8-cd1e-4631-a7b5-bd9d8d72f4bd",
                "b0120fad-6943-4990-be0a-d5cbae6e8010",
              ],
            },
            {
              id: "0d2c8c03-2fd0-46d4-a8d4-fd13cd155c37",
              text: "The measurement is therefore more complicated than counting transactions. A transaction can demonstrate that Bitcoin can transfer value, but it does not establish whether people prefer it to conventional payment systems or whether it is efficient for everyday purchases.",
              auditItemIds: [
                "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "9689838d-e4c2-4417-82fa-327960d4eebb",
              ],
            },
            {
              id: "9ea713c2-03a6-48d7-8eff-9f731e0cade5",
              text: "Bitcoin's role has also changed over time. Some users treat it as a payment network, others as a long-term asset, and others as protection against monetary or political risks. These different uses should not automatically be treated as evidence for the same claim.",
              auditItemIds: [
                "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
                "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
                "55ad631b-796e-4358-8359-564955c39730",
              ],
            },
            {
              id: "6501a025-f7ab-421b-8449-58a5489fc207",
              text: "Different users also face very different risks. An experienced self-custodian may value direct control over assets, while another user may prefer a regulated intermediary that can recover an account or reverse a fraudulent transaction.",
              auditItemIds: [
                "37efaf51-315b-4ee9-9d10-44c5488ec087",
                "1be30ad8-cd1e-4631-a7b5-bd9d8d72f4bd",
                "3a9723d7-16b5-4d69-a48b-538fdaa00990",
              ],
            },
            {
              id: "4c9ef13f-10ce-49c4-9187-b81d3011c465",
              text: "The limit is interpretive. Bitcoin transactions show that decentralised settlement is possible; they do not by themselves establish that decentralised settlement is superior to existing financial infrastructure for every use case.",
              auditItemIds: [
                "ada13922-a89f-4367-aff6-d78e6025ef82",
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
                "9689838d-e4c2-4417-82fa-327960d4eebb",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "9e04ee5e-6da3-4728-9b91-a888169d25d5",
      label: "Policy",
      items: [
        {
          id: "6602292d-299e-4b87-8460-f20fa2f150d6",
          title: "Bitcoin regulation lives or dies on what risk it targets",
          labels: ["Policy"],
          author: "S. Okafor",
          date: "2024-09-30",
          authorAddress: "0x3333333333333333333333333333333333333333",
          openCount: 21,
          paragraphs: [
            {
              id: "269c1042-6b04-442a-879e-8a4de47ee2ae",
              text: "Bitcoin regulation can target exchanges, custodians, payment providers, taxation, consumer protection or financial crime. Treating these as one problem makes it difficult to distinguish risks created by Bitcoin itself from risks created by intermediaries built around it.",
              auditItemIds: [
                "48dcabaf-4e9f-423b-a34d-37a6e7a7c0ba",
                "b0120fad-6943-4990-be0a-d5cbae6e8010",
              ],
            },
            {
              id: "5243c6a6-6b4e-40b8-ad16-e9355ec8393f",
              text: "The political reading matters as much as the technical one. Regulation can be framed as protecting consumers and financial stability, or as restricting an alternative financial system. The same rule can therefore be evaluated very differently depending on the problem policymakers are trying to solve.",
              auditItemIds: [
                "b0120fad-6943-4990-be0a-d5cbae6e8010",
                "fca860a3-58d1-4986-a411-a97fd61c0a84",
              ],
            },
          ],
        },
      ],
    },
  ] satisfies ContentTab<Article>[],
};

export const auditCard = {
  title: "Argument audit",
  tabs: [
    {
      id: "2d59d33d-f1bf-4ee4-b73e-379a436cfd47",
      label: "Contraargument",
      items: [
        {
          id: "3a9723d7-16b5-4d69-a48b-538fdaa00990",
          title:
            "Volatility: Bitcoin is difficult to use as a stable everyday currency",
          author: "H. Müller",
          date: "2024-09-12",
          paragraphs: [
            "The concern is straightforward: Bitcoin's market price has historically moved substantially over relatively short periods. Someone who receives a salary or holds savings in bitcoin can therefore experience large changes in purchasing power without changing their underlying amount of bitcoin.",
            "Supporters can respond that Bitcoin does not need to replace fiat currency to be useful. But that changes the claim from stable everyday money to an alternative asset or settlement network.",
          ],
        },
        {
          id: "48dcabaf-4e9f-423b-a34d-37a6e7a7c0ba",
          title:
            "Energy use: securing the network requires substantial computational resources",
          author: "S. Okafor",
          date: "2025-01-28",
          paragraphs: [
            "Bitcoin's proof-of-work consensus mechanism requires miners to perform computational work, which consumes electricity. The environmental significance depends not only on total energy use but also on the energy sources, opportunity cost and alternative systems being compared.",
            "That makes energy consumption a real design trade-off rather than a simple proof that the network is either good or bad.",
          ],
        },
      ],
    },
    {
      id: "7c59449d-c76e-4672-a36c-83d29d8d61cd",
      label: "Fallacies",
      author: "J. Kim",
      date: "2025-02-14",
      items: [
        {
          id: "9689838d-e4c2-4417-82fa-327960d4eebb",
          title:
            "Appeal to popularity: Bitcoin is valuable because millions of people believe in it",
          author: "L. Brandt",
          date: "2024-10-03",
          paragraphs: [
            "Adoption is evidence that people find Bitcoin useful or valuable, but popularity does not establish which particular claim about Bitcoin is true.",
            "The honest form is comparative: useful for what purpose, compared with which alternative, at what cost, and for which users.",
          ],
        },
        {
          id: "ada13922-a89f-4367-aff6-d78e6025ef82",
          title:
            "False dilemma: Bitcoin is either the future of money or completely worthless",
          author: "A. Rossi",
          date: "2024-11-21",
          paragraphs: [
            "Bitcoin does not need to become the dominant global currency to have some economic value. It can be useful as a settlement network, alternative asset, censorship-resistant payment mechanism or experimental monetary system without fulfilling every monetary function.",
            "The same mistake appears in the opposite direction when critics treat failure to replace fiat currencies as proof that Bitcoin has no useful properties.",
          ],
        },
        {
          id: "55ad631b-796e-4358-8359-564955c39730",
          title:
            "Moving the goalposts: changing Bitcoin's purpose whenever an objection is answered",
          author: "J. Kim",
          date: "2025-02-14",
          paragraphs: [
            "A discussion may begin with the claim that Bitcoin will replace everyday payments, then shift to digital gold when payment adoption is challenged, and later shift to censorship resistance when the store-of-value argument is questioned.",
            "Those can all be legitimate properties to investigate, but changing the central claim after each objection makes the original proposition difficult to falsify.",
          ],
        },
      ],
    },
    {
      id: "be74826b-5390-412d-b5e6-550dd23a138d",
      label: "Evidences",
      items: [
        {
          id: "f957f8d6-4ad1-4e49-90f6-a45c687bedbe",
          title:
            "Bitcoin's monetary issuance follows a predictable protocol schedule",
          paragraphs: [
            "Bitcoin's protocol determines how new bitcoin enter circulation and reduces the issuance rate through scheduled halvings. This provides a transparent monetary issuance rule that does not depend on a committee setting a new supply target each period.",
            "The evidence supports predictability of issuance. It does not establish that a fixed or declining issuance schedule is necessarily superior to discretionary monetary policy.",
          ],
        },
        {
          id: "37efaf51-315b-4ee9-9d10-44c5488ec087",
          title:
            "Bitcoin has experienced substantial historical price volatility",
          paragraphs: [
            "Bitcoin has experienced repeated periods of very large price increases and declines. These episodes demonstrate that bitcoin ownership can involve substantial market risk over relatively short periods.",
            "The historical record is strong evidence about past volatility, but it cannot by itself establish what volatility will look like as the market matures.",
          ],
        },
        {
          id: "b56e2ea4-ec7b-4ac0-af48-8edc0592a1a8",
          title:
            "Bitcoin transactions can be verified without a single central ledger operator",
          paragraphs: [
            "Bitcoin nodes independently validate transactions and blocks according to publicly available consensus rules. The network therefore does not require one central institution to maintain the canonical transaction history.",
            "This supports the claim that Bitcoin provides decentralised transaction verification, although it does not mean every company, exchange or service surrounding Bitcoin is decentralised.",
          ],
        },
      ],
    },
    {
      id: "75acdce8-e309-4429-8c39-361768b62249",
      label: "Sources",
      items: [
        {
          id: "78ce1754-4931-4b6b-b06e-a612446e59c4",
          title:
            "Bitcoin Core — developer documentation and protocol reference",
          paragraphs: [
            "Primary technical source for Bitcoin's transaction model, validation rules, peer-to-peer network and consensus behaviour.",
            "Useful for claims about how Bitcoin works because the documentation describes the protocol rather than making a general investment argument.",
          ],
        },
        {
          id: "ff910dbe-3b3c-42ee-a73c-d712b3f7cebf",
          title:
            "Federal Reserve research — Bitcoin, cryptocurrencies and monetary economics",
          paragraphs: [
            "Research examining Bitcoin's relationship with money, payments, monetary policy and financial markets.",
            "Useful as a cross-check against claims made by Bitcoin advocates and critics because individual studies can be evaluated according to their specific methods and assumptions.",
          ],
        },
        {
          id: "1be30ad8-cd1e-4631-a7b5-bd9d8d72f4bd",
          title:
            "BIS research — cryptoassets, monetary systems and financial stability",
          paragraphs: [
            "Research examining cryptoassets from the perspective of monetary economics, financial stability and payment systems.",
            "The main discount to apply is institutional perspective: the research often focuses on risks to the existing financial system rather than Bitcoin's strongest philosophical arguments.",
          ],
        },
      ],
    },
    {
      id: "2702141c-4f3c-4786-961b-7aaf528040de",
      label: "Interpretation",
      author: "T. Nguyen",
      date: "2025-04-17",
      items: [
        {
          id: "fca860a3-58d1-4986-a411-a97fd61c0a84",
          title:
            "Read as a monetary technology rather than an investment, Bitcoin changes the question",
          author: "E. Duarte",
          date: "2025-03-05",
          paragraphs: [
            "If Bitcoin is evaluated primarily as an investment, price volatility, liquidity and expected returns dominate the discussion. If it is evaluated as monetary infrastructure, the relevant questions become settlement, self-custody, censorship resistance, verification and monetary issuance.",
            "Most disagreements become clearer once the frame is explicit, because different frames ask Bitcoin to solve different problems.",
          ],
        },
        {
          id: "b0120fad-6943-4990-be0a-d5cbae6e8010",
          title:
            "Read as an alternative financial infrastructure: Bitcoin's value depends on the problems it solves",
          author: "T. Nguyen",
          date: "2025-04-17",
          paragraphs: [
            "Bitcoin does not necessarily need to replace national currencies to provide useful infrastructure. Its strongest case may be in situations where users value permissionless transfers, self-custody or an alternative settlement system.",
            "That interpretation also makes the limitations clearer. Volatility, usability, custody risk, energy consumption and regulatory constraints become part of the evaluation rather than objections that must simply be dismissed.",
          ],
        },
      ],
    },
  ] satisfies ContentTab<CollapsibleItem>[],
};
