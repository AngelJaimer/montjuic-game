// Lightweight i18n for the game. The whole codebase keeps its strings in
// Spanish (which doubles as the logic keys for verbs/flags); at DISPLAY time we
// pass user-facing text through tr(), which looks the Spanish string up in the
// EN dictionary. Anything not in the dictionary falls back to Spanish, so a
// missing entry degrades gracefully instead of crashing.
//
// Proper nouns (Montjuïc, Sagrada Família, El Born, Santa Maria del Mar and the
// characters' names) are intentionally NOT translated — they stay in their
// original Spanish/Catalan to keep the Barcelona flavour.

export type Lang = 'en' | 'es';

const LANG_KEY = 'montjuic_lang';
function readLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === 'es' || v === 'en') return v;
  } catch (e) { /* ignore */ }
  return 'en'; // English by default
}

export let LANG: Lang = readLang();

export function getLang(): Lang { return LANG; }
export function setLang(l: Lang) {
  LANG = l;
  try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* ignore */ }
}

// The nine SCUMM verbs + the sentence connectors. Verbs stay Spanish internally
// (runAction compares verb === 'Abrir' etc.), so these are display-only.
const EN_VERBS: Record<string, string> = {
  'Abrir': 'Open',
  'Cerrar': 'Close',
  'Dar': 'Give',
  'Coger': 'Pick up',
  'Mirar': 'Look at',
  'Hablar con': 'Talk to',
  'Usar': 'Use',
  'Empujar': 'Push',
  'Tirar de': 'Pull',
  'Ir a': 'Go to',
  'Caminar a': 'Walk to',
  // DEFAULT_RESPONSES (verbs.ts) — shown via say(), so keyed by the Spanish line.
  'No puedo abrir eso.': "I can't open that.",
  'No hay nada que cerrar ahí.': "There's nothing to close there.",
  '¿Dárselo? ¿A quién, a las gaviotas?': 'Give it? To whom, the seagulls?',
  'Mejor lo dejo donde está.': 'Better leave it where it is.',
  'No veo nada del otro mundo.': "I don't see anything out of this world.",
  'No me contesta. Qué maleducado.': 'No answer. How rude.',
  'No sabría ni por dónde empezar.': "I wouldn't even know where to begin.",
  'Empujo... y no pasa absolutamente nada.': 'I push... and absolutely nothing happens.',
  'No se mueve ni harto de horchata.': "It won't budge for the life of me.",
};

// UI chrome: title screen, settings panel, about box, save messages, and the
// generic fallback lines hard-coded in main.ts.
const EN_UI: Record<string, string> = {
  // runAction / handleNPC / giveItem fallbacks
  'Las cerraduras ceden, una tras otra...': 'The locks give way, one after another...',
  'Aún me faltan llaves.': "I'm still missing keys.",
  'Ahora mismo no puedo cogerlo.': "I can't pick that up right now.",
  'Cogido.': 'Got it.',
  'Mmm.': 'Hmm.',
  'No parece buena idea.': "Doesn't seem like a good idea.",
  'No, gracias. No me hace ninguna falta.': "No, thanks. I don't need it at all.",
  'Te falta algo.': "You're missing something.",
  // win-ending literal (main.ts)
  'EPISODIO COMPLETADO': 'EPISODE COMPLETE',
  'Continuará...': 'To be continued...',
  // ending continue hint
  'toca para continuar': 'tap to continue',
  // title screen
  'EL SECRETO DE': 'THE SECRET OF',
  'Episodio 1: El Puerto': 'Episode 1: The Port',
  'Haz clic para empezar': 'Click to start',
  'un spin-off de Monkey Island · por Angel Jaime': 'a Monkey Island spin-off · by Angel Jaime',
  // settings panel
  'AJUSTES': 'SETTINGS',
  'Música': 'Music',
  'Sonido': 'Sound',
  'Partida': 'Game',
  'Guardar': 'Save',
  'Cargar': 'Load',
  'Borrar': 'Erase',
  'Acerca de': 'About',
  'Cerrar': 'Close', // settings/about button (distinct from the 'Cerrar' verb, same word in ES)
  'Idioma': 'Language',
  // song labels (audio/engine.ts)
  'Automática': 'Automatic',
  'Mediterránea': 'Mediterranean',
  // save messages
  'Partida guardada': 'Game saved',
  'No se pudo guardar': "Couldn't save",
  'No hay partida': 'No saved game',
  'Partida cargada': 'Game loaded',
  'No se pudo cargar': "Couldn't load",
  'Partida borrada': 'Game erased',
  // save-info help lines
  'Tu progreso se guarda solo en': 'Your progress is saved only in',
  'este navegador. Sobrevive al': 'this browser. It survives a',
  'refrescar: pulsa Cargar para': 'refresh: press Load to keep',
  'seguir. Borrar lo elimina.': 'playing. Erase deletes it.',
  // about box
  'EL SECRETO DE MONTJUÏC': 'THE SECRET OF MONTJUÏC',
  'Volver': 'Back',
  'Un spin-off de fans de Monkey Island.': 'A Monkey Island fan spin-off.',
  'Todos los derechos reservados sobre el': 'All rights reserved on the',
  'código, el arte y la música originales.': 'original code, art and music.',
  'Juego de fans, por afición y sin ánimo': 'A fan game, made out of love and',
  'de lucro. NO es un producto oficial.': 'not for profit. NOT an official product.',
  '"Monkey Island", sus personajes y marcas': '"Monkey Island", its characters and marks',
  'son propiedad de sus titulares': 'are property of their owners',
  '(Lucasfilm / Disney). Este juego no está': '(Lucasfilm / Disney). This game is not',
  'afiliado ni respaldado por ellos: es un': 'affiliated or endorsed by them: it is a',
  'homenaje inspirado en su estilo.': 'tribute inspired by their style.',
};

// ---- Content dictionaries (filled from the content/rooms files) ----
// Kept as separate consts so each source file's strings can be maintained
// independently; all merged into EN below.
const EN_ITEMS: Record<string, string> = {
  'la cuerda': 'the rope',
  'la moneda': 'the coin',
  'los churros': 'the churros',
  'la xocolata': 'the hot chocolate',
  'el salvoconducto': 'the safe-conduct',
  'el alpiste': 'the birdseed',
  'la primera clave': 'the first key',
  'la ristra de ajos': 'the string of garlic',
  'el tónico': 'the tonic',
  'la segunda clave': 'the second key',
  'los planos': 'the blueprints',
  'la tercera clave': 'the third key',
};

const EN_ROOMS: Record<string, string> = {
  // in-world signage (port.ts)
  'ADUANA': 'CUSTOMS',

  // ===== Port (Ep1) =====
  // exits / place names
  'la ciudad': 'the city',
  'el Mercat': 'the Mercat',
  'el puerto': 'the port',
  'el camino a Montjuïc': 'the road to Montjuïc',
  'el Born': 'El Born',
  'la Rambla': 'La Rambla',
  'la Sagrada Família': 'the Sagrada Família',
  // port hotspots
  'el barril': 'the barrel',
  'la caja': 'the crate',
  'la barca': 'the rowboat',
  'la puerta': 'the door',
  'el cartel': 'the sign',
  'el farol': 'the lamp',
  'la Aduana': 'the Customs House',
  'el galeón': 'the galleon',
  'el mar': 'the sea',
  'Una cuerda bien enrollada. Muy de fiar, a diferencia de los piratas de por aquí.': 'A neatly coiled rope. Very dependable, unlike the pirates around here.',
  'Una buena cuerda. En esta vida nunca se sabe cuándo tendrás que atar a alguien.': "A good rope. In this life you never know when you'll have to tie someone up.",
  'Un barril. Podría contener ron, agua... o lágrimas de marinero.': "A barrel. Could hold rum, water... or a sailor's tears.",
  'Rueda un poco y vuelve a su sitio. Como mis ex.': 'It rolls a bit and comes right back. Like my exes.',
  'Pesa más que mis problemas, y mira que es difícil.': "Heavier than my problems, and that's saying something.",
  "Una caja de embalaje. Pone 'FRÁGIL'. La trataré como trato a mi ego.": "A packing crate. It says 'FRAGILE'. I'll treat it the way I treat my ego.",
  'Una barquita de remos. Mi yate, en una vida paralela más afortunada.': 'A little rowboat. My yacht, in a luckier parallel life.',
  'La puerta de la Aduana. Tras ella, el funcionario más temido del Mediterráneo.': 'The Customs House door. Behind it, the most feared official in the Mediterranean.',
  'Cerrada a cal y canto. Como el corazón de un casero.': "Bolted shut. Like a landlord's heart.",
  'Es una puerta. Hasta yo tengo mis límites.': "It's a door. Even I have my limits.",
  "'ADUANA'. Aquí sellan salvoconductos y aplastan sueños, no siempre en ese orden.": "'CUSTOMS'. Here they stamp safe-conducts and crush dreams, not always in that order.",
  'Un farol. Da una luz cálida y melancólica, como un fado a medianoche.': 'A lamp. It casts a warm, melancholy light, like a fado at midnight.',
  'La Aduana del Port. Para subir a Montjuïc necesito un salvoconducto sellado ahí dentro.': 'The Port Customs House. To get up to Montjuïc I need a safe-conduct stamped inside.',
  'Un galeón precioso. Me pregunto si aceptan polizones con buena conversación.': 'A gorgeous galleon. I wonder if they take stowaways with good conversation.',
  'No me cabe en el bolsillo. Y créeme, lo he intentado con cosas más grandes.': "It won't fit in my pocket. And believe me, I've tried with bigger things.",
  'El castell de Montjuïc, allá arriba. Dicen que guarda un secreto. Por eso he cruzado medio mar.': "The castell de Montjuïc, up there. They say it guards a secret. That's why I crossed half a sea.",
  'El Mediterráneo. Huele a sal, a aventura y a calamares a la romana.': 'The Mediterranean. It smells of salt, adventure, and fried calamari.',
  // port NPCs
  'el aduanero': 'the customs officer',
  'El Oficial de Aduanas. No sonríe desde tiempos del rey Jaume I, y no piensa empezar hoy.': "The Customs Officer. He hasn't smiled since the days of King Jaume I, and he's not about to start today.",
  '¿Churros sin chocolate? Un churro solo es un palo triste. Trae las dos cosas.': 'Churros without chocolate? A lone churro is just a sad little stick. Bring me both.',
  '¡Aaah, esmorzar! Por fin alguien que entiende la burocracia. Mojo, sello... y aquí tienes tu salvoconducto. Ahora desaparece.': "Aaah, breakfast! Finally, someone who understands bureaucracy. Dip, stamp... and here's your safe-conduct. Now disappear.",
  '¿Chocolate sin churros? ¿Qué clase de salvaje eres? Trae las dos cosas.': 'Chocolate without churros? What kind of savage are you? Bring me both.',
  'Stan, vendedor de barcos. Su chaqueta podría guiar navíos en la niebla.': 'Stan, boat salesman. His jacket could guide ships through the fog.',

  // ===== Mercat (Ep1) =====
  'el jamón': 'the ham',
  'el puesto de xurros': 'the churro stall',
  'el puesto de xocolata': 'the hot-chocolate stall',
  'Una moneda en el suelo. Brilla con un descaro casi insultante.': 'A coin on the ground. It gleams with an almost insulting cheek.',
  '¡Una moneda! El destino me sonríe. O alguien muy torpe acaba de pasar.': 'A coin! Fate smiles on me. Or someone very clumsy just walked by.',
  'Un jamón colgado. Me observa. O eso me parece.': "A hanging cured ham. It's watching me. Or so it seems.",
  'El puesto del churrero. Huele a gloria frita.': "The churro vendor's stall. It smells of deep-fried glory.",
  'El puesto de la chocolatera. El aroma me abraza el alma.': "The chocolate vendor's stall. The aroma hugs my very soul.",
  'el churrero': 'the churro vendor',
  'El churrero, sujetando su toldo con cara de mártir.': "The churro vendor, holding up his awning with a martyr's face.",
  '¡Maravilla! Sujeta esto y... ¡listo! Toma, un cucurucho de los buenos, recién hechos.': 'Wonderful! Hold this and... done! Here, a proper cone of them, fresh out of the oil.',
  'la chocolatera': 'the chocolate vendor',
  'La chocolatera, removiendo un pozo de chocolate negro como la noche.': 'The chocolate vendor, stirring a well of chocolate as black as night.',
  'Una moneda, una tacita. Cuidado, que quema más que la lengua de mi suegra.': "One coin, one little cup. Careful, it burns hotter than my mother-in-law's tongue.",

  // ===== Gate / Montjuïc (Ep1 finale) =====
  'la puerta de Montjuïc': 'the gate of Montjuïc',
  'el castillo': 'the castle',
  'la antorcha': 'the torch',
  'la guardia': 'the guard',
  'La puerta del castillo. Cerrada, enorme y muy poco impresionada por mí.': 'The castle gate. Shut, enormous, and thoroughly unimpressed by me.',
  'Ni se inmuta. Necesitaré algo más que mis bíceps. Como, por ejemplo, permiso.': "It doesn't budge. I'll need more than my biceps. Like, say, permission.",
  'Empujo con todo. La puerta gana. La puerta siempre gana.': "I push with everything. The gate wins. The gate always wins.",
  'El castell de Montjuïc. Tan cerca que casi huelo el secreto. Casi.': 'The castell de Montjuïc. So close I can almost smell the secret. Almost.',
  'Una antorcha. Cálida, peligrosa y muy del montón medieval.': 'A torch. Warm, dangerous, and very run-of-the-mill medieval.',
  'La guardia del castillo. Armadura reluciente, expresión de no-vas-a-pasar.': 'The castle guard. Gleaming armor, a you-shall-not-pass expression.',
  'Sellado y en regla. Bien... adelante. Y mucha suerte ahí arriba: vas a necesitarla.': "Stamped and in order. Right... go ahead. And good luck up there: you'll need it.",
  'EPISODIO 1 COMPLETADO': 'EPISODE 1 COMPLETE',
  'Guybrush cruza la puerta de Montjuïc.': 'Guybrush passes through the gate of Montjuïc.',
  'En el castillo, una vieja inscripción habla': 'In the castle, an old inscription tells',
  'de un tesoro escondido en la ciudad vieja...': 'of a treasure hidden in the old city...',
  'sellado por tres llaves.': 'sealed by three keys.',
  'EPISODIO 2: La Ciudad': 'EPISODE 2: The Old City',

  // ===== La Rambla (Ep2) =====
  'el plátano': 'the plane tree',
  'el quiosco': 'the kiosk',
  'el puesto de flores': 'the flower stall',
  'el empedrado': 'the cobblestones',
  'la estatua humana': 'the living statue',
  'el pajarero': 'the bird seller',
  'la florista': 'the flower seller',
  'Un plátano de la Rambla. Da sombra, hojas en otoño y, todo el año, palomas.': 'A plane tree on the Rambla. It gives shade, leaves in autumn, and pigeons all year round.',
  'Un quiosco modernista. Venden prensa, horchata y rumores a partes iguales.': 'A modernista kiosk. They sell newspapers, horchata, and rumors in equal measure.',
  'La Rambla de les Flors en todo su esplendor. Huele mejor que el resto del puerto.': 'The Rambla de les Flors in all its splendor. It smells better than the rest of the port.',
  'El empedrado de la Rambla, pulido por un millón de paseantes y algún que otro pirata.': "The Rambla's cobblestones, polished by a million strollers and the odd pirate.",
  'Una estatua humana, pintada de plata, congelada en pose heroica. Sostiene una llave en alto. No se mueve ni con un terremoto.': "A living statue, painted silver, frozen in a heroic pose. He holds a key up high. He wouldn't move for an earthquake.",
  'Esparzo el alpiste a sus pies. En segundos, una nube de palomas se le echa encima. El "invencible" aguanta... aguanta... ¡y estalla espantándolas a manotazos! La llave cae rodando. ¡Mía!': 'I scatter the birdseed at his feet. Within seconds a cloud of pigeons descends on him. The "invincible" one holds... holds... and then bursts, swatting them away! The key rolls free. Mine!',
  'El pajarero, rodeado de jaulas. Sus canarios cantan; sus palomas conspiran.': 'The bird seller, surrounded by cages. His canaries sing, his pigeons conspire.',
  'La florista, con una bandeja de flores más colorida que una fiesta mayor.': 'The flower seller, with a tray of flowers more colorful than a town festival.',

  // ===== El Born (Ep2) =====
  'la botiga de la vidente': "the seer's shop",
  'la fragua': 'the forge',
  'las torres': 'the towers',
  'la vidente': 'the seer',
  'el ferrer': 'the blacksmith',
  'Una ristra de ajos colgada de un balcón. Espanta vampiros y, según dicen, a algún que otro pretendiente.': 'A string of garlic hanging from a balcony. It wards off vampires and, they say, the odd suitor.',
  'Una buena ristra de ajos. La vidente estará encantada.': 'A fine string of garlic. The seer will be delighted.',
  'La botiga de la vidente. Velas, abalorios y un olor a incienso que tira de espaldas.': "The seer's shop. Candles, trinkets, and a smell of incense that knocks you flat.",
  'La fragua. El fuego ruge y las herramientas cuelgan como trofeos de guerra.': 'The forge. The fire roars and the tools hang like war trophies.',
  'La segunda clave, en su soporte. Reluce como recién forjada. El ferrer la vigila como un dragón a su oro.': 'The second key, on its stand. It gleams as if freshly forged. The blacksmith guards it like a dragon over its gold.',
  'En cuanto extiendo la mano, el ferrer gruñe sin levantar la vista. Mejor no perder los dedos.': 'The moment I reach out, the blacksmith growls without looking up. Best not to lose my fingers.',
  'Las torres de Santa Maria del Mar asoman tras los tejados. Algo me dice que esta historia acaba ahí dentro.': 'The towers of Santa Maria del Mar rise behind the rooftops. Something tells me this story ends in there.',
  'La Vidente del Born, envuelta en chales y misterio (y un poco de teatro).': 'The Seer of El Born, wrapped in shawls and mystery (and a bit of theatre).',
  '¡Ajos del bueno! El último ingrediente. (revuelve, sopla, murmura un conjuro) ...Toma: un tónico que duerme a quien lo prueba. Úsalo con cabeza. O con quien quieras dormir.': 'Good garlic! The last ingredient. (stirs, blows, mutters a spell) ...Here: a tonic that puts whoever tastes it to sleep. Use it wisely. Or on whoever you want asleep.',
  'El ferrer, ancho como una puerta y sordo como un yunque por el martilleo.': 'The blacksmith, broad as a door and deaf as an anvil from all the hammering.',
  '¿Para mí? ¡Por fin alguien con modales! (glu glu glu) Aaah, qué fresqui... *bostezo*... qué sueñ... (ZZZzzz, se desploma sobre el yunque). Con muchísimo cuidado, le quito la clave del soporte. ¡La segunda es mía!': 'For me? Finally, someone with manners! (glug glug glug) Aaah, so refreshi... (yawn)... so sleep... (ZZZzzz, he keels over onto the anvil). Very carefully, I lift the key off the stand. The second is mine!',

  // ===== Sagrada Família (Ep2) =====
  'la primera piedra': 'the first stone',
  'el dibujo del templo': 'the temple drawing',
  'la grúa': 'the crane',
  'el andamio': 'the scaffolding',
  'el arquitecto': 'the architect',
  'el cantero': 'the stonemason',
  'La primera piedra del templo, con una llave ceremonial encima. Reluce, recién colocada para la ocasión.': "The temple's first stone, with a ceremonial key resting on it. It gleams, freshly laid for the occasion.",
  'En cuanto alargo la mano, el arquitecto me espanta agitando los brazos como un molino. Habrá que quitarlo de en medio.': "The moment I reach out, the architect shoos me off, flapping his arms like a windmill. I'll have to get him out of the way.",
  'Con el arquitecto distraído en su rincón, levanto la llave de la primera piedra. ¡La tercera es mía!': 'With the architect distracted in his corner, I lift the key off the first stone. The third is mine!',
  'Unos planos enrollados, enganchados en lo alto del andamio. Deben de ser los del arquitecto.': "Some rolled-up blueprints, snagged high on the scaffolding. They must be the architect's.",
  'Rescato los planos del andamio. El arquitecto va a llorar de alegría.': 'I rescue the blueprints from the scaffolding. The architect is going to weep with joy.',
  'Un dibujo del templo acabado: una selva de torres apuntando al cielo. Una nota dice "estreno: dentro de unos 150 años". Optimista, el hombre.': 'A drawing of the finished temple: a jungle of towers pointing skyward. A note reads "opening: in about 150 years". Optimistic fellow.',
  'Una grúa de madera con un sillar colgando. Pienso no pasar por debajo.': 'A wooden crane with a stone block dangling. I plan on not walking underneath.',
  'Andamios de madera trepando por la piedra. El futuro, a cámara muy lenta.': 'Wooden scaffolding climbing up the stone. The future, in extreme slow motion.',
  'El arquitecto, barba al viento y mirada de iluminado, montando guardia ante la primera piedra.': "The architect, beard in the wind and a visionary's gaze, standing guard over the first stone.",
  '¡MIS PLANOS! ¡Bendito pirata! Disculpa, debo replantear la nave central AHORA MISMO, antes de que se me escape la curvatura de la cabeza...': 'MY BLUEPRINTS! Blessed pirate! Excuse me, I must redraft the central nave RIGHT NOW, before the curvature slips out of my head...',
  'Un cantero cubierto de polvo, tallando un sillar sin demasiada prisa.': 'A stonemason covered in dust, carving a block with no great hurry.',

  // ===== Santa Maria del Mar (Ep2 finale) =====
  'el arca del Consolat': 'the chest of the Consolat',
  'el rosetón': 'the rose window',
  'la nave': 'the nave',
  'El arca del Tesoro del Consolat de Mar. Tres cerraduras, una por cada llave. Lo que llevo persiguiendo todo el episodio.': "The Treasure Chest of the Consolat de Mar. Three locks, one for each key. What I've been chasing all episode.",
  'Tres cerraduras, y aún no tengo las tres llaves. Me falta alguna.': "Three locks, and I still don't have all three keys. I'm missing one.",
  'Meto las tres llaves. Clic. Clic. CLIC. El arca se abre con un gemido de siglos y un resplandor dorado me ciega...': 'I insert the three keys. Click. Click. CLICK. The chest opens with a groan of centuries and a golden glow blinds me...',
  'El rosetón de Santa Maria del Mar. La luz que cruza el cristal pinta el suelo de colores.': 'The rose window of Santa Maria del Mar. Light crossing the glass paints the floor in colors.',
  'La nave de la catedral del mar, alta y serena. Huele a piedra, cera y siglos.': 'The nave of the cathedral of the sea, tall and serene. It smells of stone, wax, and centuries.',
  'LeChuck, el pirata fantasma. Mi perdición de siempre, ahora con la sonrisa del que acaba de ganar.': 'LeChuck, the ghost pirate. My eternal undoing, now with the grin of someone who has just won.',
  'EPISODIO 2 COMPLETADO': 'EPISODE 2 COMPLETE',
  'El arca del Consolat de Mar se abre de par en par...': 'The chest of the Consolat de Mar swings wide open...',
  '"Gracias por reunir las llaves por mí, Threepwood."': '"Thanks for gathering the keys for me, Threepwood."',
  'Una risa fantasmal retumba en la catedral.': 'A ghostly laugh echoes through the cathedral.',
  'Continuará... Episodio 3': 'To be continued... Episode 3',
};

const EN_DIALOGUES: Record<string, string> = {
  // shared option strings
  '(Salir)': '(Leave)',
  'Insistir': 'Insist',
  'Veré qué encuentro.': "I'll see what I can find.",
  'Solo miro, gracias. (Salir)': 'Just looking, thanks. (Leave)',

  // --- el aduanero (customs officer) ---
  '¿Eh? ¿Qué? No ves que estoy... supervisando el interior de mis párpados.': "Eh? What? Can't you see I'm... inspecting the inside of my eyelids.",
  'Quiero subir al castillo de Montjuïc.': 'I want to go up to Montjuïc castle.',
  'Necesito un salvoconducto.': 'I need a safe-conduct pass.',
  '¿Quién es usted?': 'Who are you?',
  'Nada, perdone. (Salir)': 'Never mind, sorry. (Leave)',
  '¿A Montjuïc? Ja. Sin un salvoconducto sellado, el guarda de la puerta no te deja pasar ni en sueños.': "To Montjuïc? Ha. Without a stamped safe-conduct, the gate guard won't let you pass, not in your dreams.",
  'Pues deme un salvoconducto.': 'Then give me a safe-conduct.',
  'Gracias por nada. (Salir)': 'Thanks for nothing. (Leave)',
  'Yo sello salvoconductos, sí. Pero no sello NADA con el estómago vacío. Tráeme mis xurros amb xocolata desfeta y hablamos.': "I stamp safe-conducts, yes. But I stamp NOTHING on an empty stomach. Bring me my churros with hot chocolate and we'll talk.",
  '¿Churros con chocolate? ¿En serio?': 'Churros with hot chocolate? Seriously?',
  'Está bien, le traeré el desayuno.': "Fine, I'll bring you your breakfast.",
  'Mortalmente en serio. Un aduanero sin esmorzar es un aduanero peligroso. Pregunta en el Mercat, en la parada del xurrer.': 'Deadly serious. A customs officer with no breakfast is a dangerous customs officer. Ask at the Mercat, at the churro stall.',
  'Voy para allá.': "I'm on my way.",
  'Soy el Oficial de Aduanas del Port de Barcelona. El hombre que decide quién entra, quién sale y quién se queda con las ganas.': "I'm the Customs Officer of the Port of Barcelona. The man who decides who comes in, who goes out, and who's left wanting.",
  'Encantado, supongo.': 'Pleased to meet you, I suppose.',
  'Volvamos a lo mío. (Salir)': 'Back to my business. (Leave)',

  // --- Stan (used-boat salesman) ---
  '¡Bienvenido, bienvenido! ¡Stan, Embarcacions de Segona Mà! ¿Buscas barco? ¡Tengo el barco de tus sueños!': "Welcome, welcome! Stan's Used Boats! Looking for a boat? I've got the boat of your dreams!",
  '¿Qué tipo de barcos vendes?': 'What kind of boats do you sell?',
  '¿Sabes algo del secreto de Montjuïc?': 'Do you know anything about the secret of Montjuïc?',
  'Solo estaba mirando.': 'I was just looking.',
  'Adiós, Stan. (Salir)': 'Bye, Stan. (Leave)',
  '¡De todo! Galeras, llaüts, una góndola seminueva, un patito de goma para el baño... ¡y todos con financiación a 200 años! Con intereses, eso sí. Muchos.': "Everything! Galleys, llaüts, a nearly-new gondola, a rubber ducky for the bath... and all with 200-year financing! With interest, mind you. Lots of it.",
  'No tengo dinero, Stan.': 'I have no money, Stan.',
  'Quizá más tarde. (Salir)': 'Maybe later. (Leave)',
  '¡No te preocupes por el dinero! ¡El dinero es una idea! ¡Una ilusión!... que me deberás en doce cómodos plazos.': "Don't you worry about money! Money is an idea! An illusion!... that you'll owe me in twelve easy installments.",
  'Sigo sin tener dinero.': 'I still have no money.',
  'Pssst. Dicen que en el castillo de arriba hay algo que vale más que toda mi flota. Pero para subir hay que pasar al guarda. Y al guarda lo manda el aduanero.': "Pssst. They say the castle up top holds something worth more than my whole fleet. But to go up you have to get past the guard. And the guard answers to the customs officer.",
  '¿Y qué pasa con el aduanero?': 'And what about the customs officer?',
  'Gracias por el dato. (Salir)': 'Thanks for the tip. (Leave)',
  'Que no hace NADA sin desayunar. Llévale churros con chocolate y lo tendrás comiendo de tu mano. Nunca mejor dicho.': "He does NOTHING without his breakfast. Bring him churros with hot chocolate and you'll have him eating out of your hand. Literally.",
  'Muy útil, gracias.': 'Very helpful, thanks.',
  "¡'Solo mirando' es como empieza toda gran compra! Tómate tu tiempo. Tengo barcos hasta que se ponga el sol. Y mañana también.": "'Just looking' is how every great purchase begins! Take your time. I've got boats till the sun goes down. And tomorrow too.",
  'Ya...': 'Right...',

  // --- el xurrer (churro vendor) ---
  '¡Xurros calentets! Bueno... lo estarían si no tuviera las manos ocupadas sujetando este toldo. Como no lo ate, se le cae encima a algún guiri.': "Hot churros! Well... they would be if my hands weren't busy holding up this awning. If I don't tie it down it'll land on some tourist.",
  '¿Me vendes churros?': 'Will you sell me some churros?',
  '¿Te ayudo con el toldo?': 'Want a hand with the awning?',
  'Solo miraba. (Salir)': 'Just looking. (Leave)',
  '¡Claro! En cuanto suelte el toldo. Tráeme algo para atarlo y son tuyos. Una cuerda buena, por ejemplo.': "Of course! As soon as I let go of this awning. Bring me something to tie it down and they're yours. A good rope, for instance.",
  'Necesito una cuerda resistente. Átamelo y te lleno un cucurucho de xurros. Trato hecho.': "I need a sturdy rope. Tie it down for me and I'll fill you a cone of churros. Deal.",
  'Trato hecho.': 'Deal.',

  // --- la chocolatera (hot-chocolate vendor) ---
  'Xocolata desfeta, espesa como el barro y dulce como un domingo. ¿Una tacita?': 'Hot chocolate, thick as mud and sweet as a Sunday. A little cup?',
  '¿Cuánto cuesta?': 'How much is it?',
  '¿Qué tiene de especial?': "What's so special about it?",
  'Quizá luego. (Salir)': 'Maybe later. (Leave)',
  'Una moneda. Una sola. Es chocolate, no el tesoro de Montjuïc.': "One coin. Just one. It's chocolate, not the treasure of Montjuïc.",
  'Buscaré una moneda.': "I'll find a coin.",
  'Que se le puede poner la cuchara de pie. Si tu cuchara se cae, te devuelvo el dinero. (Nunca ha pasado.)': "You can stand a spoon upright in it. If your spoon falls over, I'll refund you. (It has never happened.)",
  'Tentador. ¿Cuánto era?': 'Tempting. How much was it?',
  'Ya veo. (Salir)': 'I see. (Leave)',

  // --- el guarda (gate guard) ---
  'Alto. Al castillo de Montjuïc no sube nadie sin un salvoconducto sellado por la Aduana. Órdenes.': 'Halt. Nobody goes up to Montjuïc castle without a safe-conduct stamped by Customs. Orders.',
  '¿Y si no lo tengo?': "And if I don't have one?",
  'Tengo que subir, es importante.': "I have to go up, it's important.",
  'Está bien. (Salir)': 'All right. (Leave)',
  'Entonces te quedas aquí abajo admirando las vistas. Que son bonitas, todo hay que decirlo.': "Then you stay down here admiring the view. Which is lovely, I'll admit.",
  'Volveré con el salvoconducto.': "I'll come back with the safe-conduct.",
  'Todo el mundo dice que es importante. El salvoconducto no opina: o lo tienes, o no pasas.': "Everybody says it's important. The safe-conduct has no opinion: either you have it, or you don't pass.",
  'Entendido.': 'Understood.',

  // --- l'ocellaire (bird seller, La Rambla) ---
  '¡Ocells, ocells! Canaris, caderneres, coloms... ¡todo lo que canta y lo que ensucia!': 'Birds, birds! Canaries, goldfinches, pigeons... everything that sings and everything that makes a mess!',
  '¿Me das un puñado de alpiste?': 'Could you give me a handful of birdseed?',
  '¿Qué pájaros vendes?': 'What birds do you sell?',
  'Nada, gracias. (Salir)': 'Nothing, thanks. (Leave)',
  'Toma, un buen puñado. Pero no alimentes a las palomas, ¿eh? Que de esas ya vamos sobrados.': "Here, a good handful. But don't feed the pigeons, eh? We have more than enough of those.",
  'Lo tendré en cuenta... je, je.': "I'll keep that in mind... heh, heh.",
  'De todo. Aunque las palomas se venden solas: acuden a quien lleva alpiste como por arte de magia. Es un imán de plumas, créeme.': "All sorts. Though pigeons sell themselves: they flock to anyone carrying birdseed as if by magic. It's a feather magnet, believe me.",
  'Interesante...': 'Interesting...',
  'Gracias. (Salir)': 'Thanks. (Leave)',

  // --- la estatua humana (living statue holding a key) ---
  '¿Hola? ¿Me oye?': 'Hello? Can you hear me?',
  'Le voy a hacer cosquillas.': "I'm going to tickle him.",
  'Dejarlo en paz. (Salir)': 'Leave him be. (Leave)',
  '(No se inmuta. Ni un parpadeo. Es bueno. Es muy bueno.)': "(He doesn't flinch. Not a blink. He's good. He's very good.)",
  '(Una mirada de advertencia le rompe la pose una décima de segundo. Mejor no tentar a la suerte.)': "(A warning glare breaks his pose for a tenth of a second. Best not to push my luck.)",
  '(Nada. Sostiene una llave en alto, parte de su número. Contra una pose así no puedo a las bravas... tendré que ser más listo.)': "(Nothing. He holds a key up high, part of his act. I can't beat a pose like that head-on... I'll have to be cleverer.)",

  // --- la florista (flower seller) ---
  '¡Flors fresques! Rosas, claveles... un ramo para quien amas. O para ti mismo, que también te lo mereces.': "Fresh flowers! Roses, carnations... a bouquet for the one you love. Or for yourself, you deserve it too.",
  'Qué colores tan bonitos.': 'Such beautiful colors.',
  'La Rambla de les Flors, la llaman. Color todo el año, llueva, truene o desembarquen piratas.': 'The Rambla de les Flors, they call it. Color all year round, come rain, thunder, or pirates making landfall.',

  // --- la Vidente del Born (the Seer) ---
  'Aaah... te esperaba, pirata. Las conchas me hablaron de ti. (En realidad te he visto venir por la calle, pero queda mejor así.)': "Aaah... I was expecting you, pirate. The shells spoke to me of you. (I actually saw you coming down the street, but it sounds better this way.)",
  'Necesito la llave que guarda el ferrer.': 'I need the key the blacksmith is guarding.',
  '¿Me lees el futuro?': 'Will you read my future?',
  '¿Quién eres?': 'Who are you?',
  'Adiós, vidente. (Salir)': 'Goodbye, seer. (Leave)',
  'El ferrer no suelta esa llave ni dormido. ...Dormido. Mmm. Puedo prepararte un tónico que tumbaría a un buey. Pero me falta un ingrediente con carácter: tráeme una ristra de ajos del Born.': "The blacksmith won't let go of that key even asleep. ...Asleep. Mmm. I can brew you a tonic that would knock out an ox. But I'm missing one ingredient with character: bring me a string of garlic from El Born.",
  '¿Ajos? ¿En una poción mágica?': 'Garlic? In a magic potion?',
  'Voy a por los ajos.': "I'll go get the garlic.",
  'El ajo espanta a los malos espíritus y, de paso, sazona. No preguntes más y tráemelos.': "Garlic scares off evil spirits and seasons the pot while it's at it. Ask no more and bring it to me.",
  'Está bien, está bien.': 'All right, all right.',
  'Veo... veo... una llave, una catedral junto al mar, y a ti metiéndote en un buen lío. Como siempre.': "I see... I see... a key, a cathedral by the sea, and you getting into deep trouble. As always.",
  'Tranquilizador, gracias.': 'Reassuring, thanks.',
  'Soy la Vidente del Born. Leo el porvenir, vendo amuletos y, los martes, hago un fricandó excelente.': "I'm the Seer of El Born. I read fortunes, sell charms, and on Tuesdays I make an excellent fricandó.",
  'Encantado.': 'Charmed.',

  // --- el ferrer (blacksmith) ---
  '(CLANG CLANG) ¿Eh? ¿Qué quieres? ¡Habla fuerte, que el martillo no me deja oír!': "(CLANG CLANG) Eh? What do you want? Speak up, the hammer drowns everything out!",
  '¡Quiero esa llave!': 'I want that key!',
  '¿Qué forjas?': 'What are you forging?',
  'Nada. (Salir)': 'Nothing. (Leave)',
  '¿Esta? ¡Mi obra maestra! No la vendo ni por todo el oro de Montjuïc. Y ahora aparta, que con esta sed de mil demonios no estoy de humor.': "This one? My masterpiece! I wouldn't sell it for all the gold of Montjuïc. Now step aside, with this raging thirst I'm in no mood.",
  '¿Tienes sed?': 'Are you thirsty?',
  'Lo entiendo. (Salir)': 'I understand. (Leave)',
  '¡Llevo horas dándole al martillo! Tráeme algo fresco para beber y serás mi pirata favorito. Pero la llave, ni la mires.': "I've been swinging this hammer for hours! Bring me something cool to drink and you'll be my favorite pirate. But the key, don't even look at it.",
  'Llaves, rejas, espadas y, cuando nadie mira, figuritas de gatos. No se lo cuentes a nadie.': "Keys, grilles, swords, and when nobody's looking, little cat figurines. Don't tell a soul.",
  'Tu secreto está a salvo.': "Your secret's safe.",

  // --- el arquitecto (the architect) ---
  '¡No, no, NO! ¿Dónde están mis planos? ¡Sin ellos no se coloca ni una piedra más! (Y aún quedan... ¿ciento cincuenta años de obra? Por lo menos.)': "No, no, NO! Where are my blueprints? Without them not one more stone gets laid! (And there's still... a hundred and fifty years of work to go? At least.)",
  '¿Has perdido los planos?': 'Have you lost the blueprints?',
  'Quiero la llave de la primera piedra.': 'I want the key to the first stone.',
  '¿Qué estás construyendo?': 'What are you building?',
  'Suerte con eso. (Salir)': 'Good luck with that. (Leave)',
  '¡Se los llevó el viento! Andarán por el andamio. Tráemelos y hasta te esculpiré una estatua. De piedra, claro, que es lo único que me sobra.': "The wind carried them off! They're somewhere up on the scaffolding. Bring them back and I'll even sculpt you a statue. Out of stone, of course, it's the one thing I have to spare.",
  'Los buscaré.': "I'll look for them.",
  '¿La llave de la primera piedra? ¡Es ceremonial! ¡Sagrada! Nadie la toca mientras yo monte guardia. Y pienso montar guardia un siglo o dos.': "The key to the first stone? It's ceremonial! Sacred! Nobody touches it while I stand guard. And I intend to stand guard for a century or two.",
  'Ya veo...': 'I see...',
  'Un templo que rozará el cielo. Sin una sola línea recta: la recta es cosa de hombres, y yo construyo para Dios... y para los guiris que vendrán en autocar.': "A temple that will graze the sky. Not one straight line: the straight line is the work of men, and I build for God... and for the tourists who'll come by the busload.",
  'Ambicioso.': 'Ambitious.',

  // --- el picapedrer (the stonemason) ---
  'Pesa lo suyo, esta piedra. ¿Ayudas o solo miras, pirata?': 'Weighs a fair bit, this stone. Lending a hand or just watching, pirate?',
  '¿Por qué no avanza la obra?': "Why isn't the work moving along?",
  'El jefe ha perdido los planos y se ha bloqueado. Sin él dándonos la brasa, nadie se acerca a la primera piedra. Devuélvele los papeles y se irá a su rincón a dibujar, ya verás.': "The boss lost his blueprints and he's seized up. Without him nagging us, nobody goes near the first stone. Give him back his papers and he'll scurry off to his corner to draw, you'll see.",
  'Gracias por el dato.': 'Thanks for the tip.',
};

const EN: Record<string, string> = {
  ...EN_VERBS,
  ...EN_UI,
  ...EN_ITEMS,
  ...EN_ROOMS,
  ...EN_DIALOGUES,
};

// Translate a Spanish display string to the active language. Unknown strings
// (and everything when LANG === 'es') fall back to the original Spanish.
export function tr(s: string): string {
  if (LANG === 'es' || !s) return s;
  return EN[s] ?? s;
}
