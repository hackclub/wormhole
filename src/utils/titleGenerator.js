// Helper function to determine if a word starts with a vowel sound
const startsWithVowelSound = (word) => {
  const firstLetter = word.toLowerCase()[0];
  const vowelSounds = ["a", "e", "i", "o", "u"];
  return vowelSounds.includes(firstLetter);
};

// Helper function to get the correct article
const getArticle = (word) => (startsWithVowelSound(word) ? "an" : "a");

export const generateFunnyTitle = () => {
  const adjectives = [
    "Cosmic",
    "Quantum",
    "Temporal",
    "Dimensional",
    "Ethereal",
    "Mystical",
    "Astral",
    "Celestial",
    "Interstellar",
    "Transcendental",
    "Bizarre",
    "Whimsical",
    "Eccentric",
    "Surreal",
    "Psychedelic",
    "Ludicrous",
    "Absurd",
    "Outlandish",
    "Fantastical",
    "Uncanny",
    "Cosmic",
    "Galactic",
    "Stellar",
    "Lunar",
    "Solar",
    "Ethereal",
    "Mysterious",
    "Enigmatic",
    "Cryptic",
    "Arcane",
  ];
  const nouns = [
    "Wormhole",
    "Portal",
    "Rift",
    "Gateway",
    "Vortex",
    "Tunnel",
    "Bridge",
    "Passage",
    "Corridor",
    "Pathway",
    "Time Machine",
    "Teleporter",
    "Dimensional Door",
    "Space Elevator",
    "Time Capsule",
    "Cosmic Toaster",
    "Quantum Coffee Maker",
    "Interdimensional Fridge",
    "Astral Microwave",
    "Galactic Blender",
    "Black Hole",
    "Nebula",
    "Supernova",
    "Asteroid",
    "Comet",
    "Parallel Universe",
    "Alternate Reality",
    "Time Loop",
    "Space-Time Continuum",
    "Cosmic String",
  ];
  const verbs = [
    "Journey",
    "Adventure",
    "Expedition",
    "Voyage",
    "Quest",
    "Odyssey",
    "Pilgrimage",
    "Wander",
    "Traverse",
    "Explore",
    "Bounce",
    "Wiggle",
    "Squiggle",
    "Flutter",
    "Dance",
    "Teleport",
    "Time Travel",
    "Dimension Hop",
    "Space Surf",
    "Cosmic Skate",
    "Navigate",
    "Pilot",
    "Steer",
    "Guide",
    "Chart",
    "Discover",
    "Uncover",
    "Reveal",
    "Unveil",
    "Expose",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const verb = verbs[Math.floor(Math.random() * verbs.length)];

  const templates = [
    `${adjective} ${noun} ${verb}`,
    `${verb} Through the ${adjective} ${noun}`,
    `${adjective} ${verb} in the ${noun}`,
    `${noun} ${verb}: ${getArticle(adjective)} ${adjective} Tale`,
    `${adjective} ${noun} ${verb}ing`,
    `The ${adjective} ${noun} That ${verb}ed Too Much`,
    `${verb}ing with the ${adjective} ${noun}`,
    `My ${adjective} ${noun} ${verb}ing Adventure`,
    `The ${noun} That ${verb}ed: ${getArticle(adjective)} ${adjective} Story`,
    `${adjective} ${noun} ${verb}s Again`,
    `When the ${noun} ${verb}ed: ${getArticle(
      adjective
    )} ${adjective} Experience`,
    `${verb}ing Through the ${adjective} ${noun}`,
    `The ${adjective} ${noun} ${verb}ing Chronicles`,
    `${noun} ${verb}s: The ${adjective} Edition`,
    `${getArticle(adjective)} ${adjective} ${noun} ${verb}ing Tale`,
  ];

  const title = templates[Math.floor(Math.random() * templates.length)];

  // Capitalize the first letter of the title
  return title.charAt(0).toUpperCase() + title.slice(1);
};
