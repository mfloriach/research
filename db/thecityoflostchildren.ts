import { ContentTab, Article, CollapsibleItem } from "./types";

export const site = {
  brand: "Epistimology",
  title: "Epistimology — structured argument analysis",
  description:
    "The City of Lost Children read side by side with a structured audit of its themes, symbolism, characters and interpretations.",
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
 *
 * Route segments are plural (`/debate/contraarguments/create`) while the
 * canonical audit labels are singular ("Contraargument"). Segments missing
 * here are humanised from the slug instead.
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
 * Canonical argument labels. Seeded onto the argument document and used as
 * the default reporting labels for articles.
 */
export const ARGUMENT_LABELS: readonly string[] = [
  "Story",
  "Themes",
  "Symbolism",
  "Characters",
  "Filmmaking",
];

export const argument = {
  title: "The City of Lost Children, audited",
  description:
    "The City of Lost Children read against a structured audit of its story, characters, symbolism, themes, evidence, sources and competing interpretations.",
  labels: ARGUMENT_LABELS,
};

export const reportingCard = {
  title: "Reporting",
  tabs: [
    {
      id: "ddb3f795-5985-48f0-8002-51a1868c20cc",
      label: "Story",
      items: [
        {
          id: "175b4910-5e74-4965-90d8-db9037ca6ae8",
          title: "A fairy tale built around stolen dreams",
          labels: ["Story", "Themes"],
          author: "M. Laurent",
          date: "2024-06-18",
          authorAddress: "0x1111111111111111111111111111111111111111",
          openCount: 42,
          paragraphs: [
            {
              id: "3500e329-83cd-473e-b5cf-56105bd19f21",
              text: "The City of Lost Children follows One, a powerful but childlike circus performer whose little brother Denrée is kidnapped. His search takes him into a strange industrial world populated by abandoned children, clones, thieves and other outsiders.",
              auditItemIds: [
                "c5f66d5f-5809-4b2b-9bd6-acf841ff15a2",
                "232accb6-3f6c-4e0c-b429-4d3e4ab664db",
              ],
            },
            {
              id: "3d742319-97cd-4262-850e-8aec7345efd7",
              text: "The kidnapping is part of Krank's attempt to solve a personal problem: he cannot dream. He therefore steals children and attempts to extract their dreams, treating their inner lives as something that can be possessed.",
              auditItemIds: [
                "f6763a3a-724e-4ecb-8d15-1eecdc83f78f",
                "06125ca0-5a2c-42f2-96e8-c6614d4fe487",
                "55dc540d-ec41-49fd-ac19-1a222d839603",
              ],
            },
            {
              id: "c5f66d5f-5809-4b2b-9bd6-acf841ff15a2",
              text: "The narrative resembles a fairy tale, but its central conflict is unusually dark. Childhood becomes something vulnerable to exploitation, while dreams become a metaphor for imagination, identity and emotional freedom.",
              auditItemIds: [
                "2cb9153b-ed5f-45f2-ac48-75f6ea9d6786",
                "ad37b470-7775-4f20-b465-1c490d2574a5",
                "cc152b65-37bc-48ea-9f6f-3efeaf148716",
              ],
            },
            {
              id: "cb1e2e3e-723f-4f0b-8b45-fe30b553f574",
              text: "The search for Denrée gradually becomes a story about connection. One begins the journey looking for his brother, but the film repeatedly places isolated characters into relationships where cooperation becomes their main source of strength.",
              auditItemIds: [
                "23ba1d5d-34c4-4482-9d5a-1892c5280aa9",
                "9eab726e-5608-4172-81a6-3d8d5bdc0e7e",
                "8016248b-edd2-42eb-9713-6f9a7e776b2c",
              ],
            },
          ],
        },
        {
          id: "7e04da04-b6dc-4f9f-99a7-dfac20c47a5e",
          title: "The children are victims, but not powerless",
          labels: ["Story", "Characters"],
          author: "M. Laurent",
          date: "2024-08-05",
          authorAddress: "0x2222222222222222222222222222222222222222",
          openCount: 31,
          paragraphs: [
            {
              id: "f43d5394-fc41-4e89-95db-ee19696c978c",
              text: "The children are placed in an environment where adults exploit them, but the film does not portray them as completely passive. They communicate, cooperate and develop strategies for surviving the system around them.",
              auditItemIds: [
                "23ba1d5d-34c4-4482-9d5a-1892c5280aa9",
                "1d73897a-4de5-4bd7-823a-3400dab89cac",
              ],
            },
            {
              id: "73c40dbf-d89c-43f7-a7fe-48bcedd7f049",
              text: "This makes the film's treatment of childhood more complicated than a simple innocent-versus-evil story. Vulnerability exists alongside curiosity, intelligence and collective resistance.",
              auditItemIds: [
                "9d0a45f3-8b41-4646-9e22-1904fc1a010c",
                "3fdad5a7-e9e8-4df5-bf9a-3d5164c62212",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "6574d5bb-9dbf-4379-89c9-dcaa9df620c7",
      label: "Themes",
      items: [
        {
          id: "4978a3d8-3637-4cf3-b773-dd361c3176ef",
          title: "Loneliness is the hidden engine of the story",
          labels: ["Themes", "Characters"],
          author: "A. Rossi",
          date: "2024-09-12",
          authorAddress: "0x3333333333333333333333333333333333333333",
          openCount: 56,
          paragraphs: [
            {
              id: "2ca34372-d4d3-4f8a-a9a0-263c5cf85c2d",
              text: "Almost every major character is isolated in some way. Krank lacks dreams, the clones lack individual identity, the children lack their families, and One fears losing the people he loves.",
              auditItemIds: [
                "f6763a3a-724e-4ecb-8d15-1eecdc83f78f",
                "59f69aa3-6fcb-46cb-8190-df622b4de96b",
              ],
            },
            {
              id: "22b57d31-e977-4d83-9ec1-e5e1bd9f2f0f",
              text: "From this perspective, the kidnappings are not only about dreams. They are attempts by isolated characters to obtain something they cannot create or maintain themselves.",
              auditItemIds: [
                "ad37b470-7775-4f20-b465-1c490d2574a5",
                "cc152b65-37bc-48ea-9f6f-3efeaf148716",
                "48e49aae-10bf-48ab-91c8-b75b9091da69",
              ],
            },
            {
              id: "5648176d-7834-4b19-8229-1f2b24a6510b",
              text: "The emotional resolution therefore depends less on defeating a villain than on restoring relationships. Characters who cooperate are able to escape the isolation that defines much of the film.",
              auditItemIds: [
                "8016248b-edd2-42eb-9713-6f9a7e776b2c",
                "ae69718a-d61d-4557-a12f-d3e1cf1a6b91",
              ],
            },
          ],
        },
        {
          id: "5540868d-8a4e-4b80-a946-e174daf2bef0",
          title: "Dreams become a form of human property",
          labels: ["Themes", "Symbolism"],
          author: "J. Moreau",
          date: "2024-10-03",
          authorAddress: "0x4444444444444444444444444444444444444444",
          openCount: 63,
          paragraphs: [
            {
              id: "8801ae2a-ceaa-4c4e-a546-f4fb5e087f8a",
              text: "The film gives dreams an almost physical existence. They can be observed, manipulated and transferred, turning something deeply personal into a resource that another person can attempt to extract.",
              auditItemIds: [
                "55dc540d-ec41-49fd-ac19-1a222d839603",
                "1d73897a-4de5-4bd7-823a-3400dab89cac",
              ],
            },
            {
              id: "ddb3f795-5985-48f0-8002-51a1868c20cc",
              text: "This mechanism supports an interpretation of the film as a critique of exploitation. The children possess something valuable precisely because it cannot normally be bought or manufactured.",
              auditItemIds: [
                "2cb9153b-ed5f-45f2-ac48-75f6ea9d6786",
                "3fdad5a7-e9e8-4df5-bf9a-3d5164c62212",
              ],
            },
          ],
        },
      ],
    },

    {
      id: "175b4910-5e74-4965-90d8-db9037ca6ae8",
      label: "Filmmaking",
      items: [
        {
          id: "3500e329-83cd-473e-b5cf-56105bd19f21",
          title: "A city designed like a physical nightmare",
          labels: ["Filmmaking", "Symbolism"],
          author: "C. Bernard",
          date: "2024-11-21",
          authorAddress: "0x5555555555555555555555555555555555555555",
          openCount: 74,
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=example",
          paragraphs: [
            {
              id: "3d742319-97cd-4262-850e-8aec7345efd7",
              text: "Jean-Pierre Jeunet and Marc Caro construct an artificial world filled with rust, machinery, water, mechanical structures and distorted architecture. The setting rarely behaves like an ordinary city.",
              auditItemIds: [
                "b8c0f3c4-6848-4523-9954-421c637a24a1",
                "f22dd3da-eac2-49f0-bba1-b512037d2843",
              ],
            },
            {
              id: "c5f66d5f-5809-4b2b-9bd6-acf841ff15a2",
              text: "The production design makes the environment feel like an external representation of the film's psychological world. Machines dominate the landscape while human relationships remain fragile.",
              auditItemIds: [
                "cc152b65-37bc-48ea-9f6f-3efeaf148716",
                "48e49aae-10bf-48ab-91c8-b75b9091da69",
              ],
            },
          ],
        },
        {
          id: "232accb6-3f6c-4e0c-b429-4d3e4ab664db",
          title: "Beauty and grotesqueness are deliberately mixed",
          labels: ["Filmmaking", "Symbolism"],
          author: "C. Bernard",
          date: "2025-01-28",
          authorAddress: "0x6666666666666666666666666666666666666666",
          openCount: 48,
          paragraphs: [
            {
              id: "06125ca0-5a2c-42f2-96e8-c6614d4fe487",
              text: "The film repeatedly places grotesque imagery next to tenderness. Strange bodies, mechanical creatures and decaying environments coexist with friendship, loyalty and childlike curiosity.",
              auditItemIds: [
                "9d0a45f3-8b41-4646-9e22-1904fc1a010c",
                "f22dd3da-eac2-49f0-bba1-b512037d2843",
              ],
            },
            {
              id: "55dc540d-ec41-49fd-ac19-1a222d839603",
              text: "This prevents the visual style from having a simple moral code. The unusual-looking characters are not necessarily the villains, while apparently human desires such as possession and control can become the truly disturbing elements.",
              auditItemIds: [
                "3fdad5a7-e9e8-4df5-bf9a-3d5164c62212",
                "ae69718a-d61d-4557-a12f-d3e1cf1a6b91",
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
      id: "f6763a3a-724e-4ecb-8d15-1eecdc83f78f",
      label: "Contraargument",
      items: [
        {
          id: "06125ca0-5a2c-42f2-96e8-c6614d4fe487",
          title: "The film is not necessarily a metaphor for childhood",
          author: "R. Martin",
          date: "2024-09-14",
          paragraphs: [
            "The children are central to the story, but that does not mean childhood is the film's primary subject. The same events can be understood more broadly as a story about loneliness, exploitation and the desire to obtain something another person possesses.",
            "A childhood interpretation is therefore plausible, but it should remain one interpretation among several rather than being treated as the definitive meaning of the film.",
          ],
        },
        {
          id: "2cb9153b-ed5f-45f2-ac48-75f6ea9d6786",
          title: "Krank is more complicated than a conventional villain",
          author: "E. Duarte",
          date: "2024-10-08",
          paragraphs: [
            "Krank's actions are cruel and exploitative, but his motivation is rooted in an absence. He cannot dream and desperately attempts to obtain the experience through other people.",
            "Understanding this motivation does not excuse his actions. It does, however, make him closer to a tragic antagonist than a purely evil character.",
          ],
        },
        {
          id: "ad37b470-7775-4f20-b465-1c490d2574a5",
          title:
            "The visual design does not require a psychological interpretation",
          author: "C. Bernard",
          date: "2024-11-02",
          paragraphs: [
            "The strange architecture, machines and creatures can be interpreted as world-building rather than as direct representations of psychological states.",
            "The psychological reading is supported by recurring imagery, but the film deliberately leaves enough ambiguity for the environment to function as an independent fictional world.",
          ],
        },
      ],
    },

    {
      id: "f43d5394-fc41-4e89-95db-ee19696c978c",
      label: "Fallacies",
      author: "J. Kim",
      date: "2025-02-14",
      items: [
        {
          id: "9d0a45f3-8b41-4646-9e22-1904fc1a010c",
          title: "The children are completely powerless",
          author: "M. Laurent",
          date: "2024-08-19",
          paragraphs: [
            "The film clearly presents the children as vulnerable, but repeatedly shows them cooperating and exercising agency.",
            "Reducing them to passive victims removes an important part of the story: their ability to understand and resist the system surrounding them.",
          ],
        },
        {
          id: "3fdad5a7-e9e8-4df5-bf9a-3d5164c62212",
          title: "Krank represents pure evil",
          author: "R. Martin",
          date: "2024-10-08",
          paragraphs: [
            "Calling Krank purely evil ignores the film's interest in loneliness and deprivation. His actions are harmful, but the narrative gives him an understandable emotional deficiency.",
            "A more precise interpretation separates moral responsibility from psychological motivation.",
          ],
        },
        {
          id: "48e49aae-10bf-48ab-91c8-b75b9091da69",
          title: "Every strange object must represent a specific symbol",
          author: "C. Bernard",
          date: "2025-01-11",
          paragraphs: [
            "The film contains an enormous number of unusual objects, machines and creatures. Assigning a fixed symbolic meaning to every one risks turning interpretation into speculation.",
            "The stronger approach is to look for recurring patterns before claiming that a particular visual element has a specific meaning.",
          ],
        },
      ],
    },

    {
      id: "73c40dbf-d89c-43f7-a7fe-48bcedd7f049",
      label: "Evidences",
      items: [
        {
          id: "55dc540d-ec41-49fd-ac19-1a222d839603",
          title: "Krank cannot dream",
          paragraphs: [
            "Krank's inability to dream is explicitly established as part of his character and provides the motivation for his attempts to obtain dreams from children.",
            "This makes dreams more than a visual motif: they are directly connected to the central conflict.",
          ],
        },
        {
          id: "1d73897a-4de5-4bd7-823a-3400dab89cac",
          title: "Dreams are treated as something that can be extracted",
          paragraphs: [
            "The film gives dreams a physical mechanism through which they can be observed and manipulated.",
            "By making an intangible human experience physically transferable, the story creates a literal representation of exploitation.",
          ],
        },
        {
          id: "23ba1d5d-34c4-4482-9d5a-1892c5280aa9",
          title: "The children cooperate with one another",
          paragraphs: [
            "The children are not isolated individuals. Their interactions and shared knowledge help them navigate the environment in which they are trapped.",
            "This supports an interpretation in which cooperation is presented as an alternative to the exploitation practiced by the adults.",
          ],
        },
      ],
    },

    {
      id: "8016248b-edd2-42eb-9713-6f9a7e776b2c",
      label: "Sources",
      items: [
        {
          id: "b8c0f3c4-6848-4523-9954-421c637a24a1",
          title: "The City of Lost Children itself",
          paragraphs: [
            "The primary source for claims about the film's story, characters and symbolism is the film itself.",
            "Dialogue, character behaviour, recurring imagery and the sequence of events should take priority over interpretations that are not grounded in the text.",
          ],
        },
        {
          id: "f22dd3da-eac2-49f0-bba1-b512037d2843",
          title: "The film's production design",
          paragraphs: [
            "The sets, costumes, creatures, mechanical objects and cinematography provide direct evidence for claims about the film's visual language.",
            "The unusually artificial environment is one of the strongest observable features of the film and does not depend on external interpretation.",
          ],
        },
        {
          id: "ae69718a-d61d-4557-a12f-d3e1cf1a6b91",
          title: "Jean-Pierre Jeunet and Marc Caro's filmmaking style",
          paragraphs: [
            "The collaboration between Jean-Pierre Jeunet and Marc Caro provides useful context for understanding the film's mixture of surrealism, grotesque imagery, physical sets and dark fairy-tale elements.",
            "This context can strengthen an interpretation, but it should not replace evidence from the film itself.",
          ],
        },
      ],
    },

    {
      id: "9eab726e-5608-4172-81a6-3d8d5bdc0e7e",
      label: "Interpretation",
      author: "T. Nguyen",
      date: "2025-04-17",
      items: [
        {
          id: "cc152b65-37bc-48ea-9f6f-3efeaf148716",
          title: "Read as a story about the exploitation of innocence",
          author: "E. Duarte",
          date: "2025-03-05",
          paragraphs: [
            "The film can be read as a dark fairy tale in which adults exploit children because children possess something the adults cannot reproduce themselves.",
            "Dreams therefore become a metaphor for imagination, innocence and the parts of human experience that cannot ethically be taken from another person.",
          ],
        },
        {
          id: "59f69aa3-6fcb-46cb-8190-df622b4de96b",
          title: "Read as a story about loneliness",
          author: "T. Nguyen",
          date: "2025-04-17",
          paragraphs: [
            "Almost every important character experiences some form of isolation. Krank lacks dreams, the clones lack individuality, the children lack their families and One fears losing his brother.",
            "From this perspective, the film's strange world is organized around characters attempting to escape isolation, sometimes through healthy relationships and sometimes through destructive possession.",
          ],
        },
        {
          id: "8016248b-edd2-42eb-9713-6f9a7e776b2c",
          title: "Read as a conflict between connection and possession",
          author: "J. Moreau",
          date: "2025-05-02",
          paragraphs: [
            "A central distinction can be drawn between characters who try to connect with others and characters who try to possess something from them.",
            "One searches for Denrée because of love and attachment. Krank takes children's dreams because he wants to fill his own absence. The difference suggests that the film is less interested in desire itself than in how desire treats other people.",
          ],
        },
      ],
    },
  ] satisfies ContentTab<CollapsibleItem>[],
};
