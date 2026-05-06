#!/usr/bin/env python3
"""Generate db/seed.sql — European Portuguese course, modules, lessons, phrases, activities, sound lessons.

Stable IDs use only hexadecimal UUID characters (0-9, a-f). Module / lesson / sound-lesson rows use
e1000001… / d1000001… / c1000001… prefixes so Postgres accepts literals (m/l/s are not valid hex).
"""

from __future__ import annotations

import json
from pathlib import Path

LANG = "f0000001-0001-4001-8001-000000000001"
COURSE = "f0000002-0002-4002-8002-000000000002"
LEVELS = {
    "A1": ("a1111111-1111-4111-8111-111111111101", "A1 Foundations", "First steps: sounds, greetings, survival — starter practice, not certified instruction.", 1),
    "A2": ("a2222222-2222-4222-8222-222222222202", "A2 Daily Independence", "Coming during beta: everyday independence themes are being expanded.", 2),
    "B1": ("b1111111-1111-4111-8111-111111111103", "B1 Real Conversations", "Preview only: real-conversation content is being expanded during beta.", 3),
    "B2": ("b2222222-2222-4222-8222-222222222204", "B2 Natural Expression", "Preview only: advanced expression modules are coming during beta.", 4),
}

# A1 modules: slug, title, description, coming_soon, lessons: [{slug, title, learn, phrases:[...], activities:[...]}]
A1_MODULES = [
    {
        "slug": "sound-foundations",
        "title": "Sound Foundations",
        "desc": "European Portuguese sound basics for English speakers.",
        "soon": False,
        "lessons": [
            {
                "slug": "nasal-vowels-rhythm",
                "title": "Nasal vowels and rhythm",
                "learn": "Portuguese nasal vowels change meaning. Keep airflow steady and avoid over-projecting.",
                "phrases": [
                    ("Bom dia", "Good morning", "bohng DEE-ah", "bom · di · a", "Nasal om in bom.", "Saying bom with a hard m.", ["sound", "greeting", "A1"]),
                    ("Tudo bem?", "All good?", "TOO-doo beng?", "tu · do · bem", "Nasal bem at the end.", "Flat English intonation.", ["sound", "A1"]),
                    ("Também", "Also", "tam-BENG", "tam · bém", "Nasal -ém.", "Dropping nasal ending.", ["sound", "A1"]),
                    ("Não", "No", "nown", "não", "Nasal ão.", "Pronouncing as nao.", ["sound", "A1"]),
                    ("Pão", "Bread", "pown", "pão", "Very nasal vowel.", "Adding an English n.", ["food", "sound", "A1"]),
                    ("Amanhã", "Tomorrow", "ah-ma-NYAH", "a · ma · nhã", "nhã has palatal nasal sound.", "Hard n in amanhã.", ["time", "sound", "A1"]),
                    ("Lisboa", "Lisbon", "leesh-BOH-ah", "Lis · bo · a", "Keep s soft in many accents.", "Saying liz-BO-ah.", ["place", "A1"]),
                    ("Obrigado", "Thank you (m)", "oh-bree-GAH-doo", "o · bri · ga · do", "Stress ga.", "Overstressing final do.", ["polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Meaning check", "reading", {"prompt": "What does Não mean?", "options": ["Yes", "No", "Maybe"], "correctIndex": 1}),
                    ("type_missing", "Fill the missing word", "writing", {"template": "____ dia", "answer": "Bom", "hint": "Morning greeting"}),
                    ("pronunciation_confidence", "Nasal sound confidence", "pronunciation", {"targetSound": "nasal vowels (ão / em)"}),
                ],
            },
            {
                "slug": "final-s-and-endings",
                "title": "Final S and quiet endings",
                "learn": "Final consonants can soften in connected speech. Focus on clarity, not force.",
                "phrases": [
                    ("Boa tarde", "Good afternoon", "BOH-ah TAR-dih", "bo · a · tar · de", "Keep final e light.", "Hard English dee ending.", ["greeting", "sound", "A1"]),
                    ("Boa noite", "Good evening/night", "BOH-ah NOY-tuh", "bo · a · noi · te", "Light final -te.", "Heavy English t.", ["greeting", "sound", "A1"]),
                    ("Mais ou menos", "So-so", "mysh oo MEN-oosh", "mais · ou · me · nos", "Final s often softens.", "Hard American s everywhere.", ["smalltalk", "A1"]),
                    ("Dois cafés", "Two coffees", "doysh kah-FESH", "dois · ca · fés", "Final s in cafés can soften.", "Over-pronouncing every s.", ["food", "numbers", "A1"]),
                    ("Três euros", "Three euros", "trayzh EH-roosh", "três · eu · ros", "Blend naturally between words.", "Full stop between each word.", ["numbers", "money", "A1"]),
                    ("Os meus amigos", "My friends", "oosh MAY-oosh ah-MEE-goosh", "os · meus · a · mi · gos", "Link os + meus smoothly.", "Speaking each word in isolation.", ["people", "A1"]),
                    ("Estamos bem", "We are fine", "esh-TAH-moosh beng", "es · ta · mos · bem", "Keep unstressed vowels short.", "English rhythm with strong syllables only.", ["grammar", "A1"]),
                    ("Até já", "See you soon", "ah-TEH ZHAH", "a · té · já", "Final short phrase rhythm.", "Overly long final vowel.", ["goodbye", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match phrase and meaning", "reading", {"pairs": [["Até já", "See you soon"], ["Mais ou menos", "So-so"], ["Boa noite", "Good evening/night"]]}),
                    ("rebuild_sentence", "Rebuild the sentence", "writing", {"tokens": ["já", "Até"], "answer": "Até já"}),
                    ("listen_placeholder", "Listen and shadow (placeholder)", "listening", {"label": "Connected speech with final s"}),
                ],
            },
            {
                "slug": "lh-nh-and-portuguese-r",
                "title": "LH, NH, and Portuguese R",
                "learn": "Train tricky consonants with short practical chunks.",
                "phrases": [
                    ("Filho", "Son", "FEE-lyoo", "fi · lho", "lh is like a soft ly.", "Saying fill-ho.", ["family", "sound", "A1"]),
                    ("Trabalho", "Work (noun/verb stem)", "trah-BAH-lyoo", "tra · ba · lho", "lh stays light and smooth.", "Hard l sound.", ["work", "sound", "A1"]),
                    ("Minha mãe", "My mother", "MEE-nyah myng", "mi · nha · mãe", "nh is like ny.", "Hard n in minha.", ["family", "sound", "A1"]),
                    ("Amanhã de manhã", "Tomorrow morning", "ah-ma-NYAH duh mah-NYAH", "a · ma · nhã · de · ma · nhã", "Repeat nh shape consistently.", "Changing nh between words.", ["time", "sound", "A1"]),
                    ("Rua", "Street", "ROO-ah", "ru · a", "Initial r is not American r.", "Strong English r.", ["directions", "A1"]),
                    ("Carro", "Car", "KAH-hoo", "car · ro", "Double r stronger than single r.", "Using American r in carro.", ["travel", "A1"]),
                    ("Obrigado pela ajuda", "Thanks for the help", "oh-bree-GAH-doo PEH-lah ah-ZHOO-dah", "o · bri · ga · do · pe · la · a · ju · da", "Portuguese j in ajuda sounds like zh.", "Hard English j.", ["polite", "A1"]),
                    ("Por favor", "Please", "poor fah-VOHR", "por · fa · vor", "Keep r light, not growled.", "Over-rolling r.", ["polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Choose the correct meaning", "reading", {"prompt": "What does Minha mãe mean?", "options": ["My friend", "My mother", "My sister"], "correctIndex": 1}),
                    ("translate_pt", "Translate to Portuguese", "writing", {"prompt": "Write: Tomorrow morning", "answers": ["Amanhã de manhã", "amanhã de manhã"]}),
                    ("self_rate_speaking", "Self-rate your LH/NH/R clarity", "speaking", {"cue": "How clear did LH, NH, and R feel?"}),
                ],
            },
        ],
    },
    {
        "slug": "greetings-politeness",
        "title": "Greetings and Politeness",
        "desc": "Greet people calmly and use polite openers naturally.",
        "soon": False,
        "lessons": [
            {
                "slug": "core-greetings",
                "title": "Core greetings",
                "learn": "Use short greetings with natural tone in shops and on the street.",
                "phrases": [
                    ("Olá", "Hello", "oh-LAH", "o · lá", "Short and clear.", "Overly long final vowel.", ["greeting", "A1"]),
                    ("Bom dia", "Good morning", "bohng DEE-ah", "bom · di · a", "Nasal om.", "Hard m ending.", ["greeting", "A1"]),
                    ("Boa tarde", "Good afternoon", "BOH-ah TAR-dih", "bo · a · tar · de", "Light final e.", "Hard dee ending.", ["greeting", "A1"]),
                    ("Boa noite", "Good evening/night", "BOH-ah NOY-tuh", "bo · a · noi · te", "Keep rhythm soft.", "English stress pattern.", ["greeting", "A1"]),
                    ("Como está?", "How are you? (formal)", "KOH-moo esh-TAH", "co · mo · es · tá", "Formal polite form.", "Using tu form by default.", ["smalltalk", "polite", "A1"]),
                    ("Tudo bem?", "All good?", "TOO-doo beng?", "tu · do · bem", "Friendly informal check-in.", "Flat question tone.", ["smalltalk", "A1"]),
                    ("Prazer", "Nice to meet you", "prah-ZEHR", "pra · zer", "Stress final syllable.", "English PRAY-zer.", ["intro", "A1"]),
                    ("Bem-vindo", "Welcome (m)", "beng-VEEN-doo", "bem · vin · do", "Nasal bem.", "Over-pronouncing hyphen.", ["polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Pick the best greeting", "reading", {"prompt": "You meet someone at 19:00. Best option?", "options": ["Bom dia", "Boa noite", "Até amanhã"], "correctIndex": 1}),
                    ("match_meaning", "Match greeting to English", "reading", {"pairs": [["Olá", "Hello"], ["Prazer", "Nice to meet you"], ["Tudo bem?", "All good?"]]}),
                    ("pronunciation_confidence", "Greeting rhythm confidence", "pronunciation", {"targetSound": "short greeting rhythm"}),
                ],
            },
            {
                "slug": "polite-openers",
                "title": "Polite openers",
                "learn": "Start requests politely before asking for help.",
                "phrases": [
                    ("Por favor", "Please", "poor fah-VOHR", "por · fa · vor", "Stress final syllable.", "Dropping final r completely.", ["polite", "A1"]),
                    ("Desculpe", "Excuse me / sorry", "desh-KOOL-puh", "des · cul · pe", "Use to start questions politely.", "Overly dramatic stress.", ["polite", "A1"]),
                    ("Com licença", "Excuse me (passing by)", "kong lee-SEN-sah", "com · li · cen · ça", "Use for movement in space.", "Using desculpe for every context.", ["polite", "A1"]),
                    ("Se faz favor", "If you please", "suh fahz fah-VOHR", "se · faz · fa · vor", "Common polite formula.", "English word-by-word rhythm.", ["polite", "A1"]),
                    ("Pode ajudar-me?", "Can you help me?", "POH-deh ah-zhoo-DAR-meh", "po · de · a · ju · dar · me", "Attach -me softly.", "Hard break before me.", ["help", "A1"]),
                    ("Pode repetir?", "Can you repeat?", "POH-deh heh-peh-TEER", "po · de · re · pe · tir", "Very useful for beginners.", "Speaking too fast.", ["help", "A1"]),
                    ("Pode falar mais devagar?", "Can you speak slower?", "POH-deh fah-LAR mysh duh-vah-GAR", "po · de · fa · lar · mais · de · va · gar", "Keep final phrase smooth.", "Saying each word separately.", ["help", "A1"]),
                    ("Muito obrigado", "Thank you very much (m)", "MWEEN-too oh-bree-GAH-doo", "mui · to · o · bri · ga · do", "Muit- sounds close to mwee.", "English MY-too.", ["polite", "A1"]),
                ],
                "activities": [
                    ("type_missing", "Fill in the opener", "writing", {"template": "_____, pode ajudar-me?", "answer": "Desculpe", "hint": "Polite opener"}),
                    ("translate_pt", "Translate politely", "writing", {"prompt": "Write: Can you repeat?", "answers": ["Pode repetir?", "pode repetir?"]}),
                    ("self_rate_speaking", "Polite request confidence", "speaking", {"cue": "How confident do you feel saying polite openers?"}),
                ],
            },
        ],
    },
    {
        "slug": "introductions",
        "title": "Introductions",
        "desc": "Introduce yourself and share simple personal details.",
        "soon": False,
        "lessons": [
            {
                "slug": "who-you-are",
                "title": "Who you are",
                "learn": "Use short self-introduction lines you can repeat naturally.",
                "phrases": [
                    ("Chamo-me Alex", "My name is Alex", "SHAH-moo meh AL-eks", "cha · mo · me", "Soft me ending.", "Over-pronouncing ch as tch.", ["intro", "A1"]),
                    ("Sou a Sara", "I am Sara", "soh ah SAH-rah", "sou · a · sa · ra", "Sou is enough in simple intros.", "Adding unnecessary words.", ["intro", "A1"]),
                    ("Sou dos Estados Unidos", "I am from the United States", "soh doosh esh-TAH-doosh oo-NEE-doosh", "sou · dos · es · ta · dos · u · ni · dos", "Link dos + estados.", "Hard d in every syllable.", ["intro", "origin", "A1"]),
                    ("Sou de Londres", "I am from London", "soh duh LON-dresh", "sou · de · Lon · dres", "de + place is very common.", "Using em for origin.", ["intro", "origin", "A1"]),
                    ("Moro em Lisboa", "I live in Lisbon", "MOH-roo eng leesh-BOH-ah", "mo · ro · em · Lis · bo · a", "Moro = permanent-ish residence.", "Using estou for residence by habit.", ["intro", "A1"]),
                    ("Estou em Portugal", "I am in Portugal", "esh-TOW eng por-too-GAL", "es · tou · em · Por · tu · gal", "Useful for current location.", "Mixing sou/estou.", ["intro", "A1"]),
                    ("Tenho trinta anos", "I am thirty years old", "TEN-yoo TREEN-tah AH-noosh", "te · nho · trin · ta · a · nos", "Tenho for age in Portuguese.", "Literal English structure with am.", ["intro", "numbers", "A1"]),
                    ("Não falo muito português", "I don't speak much Portuguese", "nown FAH-loo MWEEN-too por-too-GAYSH", "não · fa · lo · mui · to · por · tu · guês", "Great line for setting expectations.", "Over-apologizing before speaking.", ["intro", "help", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Choose the intro phrase", "reading", {"prompt": "How do you say 'My name is Alex'?", "options": ["Sou Alex", "Chamo-me Alex", "Tenho Alex"], "correctIndex": 1}),
                    ("rebuild_sentence", "Build your intro", "writing", {"tokens": ["Sou", "de", "Londres"], "answer": "Sou de Londres"}),
                    ("self_rate_speaking", "Self-introduction confidence", "speaking", {"cue": "How natural did your self-introduction sound?"}),
                ],
            },
            {
                "slug": "personal-details",
                "title": "Simple personal details",
                "learn": "Share small personal facts in one sentence at a time.",
                "phrases": [
                    ("Trabalho remotamente", "I work remotely", "trah-BAH-lyoo heh-moh-TAH-men-tuh", "tra · ba · lho · re · mo · ta · men · te", "Keep rhythm steady.", "English stress on re-MOTE.", ["work", "A1"]),
                    ("Sou estudante", "I am a student", "soh esh-too-DAN-tuh", "sou · es · tu · dan · te", "Soft final te.", "Hard student-like final t.", ["work", "A1"]),
                    ("Tenho um cão", "I have a dog", "TEN-yoo oong kown", "te · nho · um · cão", "Nasal cão.", "English dog translation anxiety.", ["people", "A1"]),
                    ("Tenho uma gata", "I have a cat (f)", "TEN-yoo OO-mah GAH-tah", "te · nho · u · ma · ga · ta", "Match gender articles.", "Using um with gata.", ["people", "A1"]),
                    ("Gosto de café", "I like coffee", "GOSH-too duh kah-FEH", "gos · to · de · ca · fé", "de after gosto.", "Saying gosto café.", ["food", "A1"]),
                    ("Gosto de viajar", "I like traveling", "GOSH-too duh vyah-ZHAR", "gos · to · de · vi · a · jar", "Useful small-talk line.", "English j sound in viajar.", ["smalltalk", "A1"]),
                    ("Falo inglês", "I speak English", "FAH-loo een-GLAYSH", "fa · lo · in · glês", "Short clear phrase.", "Over-long final glês.", ["intro", "A1"]),
                    ("Estou a aprender português", "I am learning Portuguese", "esh-TOW ah ah-pren-DER por-too-GAYSH", "es · tou · a · a · pren · der · por · tu · guês", "European progressive with estar a.", "Using Brazilian estou aprendendo.", ["intro", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match detail phrases", "reading", {"pairs": [["Tenho um cão", "I have a dog"], ["Gosto de café", "I like coffee"], ["Sou estudante", "I am a student"]]}),
                    ("type_missing", "Complete the phrase", "writing", {"template": "Estou a ______ português", "answer": "aprender", "hint": "Learning verb"}),
                    ("pronunciation_confidence", "Intro confidence", "pronunciation", {"targetSound": "smooth phrase linking"}),
                ],
            },
        ],
    },
    {
        "slug": "numbers-time",
        "title": "Numbers and Time",
        "desc": "Handle prices, times, and simple planning.",
        "soon": False,
        "lessons": [
            {
                "slug": "numbers-prices",
                "title": "Numbers and prices",
                "learn": "Start with practical numbers used in cafés, markets, and transport.",
                "phrases": [
                    ("Quanto é?", "How much is it?", "KWAHN-too eh", "quan · to · é", "Keep final é clear.", "Flat English monotone.", ["numbers", "money", "A1"]),
                    ("Custa dez euros", "It costs ten euros", "KOOSH-tah dezh EH-roosh", "cus · ta · dez · eu · ros", "dez + euros links.", "Hard z and separate rhythm.", ["numbers", "money", "A1"]),
                    ("São cinco euros", "It's five euros", "sow SEEN-koo EH-roosh", "são · cin · co · eu · ros", "Nasal são.", "Saying sao like 'sow'.", ["numbers", "money", "A1"]),
                    ("Só tenho vinte", "I only have twenty", "soh TEN-yoo VEEN-tuh", "só · te · nho · vin · te", "Great at checkout.", "Using only in English order.", ["numbers", "money", "A1"]),
                    ("Tem troco?", "Do you have change?", "tem TROH-koo", "tem · tro · co", "Short practical phrase.", "Overformal alternatives first.", ["money", "A1"]),
                    ("Quero dois bilhetes", "I want two tickets", "KEH-roo doish bee-LYEH-tesh", "que · ro · dois · bi · lhe · tes", "lh in bilhetes.", "Saying bil-het-es.", ["travel", "numbers", "A1"]),
                    ("Um, dois, três", "One, two, three", "oong, doish, trayzh", "um · dois · três", "Practice rhythm in sequence.", "Forgetting accents and stress.", ["numbers", "A1"]),
                    ("Preciso de moedas", "I need coins", "preh-SEE-zoo duh moo-EH-dash", "pre · ci · so · de · mo · e · das", "Useful for machines.", "Dropping de.", ["money", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Price question check", "reading", {"prompt": "Which phrase asks the price?", "options": ["Quanto é?", "Que horas são?", "Onde fica?"], "correctIndex": 0}),
                    ("translate_pt", "Translate to Portuguese", "writing", {"prompt": "Write: It costs ten euros", "answers": ["Custa dez euros", "custa dez euros"]}),
                    ("self_rate_speaking", "Price phrase confidence", "speaking", {"cue": "How natural did your price questions sound?"}),
                ],
            },
            {
                "slug": "days-and-time",
                "title": "Days and time",
                "learn": "Use simple time expressions for meetings and appointments.",
                "phrases": [
                    ("Que horas são?", "What time is it?", "keh OH-rash sow", "que · ho · ras · são", "Plural horas.", "Using singular form.", ["time", "A1"]),
                    ("A que horas?", "At what time?", "ah keh OH-rash", "a · que · ho · ras", "Useful booking phrase.", "Forgetting article a.", ["time", "A1"]),
                    ("Hoje", "Today", "OH-zhuh", "ho · je", "Portuguese j is zh.", "English j sound.", ["time", "A1"]),
                    ("Amanhã", "Tomorrow", "ah-ma-NYAH", "a · ma · nhã", "Nasal nhã.", "Hard n ending.", ["time", "A1"]),
                    ("Segunda-feira", "Monday", "seh-GOON-dah FAY-rah", "se · gun · da · fei · ra", "Break into chunks.", "Rushing too fast.", ["time", "A1"]),
                    ("De manhã", "In the morning", "duh mah-NYAH", "de · ma · nhã", "Use with schedules.", "Hard n in manhã.", ["time", "A1"]),
                    ("À tarde", "In the afternoon", "ah TAR-dih", "à · tar · de", "Accent marks contraction.", "Using article without contraction.", ["time", "A1"]),
                    ("Às três", "At three", "ahsh trayzh", "às · três", "Contraction with plural hours.", "Saying a três.", ["time", "numbers", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match time phrases", "reading", {"pairs": [["Hoje", "Today"], ["À tarde", "In the afternoon"], ["A que horas?", "At what time?"]]}),
                    ("type_missing", "Complete schedule phrase", "writing", {"template": "Encontro ___ três", "answer": "às", "hint": "Contraction before clock time"}),
                    ("pronunciation_confidence", "Time expression rhythm", "pronunciation", {"targetSound": "contractions in time phrases"}),
                ],
            },
        ],
    },
    {
        "slug": "food-cafes",
        "title": "Food and Cafés",
        "desc": "Order confidently and handle payment politely.",
        "soon": False,
        "lessons": [
            {
                "slug": "ordering-coffee",
                "title": "Ordering coffee",
                "learn": "Use short café lines with polite rhythm and clear quantity words.",
                "phrases": [
                    ("Um café, por favor", "A coffee, please", "oong kah-FEH poor fah-VOHR", "um · ca · fé · por · fa · vor", "Nasal um.", "Overpronouncing every syllable.", ["food", "cafe", "A1"]),
                    ("Uma água, por favor", "A water, please", "OO-mah AH-gwah poor fah-VOHR", "u · ma · á · gua · por · fa · vor", "Clear stressed á.", "English 'agua'.", ["food", "cafe", "A1"]),
                    ("Uma meia de leite", "A milky coffee", "OO-mah MAY-ah duh LAY-tuh", "u · ma · mei · a · de · lei · te", "Portugal-specific coffee term.", "Using latte directly.", ["food", "A1"]),
                    ("Sem açúcar", "Without sugar", "seng ah-SOO-kar", "sem · a · çú · car", "Ç = s sound.", "Hard k in açúcar.", ["food", "A1"]),
                    ("Com gelo", "With ice", "kong ZHEH-loo", "com · ge · lo", "Soft g in gelo.", "Hard g like goal.", ["food", "A1"]),
                    ("Para levar", "To go", "PAH-rah leh-VAHR", "pa · ra · le · var", "Useful in cafés and bakeries.", "Literal English rhythm.", ["food", "A1"]),
                    ("Para aqui", "For here", "PAH-rah ah-KEE", "pa · ra · a · qui", "Contrast with para levar.", "Mixing here/to-go forms.", ["food", "A1"]),
                    ("Mais um, se faz favor", "One more, please", "mysh oong, suh fahz fah-VOHR", "mais · um · se · faz · fa · vor", "Great follow-up order phrase.", "Using English 'another'.", ["food", "polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Café order check", "reading", {"prompt": "Which phrase means 'to go'?", "options": ["Para aqui", "Para levar", "Mais um"], "correctIndex": 1}),
                    ("rebuild_sentence", "Build the order", "writing", {"tokens": ["por", "favor", "café,", "Um"], "answer": "Um café, por favor"}),
                    ("self_rate_speaking", "Ordering confidence", "speaking", {"cue": "How confident did your café order sound?"}),
                ],
            },
            {
                "slug": "paying-and-receipts",
                "title": "Paying and receipts",
                "learn": "Close the interaction clearly: ask for bill, card payment, and receipt.",
                "phrases": [
                    ("A conta, se faz favor", "The bill, please", "ah KON-tah, suh fahz fah-VOHR", "a · con · ta · se · faz · fa · vor", "Very common polite request.", "Using direct 'bill please'.", ["food", "payment", "A1"]),
                    ("Posso pagar com cartão?", "Can I pay by card?", "POH-soo pah-GAR kong kar-TOWN", "pos · so · pa · gar · com · car · tão", "Nasal -ão in cartão.", "English card intonation.", ["payment", "A1"]),
                    ("Em dinheiro", "In cash", "eng dee-NYAY-roo", "em · di · nhei · ro", "Useful payment contrast.", "Hard n in dinheiro.", ["payment", "A1"]),
                    ("Tem multibanco?", "Do you have card payment?", "tem mool-tee-BAHNG-koo", "tem · mul · ti · ban · co", "Portugal card-system term.", "Using ATM meaning only.", ["payment", "A1"]),
                    ("Quero fatura, se faz favor", "I want an invoice/receipt, please", "KEH-roo fah-TOO-rah, suh fahz fah-VOHR", "que · ro · fa · tu · ra", "Common in Portugal.", "Only using talão when fatura needed.", ["payment", "A1"]),
                    ("Pode dar-me o talão?", "Can you give me the receipt?", "POH-deh dar-meh oo tah-LOWN", "po · de · dar · me · o · ta · lão", "talão common in retail/cafés.", "Forgetting me in dar-me.", ["payment", "A1"]),
                    ("Está incluído?", "Is it included?", "esh-TAH een-kloo-EE-doo", "es · tá · in · clu · í · do", "Useful with menu questions.", "English included stress.", ["food", "A1"]),
                    ("Obrigado, até já", "Thanks, see you soon", "oh-bree-GAH-doo ah-TEH ZHAH", "o · bri · ga · do · a · té · já", "Friendly close to interaction.", "Stopping abruptly after payment.", ["polite", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match payment phrases", "reading", {"pairs": [["A conta, se faz favor", "The bill, please"], ["Em dinheiro", "In cash"], ["Posso pagar com cartão?", "Can I pay by card?"]]}),
                    ("translate_pt", "Translate to Portuguese", "writing", {"prompt": "Write: Can I pay by card?", "answers": ["Posso pagar com cartão?", "posso pagar com cartão?"]}),
                    ("pronunciation_confidence", "Checkout clarity", "pronunciation", {"targetSound": "card/payment phrases"}),
                ],
            },
        ],
    },
    {
        "slug": "directions-transport",
        "title": "Directions and Transport",
        "desc": "Ask for places and move around metro, bus, and comboio.",
        "soon": False,
        "lessons": [
            {
                "slug": "asking-where-things-are",
                "title": "Asking where things are",
                "learn": "Use short where-questions before adding details.",
                "phrases": [
                    ("Onde fica...?", "Where is...?", "ON-deh FEE-kah", "on · de · fi · ca", "Most useful direction opener.", "Using where as direct translation.", ["directions", "A1"]),
                    ("Onde fica a estação?", "Where is the station?", "ON-deh FEE-kah ah esh-tah-SOWN", "on · de · fi · ca · a · es · ta · ção", "Nasal ão in estação.", "Hard tion sound.", ["directions", "A1"]),
                    ("Onde fica a casa de banho?", "Where is the bathroom?", "ON-deh FEE-kah ah KAH-zah duh BAHN-yoo", "on · de · fi · ca · a · ca · sa · de · ba · nho", "Portugal usage: casa de banho.", "Using banheiro (BR).", ["directions", "A1"]),
                    ("É perto?", "Is it close?", "eh PEHR-too", "é · per · to", "Quick check-in phrase.", "Saying close by as two words.", ["directions", "A1"]),
                    ("É longe?", "Is it far?", "eh LON-zhuh", "é · lon · ge", "Useful follow-up.", "Hard g at end.", ["directions", "A1"]),
                    ("À direita", "To the right", "ah dee-RAY-tah", "à · di · rei · ta", "Contraction à.", "Saying a direita.", ["directions", "A1"]),
                    ("À esquerda", "To the left", "ah esh-KEHR-dah", "à · es · quer · da", "Keep esq cluster smooth.", "Over-hard sk.", ["directions", "A1"]),
                    ("Em frente", "Straight ahead", "eng FREN-tuh", "em · fren · te", "Nasal em.", "English front pronunciation.", ["directions", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Direction phrase check", "reading", {"prompt": "How do you say 'to the right'?", "options": ["À esquerda", "À direita", "Em frente"], "correctIndex": 1}),
                    ("type_missing", "Complete the phrase", "writing", {"template": "Onde _____ a estação?", "answer": "fica", "hint": "Where is..."}),
                    ("self_rate_speaking", "Direction question confidence", "speaking", {"cue": "How clear were your direction questions?"}),
                ],
            },
            {
                "slug": "metro-bus-and-train",
                "title": "Metro, bus, and train",
                "learn": "Use Portugal transport vocabulary from day one.",
                "phrases": [
                    ("A estação de metro", "The metro station", "ah esh-tah-SOWN duh MEH-troo", "a · es · ta · ção · de · me · tro", "Common city phrase.", "Hard r in metro.", ["transport", "A1"]),
                    ("O autocarro", "The bus", "oo ow-too-KAH-hoo", "o · au · to · car · ro", "Portugal term: autocarro.", "Using ônibus (BR).", ["transport", "A1"]),
                    ("O comboio", "The train", "oo kong-BOY-oo", "o · com · boi · o", "Portugal term: comboio.", "Using trem (BR).", ["transport", "A1"]),
                    ("Qual é o próximo?", "Which is the next one?", "kwal eh oo PROK-see-moo", "qual · é · o · pró · xi · mo", "Useful on platforms.", "Skipping article o.", ["transport", "A1"]),
                    ("Para o centro", "To the center", "PAH-rah oo SEN-troo", "pa · ra · o · cen · tro", "Destination phrase.", "Using para centro without article.", ["transport", "A1"]),
                    ("Este vai para...?", "Does this go to...?", "ESH-tuh vy pah-rah", "es · te · vai · pa · ra", "Great route-check phrase.", "Overly direct translation.", ["transport", "A1"]),
                    ("Onde compro bilhete?", "Where do I buy a ticket?", "ON-deh KOM-proo bee-LYEH-tuh", "on · de · com · pro · bi · lhe · te", "Ticket phrase with bilhete.", "Saying ticket in English.", ["transport", "A1"]),
                    ("Preciso de um bilhete", "I need a ticket", "preh-SEE-zoo duh oong bee-LYEH-tuh", "pre · ci · so · de · um · bi · lhe · te", "Use in kiosks/counters.", "Dropping de.", ["transport", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match transport terms", "reading", {"pairs": [["O autocarro", "The bus"], ["O comboio", "The train"], ["O bilhete", "The ticket"]]}),
                    ("rebuild_sentence", "Build route question", "writing", {"tokens": ["para", "vai", "Este", "...?"], "answer": "Este vai para ...?"}),
                    ("pronunciation_confidence", "Transport pronunciation confidence", "pronunciation", {"targetSound": "comboio / autocarro"}),
                ],
            },
        ],
    },
    {
        "slug": "shopping-basics",
        "title": "Shopping Basics",
        "desc": "Handle checkout, requests, and basic customer service.",
        "soon": False,
        "lessons": [
            {
                "slug": "at-checkout",
                "title": "At checkout",
                "learn": "Keep checkout lines short and polite.",
                "phrases": [
                    ("Quanto custa?", "How much does it cost?", "KWAHN-too KOOSH-tah", "quan · to · cus · ta", "Everyday shopping question.", "Mixing with quanto é incorrectly.", ["shopping", "A1"]),
                    ("Só isto", "Just this", "soh EESH-too", "só · is · to", "Natural checkout phrase.", "Adding extra words from English.", ["shopping", "A1"]),
                    ("Tem saco?", "Do you have a bag?", "tem SAH-koo", "tem · sa · co", "Common grocery question.", "Using bolha/bolsa wrongly.", ["shopping", "A1"]),
                    ("Pode ajudar-me?", "Can you help me?", "POH-deh ah-zhoo-DAR-meh", "po · de · a · ju · dar · me", "Polite request.", "Dropping pronoun me.", ["shopping", "A1"]),
                    ("Quero este", "I want this one (m)", "KEH-roo ESH-tuh", "que · ro · es · te", "Use with masculine noun.", "Forgetting gender.", ["shopping", "A1"]),
                    ("Quero esta", "I want this one (f)", "KEH-roo ESH-tah", "que · ro · es · ta", "Use with feminine noun.", "Using este for all nouns.", ["shopping", "A1"]),
                    ("Posso pagar com cartão?", "Can I pay by card?", "POH-soo pah-GAR kong kar-TOWN", "pos · so · pa · gar · com · car · tão", "Reuse from cafés and shops.", "Switching to English at payment.", ["shopping", "payment", "A1"]),
                    ("Quero fatura", "I want an invoice/receipt", "KEH-roo fah-TOO-rah", "que · ro · fa · tu · ra", "Useful in many stores.", "Asking only for talão when invoice needed.", ["shopping", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Checkout phrase check", "reading", {"prompt": "How do you ask for a bag?", "options": ["Tem saco?", "Só isto", "Quanto pesa?"], "correctIndex": 0}),
                    ("type_missing", "Fill in", "writing", {"template": "_____ isto", "answer": "Só", "hint": "Just this"}),
                    ("self_rate_speaking", "Checkout confidence", "speaking", {"cue": "How confident do you feel at checkout?"}),
                ],
            },
            {
                "slug": "sizes-help-and-returns",
                "title": "Sizes, help, and returns",
                "learn": "Ask for sizes, help, and basic service support.",
                "phrases": [
                    ("Tem em tamanho M?", "Do you have size M?", "tem eng tah-MAH-nyoo em", "tem · em · ta · ma · nho", "tamanho uses nh sound.", "Hard n in tamanho.", ["shopping", "A1"]),
                    ("Tem noutra cor?", "Do you have it in another color?", "tem NOH-trah kor", "tem · nou · tra · cor", "Useful fitting-room phrase.", "Forgetting article/structure.", ["shopping", "A1"]),
                    ("Pode mostrar-me?", "Can you show me?", "POH-deh mohs-TRAR-meh", "po · de · mos · trar · me", "Polite and direct.", "Dropping me and sounding blunt.", ["shopping", "A1"]),
                    ("Estou só a ver", "I'm just looking", "esh-TOW soh ah VEHR", "es · tou · só · a · ver", "Natural browsing phrase.", "Literal English wording.", ["shopping", "A1"]),
                    ("Posso experimentar?", "Can I try it on?", "POH-soo esh-peh-ree-men-TAR", "pos · so · ex · pe · ri · men · tar", "Great for clothing.", "Using provar in wrong context.", ["shopping", "A1"]),
                    ("Não serve", "It doesn't fit / it doesn't work", "nown SER-vuh", "não · ser · ve", "Common return/service line.", "Using direct English fit phrase.", ["shopping", "A1"]),
                    ("Posso trocar?", "Can I exchange it?", "POH-soo troh-KAR", "pos · so · tro · car", "Useful return phrase.", "Using devolver for every case.", ["shopping", "A1"]),
                    ("Preciso de ajuda", "I need help", "preh-SEE-zoo duh ah-ZHOO-dah", "pre · ci · so · de · a · ju · da", "Keep phrase calm and clear.", "Hard j in ajuda.", ["shopping", "help", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match service phrases", "reading", {"pairs": [["Estou só a ver", "I'm just looking"], ["Posso trocar?", "Can I exchange it?"], ["Preciso de ajuda", "I need help"]]}),
                    ("translate_pt", "Translate return phrase", "writing", {"prompt": "Write: Can I exchange it?", "answers": ["Posso trocar?", "posso trocar?"]}),
                    ("pronunciation_confidence", "Retail phrase confidence", "pronunciation", {"targetSound": "nh in tamanho"}),
                ],
            },
        ],
    },
    {
        "slug": "people-family",
        "title": "People and Family",
        "desc": "Talk about family and people around you in simple terms.",
        "soon": False,
        "lessons": [
            {
                "slug": "family-words",
                "title": "Family words",
                "learn": "Start with immediate family and possessive basics.",
                "phrases": [
                    ("A minha família", "My family", "ah MEE-nyah fah-MEE-lyah", "a · mi · nha · fa · mí · li · a", "nh in minha.", "Hard n in minha.", ["family", "A1"]),
                    ("O meu pai", "My father", "oo may-oo py", "o · meu · pai", "Possessive agrees with noun.", "Using minha with pai.", ["family", "A1"]),
                    ("A minha mãe", "My mother", "ah MEE-nyah myng", "a · mi · nha · mãe", "Nasal mãe.", "Saying mae with open e.", ["family", "A1"]),
                    ("Tenho um irmão", "I have a brother", "TEN-yoo oong eer-MOWN", "te · nho · um · ir · mão", "Nasal ão in irmão.", "Hard final n.", ["family", "A1"]),
                    ("Tenho uma irmã", "I have a sister", "TEN-yoo OO-mah eer-MAHNG", "te · nho · u · ma · ir · mã", "Nasal ã in irmã.", "Forgetting feminine form.", ["family", "A1"]),
                    ("Somos quatro", "We are four", "SOH-moosh KWA-troo", "so · mos · qua · tro", "Great family count phrase.", "Using English style we have four.", ["family", "numbers", "A1"]),
                    ("Moro com a minha família", "I live with my family", "MOH-roo kong ah MEE-nyah fah-MEE-lyah", "mo · ro · com · a · mi · nha · fa · mí · li · a", "Link com + a.", "Breaking every word.", ["family", "A1"]),
                    ("A minha avó", "My grandmother", "ah MEE-nyah ah-VOH", "a · mi · nha · a · vó", "Accent indicates stress.", "Mixing avó/avô sounds.", ["family", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Pick family phrase", "reading", {"prompt": "How do you say 'my mother'?", "options": ["O meu pai", "A minha mãe", "Tenho irmão"], "correctIndex": 1}),
                    ("type_missing", "Fill in possessive", "writing", {"template": "_____ minha família", "answer": "A", "hint": "Article with família"}),
                    ("self_rate_speaking", "Family intro confidence", "speaking", {"cue": "How natural did your family phrases sound?"}),
                ],
            },
            {
                "slug": "describing-people-and-pets",
                "title": "Describing people and pets",
                "learn": "Describe people simply without overcomplicating grammar.",
                "phrases": [
                    ("Ele é simpático", "He is nice", "EH-leh eh seem-PAH-tee-koo", "e · le · é · sim · pá · ti · co", "Basic adjective pattern.", "English word order shifts.", ["people", "A1"]),
                    ("Ela é simpática", "She is nice", "EH-lah eh seem-PAH-tee-kah", "e · la · é · sim · pá · ti · ca", "Gender agreement.", "Using masculine adjective for all.", ["people", "A1"]),
                    ("Ele é português", "He is Portuguese", "EH-leh eh por-too-GAYSH", "e · le · é · por · tu · guês", "Nationality adjective.", "Hard English guese.", ["people", "A1"]),
                    ("Ela é portuguesa", "She is Portuguese", "EH-lah eh por-too-GAY-zah", "e · la · é · por · tu · gue · sa", "Feminine ending -a.", "Forgetting feminine form.", ["people", "A1"]),
                    ("Tenho um cão", "I have a dog", "TEN-yoo oong KOWN", "te · nho · um · cão", "Nasal cão.", "Saying cao with hard o.", ["pets", "A1"]),
                    ("Tenho uma gata", "I have a female cat", "TEN-yoo OO-mah GAH-tah", "te · nho · u · ma · ga · ta", "Use feminine article.", "Using um gata.", ["pets", "A1"]),
                    ("A minha amiga", "My friend (f)", "ah MEE-nyah ah-MEE-gah", "a · mi · nha · a · mi · ga", "Useful social phrase.", "Mixing amigo/amiga.", ["people", "A1"]),
                    ("O meu amigo", "My friend (m)", "oo may-oo ah-MEE-goo", "o · meu · a · mi · go", "Masculine form.", "Using minha amigo.", ["people", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match people phrases", "reading", {"pairs": [["Ele é simpático", "He is nice"], ["A minha amiga", "My friend (f)"], ["Tenho um cão", "I have a dog"]]}),
                    ("translate_pt", "Translate adjective sentence", "writing", {"prompt": "Write: She is nice", "answers": ["Ela é simpática", "ela é simpática"]}),
                    ("pronunciation_confidence", "People-description confidence", "pronunciation", {"targetSound": "gender endings -o / -a"}),
                ],
            },
        ],
    },
    {
        "slug": "grammar-patterns",
        "title": "Basic Grammar Patterns",
        "desc": "High-frequency verb patterns for daily communication.",
        "soon": False,
        "lessons": [
            {
                "slug": "estou-sou-tenho",
                "title": "Estou, sou, tenho",
                "learn": "Use the right verb for state, identity, and possession.",
                "phrases": [
                    ("Estou em casa", "I am at home", "esh-TOW eng KAH-zah", "es · tou · em · ca · sa", "Use estou for location/state.", "Using sou for location.", ["grammar", "A1"]),
                    ("Estou cansado", "I am tired (m)", "esh-TOW kan-SAH-doo", "es · tou · can · sa · do", "State adjective after estou.", "Using tenho cansado.", ["grammar", "A1"]),
                    ("Sou estudante", "I am a student", "soh esh-too-DAN-tuh", "sou · es · tu · dan · te", "Identity uses sou.", "Using estou for identity.", ["grammar", "A1"]),
                    ("Sou de Nova Iorque", "I am from New York", "soh duh NOH-vah EE-ork", "sou · de · No · va · Ior · que", "Origin uses sou de.", "Using estou de.", ["grammar", "A1"]),
                    ("Tenho uma dúvida", "I have a question/doubt", "TEN-yoo OO-mah DOO-vee-dah", "te · nho · u · ma · dú · vi · da", "Common support phrase.", "Literal 'I am with doubt'.", ["grammar", "A1"]),
                    ("Tenho tempo", "I have time", "TEN-yoo TEM-poo", "te · nho · tem · po", "Possession/availability uses tenho.", "Using estou tempo.", ["grammar", "A1"]),
                    ("Não tenho tempo", "I don't have time", "nown TEN-yoo TEM-poo", "não · te · nho · tem · po", "Great everyday phrase.", "Negation placement issues.", ["grammar", "A1"]),
                    ("Estou pronto", "I am ready (m)", "esh-TOW PRON-too", "es · tou · pron · to", "State phrase for action readiness.", "Using sou pronto.", ["grammar", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Choose the correct verb", "reading", {"prompt": "I ___ in Lisbon (location).", "options": ["sou", "tenho", "estou"], "correctIndex": 2}),
                    ("type_missing", "Complete the sentence", "writing", {"template": "Eu _____ estudante.", "answer": "sou", "hint": "Identity verb"}),
                    ("self_rate_speaking", "Core verb confidence", "speaking", {"cue": "How confident are you with estou/sou/tenho?"}),
                ],
            },
            {
                "slug": "quero-preciso-posso",
                "title": "Quero, preciso, posso",
                "learn": "Use request and need verbs to function in daily situations.",
                "phrases": [
                    ("Quero um café", "I want a coffee", "KEH-roo oong kah-FEH", "que · ro · um · ca · fé", "Simple purchase phrase.", "Overly direct tone in context.", ["grammar", "food", "A1"]),
                    ("Preciso de ajuda", "I need help", "preh-SEE-zoo duh ah-ZHOO-dah", "pre · ci · so · de · a · ju · da", "Preciso takes de.", "Dropping de.", ["grammar", "help", "A1"]),
                    ("Posso entrar?", "Can I come in?", "POH-soo en-TRAR", "pos · so · en · trar", "Polite permission phrase.", "Using may I translation directly.", ["grammar", "A1"]),
                    ("Posso sentar-me aqui?", "Can I sit here?", "POH-soo sen-TAR-meh ah-KEE", "pos · so · sen · tar · me · a · qui", "Attach -me softly.", "Separating me too strongly.", ["grammar", "A1"]),
                    ("Quero comprar isto", "I want to buy this", "KEH-roo kom-PRAR EESH-too", "que · ro · com · prar · is · to", "Common shopping line.", "Using this in English.", ["grammar", "shopping", "A1"]),
                    ("Preciso de água", "I need water", "preh-SEE-zoo duh AH-gwah", "pre · ci · so · de · á · gua", "Useful daily phrase.", "Hard g in água.", ["grammar", "food", "A1"]),
                    ("Posso pagar agora?", "Can I pay now?", "POH-soo pah-GAR ah-GOH-rah", "pos · so · pa · gar · a · go · ra", "Payment + timing combo.", "Stress on wrong syllable in agora.", ["grammar", "payment", "A1"]),
                    ("Quero ir para casa", "I want to go home", "KEH-roo eer PAH-rah KAH-zah", "que · ro · ir · pa · ra · ca · sa", "High-frequency movement phrase.", "Dropping para.", ["grammar", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match verb phrases", "reading", {"pairs": [["Preciso de ajuda", "I need help"], ["Posso entrar?", "Can I come in?"], ["Quero um café", "I want a coffee"]]}),
                    ("translate_pt", "Translate request", "writing", {"prompt": "Write: Can I pay now?", "answers": ["Posso pagar agora?", "posso pagar agora?"]}),
                    ("pronunciation_confidence", "Request phrase confidence", "pronunciation", {"targetSound": "quero / preciso / posso rhythm"}),
                ],
            },
        ],
    },
    {
        "slug": "survival-phrases",
        "title": "Survival Phrases",
        "desc": "Essential lines for misunderstandings and urgent moments.",
        "soon": False,
        "lessons": [
            {
                "slug": "help-and-repetition",
                "title": "Help and repetition",
                "learn": "Use calm survival phrases to keep conversations moving.",
                "phrases": [
                    ("Pode repetir?", "Can you repeat?", "POH-deh heh-peh-TEER", "po · de · re · pe · tir", "Top survival line.", "Sounding frustrated.", ["survival", "A1"]),
                    ("Pode falar mais devagar?", "Can you speak slower?", "POH-deh fah-LAR mysh duh-vah-GAR", "po · de · fa · lar · mais · de · va · gar", "Very useful in fast speech.", "Saying each word separately.", ["survival", "A1"]),
                    ("Não percebo", "I don't understand", "nown pehr-SEH-boo", "não · per · ce · bo", "Polite and clear.", "Switching to English too fast.", ["survival", "A1"]),
                    ("Não percebo bem", "I don't understand well", "nown pehr-SEH-boo beng", "não · per · ce · bo · bem", "Softens tone politely.", "Over-apologizing instead.", ["survival", "A1"]),
                    ("Pode escrever?", "Can you write it?", "POH-deh esh-kreh-VEHR", "po · de · es · cre · ver", "Great for addresses.", "Asking spell without context.", ["survival", "A1"]),
                    ("Pode mostrar no mapa?", "Can you show on the map?", "POH-deh mohsh-TRAR noo MAH-pah", "po · de · mos · trar · no · ma · pa", "Useful for directions.", "Word-by-word English mapping.", ["survival", "A1"]),
                    ("Fala inglês?", "Do you speak English?", "FAH-lah een-GLAYSH", "fa · la · in · glês", "Use politely with smile.", "Using this as first line always.", ["survival", "A1"]),
                    ("Obrigado pela paciência", "Thanks for your patience", "oh-bree-GAH-doo PEH-lah pah-see-EN-see-ah", "o · bri · ga · do · pe · la · pa · ci · ên · cia", "Great repair phrase.", "Skipping polite close.", ["survival", "polite", "A1"]),
                ],
                "activities": [
                    ("multiple_choice", "Pick the repair phrase", "reading", {"prompt": "Which phrase means 'I don't understand'?", "options": ["Não percebo", "Estou perdido", "Tem troco?"], "correctIndex": 0}),
                    ("type_missing", "Complete the phrase", "writing", {"template": "Pode falar mais _____?", "answer": "devagar", "hint": "slower"}),
                    ("self_rate_speaking", "Survival line confidence", "speaking", {"cue": "How comfortable are your help/repetition phrases?"}),
                ],
            },
            {
                "slug": "problems-and-emergencies",
                "title": "Problems and emergencies",
                "learn": "Use short, direct lines when something goes wrong.",
                "phrases": [
                    ("Preciso de ajuda", "I need help", "preh-SEE-zoo duh ah-ZHOO-dah", "pre · ci · so · de · a · ju · da", "Start with this line in urgent moments.", "Using long explanations first.", ["survival", "A1"]),
                    ("Há um problema", "There is a problem", "ah oong pro-BLEH-mah", "há · um · pro · ble · ma", "Clear and neutral statement.", "Hard English 'problem' stress.", ["survival", "A1"]),
                    ("Não funciona", "It doesn't work", "nown foon-see-OH-nah", "não · fun · ci · o · na", "Useful for devices/tickets.", "Using Spanish funciona pronunciation.", ["survival", "A1"]),
                    ("Estou perdido", "I am lost (m)", "esh-TOW pehr-DEE-doo", "es · tou · per · di · do", "Simple travel emergency phrase.", "Using sou perdido.", ["survival", "A1"]),
                    ("Estou perdida", "I am lost (f)", "esh-TOW pehr-DEE-dah", "es · tou · per · di · da", "Gender variation.", "Using masculine always.", ["survival", "A1"]),
                    ("Preciso de um médico", "I need a doctor", "preh-SEE-zoo duh oong MEH-dee-koo", "pre · ci · so · de · um · mé · di · co", "Clear urgent request.", "Over-detailed medical story first.", ["survival", "A1"]),
                    ("Chame a polícia, por favor", "Call the police, please", "SHAH-meh ah poh-LEE-see-ah, poor fah-VOHR", "cha · me · a · po · lí · ci · a", "Emergency-only phrase.", "Using informal tone.", ["survival", "A1"]),
                    ("Onde é a farmácia?", "Where is the pharmacy?", "ON-deh eh ah far-MAH-see-ah", "on · de · é · a · far · má · ci · a", "Useful for urgent needs.", "Saying drugstore in English.", ["survival", "A1"]),
                ],
                "activities": [
                    ("match_meaning", "Match emergency phrases", "reading", {"pairs": [["Há um problema", "There is a problem"], ["Não funciona", "It doesn't work"], ["Preciso de um médico", "I need a doctor"]]}),
                    ("rebuild_sentence", "Rebuild emergency line", "writing", {"tokens": ["de", "Preciso", "ajuda"], "answer": "Preciso de ajuda"}),
                    ("pronunciation_confidence", "Emergency phrase confidence", "pronunciation", {"targetSound": "clear short emergency lines"}),
                ],
            },
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
        mid = f"e1000001-0001-4001-8001-{mod_idx:012d}"
        lines.append(
            f"insert into public.modules (id, level_id, slug, title, description, sort_order, coming_soon) values "
            f"('{mid}', '{lid_a1}', {esc(mod['slug'])}, {esc(mod['title'])}, {esc(mod['desc'])}, {mod_idx}, {str(mod['soon']).lower()});\n"
        )
        les_idx = 0
        for les in mod["lessons"]:
            les_idx += 1
            les_id = f"d1000001-0001-4001-8001-{mod_idx:06d}{les_idx:06d}"
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
                f"{esc('Preview only — content is coming during beta and being expanded.')}, {i}, true);\n"
            )
        lines.append("\n")

    # sound lessons
    for i, sl in enumerate(SOUND_LESSONS, start=1):
        sid = f"c1000001-0001-4001-8001-{i:012d}"
        lines.append(
            f"insert into public.sound_lessons (id, course_id, slug, title, summary, body, sort_order) values "
            f"('{sid}', '{COURSE}', {esc(sl['slug'])}, {esc(sl['title'])}, {esc(sl['summary'])}, {esc_json(sl['body'])}::jsonb, {sl['sort']});\n"
        )

    lines.append("\ncommit;\n")
    out.write_text("".join(lines), encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
