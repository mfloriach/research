/**
 * Page content.
 *
 * Every string the UI renders lives here so components stay free of hardcoded
 * copy and can be reused with different text.
 *
 * All `id` fields are UUIDv4 strings. `auditItemIds` reference audit item
 * UUIDs defined in `auditCard`.
 */

export type ReportingParagraph = {
  id: string;
  text: string;
  /** IDs into `auditCard` items shown when this paragraph is selected. */
  auditItemIds: string[];
};

export type Article = {
  id: string;
  title: string;
  paragraphs: ReportingParagraph[];
};

export type CollapsibleItem = {
  id: string;
  title: string;
  paragraphs: string[];
  author?: string;
  date?: string;
};

export type ContentTab<T> = {
  id: string;
  label: string;
  items: T[];
  author?: string;
  date?: string;
};

export type MenuItem = {
  id: string;
  label: string;
  href: string;
};

export const site = {
  brand: "Epistimology",
  title: "Epistimology — structured argument analysis",
  description:
    "Climate and economy reporting read side by side with a structured audit of the carbon border tax argument.",
  search: {
    placeholder: "Search the dossier",
    label: "Search articles, evidence and sources",
  },
  avatar: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "Signed-in user avatar",
  },
  menu: {
    label: "Account menu",
    items: [
      {
        id: "32d73367-260e-4855-b7dc-dab080ed8929",
        label: "Profile",
        href: "#profile",
      },
      {
        id: "99626ca3-7156-4461-b224-1616f023f6c2",
        label: "Settings",
        href: "#settings",
      },
      {
        id: "f01fadf6-e614-4523-8bb3-aab85b8feaa3",
        label: "Sign out",
        href: "#sign-out",
      },
    ] satisfies MenuItem[],
  },
};

export const heading = {
  title: "Carbon border taxes, audited",
  description:
    "Current reporting on climate and the economy, read against a structured audit of the argument — counterarguments, fallacies, evidence, sources and interpretation.",
};

export const reportingCard = {
  title: "Reporting",
  tabs: [
    {
      id: "cd58cc87-b488-481f-8be4-397767fdd010",
      label: "Clima",
      items: [
        {
          id: "33c84ebe-6f7d-4100-9fa0-0100f30d128f",
          title: "Climate sensitivity is a range, not a number",
          paragraphs: [
            {
              id: "1cb8e607-f3a7-4614-a44c-da704f1b6780",
              text: "Equilibrium climate sensitivity — how much the surface eventually warms after atmospheric carbon dioxide doubles — has been argued over for four decades. The 1979 Charney Report put it at 1.5 to 4.5 degrees Celsius. The 2013 IPCC assessment kept that same range after a review widely criticised for underweighting palaeoclimate evidence. The 2021 assessment moved to a best estimate of 3 degrees, with a likely range of 2.5 to 4.",
              auditItemIds: [
                "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
                "6625b27f-1e90-4615-a444-a1070fa38233",
                "0eb94504-0b6b-4070-931c-10e2ad242af2",
              ],
            },
            {
              id: "b0725e6e-56d0-4e3d-bc20-9f193c159410",
              text: "Three sources of uncertainty dominate. Cloud feedback is the first: low-level marine stratocumulus reflect sunlight, and whether those clouds thin or thicken as the planet warms is hard to observe directly. Aerosol forcing is the second, because the cooling effect of industrial particulates is inferred rather than measured, and small changes in that inference shift how much warming is attributed to greenhouse gases. Ocean heat uptake is the third, since it delays the surface response and makes the instrumental record an imperfect constraint.",
              auditItemIds: [
                "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
                "6625b27f-1e90-4615-a444-a1070fa38233",
                "2746480b-1cfa-4650-954c-43283dea532f",
              ],
            },
            {
              id: "401b5cc3-b16f-41b1-be57-d1d77830ff94",
              text: "Palaeoclimate estimates matter because they integrate the system over centuries rather than decades. Reconstruct the Last Glacial Maximum and the inferred sensitivity tends to sit higher than when only the modern record is used. Reconciling the two remains open.",
              auditItemIds: [
                "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
                "6625b27f-1e90-4615-a444-a1070fa38233",
                "a7d6e08d-8071-4a2d-b8c5-d4a88d1a9c6c",
              ],
            },
            {
              id: "a35338c2-1e3f-433d-aad4-ba7b738895a8",
              text: "The practical consequence is that policy thresholds are being set against a distribution rather than a point. A world that warms by 2 degrees and one that warms by 4 are not variations on a single scenario: they imply different coastlines, different agricultural zones and different extinction pressures. Framed as holding to 1.5, the target quietly assumes the low tail of a distribution whose upper tail has not been excluded.",
              auditItemIds: [
                "a7d6e08d-8071-4a2d-b8c5-d4a88d1a9c6c",
                "37adaa72-5215-4edb-a297-08bfa9b46623",
                "a5279f38-dca3-4921-aad8-9c6b049ce5c0",
                "95b87e22-bdc7-4761-a186-a3a4488caba9",
              ],
            },
            {
              id: "0264bc19-b7a3-4dff-8cde-e08d11ac4bfe",
              text: "The honest summary is that the uncertainty has narrowed, it has not closed, and the residual width sits in exactly the processes that determine how bad the high end would be.",
              auditItemIds: [
                "a7d6e08d-8071-4a2d-b8c5-d4a88d1a9c6c",
                "580d58a3-779b-4d98-9970-021478894e6e",
                "dfa621c5-cde8-4468-9249-a341e98a5a36",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "37ed05ed-bccf-49d2-8695-b6d0de0fedf5",
      label: "Economy",
      items: [
        {
          id: "ac11660e-454a-416a-82e2-37e32e21f0fc",
          title: "What productivity numbers can and cannot tell us",
          paragraphs: [
            {
              id: "02985276-a8d5-4c5c-afbc-d615beb85b1c",
              text: "Labour productivity — output per hour worked — is the closest thing economics has to a scorecard for living standards. Over long periods it is nearly the whole story: real wages track it with a lag, and the compounding difference between 1.5% and 2.5% annual growth is a third more income within a generation.",
              auditItemIds: [
                "95b87e22-bdc7-4761-a186-a3a4488caba9",
                "cbc09843-2888-481e-819f-ff5b9b7f159a",
                "37adaa72-5215-4edb-a297-08bfa9b46623",
              ],
            },
            {
              id: "8af2f4be-684e-4551-b986-bf45f5f7dbbb",
              text: "The measurement is weaker than the headline suggests. Output is deflated by an index that struggles with quality change, and services — now most of the economy — are notoriously hard to price. When a subscription replaces a purchase, or a search engine replaces a phone call, the gain shows up late and imperfectly, if at all.",
              auditItemIds: [
                "6625b27f-1e90-4615-a444-a1070fa38233",
                "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
                "2746480b-1cfa-4650-954c-43283dea532f",
              ],
            },
            {
              id: "ac22edce-8bb5-4f35-9bdc-3034764c9bbf",
              text: "Recent revisions illustrate the problem. Productivity growth across the 2010s was revised up substantially after new source data, turning a narrative of secular stagnation into one of slow but real improvement. The underlying economy had not changed; the estimate had.",
              auditItemIds: [
                "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
                "6625b27f-1e90-4615-a444-a1070fa38233",
                "580d58a3-779b-4d98-9970-021478894e6e",
              ],
            },
            {
              id: "5b5f7b2b-b793-42a5-9e30-56ed72b3feae",
              text: "Sector averages also hide the spread. Within a single industry the gap between the most and least productive firms is large and persistent, and it varies more across countries than within them. That points at diffusion — how quickly management practices and capital reach laggards — rather than at invention alone.",
              auditItemIds: [
                "dfa621c5-cde8-4468-9249-a341e98a5a36",
                "cbc09843-2888-481e-819f-ff5b9b7f159a",
                "8cc991c0-94b8-40f5-beae-0e1ae0229ee5",
              ],
            },
            {
              id: "ce4291f7-0f6d-4a75-833a-7e2abd54ab07",
              text: "The limit is interpretive. Productivity data describe what happened; they do not identify why, and they cannot separate a durable shift from a cyclical one until well after it matters. Read as a single trend it misleads; read as a distribution it informs.",
              auditItemIds: [
                "a5279f38-dca3-4921-aad8-9c6b049ce5c0",
                "a7d6e08d-8071-4a2d-b8c5-d4a88d1a9c6c",
                "2746480b-1cfa-4650-954c-43283dea532f",
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
      id: "97b47741-b5cc-4975-83ae-53719f6cf3c1",
      label: "Contraargument",
      items: [
        {
          id: "8cc991c0-94b8-40f5-beae-0e1ae0229ee5",
          title: "Relocation: production moves outside the scheme instead of cutting emissions",
          author: "H. Müller",
          date: "2024-09-12",
          paragraphs: [
            "The concern is real, but the mechanism is narrower than it sounds. A border adjustment charges imports on their embedded emissions, so relocating production does not by itself lower the bill. What it can do is shift output to jurisdictions with weaker standards and higher carbon intensity per unit, which raises global emissions for unchanged demand.",
            "The design answers part of this: free allocation is withdrawn as border coverage expands, so producers inside the scheme keep an incentive to decarbonise rather than to move. The residual risk sits in sectors where abatement is genuinely hard and margins are thin.",
          ],
        },
        {
          id: "95b87e22-bdc7-4761-a186-a3a4488caba9",
          title: "Incidence: the tariff is paid by domestic importers, not by foreign exporters",
          author: "S. Okafor",
          date: "2025-01-28",
          paragraphs: [
            "Who writes the cheque is clear; who ultimately bears the cost is not. Passed through to prices, the charge is regressive in practice, since carbon-intensive goods take a larger share of low-income budgets.",
            "That is an argument about revenue recycling, not about the instrument. Returning the receipts per capita converts the same levy from a regressive charge into a progressive one, which is a fiscal decision kept deliberately separate from the trade decision.",
          ],
        },
      ],
    },
    {
      id: "b36c3ee0-abfe-4b21-a54d-c9f0423df768",
      label: "Fallacies",
      author: "J. Kim",
      date: "2025-02-14",
      items: [
        {
          id: "2746480b-1cfa-4650-954c-43283dea532f",
          title: "Appeal to consequence: the policy is rejected because accepting it would be costly",
          author: "L. Brandt",
          date: "2024-10-03",
          paragraphs: [
            "The cost of a measure is evidence about its design, never about its truth. Arguing that a border tax must be wrong because it raises input prices evaluates a prediction, then treats the evaluation as a refutation.",
            "The honest form is comparative: costly relative to what baseline, over which horizon, and borne by whom.",
          ],
        },
        {
          id: "a5279f38-dca3-4921-aad8-9c6b049ce5c0",
          title: "False dilemma: presented as either a border tax or no climate policy at all",
          author: "A. Rossi",
          date: "2024-11-21",
          paragraphs: [
            "A border adjustment is one instrument among many — standards, subsidies, permits, procurement. Presenting it as the only alternative to inaction removes the actual policy space from the discussion.",
            "Watch for it in both directions: opponents use it to make the tax look compulsory, proponents use it to make rejecting the tax look like rejecting climate policy.",
          ],
        },
        {
          id: "580d58a3-779b-4d98-9970-021478894e6e",
          title: "Moving the goalposts: cost objections become sovereignty objections once answered",
          author: "J. Kim",
          date: "2025-02-14",
          paragraphs: [
            "Each rebuttal is met by a new, unrelated objection — competitiveness, then administrative burden, then treaty compatibility. The sequence is the tell: the objection is downstream of a conclusion already reached.",
            "A position that changes its stated reason while holding its conclusion is not being argued. It is being defended.",
          ],
        },
      ],
    },
    {
      id: "537b2424-1e4f-4962-af16-1d11de2645f7",
      label: "Evidences",
      items: [
        {
          id: "17dae7c0-edb0-4f2b-8611-4a72d5dd53d1",
          title: "EU ETS coverage coincided with an 8% fall in covered emissions over its first decade",
          paragraphs: [
            "The association is well documented; the attribution is not. Over the same period the financial crisis removed output, fuel switching from coal to gas did much of the work, and a surplus of allowances suppressed the carbon price for years.",
            "Read as evidence that coverage changes behaviour, it is suggestive. Read as a clean estimate of the policy's own effect, it overstates.",
          ],
        },
        {
          id: "dfa621c5-cde8-4468-9249-a341e98a5a36",
          title: "Carbon leakage appears in cement and aluminium, but not in the chemicals sector",
          paragraphs: [
            "Sector-level trade data splits the aggregate claim. Bulk, low-value, transport-sensitive products show measurable displacement; higher-value chemical output, where specification and proximity matter more, does not.",
            "This is the strongest case for a border instrument that is calibrated per sector rather than applied uniformly.",
          ],
        },
        {
          id: "2ade1891-0c77-4112-b37e-ee115547d809",
          title: "Switzerland linked its carbon price to the EU scheme through a bilateral agreement",
          paragraphs: [
            "The link is a working precedent for the administrative machinery: mutual recognition of certificates, a joint registry, and a dispute process.",
            "It also shows the political condition. The agreement held because both sides treated it as symmetric rather than as a unilateral standard imposed on one party.",
          ],
        },
      ],
    },
    {
      id: "b97b9a6e-eef8-4df5-aef6-ca388113a3b2",
      label: "Sources",
      items: [
        {
          id: "0eb94504-0b6b-4070-931c-10e2ad242af2",
          title: "European Commission — CBAM impact assessment and implementing regulation, 2021–2023",
          paragraphs: [
            "Primary institutional source for scope, sectoral coverage and the phase-in schedule. The impact assessment is the reference for projected leakage risk; the regulation is the reference for what is actually in force.",
            "Both are normative documents: they state intent as well as evidence, and the modelling behind them is summarised rather than shown in full.",
          ],
        },
        {
          id: "6625b27f-1e90-4615-a444-a1070fa38233",
          title: "OECD — Effective Carbon Rates 2023: pricing greenhouse gas emissions",
          paragraphs: [
            "Comparable carbon prices across member and major partner economies, combining taxes and tradeable permit prices.",
            "Useful precisely because it is not built around the policy under debate, which makes it a good cross-check on claims about relative pricing.",
          ],
        },
        {
          id: "cbc09843-2888-481e-819f-ff5b9b7f159a",
          title: "IMF — Fiscal policies for Paris-compatible mitigation, Staff Climate Notes",
          paragraphs: [
            "Sets out the instrument mix and the revenue-recycling options, and is explicit that the distributional outcome is a choice rather than a property of the levy.",
            "The discount to apply: an international institution writing to finance ministries, so its emphasis is administrability and revenue.",
          ],
        },
      ],
    },
    {
      id: "a9c65285-7074-4175-b978-6c6c6267a1db",
      label: "Interpretation",
      author: "T. Nguyen",
      date: "2025-04-17",
      items: [
        {
          id: "a7d6e08d-8071-4a2d-b8c5-d4a88d1a9c6c",
          title: "Read as a pricing instrument rather than a trade sanction, it changes incentives at the border",
          author: "E. Duarte",
          date: "2025-03-05",
          paragraphs: [
            "The distinction is not rhetorical. As a sanction, the measure is judged by whether it changes another government's behaviour — a high bar it is not designed to clear. As a pricing instrument, it is judged by whether domestic and imported output face comparable costs, which is a question about calibration.",
            "Most of the disagreement dissolves once the frame is settled, because the two readings disagree about what the policy is for rather than about how it works.",
          ],
        },
        {
          id: "37adaa72-5215-4edb-a297-08bfa9b46623",
          title: "Read as a coalition-building device: it makes domestic carbon pricing politically survivable",
          author: "T. Nguyen",
          date: "2025-04-17",
          paragraphs: [
            "On this reading the border component exists to answer the competitiveness objection that has blocked domestic pricing for two decades. Its value is political rather than fiscal — the revenue is secondary to the licence it gives legislatures to price carbon at home.",
            "That also predicts its limits. It works while the coalition stays narrow enough to be credible and broad enough to matter, and it degrades when either end slips.",
          ],
        },
      ],
    },
  ] satisfies ContentTab<CollapsibleItem>[],
};
