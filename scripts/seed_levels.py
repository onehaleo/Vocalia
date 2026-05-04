"""Level metadata (stable UUIDs match prior Vocalia seeds)."""

# Starter educational content — friendly practice for Americans relocating to Portugal.
# Not certified linguistic instruction; verify official rules with authorities.

LEVEL_ROWS = [
    (
        "a1111111-1111-4111-8111-111111111101",
        "A1",
        "Level A1",
        "Survival European Portuguese: shops, cafés, directions. Starter practice — not certified instruction.",
        1,
        5,
    ),
    (
        "a2222222-2222-4222-8222-222222222202",
        "A2",
        "Level A2",
        "Daily life: housing, groceries, appointments, post office. Informal coaching only.",
        2,
        5,
    ),
    (
        "b1111111-1111-4111-8111-111111111103",
        "B1",
        "Level B1",
        "Explain issues, talk to landlords, health desks, car papers. Practical tone — not legal or medical advice.",
        3,
        5,
    ),
    (
        "b2222222-2222-4222-8222-222222222204",
        "B2",
        "Level B2",
        "Work, immigration tone, neighbors, schools. Adult, nuanced — still starter educational content.",
        4,
        5,
    ),
]

# lesson key: (level_code, lesson_index 1..5) -> (uuid, title, description)
LESSON_META = {
    ("A1", 1): (
        "a1111111-1111-4111-8111-100000000101",
        "Greetings, shops, and first impressions",
        "Polite openers; European vowels and light r — not Brazilian TV melody.",
    ),
    ("A1", 2): (
        "a1111111-1111-4111-8111-100000000102",
        "Café, pastelarias, and paying",
        "Order drinks, ask for the bill, and use talão like locals.",
    ),
    ("A1", 3): (
        "a1111111-1111-4111-8111-100000000103",
        "Directions, transport, and bilhetes",
        "Metro and comboio vocabulary with PT-PT rhythm.",
    ),
    ("A1", 4): (
        "a1111111-1111-4111-8111-100000000104",
        "Times, prices, and slow speech",
        "Ask how much, ask to repeat—without English stress habits.",
    ),
    ("A1", 5): (
        "a1111111-1111-4111-8111-100000000105",
        "Farmácia counter (basic)",
        "Simple requests; educational phrases only — ask a professional for medical advice.",
    ),
    ("A2", 1): (
        "a2222222-2222-4222-8222-200000000201",
        "Housing visits and utilities",
        "Viewings, water pressure, polite follow-ups.",
    ),
    ("A2", 2): (
        "a2222222-2222-4222-8222-200000000202",
        "Groceries, weights, and checkout",
        "Mercado language: scales, bags, and thank-yous.",
    ),
    ("A2", 3): (
        "a2222222-2222-4222-8222-200000000203",
        "Phone and in-person appointments",
        "Schedule, confirm, reschedule calmly.",
    ),
    ("A2", 4): (
        "a2222222-2222-4222-8222-200000000204",
        "Bank counter and Multibanco basics",
        "Practical phrases — confirm fees and limits officially.",
    ),
    ("A2", 5): (
        "a2222222-2222-4222-8222-200000000205",
        "Correios, encomendas, and tracking",
        "Post office vocabulary for everyday parcels.",
    ),
    ("B1", 1): (
        "b1111111-1111-4111-8111-300000000301",
        "Explaining problems calmly",
        "Neighbors, condomínio, and services—clear adult tone.",
    ),
    ("B1", 2): (
        "b1111111-1111-4111-8111-300000000302",
        "Landlord, repairs, and written follow-up",
        "Requests and boundaries without drama.",
    ),
    ("B1", 3): (
        "b1111111-1111-4111-8111-300000000303",
        "Clinic desk, SNS, and pharmacy follow-up",
        "Symptoms and timing — phrases only, not diagnosis.",
    ),
    ("B1", 4): (
        "b1111111-1111-4111-8111-300000000304",
        "Finanças counter tone",
        "Wait, clarify, stay patient — informal coaching.",
    ),
    ("B1", 5): (
        "b1111111-1111-4111-8111-300000000305",
        "Car papers, IUC, and inspeção small talk",
        "Bureaucracy vocabulary at a friendly level.",
    ),
    ("B2", 1): (
        "b2222222-2222-4222-8222-400000000401",
        "Hybrid work and async updates",
        "Professional but human European PT.",
    ),
    ("B2", 2): (
        "b2222222-2222-4222-8222-400000000402",
        "Immigration appointments and documents",
        "Neutral, prepared phrasing — always verify rules officially.",
    ),
    ("B2", 3): (
        "b2222222-2222-4222-8222-400000000403",
        "Soft disagreement and nuance",
        "Disagree without sounding cold.",
    ),
    ("B2", 4): (
        "b2222222-2222-4222-8222-400000000404",
        "Neighbors, barulho, and building life",
        "Polite limits and empathy.",
    ),
    ("B2", 5): (
        "b2222222-2222-4222-8222-400000000405",
        "Escola, creche, and parent small talk",
        "Icebreakers for school gates — starter content.",
    ),
}

LEVEL_CODE_TO_ID = {row[1]: row[0] for row in LEVEL_ROWS}
