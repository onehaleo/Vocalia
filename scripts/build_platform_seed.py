#!/usr/bin/env python3
"""Generate db/seed.sql — European Portuguese course, modules, lessons, phrases, activities, sound lessons."""

from __future__ import annotations

import json
from pathlib import Path

LANG = "f0000001-0001-4001-8001-000000000001"
COURSE = "f0000002-0002-4002-8002-000000000002"
LEVELS = {
    "A1": ("a1111111-1111-4111-8111-111111111101", "A1 Foundations", "First steps: sounds, greetings, survival — starter practice, not certified instruction.", 1),
    "A2": ("a2222222-2222-4222-8222-222222222202", "A2 Daily Independence", "Coming soon: housing, errands, appointments.", 2),
    "B1": ("b1111111-1111-4111-8111-111111111103", "B1 Real Conversations", "Coming soon: problems, health tone, bureaucracy.", 3),
    "B2": ("b2222222-2222-4222-8222-222222222204", "B2 Natural Expression", "Coming soon: work nuance, opinions, neighbors.", 4),
}

# A1 modules: slug, title, description, coming_soon, lessons: [{slug, title, learn, phrases:[...], activities:[...]}]
A1_MODULES = [
    {
        "slug": "sound-foundations",
        "title": "Sound Foundations",
        "desc": "European Portuguese sounds for English speakers — informal coaching.",
        "soon": False,
        "lessons": [
            {
                "slug": "vowels-nasals",
                "title": "Nasal vowels and rhythm",
                "learn": "Portuguese uses nasal vowels (ã, õ, -m, -n) that change meaning. Keep the jaw relaxed and let air pass through the nose without pinching.",
                "phrases": [
                    ("Bom dia", "Good morning", "bohng DEE-uh", "bom · dia", "Nasal om in bom.", "Hard American R in dia.", ["greeting", "A1"]),
                    ("Boa tarde", "Good afternoon", "BOH-uh TAR-dee", "boa · tar · de", "Light European r.", "English AFTER-noon stress.", ["greeting", "A1"]),
                    ("Obrigado", "Thank you (m)", "oh-bree-GAH-doo", "o · bri · ga · do", "Stress on ga.", "Brazilian sing-song habit.", ["polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Meaning check", "reading", {"prompt": "What does Bom dia mean?", "options": ["Good night", "Good morning", "Goodbye"], "correctIndex": 1}),
                    ("listen_placeholder", "Listen (placeholder)", "listening", {"label": "European greeting rhythm"}),
                ],
            }
        ],
    },
    {
        "slug": "greetings-politeness",
        "title": "Greetings and Politeness",
        "desc": "Enter shops and meet neighbors with calm European tone.",
        "soon": False,
        "lessons": [
            {
                "slug": "core-greetings",
                "title": "Core greetings",
                "learn": "Short beats sound more natural than long English-style greetings.",
                "phrases": [
                    ("Por favor", "Please", "poor fah-VOHR", "por · fa · vor", "Stress last syllable.", "Rounding por like Spanish.", ["polite", "A1"]),
                    ("Desculpe", "Excuse me / sorry", "desh-KOOL-puh", "des · cul · pe", "C like k before u.", "English culp sound.", ["polite", "A1"]),
                    ("Com licença", "Excuse me (passing)", "kong lee-SEN-suh", "com · li · cen · ça", "Ç like s in Portugal.", "Ch like church.", ["polite", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match", "reading", {"pairs": [["Por favor", "Please"], ["Desculpe", "Sorry"]]}),
                    ("type_missing", "Fill in", "writing", {"template": "_____, onde fica o metro?", "answer": "Desculpe", "hint": "Polite opener before a question"}),
                ],
            }
        ],
    },
    {
        "slug": "introductions",
        "title": "Introductions",
        "desc": "Say who you are and where you are from.",
        "soon": False,
        "lessons": [
            {
                "slug": "who-you-are",
                "title": "Who you are",
                "learn": "Sou… / Chamo-me… are both natural. Keep it short.",
                "phrases": [
                    ("Chamo-me Alex", "My name is Alex", "SHAH-moo meh …", "cha · mo · me", "Stress on first syllable of chamo.", "Shamo like shampoo cut off.", ["intro", "A1"]),
                    ("Sou americano", "I am American (m)", "soh ah-meh-ree-KAH-noo", "sou · a · me · ri · ca · no", "Stress on ca.", "Heavy American R everywhere.", ["intro", "A1"]),
                ],
                "activities": [
                    ("translate_pt", "Translate", "writing", {"prompt": "Write: My name is Alex (use Chamo-me)", "answers": ["Chamo-me Alex", "chamo-me Alex"]}),
                ],
            }
        ],
    },
    {
        "slug": "numbers-time",
        "title": "Numbers and Time",
        "desc": "Prices, hours, and simple scheduling.",
        "soon": False,
        "lessons": [
            {
                "slug": "asking-price-time",
                "title": "How much and when",
                "learn": "Quanto é rises on é. Hours often use 24h in writing but you may hear 12h in speech.",
                "phrases": [
                    ("Quanto é?", "How much is it?", "KWAHN-too eh?", "quan · to · é", "Short vowels.", "English HOW much stress.", ["numbers", "A1"]),
                    ("A que horas?", "At what time?", "ah keh OH-rash?", "a · que · ho · ras", "Plural horas.", "HOR-as like English horrors.", ["time", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Listening cue", "listening", {"prompt": "Which phrase asks price?", "options": ["A que horas?", "Quanto é?", "Onde fica?"], "correctIndex": 1}),
                ],
            }
        ],
    },
    {
        "slug": "food-cafes",
        "title": "Food and Cafés",
        "desc": "Order coffee and pay like a local.",
        "soon": False,
        "lessons": [
            {
                "slug": "cafe-order",
                "title": "At the café",
                "learn": "Meia de leite is a common milk coffee in Portugal; talão is receipt.",
                "phrases": [
                    ("Um café, por favor", "A coffee, please", "oong kah-FEH poor fah-VOHR", "um · ca · fé · por · fa · vor", "Nasal um before café.", "Long oo in um.", ["food", "A1"]),
                    ("Para levar", "To go", "PAH-ruh leh-VAHR", "pa · ra · le · var", "European r.", "American flap R.", ["food", "A1"]),
                ],
                "activities": [
                    ("rebuild_sentence", "Reorder", "reading", {"tokens": ["por", "favor", "café,", "Um"], "answer": "Um café, por favor"}),
                ],
            }
        ],
    },
    {
        "slug": "directions-transport",
        "title": "Directions and Transport",
        "desc": "Metro, comboio, and simple questions.",
        "soon": False,
        "lessons": [
            {
                "slug": "metro-basics",
                "title": "Metro basics",
                "learn": "Comboio is train in Portugal; estação has nasal ão.",
                "phrases": [
                    ("Onde fica a estação de metro?", "Where is the metro?", "OHN-dee FEE-kuh ah es-tah-SOWN deh MEH-troo?", "on · de · fi · ca · es · ta · ção · de · me · tro", "Nasal ão.", "Heavy R in metro.", ["travel", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Choose meaning", "reading", {"prompt": "Onde fica a estação de metro?", "options": ["Where is the bakery?", "Where is the metro station?", "What time is it?"], "correctIndex": 1}),
                ],
            }
        ],
    },
    {
        "slug": "shopping-basics",
        "title": "Shopping Basics",
        "desc": "Weights, bags, checkout phrases.",
        "soon": False,
        "lessons": [
            {
                "slug": "at-checkout",
                "title": "At checkout",
                "learn": "Talão is common for receipt in Portugal.",
                "phrases": [
                    ("Pode pesar?", "Can you weigh it?", "POH-deh peh-ZAR?", "po · de · pe · zar", "Stress second syllable.", "American Z in weigh.", ["shop", "A1"]),
                    ("Só isto, obrigado", "That is all, thanks", "soh EESH-too oh-bree-GAH-doo", "só · is · to", "Crisp isto.", "Long thanks.", ["shop", "A1"]),
                ],
                "activities": [],
            }
        ],
    },
    {
        "slug": "people-family",
        "title": "People and Family",
        "desc": "Close circle vocabulary.",
        "soon": False,
        "lessons": [
            {
                "slug": "family-words",
                "title": "Family words",
                "learn": "Possessives agree in gender/number — start with simple phrases.",
                "phrases": [
                    ("A minha família", "My family", "ah MEE-nyah fah-MEE-lyuh", "a · mi · nha · fa · mí · lia", "European i vowels.", "English family diphthong.", ["family", "A1"]),
                ],
                "activities": [],
            }
        ],
    },
    {
        "slug": "grammar-patterns",
        "title": "Basic Grammar Patterns",
        "desc": "Light patterns — not a full grammar course.",
        "soon": False,
        "lessons": [
            {
                "slug": "estar-vs-ter",
                "title": "Estou vs tenho (light touch)",
                "learn": "Estou = state/location; tenho = possession. Keep examples short.",
                "phrases": [
                    ("Estou em Lisboa", "I am in Lisbon", "ehs-TOWN ayng leesh-BOH-uh", "es · tou · em · Lis · bo · a", "Nasal em.", "English am IN stress.", ["grammar", "A1"]),
                    ("Tenho uma pergunta", "I have a question", "TEN-yoo OO-muh pehr-GOON-tuh", "ten · ho · u · ma · per · gun · ta", "Nasal tenho.", "Pergunta like English pergola.", ["grammar", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Pick the better fit", "reading", {"prompt": "I ___ in Porto (location).", "options": ["Tenho", "Estou", "Sou de"], "correctIndex": 1}),
                ],
            }
        ],
    },
    {
        "slug": "survival-phrases",
        "title": "Survival Phrases",
        "desc": "High-utility lines for your first weeks.",
        "soon": False,
        "lessons": [
            {
                "slug": "help-repeat",
                "title": "Help and repetition",
                "learn": "Fala inglês? is practical; keep tone polite.",
                "phrases": [
                    ("Fala inglês?", "Do you speak English?", "FAH-luh een-GLAYSH?", "fa · la · in · glês", "Rising question.", "Flat tone.", ["survival", "A1"]),
                    ("Pode repetir?", "Can you repeat?", "POH-deh heh-peh-TEER?", "po · de · re · pe · tir", "Polite pode.", "Impatient tone.", ["survival", "A1"]),
                ],
                "activities": [],
            }
        ],
    },
]

SOUND_LESSONS = [
    {
        "slug": "nasal-vowels",
        "title": "Nasal vowels",
        "summary": "ã, õ, and nasal -m/-n endings shape meaning in European Portuguese.",
        "body": {
            "explanation": "Nasality comes from lowering the soft palate so air exits nose and mouth together.",
            "englishApproximation": "Think of French nasal vowels, but keep the mouth a bit more open for Portuguese.",
            "mouthPosition": "Jaw relaxed; tongue forward for ã; avoid pinching the nose.",
            "commonMistakes": "Turning every final -n into a hard English n instead of nasalizing the vowel.",
            "exampleWords": ["pão", "irmã", "bem", "bom"],
            "examplePhrases": ["Bom dia", "Bem vindo", "Pão de centeio"],
        },
        "sort": 1,
    },
    {
        "slug": "final-s-sh",
        "title": "Final -s as “sh” (European Portuguese)",
        "summary": "Between vowels or at end of word in many accents, -s can sound like sh.",
        "body": {
            "explanation": "In connected speech, plural -s often softens in central/northern European Portuguese patterns.",
            "englishApproximation": "Not always as strong as English sh—often lighter.",
            "mouthPosition": "Tip of tongue down; air flows forward.",
            "commonMistakes": "Using a hard American s everywhere.",
            "exampleWords": ["amigos", "estás"],
            "examplePhrases": ["Bom dias", "Os amigos"],
        },
        "sort": 2,
    },
    {
        "slug": "unstressed-vowels",
        "title": "Unstressed vowels",
        "summary": "Unstressed vowels stay clearer than in English, but avoid over-pronouncing.",
        "body": {
            "explanation": "European Portuguese reduces some vowels, but beginners should start clear then refine with listening.",
            "englishApproximation": "Keep e and o from collapsing into uh too early.",
            "mouthPosition": "Small mouth movements between syllables.",
            "commonMistakes": "Mumbling every unstressed vowel into schwa.",
            "exampleWords": ["meseta", "porta"],
            "examplePhrases": ["Obrigado pela ajuda"],
        },
        "sort": 3,
    },
    {
        "slug": "open-closed-vowels",
        "title": "Open vs closed vowels",
        "summary": "Pairs like a/á and o/ó change quality — listen more than you memorize rules at first.",
        "body": {
            "explanation": "Vowel height affects meaning in some minimal pairs; use slow listening first.",
            "englishApproximation": "Open o is closer to awe; closed o is closer to oh.",
            "mouthPosition": "Open: jaw drops; closed: smaller opening.",
            "commonMistakes": "Using English oh for every Portuguese o.",
            "exampleWords": ["avó", "avô"],
            "examplePhrases": ["Olá, tudo bem?"],
        },
        "sort": 4,
    },
    {
        "slug": "portuguese-r",
        "title": "Portuguese R",
        "summary": "Single flap and double rr contrast; keep it light, not American growl.",
        "body": {
            "explanation": "Tap the tongue once for single r between vowels; stronger for rr.",
            "englishApproximation": "Single r can feel like a soft American d in rider.",
            "mouthPosition": "Tip near alveolar ridge; quick tap.",
            "commonMistakes": "American hard R at ends of words like English car.",
            "exampleWords": ["carro", "para"],
            "examplePhrases": ["Por favor"],
        },
        "sort": 5,
    },
    {
        "slug": "lh-nh",
        "title": "LH and NH",
        "summary": "lh like ly in million (roughly); nh like ny in canyon.",
        "body": {
            "explanation": "Palatal consonants link smoothly to following vowels.",
            "englishApproximation": "nh ≈ Spanish ñ; lh is a lateral palatal approximant.",
            "mouthPosition": "Middle of tongue toward palate for nh; sides of tongue for lh.",
            "commonMistakes": "Pronouncing nh as n + h separately.",
            "exampleWords": ["telhado", "amanhã"],
            "examplePhrases": ["Boa noite"],
        },
        "sort": 6,
    },
    {
        "slug": "word-stress",
        "title": "Word stress",
        "summary": "Stress often falls on one of the last three syllables—patterns exist, but listen first.",
        "body": {
            "explanation": "Accent marks show stress when it breaks the default pattern.",
            "englishApproximation": "Avoid English habit of stressing early syllables in Portuguese words.",
            "mouthPosition": "Slightly lengthen stressed vowel; keep others clear.",
            "commonMistakes": "Stressing the first syllable of every word.",
            "exampleWords": ["café", "útil"],
            "examplePhrases": ["Obrigado"],
        },
        "sort": 7,
    },
    {
        "slug": "sentence-rhythm",
        "title": "Sentence rhythm",
        "summary": "European Portuguese can feel faster—chunk phrases, do not translate word by word aloud.",
        "body": {
            "explanation": "Group function words with content words in practice chunks.",
            "englishApproximation": "Short breath groups like mini-phrases.",
            "mouthPosition": "Steady airflow; avoid stopping between every word.",
            "commonMistakes": "Adding English filler rhythm and pauses.",
            "exampleWords": [],
            "examplePhrases": ["Um café, por favor", "Onde fica o metro?"],
        },
        "sort": 8,
    },
]


def esc(s: str) -> str:
    return "'" + str(s).replace("'", "''") + "'"


def esc_json(obj) -> str:
    return esc(json.dumps(obj, ensure_ascii=False))


def main() -> None:
    out = Path(__file__).resolve().parents[1] / "db" / "seed.sql"
    lines: list[str] = []
    lines.append(
        """-- Vocalia platform seed (regenerates catalog). Run after db/schema.sql.
-- Starter educational content — not certified instruction.

begin;

delete from public.user_activity_attempts;
delete from public.user_skill_progress;
delete from public.user_phrase_progress;
delete from public.user_lesson_progress;
delete from public.activities;
delete from public.phrases;
delete from public.lessons;
delete from public.modules;
delete from public.sound_lessons;
delete from public.levels;
delete from public.courses;
delete from public.languages;

insert into public.languages (id, code, name) values
  (""" + f"'{LANG}', 'pt', 'Portuguese (Portugal)'" + """);

insert into public.courses (id, language_id, slug, title, description) values
  (""" + f"'{COURSE}', '{LANG}', 'european-portuguese-beginners', 'European Portuguese for English-speaking beginners', 'First Vocalia course — vocabulary, grammar patterns, and real-life phrases with pronunciation support.'" + """);

"""
    )

    a1_lessons = sum(len(m["lessons"]) for m in A1_MODULES)
    lvl_rows = []
    for code, (lid, plabel, desc, so) in LEVELS.items():
        cnt = a1_lessons if code == "A1" else 0
        lvl_rows.append(
            f"  ('{lid}', '{COURSE}', {esc(code)}, {esc(f'Level {code}')}, {esc(plabel)}, {esc(desc)}, {so}, {cnt})"
        )

    lines.append("insert into public.levels (id, course_id, code, title, path_label, description, sort_order, lesson_count) values\n")
    lines.append(",\n".join(lvl_rows) + ";\n\n")

    # modules + lessons + phrases + activities for A1 only
    mod_idx = 0
    lid_a1 = LEVELS["A1"][0]
    for mod in A1_MODULES:
        mod_idx += 1
        mid = f"m1000001-0001-4001-8001-{mod_idx:012d}"
        lines.append(
            f"insert into public.modules (id, level_id, slug, title, description, sort_order, coming_soon) values "
            f"('{mid}', '{lid_a1}', {esc(mod['slug'])}, {esc(mod['title'])}, {esc(mod['desc'])}, {mod_idx}, {str(mod['soon']).lower()});\n"
        )
        les_idx = 0
        for les in mod["lessons"]:
            les_idx += 1
            les_id = f"l1000001-0001-4001-8001-{mod_idx:06d}{les_idx:06d}"
            lines.append(
                f"insert into public.lessons (id, module_id, slug, title, description, learn_excerpt, sort_order, is_published) values "
                f"('{les_id}', '{mid}', {esc(les['slug'])}, {esc(les['title'])}, NULL, {esc(les['learn'])}, {les_idx}, true);\n"
            )
            pi = 0
            for ph in les["phrases"]:
                pi += 1
                pt, en, phon, syl, pn, cm, tags = ph
                tags_sql = "ARRAY[" + ",".join(esc(t) for t in tags) + "]::text[]"
                lines.append(
                    f"insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, tags, sort_order) values "
                    f"('{les_id}', {esc(pt)}, {esc(en)}, {esc(phon)}, {esc(syl)}, {esc(pn)}, {esc(cm)}, {tags_sql}, {pi});\n"
                )
            ai = 0
            for act in les.get("activities") or []:
                ai += 1
                atype, title, skill, cfg = act
                lines.append(
                    f"insert into public.activities (lesson_id, activity_type, title, skill, config, sort_order) values "
                    f"('{les_id}', {esc(atype)}, {esc(title)}, {esc(skill)}, {esc_json(cfg)}::jsonb, {ai});\n"
                )
        lines.append("\n")

    # Placeholder modules for A2/B1/B2 (no lessons yet)
    placeholders = [
        ("A2", "a2222222-2222-4222-8222-222222222202", "a2222222-2222-4222-8222-900000000101", "a2222222-2222-4222-8222-900000000102"),
        ("B1", "b1111111-1111-4111-8111-111111111103", "b1111111-1111-4111-8111-900000000101", "b1111111-1111-4111-8111-900000000102"),
        ("B2", "b2222222-2222-4222-8222-222222222204", "b2222222-2222-4222-8222-900000000101", "b2222222-2222-4222-8222-900000000102"),
    ]
    for code, level_id, mid1, mid2 in placeholders:
        for i, (mid, title) in enumerate([(mid1, "Module 1 (coming soon)"), (mid2, "Module 2 (coming soon)")], start=1):
            lines.append(
                f"insert into public.modules (id, level_id, slug, title, description, sort_order, coming_soon) values "
                f"('{mid}', '{level_id}', {esc(f'{code.lower()}-placeholder-{i}')}, {esc(title)}, "
                f"{esc('Content arriving in a future seed update.')}, {i}, true);\n"
            )
        lines.append("\n")

    # sound lessons
    for i, sl in enumerate(SOUND_LESSONS, start=1):
        sid = f"s1000001-0001-4001-8001-{i:012d}"
        lines.append(
            f"insert into public.sound_lessons (id, course_id, slug, title, summary, body, sort_order) values "
            f"('{sid}', '{COURSE}', {esc(sl['slug'])}, {esc(sl['title'])}, {esc(sl['summary'])}, {esc_json(sl['body'])}::jsonb, {sl['sort']});\n"
        )

    lines.append("\ncommit;\n")
    out.write_text("".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
