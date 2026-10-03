import { ContentTab, Article, CollapsibleItem } from "./types";

export const site = {
  brand: "Epistimology",
  title: "Epistimology — Rick and Morty: Pilot",
  description:
    "A structured analysis of Rick and Morty's first episode, read through characters, themes, evidence, interpretations and counterarguments.",
  search: {
    placeholder: "Search the dossier",
    label: "Search articles, themes and interpretations",
  },
  avatar: {
    src: "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp",
    alt: "Signed-in user avatar",
  },
  breadcrumbs: {
    topicLabel: "Topic",
  },
};

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

export const ARGUMENT_LABELS: readonly string[] = [
  "Characters",
  "Family",
  "Science",
  "Humor",
  "Existentialism",
];

export const argument = {
  title: "Rick and Morty: Pilot, audited",
  description:
    "The first episode introduces Rick, Morty and their family while establishing the show's central tension: extraordinary scientific freedom collides with ordinary family responsibilities.",
  labels: ARGUMENT_LABELS,
};

export const reportingCard = {
  title: "Episode",
  tabs: [
    {
      id: "4b5d8a01-3c72-4f9e-a1d6-82c4e7b91f20",
      label: "Characters",
      items: [
        {
          id: "8e2a6d41-5c90-4b17-a8f3-1d72c6e904ab",
          title:
            "Rick's first appearance establishes the show's central contradiction",
          labels: ["Characters", "Science"],
          author: "Episode analysis",
          date: "2013-12-02",
          authorAddress: "0x1111111111111111111111111111111111111111",
          openCount: 12,
          paragraphs: [
            {
              id: "1f3c7a20-8d45-4e91-b6a2-5c7d9e0f3148",
              text: "Rick is introduced as a brilliant but unreliable scientist whose behavior repeatedly conflicts with the expectations of his family. His scientific ability gives him enormous freedom, while his disregard for ordinary responsibilities creates immediate friction.",
              auditItemIds: [
                "91a4e7c2-5d68-4f30-b9a1-2e7c6d8f4053",
                "63b8d1f4-2a97-4c65-ae30-7d9f1b5c8246",
              ],
            },
            {
              id: "7b2e9d41-6c53-4a80-b1f7-3e5d8c9a2046",
              text: "The episode does not present Rick simply as a hero or villain. His inventions solve problems that ordinary people could not solve, but the same indifference that makes him fearless also makes him dangerous to the people around him.",
              auditItemIds: [
                "91a4e7c2-5d68-4f30-b9a1-2e7c6d8f4053",
                "a7d3c9e1-4f62-48b5-b0a7-2d6e8c9f3154",
              ],
            },
          ],
        },
        {
          id: "2c7f5e91-4a83-46d0-b2e6-9d1c8f7035ab",
          title: "Morty is introduced as both sidekick and moral constraint",
          labels: ["Characters", "Family"],
          author: "Episode analysis",
          date: "2013-12-02",
          authorAddress: "0x2222222222222222222222222222222222222222",
          openCount: 8,
          paragraphs: [
            {
              id: "5e8c2a71-3d94-4f60-b1a7-9c2e6d8f3054",
              text: "Morty initially follows Rick because he is fascinated and frightened by the possibilities of interdimensional travel. His reactions also provide the audience with a human-scale response to situations that Rick treats as routine.",
              auditItemIds: [
                "63b8d1f4-2a97-4c65-ae30-7d9f1b5c8246",
                "c4e7a1d9-5b62-48f0-a3d7-9e1c6b8254f0",
              ],
            },
            {
              id: "9a4d7c20-6e51-4f83-b2c9-1d7e5a8f3046",
              text: "Morty's fear and confusion are not merely comic reactions. They create a contrast with Rick's confidence and establish the relationship that drives the episode: Rick treats danger as ordinary while Morty keeps reminding the audience that it is not.",
              auditItemIds: [
                "c4e7a1d9-5b62-48f0-a3d7-9e1c6b8254f0",
                "e2a8c5f1-7d43-49b0-b6e1-3c9a8f2057d4",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "9d4e7a20-5c81-43f6-b2a9-6e1c8d7054ab",
      label: "Family",
      items: [
        {
          id: "3a8f1c62-7d45-4e90-b2a6-5c9e1f7038bd",
          title: "Beth and Jerry represent competing ideas of responsibility",
          labels: ["Family"],
          author: "Episode analysis",
          date: "2013-12-02",
          authorAddress: "0x3333333333333333333333333333333333333333",
          openCount: 15,
          paragraphs: [
            {
              id: "6c2e8a51-4f73-49d0-b1a7-5e9c3d8026f4",
              text: "Beth is caught between loyalty to her father and the need to protect the stability of her family. Jerry, meanwhile, sees Rick's behavior primarily through the lens of disruption and irresponsibility.",
              auditItemIds: [
                "b5e7c1a9-4d62-48f0-93a8-2e6c7f1054bd",
                "f1a8c4e7-5d30-49b2-a6e1-7c9f2038d54a",
              ],
            },
            {
              id: "8f3a6d21-5c74-4e90-b2a1-7d9c0e5836af",
              text: "Their conflict is important because Rick's extraordinary abilities do not remove the ordinary consequences of his actions. The family still has to deal with fear, trust, embarrassment and the practical consequences of his experiments.",
              auditItemIds: [
                "b5e7c1a9-4d62-48f0-93a8-2e6c7f1054bd",
                "e2a8c5f1-7d43-49b0-b6e1-3c9a8f2057d4",
              ],
            },
          ],
        },
      ],
    },
    {
      id: "5e2a8c71-3d94-4f60-b1a7-9c2e6d8054f3",
      label: "Science",
      items: [
        {
          id: "7c1e9a42-5d68-4f30-b2a7-8e3d6c9051fb",
          title: "Interdimensional travel changes the scale of the story",
          labels: ["Science", "Existentialism"],
          author: "Episode analysis",
          date: "2013-12-02",
          authorAddress: "0x4444444444444444444444444444444444444444",
          openCount: 21,
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=WNhH00OIPP0",
          paragraphs: [
            {
              id: "4a7e2c91-5d63-48f0-b1a9-6c8e3f7025bd",
              text: "The portal technology establishes that the story is not limited to a single world. That immediately turns what might have been a conventional family adventure into a story about radically expanded possibilities and consequences.",
              auditItemIds: [
                "91a4e7c2-5d68-4f30-b9a1-2e7c6d8f4053",
                "d6c2a8f1-4e73-49b0-b5d9-1c7e6a2048f3",
              ],
            },
            {
              id: "8d3f6a21-5c74-4e90-b2a1-7c9e0d5836af",
              text: "The episode uses science fiction concepts primarily as narrative tools. The technology does not receive a rigorous scientific explanation; instead, its purpose is to make impossible situations ordinary enough for the characters to react to them.",
              auditItemIds: ["d6c2a8f1-4e73-49b0-b5d9-1c7e6a2048f3"],
            },
          ],
        },
      ],
    },
  ],
} satisfies ContentTab<Article>[];

export const auditCard = {
  title: "Episode audit",
  tabs: [
    {
      id: "1f7c3a82-5d94-4e60-b2a9-8c1e6d7054fb",
      label: "Contraargument",
      items: [
        {
          id: "a6e2c8f1-4d73-49b0-b5a9-1c7e3f8052d6",
          title: "Rick is not simply an irresponsible character",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "Rick repeatedly behaves irresponsibly, but reducing him to that trait misses the reason the character is compelling. His scientific competence allows him to solve problems that the rest of the family cannot even understand.",
            "The episode therefore creates a tension rather than a simple moral lesson: the same independence that produces extraordinary possibilities also makes Rick difficult to trust.",
          ],
        },
        {
          id: "c8f2a6e1-5d73-49b0-b4a7-2e9c1f8053d6",
          title: "Morty is more than a passive sidekick",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "Morty frequently reacts to Rick's decisions rather than making them, but his discomfort establishes the emotional stakes of the adventure. He gives the audience a perspective from which Rick's behavior can be questioned.",
            "His role is therefore partly structural: Morty's uncertainty prevents the fictional world from becoming completely normalized by Rick's perspective.",
          ],
        },
      ],
    },
    {
      id: "3e7a1c82-5d94-4f60-b2a9-8c1e6d7054fb",
      label: "Fallacies",
      items: [
        {
          id: "b5c9e1f7-4a62-48d0-a3e8-2c7d6f1054ab",
          title:
            "Appeal to authority: intelligence is treated as a substitute for responsibility",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "Rick's extraordinary intelligence gives him practical authority, but intelligence alone does not establish that his decisions are safe or morally justified.",
            "The episode repeatedly plays with the gap between being able to solve a problem and having good reasons to create the problem in the first place.",
          ],
        },
        {
          id: "d7a3c9e1-5f62-48b0-a4e7-2c6d8f1053bd",
          title: "False dilemma: adventure versus ordinary family life",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "The episode often places Rick's extraordinary adventures against the family's ordinary concerns, but it does not establish that the two must be mutually exclusive.",
            "The tension works because the characters behave as though they have to choose between Rick's freedom and the family's stability, even though the rest of the series explores many intermediate possibilities.",
          ],
        },
      ],
    },
    {
      id: "8c2e6a91-5d73-4f60-b1a7-9e3d8052c4fb",
      label: "Evidences",
      items: [
        {
          id: "91a4e7c2-5d68-4f30-b9a1-2e7c6d8f4053",
          title: "Rick repeatedly treats extraordinary danger as routine",
          paragraphs: [
            "His casual attitude toward technology, monsters and interdimensional travel establishes a large difference between his perception of risk and Morty's.",
            "That contrast is one of the episode's main mechanisms for generating both comedy and tension.",
          ],
        },
        {
          id: "63b8d1f4-2a97-4c65-ae30-7d9f1b5c8246",
          title:
            "Morty's reactions establish the human cost of Rick's decisions",
          paragraphs: [
            "Morty's fear, hesitation and attempts to understand what is happening provide a recurring counterpoint to Rick's confidence.",
            "The evidence supports reading Morty as an emotional anchor even when the episode prioritizes absurdity over realism.",
          ],
        },
        {
          id: "d6c2a8f1-4e73-49b0-b5d9-1c7e6a2048f3",
          title:
            "Portal technology expands the story beyond the domestic setting",
          paragraphs: [
            "The portal gun turns the Smith family's home into a gateway to other worlds and makes the consequences of Rick's actions potentially much larger than a normal family dispute.",
            "Its narrative importance is therefore greater than its role as a fictional gadget: it establishes the scale of the show's universe.",
          ],
        },
      ],
    },
    {
      id: "f4a8c2e1-5d73-49b0-a6c7-2e9d1f8053ab",
      label: "Sources",
      items: [
        {
          id: "e1c7a4f9-5d62-48b0-a3e8-2c6d9f1057bd",
          title: "Rick and Morty — Pilot episode",
          paragraphs: [
            "Primary source for the events, dialogue, character introductions and fictional technology discussed in this dossier.",
            "This dossier summarizes and analyzes the episode rather than reproducing its script.",
          ],
        },
        {
          id: "a4e8c2f1-5d73-49b0-b6a7-2c9d1f8053e6",
          title: "Rick and Morty — Season 1 production context",
          paragraphs: [
            "Useful secondary context for understanding the episode as the introduction to the show's recurring characters, tone and science-fiction premise.",
            "Production context should be treated separately from claims about what happens inside the episode itself.",
          ],
        },
      ],
    },
    {
      id: "c5e9a1f7-4d62-48b0-a3e8-2c6d9f1057bd",
      label: "Interpretation",
      items: [
        {
          id: "e2a8c5f1-7d43-49b0-b6e1-3c9a8f2057d4",
          title:
            "The episode can be read as a conflict between freedom and responsibility",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "Rick represents almost unlimited freedom of movement and experimentation, while Morty and the rest of the family remain tied to ordinary relationships and consequences.",
            "Under this reading, the science-fiction premise externalizes a familiar family conflict: one person's desire for independence affects everyone around them.",
          ],
        },
        {
          id: "f1a8c4e7-5d30-49b2-a6e1-7c9f2038d54a",
          title:
            "The comedy depends on treating existential problems as everyday problems",
          author: "Episode analysis",
          date: "2013-12-02",
          paragraphs: [
            "The episode repeatedly moves between enormous science-fiction stakes and mundane family concerns. That contrast makes the extraordinary feel routine without eliminating its consequences.",
            "The result is a comic structure in which questions about identity, mortality and responsibility can appear inside an otherwise ordinary domestic argument.",
          ],
        },
      ],
    },
  ],
} satisfies ContentTab<CollapsibleItem>[];
