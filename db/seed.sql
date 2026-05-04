-- Vocalia seed content (European Portuguese, seed / illustrative copy)
-- Run after schema.sql. Safe to re-run: uses ON CONFLICT / deletes curriculum only.

-- Clears curriculum (cascades user_*_progress rows that reference deleted lessons/phrases).
begin;

delete from public.phrases;
delete from public.lessons;
delete from public.levels;

insert into public.levels (id, code, title, description, sort_order, lesson_count) values
  ('a1111111-1111-4111-8111-111111111101', 'A1', 'Level A1', 'Survival Portuguese for daily errands and politeness.', 1, 3),
  ('a2222222-2222-4222-8222-222222222202', 'A2', 'Level A2', 'Practical situations: housing, shopping, appointments.', 2, 3),
  ('b1111111-1111-4111-8111-111111111103', 'B1', 'Level B1', 'Explain problems, talk to landlords, health visits.', 3, 3),
  ('b2222222-2222-4222-8222-222222222204', 'B2', 'Level B2', 'Work, bureaucracy, and natural opinions.', 4, 3);

-- A1 lessons
insert into public.lessons (id, level_id, title, description, sort_order) values
  ('b1000001-0001-4001-8001-000000000001', 'a1111111-1111-4111-8111-111111111101', 'Greetings and politeness', 'Sound natural when you enter a shop or meet neighbors.', 1),
  ('b1000001-0001-4001-8001-000000000002', 'a1111111-1111-4111-8111-111111111101', 'Ordering coffee', 'Café culture phrases with clear European rhythm.', 2),
  ('b1000001-0001-4001-8001-000000000003', 'a1111111-1111-4111-8111-111111111101', 'Basic directions', 'Ask and understand simple directions in Lisbon or Porto.', 3);

-- A2 lessons
insert into public.lessons (id, level_id, title, description, sort_order) values
  ('b2000002-0002-4002-8002-000000000001', 'a2222222-2222-4222-8222-222222222202', 'Apartment viewings', 'Useful lines for visits and follow-up messages.', 1),
  ('b2000002-0002-4002-8002-000000000002', 'a2222222-2222-4222-8222-222222222202', 'Grocery shopping', 'Weights, bags, and polite checkout phrases.', 2),
  ('b2000002-0002-4002-8002-000000000003', 'a2222222-2222-4222-8222-222222222202', 'Making appointments', 'Phone and counter language for scheduling.', 3);

-- B1 lessons
insert into public.lessons (id, level_id, title, description, sort_order) values
  ('b3000003-0003-4003-8003-000000000001', 'b1111111-1111-4111-8111-111111111103', 'Explaining a problem', 'Calm, clear sentences for neighbors and services.', 1),
  ('b3000003-0003-4003-8003-000000000002', 'b1111111-1111-4111-8111-111111111103', 'Talking to a landlord', 'Repairs, rent, and polite boundaries.', 2),
  ('b3000003-0003-4003-8003-000000000003', 'b1111111-1111-4111-8111-111111111103', 'Doctor or vet visit', 'Symptoms, timing, and understanding simple instructions.', 3);

-- B2 lessons
insert into public.lessons (id, level_id, title, description, sort_order) values
  ('b4000004-0004-4004-8004-000000000001', 'b2222222-2222-4222-8222-222222222204', 'Work conversations', 'Small talk and clarity in hybrid workplaces.', 1),
  ('b4000004-0004-4004-8004-000000000002', 'b2222222-2222-4222-8222-222222222204', 'Bureaucracy and immigration', 'Sef appointments and document talk.', 2),
  ('b4000004-0004-4004-8004-000000000003', 'b2222222-2222-4222-8222-222222222204', 'Expressing opinions naturally', 'Soft disagreement and nuance without sounding blunt.', 3);

-- Phrases: A1 — Greetings
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b1000001-0001-4001-8001-000000000001', 'Bom dia', 'Good morning', 'bohng DEE-uh', 'bom · dia', 'Nasal “om” in bom; “dia” ends open like “dee-ah”, not a hard American “r”.', 'Saying “bom DEE-ah” with a flap R at the end of dia.', 1),
('b1000001-0001-4001-8001-000000000001', 'Boa tarde', 'Good afternoon', 'BOH-uh TAR-dee', 'boa · tar · de', 'Two light beats; “tar” is crisp, “de” is soft.', 'Stressing like English “GOOD afterNOON”.', 2),
('b1000001-0001-4001-8001-000000000001', 'Por favor', 'Please', 'poor fah-VOHR', 'por · fa · vor', 'Roll or tap the R lightly; final syllable is stressed.', 'Over-rounding the “o” like Spanish “por”.', 3),
('b1000001-0001-4001-8001-000000000001', 'Obrigado / Obrigada', 'Thank you (m/f)', 'oh-bree-GAH-doo / dah', 'o · bri · ga · do/da', 'Stress on “ga”; final vowels stay clear, not swallowed.', 'Using Brazilian melody with extra syllable stretch.', 4),
('b1000001-0001-4001-8001-000000000001', 'Desculpe o incómodo', 'Sorry for the inconvenience', 'desh-KOOL-poo o een-KOH-moo-doo', 'des · cul · pe · o · in · có · mo · do', 'Keep vowels bright; “c” before “o” sounds like “k”.', 'Pronouncing “desculpe” with English “school”.', 5);

-- A1 — Coffee
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b1000001-0001-4001-8001-000000000002', 'Um café, por favor', 'A coffee, please', 'oong kah-FEH poor fah-VOHR', 'um · ca · fé · por · fa · vor', '“Um” nasalizes slightly before “café”.', 'Saying “OOm” with a long English “oo”.', 1),
('b1000001-0001-4001-8001-000000000002', 'Para aqui ou para levar?', 'For here or to go?', 'PAH-ruh ah-KEE oh PAH-ruh leh-VAHR?', 'pa · ra · a · qui · ou · pa · ra · le · var', 'Rhythm is even; “r” stays light in European PT.', 'American R in “for”.', 2),
('b1000001-0001-4001-8001-000000000002', 'Com leite', 'With milk', 'kong LAY-tuh', 'com · lei · te', '“ei” is a clean diphthong, not “ay-tee”.', 'Stressing “LEET” like English “lite”.', 3),
('b1000001-0001-4001-8001-000000000002', 'Sem açúcar', 'Without sugar', 'seng ah-SOO-kar', 'sem · a · çú · car', '“Sem” nasal; “ç” like “s”.', 'Hard “c” like “k” in sugar.', 4),
('b1000001-0001-4001-8001-000000000002', 'Quanto é?', 'How much is it?', 'KWAHN-too eh?', 'quan · to · é', 'Rising intonation on “é”; vowels stay short.', 'Dragging “is it” English stress pattern.', 5);

-- A1 — Directions
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b1000001-0001-4001-8001-000000000003', 'Onde fica a estação de metro?', 'Where is the metro station?', 'OHN-dee FEE-kuh ah es-tah-SOWN deh MEH-troo?', 'on · de · fi · ca · es · ta · ção · de · me · tro', 'Nasal “ão” at the end of “estação”; keep “r” soft.', 'Heavy American R in “metro”.', 1),
('b1000001-0001-4001-8001-000000000003', 'É perto daqui?', 'Is it near here?', 'eh PEHR-too dah-KEE?', 'é · per · to · da · qui', '“Perto” has a light rolled R.', 'Making “perto” rhyme with English “burrito”.', 2),
('b1000001-0001-4001-8001-000000000003', 'À direita', 'To the right', 'ah dee-RAY-tuh', 'à · di · rei · ta', 'Stress on “rei”; “à” is short.', 'English “die-RIGHT-uh” stress.', 3),
('b1000001-0001-4001-8001-000000000003', 'À esquerda', 'To the left', 'ah shkehr-DUH', 'à · es · quer · da', '“esq” cluster flows quickly; final “a” is schwa-like.', 'Pronouncing “es” like English “ess”.', 4),
('b1000001-0001-4001-8001-000000000003', 'Pode repetir, por favor?', 'Can you repeat, please?', 'POH-dee heh-peh-TEER poor fah-VOHR?', 'po · de · re · pe · tir · por · fa · vor', 'Polite tone; “pode” is softer than a command.', 'Intonation sounding impatient or too loud.', 5);

-- A2 — Apartment
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b2000002-0002-4002-8002-000000000001', 'Gostaria de visitar o apartamento', 'I would like to visit the apartment', 'gosh-tah-REE-uh deh vee-zee-TAR oh ah-part-ah-MEN-too', 'gos · ta · ri · a · de · vi · si · tar · o · a · par · ta · men · to', 'Smooth link “de visitar”; stress “men” lightly.', 'Over-stressing “APARTMENT” English-style.', 1),
('b2000002-0002-4002-8002-000000000001', 'Qual é a renda mensal?', 'What is the monthly rent?', 'kwahl eh ah HEN-dah men-SAHL?', 'qual · é · a · ren · da · men · sal', '“renda” with clear EH vowel.', 'American flap R in “rent”.', 2),
('b2000002-0002-4002-8002-000000000001', 'As despesas estão incluídas?', 'Are utilities included?', 'ash des-PEH-zash es-TOWN een-kloo-EE-dash?', 'as · des · pe · sas · es · tão · in · cluí · das', 'Nasal vowels on “estão”; plural “-das” crisp.', 'Swallowing the nasal “ão”.', 3),
('b2000002-0002-4002-8002-000000000001', 'Há elevador?', 'Is there an elevator?', 'ah eh-leh-vah-DOHR?', 'há · e · le · va · dor', '“Há” is short; stress on “dor”.', 'Silent “h” confusion—still pronounce lightly.', 4),
('b2000002-0002-4002-8002-000000000001', 'Posso marcar uma segunda visita?', 'Can I schedule a second visit?', 'POH-soo mar-KAR OO-muh seh-GOON-duh vee-ZEE-tuh?', 'pos · so · mar · car · u · ma · se · gun · da · vi · si · ta', 'Even rhythm; polite “posso”.', 'Stressing “SECOND” like English.', 5);

-- A2 — Grocery
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b2000002-0002-4002-8002-000000000002', 'Um quilo de maçãs, por favor', 'One kilo of apples, please', 'oong KEE-loo deh mah-SAHNGS poor fah-VOHR', 'um · qui · lo · de · ma · çãs · por · fa · vor', 'Nasal “ãs” at end of “maçãs”.', 'English “apples” vowel in “maçãs”.', 1),
('b2000002-0002-4002-8002-000000000002', 'Pode pesar?', 'Can you weigh it?', 'POH-deh peh-ZAR?', 'po · de · pe · sar', '“Pesar” stress on second syllable.', 'American Z in “weigh”.', 2),
('b2000002-0002-4002-8002-000000000002', 'Preciso de um saco', 'I need a bag', 'preh-SEE-zoo deh oong SAH-koo', 'pre · ci · so · de · um · sa · co', '“Saco” with open “o”.', 'English “sack-oh” diphthong.', 3),
('b2000002-0002-4002-8002-000000000002', 'Onde está o talão?', 'Where is the receipt?', 'OHN-dee es-TAH ooh tah-LOWN?', 'on · de · es · tá · o · ta · lão', 'Nasal “lão”; “talão” common in PT.', 'Saying “receipt” with English stress.', 4),
('b2000002-0002-4002-8002-000000000002', 'Só isto, obrigado', 'That is all, thank you', 'soh EESH-too oh-bree-GAH-doo', 'só · is · to · o · bri · ga · do', '“Isto” with crisp “s”.', 'Brazilian “obrigaduuu” drawl.', 5);

-- A2 — Appointments
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b2000002-0002-4002-8002-000000000003', 'Queria marcar uma consulta', 'I would like to book an appointment', 'kreh-REE-uh mar-KAR OO-muh kon-SOOL-tuh', 'que · ri · a · mar · car · u · ma · con · sul · ta', 'Soft “Queria”; polite conditional feel.', 'Hard English “WANT”.', 1),
('b2000002-0002-4002-8002-000000000003', 'Tem disponibilidade na próxima semana?', 'Do you have availability next week?', 'teng dees-poh-nee-bee-lee-DAH-deh nah PROK-see-muh seh-NAH-nuh?', 'tem · dis · po · ni · bi · li · da · de · na · pró · xi · ma · se · ma · na', 'Nasal “tem”; keep “próxima” flowing.', 'Stressing “AVAILability”.', 2),
('b2000002-0002-4002-8002-000000000003', 'Pode confirmar o endereço?', 'Can you confirm the address?', 'POH-deh kon-feer-MAR oo en-deh-REH-soo?', 'po · de · con · fir · mar · o · en · de · re · ço', '“Endereço” with soft “ç” like “s”.', 'English “address” vowels.', 3),
('b2000002-0002-4002-8002-000000000003', 'Preciso remarcar', 'I need to reschedule', 'preh-SEE-zoo heh-mar-KAR', 'pre · ci · so · re · mar · car', 'Linked “remarcar” keeps momentum.', 'Pausing awkwardly between syllables.', 4),
('b2000002-0002-4002-8002-000000000003', 'Obrigado pela chamada', 'Thank you for the call', 'oh-bree-GAH-doo PEH-luh shah-MAH-duh', 'o · bri · ga · do · pe · la · cha · ma · da', '“Chamada” with “sh” sound for ch in EP.', 'Hard “ch” like “church”.', 5);

-- B1 — Problems
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b3000003-0003-4003-8003-000000000001', 'Há um problema com a água', 'There is a problem with the water', 'ah oong proo-BLEH-muh kong ah AH-gwah', 'há · um · pro · ble · ma · com · a · á · gua', 'Open “a” in “água”; nasal “um” subtle.', 'English “problem” vowel.', 1),
('b3000003-0003-4003-8003-000000000001', 'A pressão está fraca', 'The pressure is low', 'ah preh-SOWN es-TAH FRAH-kuh', 'a · pres · são · es · tá · fra · ca', 'Nasal “pressão”; “fraca” delicate ending.', 'Stressing “LOW” English-style.', 2),
('b3000003-0003-4003-8003-000000000001', 'Já avisei o senhorio', 'I already informed the landlord', 'zhah ah-vee-ZAY ooh seh-NYOHR-yoo', 'já · a · vi · sei · o · se · nho · ri · o', '“Senhorio” flows; “nh” like Spanish ñ.', 'Hard “J” like English “judge”.', 3),
('b3000003-0003-4003-8003-000000000001', 'Podem enviar alguém hoje?', 'Can you send someone today?', 'POH-deng en-vee-AR ahl-GAYNG oy-zhe?', 'po · dem · en · vi · ar · al · guem · ho · je', 'Nasal “podem”; “hoje” soft “zh”.', 'English “today” stress.', 4),
('b3000003-0003-4003-8003-000000000001', 'Preciso disto resolvido rapidamente', 'I need this resolved quickly', 'preh-SEE-zoo DEESH-too reh-zol-VEE-doo hah-pee-dah-MEN-teh', 'pre · ci · so · dis · to · re · sol · vi · do · ra · pi · da · men · te', 'Even pace; avoid shouting urgency.', 'Rushing consonants into a blur.', 5);

-- B1 — Landlord
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b3000003-0003-4003-8003-000000000002', 'O contrato prevê estas reparações', 'The contract covers these repairs', 'ooh kon-TRA-too preh-VAY ESH-tash heh-pah-rah-SOYSH', 'o · con · tra · to · pre · vê · es · tas · re · pa · ra · ções', 'Nasal plural “ções”; measured tone.', 'English “CONtract”.', 1),
('b3000003-0003-4003-8003-000000000002', 'Gostaria de pedir um prazo', 'I would like to request a deadline', 'gosh-tah-REE-uh deh peh-DEER oong PRAH-zoo', 'gos · ta · ri · a · de · pe · dir · um · pra · zo', '“Prazo” stress on first syllable.', 'English “praise-oh”.', 2),
('b3000003-0003-4003-8003-000000000002', 'Podemos combinar uma visita técnica?', 'Can we schedule a technical visit?', 'poh-DEH-moosh kom-bee-NAHR OO-muh vee-ZEE-tuh TEK-nee-kuh?', 'po · de · mos · com · bi · nar · u · ma · vi · si · ta · té · ni · ca', 'Smooth linking; polite question intonation.', 'Stressing “TECHNICAL” English-style.', 3),
('b3000003-0003-4003-8003-000000000002', 'Preciso disto por escrito', 'I need this in writing', 'preh-SEE-zoo DEESH-too poor eesh-KREE-too', 'pre · ci · so · dis · to · por · es · cri · to', '“Escrito” crisp “s”.', 'Silent letters guessed wrong.', 4),
('b3000003-0003-4003-8003-000000000002', 'Obrigado pela compreensão', 'Thanks for your understanding', 'oh-bree-GAH-doo PEH-luh kom-pree-en-SOWN', 'o · bri · ga · do · pe · la · com · pre · en · são', 'Warm, calm closing; nasal “são”.', 'Overly casual “thanks dude”.', 5);

-- B1 — Doctor/vet
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b3000003-0003-4003-8003-000000000003', 'Sinto dores aqui', 'I feel pain here', 'SEEN-too DOH-reez ah-KEE', 'sin · to · do · res · a · qui', '“Dores” plural with crisp “s”.', 'English “pains” diphthong.', 1),
('b3000003-0003-4003-8003-000000000003', 'Começou há dois dias', 'It started two days ago', 'koh-meh-SOH ah doysh DEE-ush', 'co · me · çou · há · dois · di · as', '“Dois” with voiced s between vowels in speech.', 'Hard “z” everywhere.', 2),
('b3000003-0003-4003-8003-000000000003', 'A minha alergia é a pólen', 'My allergy is pollen', 'ah MEE-nyah ah-lehr-ZHEE-uh eh ah POH-leng', 'a · mi · nha · a · ler · gi · a · é · a · pó · len', 'Nasal “len”; gentle delivery.', 'English “allergy” stress.', 3),
('b3000003-0003-4003-8003-000000000003', 'O cão não come desde ontem', 'The dog has not eaten since yesterday', 'ooh kowngnowng KOH-mee DEHZ-dee ON-teng', 'o · cão · não · co · me · des · de · on · tem', 'Multiple nasals—keep them distinct, not mumbled.', 'Flattening nasals into one sound.', 4),
('b3000003-0003-4003-8003-000000000003', 'Preciso de uma receita', 'I need a prescription', 'preh-SEE-zoo deh OO-muh heh-SAY-tuh', 'pre · ci · so · de · u · ma · re · cei · ta', '“Receita” stress on “cei”.', 'English “recipe” vowel.', 5);

-- B2 — Work
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b4000004-0004-4004-8004-000000000001', 'Podemos alinhar expectativas para esta sprint?', 'Can we align expectations for this sprint?', 'poh-DEH-moosh ah-lee-NYAR eks-pek-tah-TEE-vash PAH-ruh ESH-tah sprint?', 'po · de · mos · a · lin · har · ex · pec · ta · ti · vas · pa · ra · es · ta', 'Borrowed “sprint” pronounced lightly; keep PT rhythm.', 'English corporate intonation on every word.', 1),
('b4000004-0004-4004-8004-000000000001', 'Vou documentar isto no Confluence', 'I will document this in Confluence', 'voh do-koo-men-TAR EESH-too noo KON-floo-ens', 'vou · do · cu · men · tar · is · to · no · Con · flu · ence', 'Product names can stay close to English; PT vowels around them.', 'Over-anglicizing every syllable.', 2),
('b4000004-0004-4004-8004-000000000001', 'Preciso de feedback até sexta', 'I need feedback by Friday', 'preh-SEE-zoo deh FEED-bak ah-TEH SAYSH-tuh', 'pre · ci · so · de · feed · back · a · té · sex · ta', 'Loanword “feedback” is common; “sexta” clear.', 'Stressing “FEEDBACK” like a slogan.', 3),
('b4000004-0004-4004-8004-000000000001', 'Estou com alguma dúvida sobre o roadmap', 'I have a question about the roadmap', 'es-TONG kong al-GOO-muh DOO-vee-dah SOH-broo hoo ROHD-map', 'es · tou · com · al · gu · ma · dú · vi · da · so · bre · o · road · map', 'Soft “sobre”; keep professional calm.', 'Heavy R in “roadmap”.', 4),
('b4000004-0004-4004-8004-000000000001', 'Podemos falar depois do stand-up?', 'Can we talk after the stand-up?', 'poh-DEH-moosh fah-LAR deh-Poysh doo stand-up?', 'po · de · mos · fa · lar · de · pois · do · stand · up', 'Natural code-switch; maintain PT melody.', 'Turning it into a command.', 5);

-- B2 — Bureaucracy
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b4000004-0004-4004-8004-000000000002', 'Tenho o NIF e o NISS impressos', 'I have my NIF and NISS printed', 'TEN-yoo ooh neef ee ooh neesh im-PREH-soosh', 'ten · ho · o · NIF · e · o · NISS · im · pre · sos', 'Acronyms spelled out softly; plural “-sos”.', 'Yelling acronyms.', 1),
('b4000004-0004-4004-8004-000000000002', 'A minha marcação é às onze', 'My appointment is at eleven', 'ah MEE-nyah mar-kah-SOWN eh ash OHNZ', 'a · mi · nha · mar · ca · ção · é · às · on · ze', 'Nasal “ção”; “às” short.', 'English “eleven” stress.', 2),
('b4000004-0004-4004-8004-000000000002', 'Trago comprovativo de morada', 'I brought proof of address', 'TRAH-goo kom-proo-vah-TEE-voo deh moh-RAH-duh', 'tra · go · com · pro · va · ti · vo · de · mo · ra · da', 'Even rhythm; official but friendly.', 'Swallowing “comprovativo”.', 3),
('b4000004-0004-4004-8004-000000000002', 'Ainda falta algum documento?', 'Is any document still missing?', 'ah-EEN-dah FAL-tah al-GOONG do-koo-MEN-too?', 'a · in · da · fal · ta · al · gum · do · cu · men · to', 'Rising intonation; polite check-in.', 'Blunt “what’s missing”.', 4),
('b4000004-0004-4004-8004-000000000002', 'Obrigado pela vossa ajuda', 'Thank you for your help', 'oh-bree-GAH-doo PEH-luh VOH-sah ah-ZHOO-dah', 'o · bri · ga · do · pe · la · vos · sa · a · ju · da', '“Vossa” formal plural; warm close.', 'Too informal for a counter context.', 5);

-- B2 — Opinions
insert into public.phrases (lesson_id, phrase, translation, phonetic, syllable_breakdown, pronunciation_notes, common_mistakes, sort_order) values
('b4000004-0004-4004-8004-000000000003', 'Compreendo o teu ponto, mas…', 'I understand your point, but…', 'kom-preh-EN-doo ooh tew POHN-too, mash...', 'com · pre · en · do · o · teu · pon · to · mas', 'Soft entry; “mas” leads calmly into contrast.', 'Starting with “NO” energy.', 1),
('b4000004-0004-4004-8004-000000000003', 'Eu veria isto de outra forma', 'I would see it another way', 'eh-oo veh-REE-uh EESH-too deh OH-trah FOR-muh', 'eu · ve · ri · a · is · to · de · ou · tra · for · ma', 'Polite conditional; measured pace.', 'Over-apologizing before every word.', 2),
('b4000004-0004-4004-8004-000000000003', 'Não estou totalmente de acordo', 'I do not fully agree', 'nowng es-TOH toh-tal-MEN-teh deh ah-KOR-doo', 'não · es · tou · to · tal · men · te · de · a · cor · do', 'Nasal “não”; avoid sounding sharp.', 'Monotone that sounds rude.', 3),
('b4000004-0004-4004-8004-000000000003', 'Há nuances que vale a pena notar', 'There are nuances worth noting', 'ah noo-AHN-sash keh VAH-lee ah PEH-nah noo-TAR', 'há · nu · an · cas · que · va · le · a · pe · na · no · tar', '“Nuances” can stay French-lite; keep PT vowels.', 'Rushing the closing.', 4),
('b4000004-0004-4004-8004-000000000003', 'Podemos explorar uma alternativa?', 'Can we explore an alternative?', 'poh-DEH-moosh eks-ploh-rah-ROO-mah al-tehr-nah-TEE-vuh?', 'po · de · mos · ex · plo · rar · u · ma · al · ter · na · ti · va', 'Polite question; open vowels on “alternativa”.', 'Closed, confrontational tone.', 5);

commit;
