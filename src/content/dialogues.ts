// Dialogue trees. Each node: an NPC line + the player's response options.
// An option's `to` points to the next node ('end' closes the conversation).
// `set` raises a flag; `if`/`ifNot` gate visibility; `once` hides after use.
export interface Opt {
  text: string;
  to: string;
  set?: string;
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
