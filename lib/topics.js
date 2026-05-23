// Curated mood/topic presets shown as quick-select chips and used by the
// "random topic" button.
export const TOPICS = [
  "loneliness",
  "overthinking",
  "healing",
  "heartbreak",
  "self growth",
  "friendship",
  "memories",
  "late night thoughts",
  "letting go",
  "nostalgia",
  "anxiety",
  "becoming yourself",
  "distance",
  "growing apart",
  "quiet hope",
  "burnout",
  "first love",
  "starting over",
];

export function randomTopic(exclude) {
  const pool = TOPICS.filter((t) => t !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}
