/**
 * Page content.
 *
 * Every string the UI renders lives here so components stay free of hardcoded
 * copy and can be reused with different text.
 */

export type Article = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type CollapsibleItem = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type ContentTab<T> = {
  id: string;
  label: string;
  items: T[];
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
      { id: "profile", label: "Profile", href: "#profile" },
      { id: "settings", label: "Settings", href: "#settings" },
      { id: "sign-out", label: "Sign out", href: "#sign-out" },
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
      id: "clima",
      label: "Clima",
      items: [
        {
          id: "clima-sensitivity",
          title: "Climate sensitivity is a range, not a number",
          paragraphs: [
            "Equilibrium climate sensitivity — how much the surface eventually warms after atmospheric carbon dioxide doubles — has been argued over for four decades. The 1979 Charney Report put it at 1.5 to 4.5 degrees Celsius. The 2013 IPCC assessment kept that same range after a review widely criticised for underweighting palaeoclimate evidence. The 2021 assessment moved to a best estimate of 3 degrees, with a likely range of 2.5 to 4.",
            "Three sources of uncertainty dominate. Cloud feedback is the first: low-level marine stratocumulus reflect sunlight, and whether those clouds thin or thicken as the planet warms is hard to observe directly. Aerosol forcing is the second, because the cooling effect of industrial particulates is inferred rather than measured, and small changes in that inference shift how much warming is attributed to greenhouse gases. Ocean heat uptake is the third, since it delays the surface response and makes the instrumental record an imperfect constraint.",
            "Palaeoclimate estimates matter because they integrate the system over centuries rather than decades. Reconstruct the Last Glacial Maximum and the inferred sensitivity tends to sit higher than when only the modern record is used. Reconciling the two remains open.",
            "The practical consequence is that policy thresholds are being set against a distribution rather than a point. A world that warms by 2 degrees and one that warms by 4 are not variations on a single scenario: they imply different coastlines, different agricultural zones and different extinction pressures. Framed as holding to 1.5, the target quietly assumes the low tail of a distribution whose upper tail has not been excluded.",
            "The honest summary is that the uncertainty has narrowed, it has not closed, and the residual width sits in exactly the processes that determine how bad the high end would be.",
          ],
        },
      ],
    },
    {
      id: "economy",
      label: "Economy",
      items: [
        {
          id: "economy-productivity",
          title: "What productivity numbers can and cannot tell us",
          paragraphs: [
            "Labour productivity — output per hour worked — is the closest thing economics has to a scorecard for living standards. Over long periods it is nearly the whole story: real wages track it with a lag, and the compounding difference between 1.5% and 2.5% annual growth is a third more income within a generation.",
            "The measurement is weaker than the headline suggests. Output is deflated by an index that struggles with quality change, and services — now most of the economy — are notoriously hard to price. When a subscription replaces a purchase, or a search engine replaces a phone call, the gain shows up late and imperfectly, if at all.",
            "Recent revisions illustrate the problem. Productivity growth across the 2010s was revised up substantially after new source data, turning a narrative of secular stagnation into one of slow but real improvement. The underlying economy had not changed; the estimate had.",
            "Sector averages also hide the spread. Within a single industry the gap between the most and least productive firms is large and persistent, and it varies more across countries than within them. That points at diffusion — how quickly management practices and capital reach laggards — rather than at invention alone.",
            "The limit is interpretive. Productivity data describe what happened; they do not identify why, and they cannot separate a durable shift from a cyclical one until well after it matters. Read as a single trend it misleads; read as a distribution it informs.",
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
      id: "contraargument",
      label: "Contraargument",
      items: [
        {
          id: "ca-relocation",
          title: "Relocation: production moves outside the scheme instead of cutting emissions",
          paragraphs: [
            "The concern is real, but the mechanism is narrower than it sounds. A border adjustment charges imports on their embedded emissions, so relocating production does not by itself lower the bill. What it can do is shift output to jurisdictions with weaker standards and higher carbon intensity per unit, which raises global emissions for unchanged demand.",
            "The design answers part of this: free allocation is withdrawn as border coverage expands, so producers inside the scheme keep an incentive to decarbonise rather than to move. The residual risk sits in sectors where abatement is genuinely hard and margins are thin.",
          ],
        },
        {
          id: "ca-incidence",
          title: "Incidence: the tariff is paid by domestic importers, not by foreign exporters",
          paragraphs: [
            "Who writes the cheque is clear; who ultimately bears the cost is not. Passed through to prices, the charge is regressive in practice, since carbon-intensive goods take a larger share of low-income budgets.",
            "That is an argument about revenue recycling, not about the instrument. Returning the receipts per capita converts the same levy from a regressive charge into a progressive one, which is a fiscal decision kept deliberately separate from the trade decision.",
          ],
        },
      ],
    },
    {
      id: "fallacies",
      label: "Fallacies",
      items: [
        {
          id: "fa-consequence",
          title: "Appeal to consequence: the policy is rejected because accepting it would be costly",
          paragraphs: [
            "The cost of a measure is evidence about its design, never about its truth. Arguing that a border tax must be wrong because it raises input prices evaluates a prediction, then treats the evaluation as a refutation.",
            "The honest form is comparative: costly relative to what baseline, over which horizon, and borne by whom.",
          ],
        },
        {
          id: "fa-dilemma",
          title: "False dilemma: presented as either a border tax or no climate policy at all",
          paragraphs: [
            "A border adjustment is one instrument among many — standards, subsidies, permits, procurement. Presenting it as the only alternative to inaction removes the actual policy space from the discussion.",
            "Watch for it in both directions: opponents use it to make the tax look compulsory, proponents use it to make rejecting the tax look like rejecting climate policy.",
          ],
        },
        {
          id: "fa-goalposts",
          title: "Moving the goalposts: cost objections become sovereignty objections once answered",
          paragraphs: [
            "Each rebuttal is met by a new, unrelated objection — competitiveness, then administrative burden, then treaty compatibility. The sequence is the tell: the objection is downstream of a conclusion already reached.",
            "A position that changes its stated reason while holding its conclusion is not being argued. It is being defended.",
          ],
        },
      ],
    },
    {
      id: "evidences",
      label: "Evidences",
      items: [
        {
          id: "ev-ets",
          title: "EU ETS coverage coincided with an 8% fall in covered emissions over its first decade",
          paragraphs: [
            "The association is well documented; the attribution is not. Over the same period the financial crisis removed output, fuel switching from coal to gas did much of the work, and a surplus of allowances suppressed the carbon price for years.",
            "Read as evidence that coverage changes behaviour, it is suggestive. Read as a clean estimate of the policy's own effect, it overstates.",
          ],
        },
        {
          id: "ev-leakage",
          title: "Carbon leakage appears in cement and aluminium, but not in the chemicals sector",
          paragraphs: [
            "Sector-level trade data splits the aggregate claim. Bulk, low-value, transport-sensitive products show measurable displacement; higher-value chemical output, where specification and proximity matter more, does not.",
            "This is the strongest case for a border instrument that is calibrated per sector rather than applied uniformly.",
          ],
        },
        {
          id: "ev-switzerland",
          title: "Switzerland linked its carbon price to the EU scheme through a bilateral agreement",
          paragraphs: [
            "The link is a working precedent for the administrative machinery: mutual recognition of certificates, a joint registry, and a dispute process.",
            "It also shows the political condition. The agreement held because both sides treated it as symmetric rather than as a unilateral standard imposed on one party.",
          ],
        },
      ],
    },
    {
      id: "sources",
      label: "Sources",
      items: [
        {
          id: "so-commission",
          title: "European Commission — CBAM impact assessment and implementing regulation, 2021–2023",
          paragraphs: [
            "Primary institutional source for scope, sectoral coverage and the phase-in schedule. The impact assessment is the reference for projected leakage risk; the regulation is the reference for what is actually in force.",
            "Both are normative documents: they state intent as well as evidence, and the modelling behind them is summarised rather than shown in full.",
          ],
        },
        {
          id: "so-oecd",
          title: "OECD — Effective Carbon Rates 2023: pricing greenhouse gas emissions",
          paragraphs: [
            "Comparable carbon prices across member and major partner economies, combining taxes and tradeable permit prices.",
            "Useful precisely because it is not built around the policy under debate, which makes it a good cross-check on claims about relative pricing.",
          ],
        },
        {
          id: "so-imf",
          title: "IMF — Fiscal policies for Paris-compatible mitigation, Staff Climate Notes",
          paragraphs: [
            "Sets out the instrument mix and the revenue-recycling options, and is explicit that the distributional outcome is a choice rather than a property of the levy.",
            "The discount to apply: an international institution writing to finance ministries, so its emphasis is administrability and revenue.",
          ],
        },
      ],
    },
    {
      id: "interpretation",
      label: "Interpretation",
      items: [
        {
          id: "in-pricing",
          title: "Read as a pricing instrument rather than a trade sanction, it changes incentives at the border",
          paragraphs: [
            "The distinction is not rhetorical. As a sanction, the measure is judged by whether it changes another government's behaviour — a high bar it is not designed to clear. As a pricing instrument, it is judged by whether domestic and imported output face comparable costs, which is a question about calibration.",
            "Most of the disagreement dissolves once the frame is settled, because the two readings disagree about what the policy is for rather than about how it works.",
          ],
        },
        {
          id: "in-coalition",
          title: "Read as a coalition-building device: it makes domestic carbon pricing politically survivable",
          paragraphs: [
            "On this reading the border component exists to answer the competitiveness objection that has blocked domestic pricing for two decades. Its value is political rather than fiscal — the revenue is secondary to the licence it gives legislatures to price carbon at home.",
            "That also predicts its limits. It works while the coalition stays narrow enough to be credible and broad enough to matter, and it degrades when either end slips.",
          ],
        },
      ],
    },
  ] satisfies ContentTab<CollapsibleItem>[],
};
