import { attachGuidance } from "./guidance.mjs";

export const article = {
  title: "A Small Public Garden",
  level: "B2",
  topic: "Đời sống đô thị và dự án môi trường nhỏ",
  sentences: [
    {
      id: "S1",
      english:
        "Many cities are trying to make daily life more sustainable, but the most effective changes are often the least dramatic.",
      vietnamese:
        "Nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn, nhưng những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất.",
    },
    {
      id: "S2",
      english:
        "In one neighborhood, the local council turned an empty parking lot into a small public garden.",
      vietnamese:
        "Ở một khu dân cư, hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ.",
    },
    {
      id: "S3",
      english:
        "At first, some residents complained that the project would reduce parking spaces and attract noise.",
      vietnamese:
        "Ban đầu, một số cư dân phàn nàn rằng dự án này sẽ làm giảm chỗ đỗ xe và thu hút tiếng ồn.",
    },
    {
      id: "S4",
      english:
        "However, within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks.",
      vietnamese:
        "Tuy nhiên, chỉ trong vài tháng, khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa.",
    },
    {
      id: "S5",
      english:
        "The project also encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors.",
      vietnamese:
        "Dự án này cũng khuyến khích các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ.",
    },
    {
      id: "S6",
      english:
        "Although the garden did not solve every environmental problem, it changed how people thought about shared space.",
      vietnamese:
        "Mặc dù khu vườn không giải quyết mọi vấn đề môi trường, nó đã thay đổi cách mọi người nghĩ về không gian chung.",
    },
    {
      id: "S7",
      english:
        "It showed that a simple local project can influence daily habits when people feel that the change belongs to them.",
      vietnamese:
        "Nó cho thấy rằng một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ.",
    },
  ],
};

function task(id, sentenceId, stage, prompt, answer) {
  return { id, sentenceId, stage, prompt, answer };
}

const sentenceOneTasks = [
  task("S1-01", "S1", "object", "thành phố", "city"),
  task("S1-02", "S1", "inflection", "các thành phố", "cities"),
  task("S1-03", "S1", "phrase", "nhiều thành phố", "many cities"),
  task("S1-04", "S1", "object", "cuộc sống", "life"),
  task("S1-05", "S1", "phrase", "đời sống hằng ngày", "daily life"),
  task(
    "S1-06",
    "S1",
    "clause",
    "các thành phố làm cho đời sống hằng ngày bền vững",
    "cities make daily life sustainable"
  ),
  task(
    "S1-07",
    "S1",
    "clause",
    "các thành phố làm cho đời sống hằng ngày bền vững hơn",
    "cities make daily life more sustainable"
  ),
  task(
    "S1-08",
    "S1",
    "clause",
    "các thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn",
    "cities are trying to make daily life more sustainable"
  ),
  task(
    "S1-09",
    "S1",
    "clause",
    "nhiều thành phố đang cố gắng làm cho đời sống hằng ngày bền vững hơn",
    "many cities are trying to make daily life more sustainable"
  ),
  task("S1-10", "S1", "object", "sự thay đổi", "change"),
  task("S1-11", "S1", "inflection", "những thay đổi", "changes"),
  task(
    "S1-12",
    "S1",
    "phrase",
    "những thay đổi hiệu quả",
    "effective changes"
  ),
  task(
    "S1-13",
    "S1",
    "phrase",
    "những thay đổi hiệu quả nhất",
    "the most effective changes"
  ),
  task(
    "S1-14",
    "S1",
    "phrase",
    "những thay đổi gây ấn tượng mạnh",
    "dramatic changes"
  ),
  task(
    "S1-15",
    "S1",
    "phrase",
    "những thay đổi ít gây ấn tượng mạnh nhất",
    "the least dramatic changes"
  ),
  task(
    "S1-16",
    "S1",
    "clause",
    "những thay đổi hiệu quả nhất là những thay đổi ít gây ấn tượng mạnh nhất",
    "the most effective changes are the least dramatic"
  ),
  task(
    "S1-17",
    "S1",
    "clause",
    "những thay đổi hiệu quả nhất thường là những thay đổi ít gây ấn tượng mạnh nhất",
    "the most effective changes are often the least dramatic"
  ),
  task(
    "S1-18",
    "S1",
    "sentence",
    article.sentences[0].vietnamese,
    article.sentences[0].english
  ),
];

const sentenceTwoTasks = [
  task("S2-01", "S2", "object", "khu dân cư", "neighborhood"),
  task("S2-02", "S2", "phrase", "một khu dân cư", "one neighborhood"),
  task("S2-03", "S2", "phrase", "ở một khu dân cư", "in one neighborhood"),
  task("S2-04", "S2", "object", "hội đồng", "council"),
  task("S2-05", "S2", "phrase", "hội đồng địa phương", "local council"),
  task("S2-06", "S2", "phrase", "hội đồng địa phương đó", "the local council"),
  task("S2-07", "S2", "object", "bãi/khu đất", "lot"),
  task("S2-08", "S2", "phrase", "bãi đỗ xe", "parking lot"),
  task("S2-09", "S2", "phrase", "một bãi đỗ xe", "a parking lot"),
  task("S2-10", "S2", "object", "khu vườn", "garden"),
  task("S2-11", "S2", "phrase", "một khu vườn", "a garden"),
  task(
    "S2-12",
    "S2",
    "clause",
    "hội đồng địa phương đã biến một bãi đỗ xe thành một khu vườn",
    "the local council turned a parking lot into a garden"
  ),
  task("S2-13", "S2", "phrase", "bãi đỗ xe trống", "empty parking lot"),
  task(
    "S2-14",
    "S2",
    "phrase",
    "một bãi đỗ xe trống",
    "an empty parking lot"
  ),
  task(
    "S2-15",
    "S2",
    "clause",
    "hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn",
    "the local council turned an empty parking lot into a garden"
  ),
  task("S2-16", "S2", "phrase", "khu vườn công cộng", "public garden"),
  task(
    "S2-17",
    "S2",
    "phrase",
    "khu vườn công cộng nhỏ",
    "small public garden"
  ),
  task(
    "S2-18",
    "S2",
    "phrase",
    "một khu vườn công cộng nhỏ",
    "a small public garden"
  ),
  task(
    "S2-19",
    "S2",
    "clause",
    "hội đồng địa phương đã biến một bãi đỗ xe trống thành một khu vườn công cộng nhỏ",
    "the local council turned an empty parking lot into a small public garden"
  ),
  task(
    "S2-20",
    "S2",
    "sentence",
    article.sentences[1].vietnamese,
    article.sentences[1].english
  ),
];

const sentenceThreeTasks = [
  task("S3-01", "S3", "object", "cư dân", "resident"),
  task("S3-02", "S3", "inflection", "các cư dân", "residents"),
  task("S3-03", "S3", "phrase", "một số cư dân", "some residents"),
  task("S3-04", "S3", "object", "dự án", "project"),
  task("S3-05", "S3", "phrase", "dự án đó", "the project"),
  task("S3-06", "S3", "object", "chỗ/không gian", "space"),
  task("S3-07", "S3", "inflection", "các chỗ", "spaces"),
  task("S3-08", "S3", "phrase", "các chỗ đỗ xe", "parking spaces"),
  task("S3-09", "S3", "object", "tiếng ồn", "noise"),
  task(
    "S3-10",
    "S3",
    "clause",
    "dự án đó sẽ làm giảm các chỗ đỗ xe",
    "the project would reduce parking spaces"
  ),
  task(
    "S3-11",
    "S3",
    "clause",
    "dự án đó sẽ thu hút tiếng ồn",
    "the project would attract noise"
  ),
  task(
    "S3-12",
    "S3",
    "clause",
    "dự án đó sẽ làm giảm các chỗ đỗ xe và dự án đó sẽ thu hút tiếng ồn",
    "the project would reduce parking spaces and the project would attract noise"
  ),
  task(
    "S3-13",
    "S3",
    "clause",
    "dự án đó sẽ làm giảm các chỗ đỗ xe và thu hút tiếng ồn",
    "the project would reduce parking spaces and attract noise"
  ),
  task(
    "S3-14",
    "S3",
    "clause",
    "một số cư dân đã phàn nàn",
    "some residents complained"
  ),
  task(
    "S3-15",
    "S3",
    "clause",
    "một số cư dân phàn nàn rằng dự án đó sẽ làm giảm các chỗ đỗ xe và thu hút tiếng ồn",
    "some residents complained that the project would reduce parking spaces and attract noise"
  ),
  task(
    "S3-16",
    "S3",
    "sentence",
    article.sentences[2].vietnamese,
    article.sentences[2].english
  ),
];

const sentenceFourTasks = [
  task("S4-01", "S4", "phrase", "khu vườn đó", "the garden"),
  task("S4-02", "S4", "object", "tháng", "month"),
  task("S4-03", "S4", "inflection", "các tháng", "months"),
  task("S4-04", "S4", "phrase", "vài tháng", "a few months"),
  task(
    "S4-05",
    "S4",
    "phrase",
    "trong vòng vài tháng",
    "within a few months"
  ),
  task("S4-06", "S4", "object", "nơi", "place"),
  task("S4-07", "S4", "phrase", "nơi yên tĩnh", "quiet place"),
  task("S4-08", "S4", "phrase", "một nơi yên tĩnh", "a quiet place"),
  task(
    "S4-09",
    "S4",
    "clause",
    "khu vườn đã trở thành một nơi yên tĩnh",
    "the garden became a quiet place"
  ),
  task("S4-10", "S4", "object", "đứa trẻ", "child"),
  task("S4-11", "S4", "inflection", "trẻ em", "children"),
  task("S4-12", "S4", "clause", "trẻ em chơi", "children play"),
  task(
    "S4-13",
    "S4",
    "clause",
    "trẻ em có thể chơi",
    "children could play"
  ),
  task("S4-14", "S4", "object", "một người", "person"),
  task("S4-15", "S4", "inflection", "những người", "people"),
  task("S4-16", "S4", "phrase", "người lớn tuổi", "older people"),
  task(
    "S4-17",
    "S4",
    "clause",
    "người lớn tuổi gặp nhau",
    "older people meet"
  ),
  task(
    "S4-18",
    "S4",
    "clause",
    "người lớn tuổi có thể gặp nhau",
    "older people could meet"
  ),
  task("S4-19", "S4", "object", "nhân viên", "worker"),
  task("S4-20", "S4", "inflection", "các nhân viên", "workers"),
  task(
    "S4-21",
    "S4",
    "phrase",
    "nhân viên văn phòng",
    "office workers"
  ),
  task(
    "S4-22",
    "S4",
    "clause",
    "nhân viên văn phòng nghỉ ngơi",
    "office workers rest"
  ),
  task(
    "S4-23",
    "S4",
    "clause",
    "nhân viên văn phòng có thể nghỉ ngơi",
    "office workers could rest"
  ),
  task("S4-24", "S4", "object", "giờ nghỉ", "break"),
  task("S4-25", "S4", "inflection", "các giờ nghỉ", "breaks"),
  task("S4-26", "S4", "phrase", "giờ nghỉ trưa", "lunch breaks"),
  task(
    "S4-27",
    "S4",
    "phrase",
    "trong giờ nghỉ trưa",
    "during lunch breaks"
  ),
  task(
    "S4-28",
    "S4",
    "clause",
    "nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "office workers could rest during lunch breaks"
  ),
  task(
    "S4-29",
    "S4",
    "clause",
    "trẻ em có thể chơi, người lớn tuổi có thể gặp nhau",
    "children could play, older people could meet"
  ),
  task(
    "S4-30",
    "S4",
    "clause",
    "trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "children could play, older people could meet, and office workers could rest during lunch breaks"
  ),
  task(
    "S4-31",
    "S4",
    "clause",
    "nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "where children could play, older people could meet, and office workers could rest during lunch breaks"
  ),
  task(
    "S4-32",
    "S4",
    "phrase",
    "một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks"
  ),
  task(
    "S4-33",
    "S4",
    "clause",
    "khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks"
  ),
  task(
    "S4-34",
    "S4",
    "clause",
    "trong vòng vài tháng, khu vườn đã trở thành một nơi yên tĩnh, nơi trẻ em có thể chơi, người lớn tuổi có thể gặp nhau, và nhân viên văn phòng có thể nghỉ ngơi trong giờ nghỉ trưa",
    "within a few months, the garden became a quiet place where children could play, older people could meet, and office workers could rest during lunch breaks"
  ),
  task(
    "S4-35",
    "S4",
    "sentence",
    article.sentences[3].vietnamese,
    article.sentences[3].english
  ),
];

const sentenceFiveTasks = [
  task("S5-01", "S5", "object", "cửa hàng", "shop"),
  task("S5-02", "S5", "inflection", "các cửa hàng", "shops"),
  task("S5-03", "S5", "phrase", "các cửa hàng gần đó", "nearby shops"),
  task("S5-04", "S5", "object", "túi", "bag"),
  task("S5-05", "S5", "inflection", "các túi", "bags"),
  task("S5-06", "S5", "phrase", "các túi nhựa", "plastic bags"),
  task(
    "S5-07",
    "S5",
    "phrase",
    "ít túi nhựa hơn",
    "fewer plastic bags"
  ),
  task(
    "S5-08",
    "S5",
    "clause",
    "các cửa hàng gần đó sử dụng ít túi nhựa hơn",
    "nearby shops use fewer plastic bags"
  ),
  task("S5-09", "S5", "object", "thùng", "bin"),
  task("S5-10", "S5", "inflection", "các thùng", "bins"),
  task("S5-11", "S5", "phrase", "các thùng tái chế", "recycling bins"),
  task("S5-12", "S5", "object", "cánh cửa", "door"),
  task("S5-13", "S5", "inflection", "các cánh cửa", "doors"),
  task("S5-14", "S5", "phrase", "các cánh cửa của họ", "their doors"),
  task(
    "S5-15",
    "S5",
    "phrase",
    "bên ngoài cửa hàng của họ",
    "outside their doors"
  ),
  task(
    "S5-16",
    "S5",
    "clause",
    "các cửa hàng gần đó đặt các thùng tái chế",
    "nearby shops place recycling bins"
  ),
  task(
    "S5-17",
    "S5",
    "clause",
    "các cửa hàng gần đó đặt các thùng tái chế bên ngoài cửa hàng của họ",
    "nearby shops place recycling bins outside their doors"
  ),
  task(
    "S5-18",
    "S5",
    "clause",
    "các cửa hàng gần đó sử dụng ít túi nhựa hơn và các cửa hàng gần đó đặt các thùng tái chế bên ngoài cửa hàng của họ",
    "nearby shops use fewer plastic bags and nearby shops place recycling bins outside their doors"
  ),
  task(
    "S5-19",
    "S5",
    "clause",
    "các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ",
    "nearby shops use fewer plastic bags and place recycling bins outside their doors"
  ),
  task(
    "S5-20",
    "S5",
    "clause",
    "dự án đó đã khuyến khích các cửa hàng gần đó sử dụng ít túi nhựa hơn và đặt các thùng tái chế bên ngoài cửa hàng của họ",
    "the project encouraged nearby shops to use fewer plastic bags and to place recycling bins outside their doors"
  ),
  task(
    "S5-21",
    "S5",
    "sentence",
    article.sentences[4].vietnamese,
    article.sentences[4].english
  ),
];

const sentenceSixTasks = [
  task("S6-01", "S6", "object", "vấn đề", "problem"),
  task(
    "S6-02",
    "S6",
    "phrase",
    "vấn đề môi trường",
    "environmental problem"
  ),
  task(
    "S6-03",
    "S6",
    "phrase",
    "mọi vấn đề môi trường",
    "every environmental problem"
  ),
  task(
    "S6-04",
    "S6",
    "clause",
    "khu vườn không giải quyết mọi vấn đề môi trường",
    "the garden did not solve every environmental problem"
  ),
  task("S6-05", "S6", "phrase", "không gian chung", "shared space"),
  task(
    "S6-06",
    "S6",
    "clause",
    "mọi người nghĩ về không gian chung",
    "people thought about shared space"
  ),
  task(
    "S6-07",
    "S6",
    "clause",
    "cách mọi người nghĩ về không gian chung",
    "how people thought about shared space"
  ),
  task(
    "S6-08",
    "S6",
    "clause",
    "nó đã thay đổi cách mọi người nghĩ về không gian chung",
    "it changed how people thought about shared space"
  ),
  task(
    "S6-09",
    "S6",
    "sentence",
    article.sentences[5].vietnamese,
    article.sentences[5].english
  ),
];

const sentenceSevenTasks = [
  task("S7-01", "S7", "phrase", "dự án địa phương", "local project"),
  task(
    "S7-02",
    "S7",
    "phrase",
    "dự án địa phương đơn giản",
    "simple local project"
  ),
  task(
    "S7-03",
    "S7",
    "phrase",
    "một dự án địa phương đơn giản",
    "a simple local project"
  ),
  task("S7-04", "S7", "object", "thói quen", "habit"),
  task("S7-05", "S7", "inflection", "các thói quen", "habits"),
  task(
    "S7-06",
    "S7",
    "phrase",
    "thói quen hằng ngày",
    "daily habits"
  ),
  task(
    "S7-07",
    "S7",
    "clause",
    "một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày",
    "a simple local project can influence daily habits"
  ),
  task("S7-08", "S7", "phrase", "sự thay đổi đó", "the change"),
  task(
    "S7-09",
    "S7",
    "clause",
    "sự thay đổi đó thuộc về họ",
    "the change belongs to them"
  ),
  task(
    "S7-10",
    "S7",
    "clause",
    "mọi người cảm thấy rằng sự thay đổi đó thuộc về họ",
    "people feel that the change belongs to them"
  ),
  task(
    "S7-11",
    "S7",
    "clause",
    "khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ",
    "when people feel that the change belongs to them"
  ),
  task(
    "S7-12",
    "S7",
    "clause",
    "một dự án địa phương đơn giản có thể ảnh hưởng đến thói quen hằng ngày khi mọi người cảm thấy rằng sự thay đổi đó thuộc về họ",
    "a simple local project can influence daily habits when people feel that the change belongs to them"
  ),
  task(
    "S7-13",
    "S7",
    "sentence",
    article.sentences[6].vietnamese,
    article.sentences[6].english
  ),
];

export const sentenceTaskGroups = [
  sentenceOneTasks,
  sentenceTwoTasks,
  sentenceThreeTasks,
  sentenceFourTasks,
  sentenceFiveTasks,
  sentenceSixTasks,
  sentenceSevenTasks,
];

const paragraphTasks = article.sentences.slice(1).map((_, index) => {
  const sentenceCount = index + 2;
  const sentences = article.sentences.slice(0, sentenceCount);

  return {
    id: `G${sentenceCount}`,
    sentenceId: "PARAGRAPH",
    sentenceIds: sentences.map((sentence) => sentence.id),
    stage: "paragraph",
    prompt: sentences.map((sentence) => sentence.vietnamese).join(" "),
    answer: sentences.map((sentence) => sentence.english).join(" "),
  };
});

export function buildLessonTasks() {
  return attachGuidance([...sentenceTaskGroups.flat(), ...paragraphTasks]);
}
