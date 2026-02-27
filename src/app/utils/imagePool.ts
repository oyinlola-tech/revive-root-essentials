import heroImage1 from '../../assets/img/23787238782782.jpg';
import heroImage2 from '../../assets/img/356322332235623672.jpg';
import heroImage3 from '../../assets/img/7237823782yux2yux278.jpg';
import heroImage4 from '../../assets/img/78237837823787823.jpg';

export const imagePool = [
  heroImage1,
  heroImage2,
  heroImage3,
  heroImage4,
];

export const pickRandomImages = (count: number) => {
  const pool = [...imagePool];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
};

export const sectionImages = {
  homeHero: heroImage3,
  homeAbout: heroImage1,
  aboutHero: heroImage3,
  contactPanel: heroImage4,
};
