// Dialogue trees. Each node: an NPC line + the player's response options.
// An option's `to` points to the next node ('end' closes the conversation).
// `set` raises a flag; `if`/`ifNot` gate visibility; `once` hides after use.
export interface Opt {
  text: string;
  to: string;
  set?: string;
  give?: string;   // grant this item id when chosen
  if?: string;
  ifNot?: string;
  once?: boolean;
}
export interface DialogueNode {
  npc: string;
  options: Opt[];
}
export type Dialogue = Record<string, DialogueNode>;

export const ADUANERO_DIALOGUE: Dialogue = {
  start: {
    npc: '¿Eh? ¿Qué? No ves que estoy... supervisando el interior de mis párpados.',
    options: [
      { text: 'Quiero subir al castillo de Montjuïc.', to: 'montjuic' },
      { text: 'Necesito un salvoconducto.', to: 'pase' },
      { text: '¿Quién es usted?', to: 'quien', once: true },
      { text: 'Nada, perdone. (Salir)', to: 'end' },
    ],
  },
  montjuic: {
    npc: '¿A Montjuïc? Ja. Sin un salvoconducto sellado, el guarda de la puerta no te deja pasar ni en sueños.',
    options: [
      { text: 'Pues deme un salvoconducto.', to: 'pase' },
      { text: 'Gracias por nada. (Salir)', to: 'end' },
    ],
  },
  pase: {
    npc: 'Yo sello salvoconductos, sí. Pero no sello NADA con el estómago vacío. Tráeme mis xurros amb xocolata desfeta y hablamos.',
    options: [
      { text: '¿Churros con chocolate? ¿En serio?', to: 'enserio' },
      { text: 'Está bien, le traeré el desayuno.', to: 'end', set: 'goal_breakfast' },
    ],
  },
  enserio: {
    npc: 'Mortalmente en serio. Un aduanero sin esmorzar es un aduanero peligroso. Pregunta en el Mercat, en la parada del xurrer.',
    options: [{ text: 'Voy para allá.', to: 'end', set: 'goal_breakfast' }],
  },
  quien: {
    npc: 'Soy el Oficial de Aduanas del Port de Barcelona. El hombre que decide quién entra, quién sale y quién se queda con las ganas.',
    options: [
      { text: 'Encantado, supongo.', to: 'start' },
      { text: 'Volvamos a lo mío. (Salir)', to: 'end' },
    ],
  },
};

export const STAN_DIALOGUE: Dialogue = {
  start: {
    npc: '¡Bienvenido, bienvenido! ¡Stan, Embarcacions de Segona Mà! ¿Buscas barco? ¡Tengo el barco de tus sueños!',
    options: [
      { text: '¿Qué tipo de barcos vendes?', to: 'barcos' },
      { text: '¿Sabes algo del secreto de Montjuïc?', to: 'secreto' },
      { text: 'Solo estaba mirando.', to: 'mirando', once: true },
      { text: 'Adiós, Stan. (Salir)', to: 'end' },
    ],
  },
  barcos: {
    npc: '¡De todo! Galeras, llaüts, una góndola seminueva, un patito de goma para el baño... ¡y todos con financiación a 200 años! Con intereses, eso sí. Muchos.',
    options: [
      { text: 'No tengo dinero, Stan.', to: 'dinero' },
      { text: 'Quizá más tarde. (Salir)', to: 'end' },
    ],
  },
  dinero: {
    npc: '¡No te preocupes por el dinero! ¡El dinero es una idea! ¡Una ilusión!... que me deberás en doce cómodos plazos.',
    options: [{ text: 'Sigo sin tener dinero.', to: 'end' }],
  },
  secreto: {
    npc: 'Pssst. Dicen que en el castillo de arriba hay algo que vale más que toda mi flota. Pero para subir hay que pasar al guarda. Y al guarda lo manda el aduanero.',
    options: [
      { text: '¿Y qué pasa con el aduanero?', to: 'aduanero' },
      { text: 'Gracias por el dato. (Salir)', to: 'end' },
    ],
  },
  aduanero: {
    npc: 'Que no hace NADA sin desayunar. Llévale churros con chocolate y lo tendrás comiendo de tu mano. Nunca mejor dicho.',
    options: [{ text: 'Muy útil, gracias.', to: 'end', set: 'goal_breakfast' }],
  },
  mirando: {
    npc: "¡'Solo mirando' es como empieza toda gran compra! Tómate tu tiempo. Tengo barcos hasta que se ponga el sol. Y mañana también.",
    options: [{ text: 'Ya...', to: 'start' }],
  },
};

export const CHURRERO_DIALOGUE: Dialogue = {
  start: {
    npc: '¡Xurros calentets! Bueno... lo estarían si no tuviera las manos ocupadas sujetando este toldo. Como no lo ate, se le cae encima a algún guiri.',
    options: [
      { text: '¿Me vendes churros?', to: 'churros' },
      { text: '¿Te ayudo con el toldo?', to: 'toldo' },
      { text: 'Solo miraba. (Salir)', to: 'end' },
    ],
  },
  churros: {
    npc: '¡Claro! En cuanto suelte el toldo. Tráeme algo para atarlo y son tuyos. Una cuerda buena, por ejemplo.',
    options: [{ text: 'Veré qué encuentro.', to: 'end' }],
  },
  toldo: {
    npc: 'Necesito una cuerda resistente. Átamelo y te lleno un cucurucho de xurros. Trato hecho.',
    options: [{ text: 'Trato hecho.', to: 'end' }],
  },
};

export const CHOCOLATERA_DIALOGUE: Dialogue = {
  start: {
    npc: 'Xocolata desfeta, espesa como el barro y dulce como un domingo. ¿Una tacita?',
    options: [
      { text: '¿Cuánto cuesta?', to: 'precio' },
      { text: '¿Qué tiene de especial?', to: 'especial' },
      { text: 'Quizá luego. (Salir)', to: 'end' },
    ],
  },
  precio: {
    npc: 'Una moneda. Una sola. Es chocolate, no el tesoro de Montjuïc.',
    options: [{ text: 'Buscaré una moneda.', to: 'end' }],
  },
  especial: {
    npc: 'Que se le puede poner la cuchara de pie. Si tu cuchara se cae, te devuelvo el dinero. (Nunca ha pasado.)',
    options: [
      { text: 'Tentador. ¿Cuánto era?', to: 'precio' },
      { text: 'Ya veo. (Salir)', to: 'end' },
    ],
  },
};

export const GUARDIA_DIALOGUE: Dialogue = {
  start: {
    npc: 'Alto. Al castillo de Montjuïc no sube nadie sin un salvoconducto sellado por la Aduana. Órdenes.',
    options: [
      { text: '¿Y si no lo tengo?', to: 'no' },
      { text: 'Tengo que subir, es importante.', to: 'importante' },
      { text: 'Está bien. (Salir)', to: 'end' },
    ],
  },
  no: {
    npc: 'Entonces te quedas aquí abajo admirando las vistas. Que son bonitas, todo hay que decirlo.',
    options: [{ text: 'Volveré con el salvoconducto.', to: 'end' }],
  },
  importante: {
    npc: 'Todo el mundo dice que es importante. El salvoconducto no opina: o lo tienes, o no pasas.',
    options: [{ text: 'Entendido.', to: 'end' }],
  },
};

// ---------- Episode 2: La Rambla ----------
export const OCELLAIRE_DIALOGUE: Dialogue = {
  start: {
    npc: '¡Ocells, ocells! Canaris, caderneres, coloms... ¡todo lo que canta y lo que ensucia!',
    options: [
      { text: '¿Me das un puñado de alpiste?', to: 'alpiste', give: 'alpiste', set: 'has_alpiste', once: true },
      { text: '¿Qué pájaros vendes?', to: 'birds' },
      { text: 'Nada, gracias. (Salir)', to: 'end' },
    ],
  },
  alpiste: {
    npc: 'Toma, un buen puñado. Pero no alimentes a las palomas, ¿eh? Que de esas ya vamos sobrados.',
    options: [{ text: 'Lo tendré en cuenta... je, je.', to: 'end' }],
  },
  birds: {
    npc: 'De todo. Aunque las palomas se venden solas: acuden a quien lleva alpiste como por arte de magia. Es un imán de plumas, créeme.',
    options: [
      { text: 'Interesante...', to: 'start' },
      { text: 'Gracias. (Salir)', to: 'end' },
    ],
  },
};

export const ESTATUA_DIALOGUE: Dialogue = {
  start: {
    npc: '...',
    options: [
      { text: '¿Hola? ¿Me oye?', to: 'sil1' },
      { text: 'Le voy a hacer cosquillas.', to: 'sil2', once: true },
      { text: 'Dejarlo en paz. (Salir)', to: 'end' },
    ],
  },
  sil1: {
    npc: '(No se inmuta. Ni un parpadeo. Es bueno. Es muy bueno.)',
    options: [{ text: 'Insistir', to: 'sil3' }, { text: '(Salir)', to: 'end' }],
  },
  sil2: {
    npc: '(Una mirada de advertencia le rompe la pose una décima de segundo. Mejor no tentar a la suerte.)',
    options: [{ text: '(Salir)', to: 'end' }],
  },
  sil3: {
    npc: '(Nada. Sostiene una llave en alto, parte de su número. Contra una pose así no puedo a las bravas... tendré que ser más listo.)',
    options: [{ text: '(Salir)', to: 'end' }],
  },
};

export const FLORISTA_DIALOGUE: Dialogue = {
  start: {
    npc: '¡Flors fresques! Rosas, claveles... un ramo para quien amas. O para ti mismo, que también te lo mereces.',
    options: [
      { text: 'Qué colores tan bonitos.', to: 'colors' },
      { text: 'Solo miro, gracias. (Salir)', to: 'end' },
    ],
  },
  colors: {
    npc: 'La Rambla de les Flors, la llaman. Color todo el año, llueva, truene o desembarquen piratas.',
    options: [{ text: '(Salir)', to: 'end' }],
  },
};

// ---------- Episode 2: El Born ----------
export const VIDENTE_DIALOGUE: Dialogue = {
  start: {
    npc: 'Aaah... te esperaba, pirata. Las conchas me hablaron de ti. (En realidad te he visto venir por la calle, pero queda mejor así.)',
    options: [
      { text: 'Necesito la llave que guarda el ferrer.', to: 'llave' },
      { text: '¿Me lees el futuro?', to: 'futuro' },
      { text: '¿Quién eres?', to: 'quien', once: true },
      { text: 'Adiós, vidente. (Salir)', to: 'end' },
    ],
  },
  llave: {
    npc: 'El ferrer no suelta esa llave ni dormido. ...Dormido. Mmm. Puedo prepararte un tónico que tumbaría a un buey. Pero me falta un ingrediente con carácter: tráeme una ristra de ajos del Born.',
    options: [
      { text: '¿Ajos? ¿En una poción mágica?', to: 'ajos' },
      { text: 'Voy a por los ajos.', to: 'end', set: 'goal_ajos' },
    ],
  },
  ajos: {
    npc: 'El ajo espanta a los malos espíritus y, de paso, sazona. No preguntes más y tráemelos.',
    options: [{ text: 'Está bien, está bien.', to: 'end', set: 'goal_ajos' }],
  },
  futuro: {
    npc: 'Veo... veo... una llave, una catedral junto al mar, y a ti metiéndote en un buen lío. Como siempre.',
    options: [{ text: 'Tranquilizador, gracias.', to: 'end' }],
  },
  quien: {
    npc: 'Soy la Vidente del Born. Leo el porvenir, vendo amuletos y, los martes, hago un fricandó excelente.',
    options: [{ text: 'Encantado.', to: 'start' }, { text: '(Salir)', to: 'end' }],
  },
};

export const FERRER_DIALOGUE: Dialogue = {
  start: {
    npc: '(CLANG CLANG) ¿Eh? ¿Qué quieres? ¡Habla fuerte, que el martillo no me deja oír!',
    options: [
      { text: '¡Quiero esa llave!', to: 'llave' },
      { text: '¿Qué forjas?', to: 'forja' },
      { text: 'Nada. (Salir)', to: 'end' },
    ],
  },
  llave: {
    npc: '¿Esta? ¡Mi obra maestra! No la vendo ni por todo el oro de Montjuïc. Y ahora aparta, que con esta sed de mil demonios no estoy de humor.',
    options: [
      { text: '¿Tienes sed?', to: 'sed' },
      { text: 'Lo entiendo. (Salir)', to: 'end' },
    ],
  },
  sed: {
    npc: '¡Llevo horas dándole al martillo! Tráeme algo fresco para beber y serás mi pirata favorito. Pero la llave, ni la mires.',
    options: [{ text: 'Veré qué encuentro.', to: 'end' }],
  },
  forja: {
    npc: 'Llaves, rejas, espadas y, cuando nadie mira, figuritas de gatos. No se lo cuentes a nadie.',
    options: [{ text: 'Tu secreto está a salvo.', to: 'end' }],
  },
};

// ---------- Episode 2: Sagrada Família (la primera piedra) ----------
export const ARQUITECTO_DIALOGUE: Dialogue = {
  start: {
    npc: '¡No, no, NO! ¿Dónde están mis planos? ¡Sin ellos no se coloca ni una piedra más! (Y aún quedan... ¿ciento cincuenta años de obra? Por lo menos.)',
    options: [
      { text: '¿Has perdido los planos?', to: 'planos' },
      { text: 'Quiero la llave de la primera piedra.', to: 'llave' },
      { text: '¿Qué estás construyendo?', to: 'obra' },
      { text: 'Suerte con eso. (Salir)', to: 'end' },
    ],
  },
  planos: {
    npc: '¡Se los llevó el viento! Andarán por el andamio. Tráemelos y hasta te esculpiré una estatua. De piedra, claro, que es lo único que me sobra.',
    options: [{ text: 'Los buscaré.', to: 'end', set: 'goal_planos' }],
  },
  llave: {
    npc: '¿La llave de la primera piedra? ¡Es ceremonial! ¡Sagrada! Nadie la toca mientras yo monte guardia. Y pienso montar guardia un siglo o dos.',
    options: [{ text: 'Ya veo...', to: 'end' }],
  },
  obra: {
    npc: 'Un templo que rozará el cielo. Sin una sola línea recta: la recta es cosa de hombres, y yo construyo para Dios... y para los guiris que vendrán en autocar.',
    options: [{ text: 'Ambicioso.', to: 'end' }],
  },
};

export const MASON_DIALOGUE: Dialogue = {
  start: {
    npc: 'Pesa lo suyo, esta piedra. ¿Ayudas o solo miras, pirata?',
    options: [
      { text: '¿Por qué no avanza la obra?', to: 'obra' },
      { text: 'Solo miro, gracias. (Salir)', to: 'end' },
    ],
  },
  obra: {
    npc: 'El jefe ha perdido los planos y se ha bloqueado. Sin él dándonos la brasa, nadie se acerca a la primera piedra. Devuélvele los papeles y se irá a su rincón a dibujar, ya verás.',
    options: [{ text: 'Gracias por el dato.', to: 'end' }],
  },
};
