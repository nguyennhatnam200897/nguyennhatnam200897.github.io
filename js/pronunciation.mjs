export const AMERICAN_IPA = {
  city: "/ˈsɪti/",
  cities: "/ˈsɪtiz/",
  many: "/ˈmɛni/",
  life: "/laɪf/",
  daily: "/ˈdeɪli/",
  make: "/meɪk/",
  sustainable: "/səˈsteɪnəbəl/",
  more: "/mɔr/",
  are: "/ɑr/",
  trying: "/ˈtraɪɪŋ/",
  to: "/tu/",
  change: "/tʃeɪndʒ/",
  changes: "/ˈtʃeɪndʒɪz/",
  effective: "/ɪˈfɛktɪv/",
  the: "/ðə/",
  most: "/moʊst/",
  dramatic: "/drəˈmætɪk/",
  least: "/list/",
  often: "/ˈɔfən/",
  but: "/bʌt/",
  neighborhood: "/ˈneɪbərhʊd/",
  one: "/wʌn/",
  in: "/ɪn/",
  council: "/ˈkaʊnsəl/",
  local: "/ˈloʊkəl/",
  lot: "/lɑt/",
  parking: "/ˈpɑrkɪŋ/",
  a: "/ə/",
  garden: "/ˈɡɑrdən/",
  turned: "/tɝnd/",
  into: "/ˈɪntu/",
  empty: "/ˈɛmpti/",
  an: "/ən/",
  public: "/ˈpʌblɪk/",
  small: "/smɔl/",
  resident: "/ˈrɛzɪdənt/",
  residents: "/ˈrɛzɪdənts/",
  some: "/sʌm/",
  project: "/ˈprɑdʒɛkt/",
  space: "/speɪs/",
  spaces: "/ˈspeɪsɪz/",
  noise: "/nɔɪz/",
  would: "/wʊd/",
  reduce: "/rɪˈdus/",
  attract: "/əˈtrækt/",
  and: "/ænd/",
  complained: "/kəmˈpleɪnd/",
  that: "/ðæt/",
  at: "/æt/",
  first: "/fɝst/",
  month: "/mʌnθ/",
  months: "/mʌnθs/",
  few: "/fju/",
  within: "/wɪˈðɪn/",
  place: "/pleɪs/",
  quiet: "/ˈkwaɪət/",
  became: "/bɪˈkeɪm/",
  child: "/tʃaɪld/",
  children: "/ˈtʃɪldrən/",
  play: "/pleɪ/",
  could: "/kʊd/",
  person: "/ˈpɝsən/",
  people: "/ˈpipəl/",
  older: "/ˈoʊldər/",
  meet: "/mit/",
  worker: "/ˈwɝkər/",
  workers: "/ˈwɝkərz/",
  office: "/ˈɔfɪs/",
  rest: "/rɛst/",
  break: "/breɪk/",
  breaks: "/breɪks/",
  lunch: "/lʌntʃ/",
  during: "/ˈdʊrɪŋ/",
  where: "/wɛr/",
  however: "/haʊˈɛvər/",
  shop: "/ʃɑp/",
  shops: "/ʃɑps/",
  nearby: "/ˌnɪrˈbaɪ/",
  bag: "/bæɡ/",
  bags: "/bæɡz/",
  plastic: "/ˈplæstɪk/",
  fewer: "/ˈfjuər/",
  use: "/juz/",
  bin: "/bɪn/",
  bins: "/bɪnz/",
  recycling: "/riˈsaɪklɪŋ/",
  door: "/dɔr/",
  doors: "/dɔrz/",
  their: "/ðɛr/",
  outside: "/ˌaʊtˈsaɪd/",
  encouraged: "/ɪnˈkɝɪdʒd/",
  also: "/ˈɔlsoʊ/",
  problem: "/ˈprɑbləm/",
  environmental: "/ɪnˌvaɪrənˈmɛntəl/",
  every: "/ˈɛvri/",
  did: "/dɪd/",
  not: "/nɑt/",
  solve: "/sɑlv/",
  shared: "/ʃɛrd/",
  thought: "/θɔt/",
  about: "/əˈbaʊt/",
  how: "/haʊ/",
  it: "/ɪt/",
  changed: "/tʃeɪndʒd/",
  although: "/ɔlˈðoʊ/",
  simple: "/ˈsɪmpəl/",
  habit: "/ˈhæbɪt/",
  habits: "/ˈhæbɪts/",
  can: "/kæn/",
  influence: "/ˈɪnfluəns/",
  belongs: "/bɪˈlɔŋz/",
  them: "/ðɛm/",
  feel: "/fil/",
  when: "/wɛn/",
  showed: "/ʃoʊd/",
};

export function tokenizeEnglish(text) {
  return text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
}

export function getAmericanIpa(word) {
  return AMERICAN_IPA[word.toLowerCase()] ?? null;
}

function stripSlashes(ipa) {
  return ipa.slice(1, -1);
}

export function buildPronunciation(term, knownWords = new Set()) {
  const words = tokenizeEnglish(term);
  const newWords = [...new Set(words)]
    .filter((word) => !knownWords.has(word))
    .map((word) => ({ term: word, ipa: getAmericanIpa(word) }));
  const full = words
    .map(getAmericanIpa)
    .filter(Boolean)
    .map(stripSlashes)
    .join(" ");

  return {
    full: full ? `/${full}/` : "",
    newWords,
  };
}
