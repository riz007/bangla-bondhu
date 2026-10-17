import type { ActivityOf, Lesson, World } from "@/features/curriculum/schema";
import {
  buildSyllable,
  buildWord,
  fillBlank,
  findThePicture,
  intro,
  lesson,
  listen,
  makeSentence,
  match,
  meaning,
  nameThePicture,
  orderWords,
  recall,
  tip,
  withInstruction,
  world,
} from "./build";

// Drafts stay hidden from children until reviewed (docs/CONTENT_REVIEW.md).

const V = (id: string) => `bn.vowel.${id}`;
const C = (id: string) => `bn.cons.${id}`;
const K = (id: string) => `bn.kar.${id}`;
const S = (id: string) => `bn.syl.${id}`;
const J = (id: string) => `bn.joined.${id}`;
const D = (id: string) => `bn.digit.${id}`;
const W = (id: string) => `bn.word.${id}`;
const P = (id: string) => `bn.phrase.${id}`;

export const bnWorlds: World[] = [
  world(
    "bn-hello",
    0,
    ["สวัสดี ภาษาเบงกาลี", "Hello, Bengali"],
    ["คำแรก ๆ และคำทักทาย", "First words and greetings"],
  ),
  world("bn-vowels", 1, ["สระ (স্বরবর্ণ)", "Vowels (স্বরবর্ণ)"], ["สระทั้ง 11 ตัว", "All 11 vowel letters"]),
  world(
    "bn-consonants",
    2,
    ["พยัญชนะ (ব্যঞ্জনবর্ণ)", "Consonants (ব্যঞ্জনবর্ণ)"],
    ["พยัญชนะทั้งหมด เรียงทีละแถว", "Every consonant, one row at a time"],
  ),
  world(
    "bn-kar",
    3,
    ["เครื่องหมายสระ (কার)", "Vowel signs (কার)"],
    ["สระตัวเล็กที่ติดกับพยัญชนะ", "The small vowel signs that attach to consonants"],
  ),
  world(
    "bn-joined",
    4,
    ["อักษรควบ (যুক্তাক্ষর)", "Joined letters (যুক্তাক্ষর)"],
    ["เมื่อพยัญชนะสองตัวรวมร่างกัน", "When two consonants merge into one"],
  ),
  world("bn-numbers", 5, ["ตัวเลข", "Numbers"], ["นับ ০ ถึง ১০", "Counting ০ to ১০"]),
  world(
    "bn-world",
    6,
    ["โลกของฉัน", "My world"],
    ["อาหาร บ้าน สัตว์ สี และครอบครัว", "Food, home, animals, colours and family"],
  ),
  world(
    "bn-grammar",
    7,
    ["สร้างประโยค", "Making sentences"],
    [
      "ลำดับคำ กริยา การปฏิเสธ คำถาม และประโยคของตัวเอง",
      "Word order, verbs, saying no, questions, and your own sentences",
    ],
  ),
  world(
    "bn-reading",
    8,
    ["อ่านและเข้าใจ", "Read and understand"],
    ["อ่านเรื่องสั้น แล้วทบทวนทุกอย่าง", "Read a short story, then review everything"],
  ),
];

type Frame = Omit<ActivityOf<"make-sentence">, "id" | "type">;

const PEOPLE = [W("ami"), W("tumi"), W("se"), W("amra")];
const agreeWithPerson = (forms: [string, string, string]) => ({
  slot: 2,
  dependsOn: 0,
  pairs: { [W("ami")]: forms[0], [W("tumi")]: forms[1], [W("se")]: forms[2], [W("amra")]: forms[0] },
});

const EAT_FRAME: Frame = {
  slots: [
    { options: PEOPLE },
    { options: [W("bhat"), W("mach"), W("aam"), W("dim")] },
    { options: [W("khai"), W("khao"), W("khay")] },
  ],
  agreement: [agreeWithPerson([W("khai"), W("khao"), W("khay")])],
  templateTh: "{0}{2}{1}",
  templateEn: "{0} {2} {1}.",
};

const GO_FRAME: Frame = {
  slots: [
    { options: PEOPLE },
    { options: [W("skule"), W("barite"), W("bajare")] },
    { options: [W("jai"), W("jao"), W("jay")] },
  ],
  agreement: [agreeWithPerson([W("jai"), W("jao"), W("jay")])],
  templateTh: "{0}{2}{1}",
  templateEn: "{0} {2} {1}.",
};

const THIS_FRAME: Frame = {
  slots: [
    { options: [W("eta"), W("ota")] },
    { options: [W("ekta")] },
    { options: [W("boi"), W("kolom"), W("phul"), W("pakhi"), W("bol")] },
  ],
  agreement: [],
  templateTh: "{0}คือ{2}",
  templateEn: "{0} is a {2}.",
};

const DESCRIBE_FRAME: Frame = {
  slots: [
    { options: [W("phulta"), W("bolta"), W("pakhita"), W("biralta")] },
    { options: [W("lal"), W("nil"), W("sada"), W("kalo"), W("boro"), W("chhoto")] },
  ],
  agreement: [],
  templateTh: "{0}{1}",
  templateEn: "{0} is {1}.",
};

const HAVE_FRAME: Frame = {
  slots: [
    { options: [W("amar"), W("tomar")] },
    { options: [W("ekta")] },
    { options: [W("lal"), W("nil"), W("boro"), W("chhoto")] },
    { options: [W("bol"), W("boi"), W("biral"), W("kolom")] },
    { options: [W("achhe")] },
  ],
  agreement: [],
  templateTh: "{0}มี{3}{2}",
  templateEn: "{0} a {2} {3}.",
};

const FROM_STORY: [string, string] = ["เติมคำให้ตรงกับเรื่อง", "Fill the gap to match the story"];
const VERB_FOR = (person: string): [string, string] => [
  `เลือกคำกริยาที่เข้ากับ ${person}`,
  `Choose the verb that goes with ${person}`,
];

const hello: Lesson[] = [
  lesson(
    {
      id: "bn-hello-1",
      world: "bn-hello",
      order: 1,
      title: ["คำแรกของฉัน", "My first words"],
      objective: ["ฟังและจำคำว่า มะม่วง หนังสือ และปลา", "Hear and remember mango, book and fish"],
      emblem: "আম",
      after: [],
      minutes: 4,
    },
    [
      intro(W("aam")),
      intro(W("boi")),
      intro(W("mach")),
      findThePicture(W("aam"), [W("boi"), W("mach")]),
      listen(W("boi"), [W("mach"), W("aam")], "image"),
      nameThePicture(W("mach"), [W("boi"), W("aam")]),
      meaning(W("aam"), [W("mach"), W("boi")]),
      match([W("aam"), W("boi"), W("mach")], "image"),
    ],
  ),
  lesson(
    {
      id: "bn-hello-2",
      world: "bn-hello",
      order: 2,
      title: ["ทักทายกัน", "Saying hello"],
      objective: [
        "ถามว่าสบายดีไหม ตอบว่าสบายดี ขอบคุณ และบอกลา",
        "Ask how someone is, say you're fine, say thank you and goodbye",
      ],
      emblem: "ধন্যবাদ",
      after: ["bn-hello-1"],
      minutes: 5,
    },
    [
      tip(
        ["ทักทายแบบบังกลาเทศ", "Greetings in Bangladesh"],
        [
          "คนบังกลาเทศส่วนใหญ่ทักทายกันว่า “আসসালামু আলাইকুম” และครอบครัวฮินดูมักพูดว่า “নমস্কার” ทั้งสองแบบสุภาพ ส่วนเพื่อน ๆ มักถามกันว่า কেমন আছো?",
          "Most people in Bangladesh greet each other with “আসসালামু আলাইকুম”, and many Hindu families say “নমস্কার”. Both are polite. Friends usually ask কেমন আছো?",
        ],
      ),
      intro(P("kemon-acho")),
      intro(P("bhalo-achi")),
      intro(P("dhonnobad")),
      intro(P("abar-dekha-hobe")),
      meaning(P("kemon-acho"), [P("dhonnobad"), P("bhalo-achi")]),
      listen(P("dhonnobad"), [P("bhalo-achi"), P("kemon-acho")]),
      withInstruction(
        ["เพื่อนถามว่า কেমন আছো? เราจะตอบว่าอะไร", "A friend asks কেমন আছো? What do you answer?"],
        recall(P("bhalo-achi"), [P("dhonnobad"), P("kemon-acho")]),
      ),
      meaning(P("abar-dekha-hobe"), [P("dhonnobad"), P("kemon-acho")]),
      match([P("kemon-acho"), P("bhalo-achi"), P("dhonnobad"), P("abar-dekha-hobe")]),
    ],
  ),
];

const vowels: Lesson[] = [
  lesson(
    {
      id: "bn-vowels-1",
      world: "bn-vowels",
      order: 1,
      title: ["অ আ ই ঈ", "অ আ ই ঈ"],
      objective: [
        "รู้จักสระสี่ตัวแรก และรู้ว่า ই กับ ঈ ออกเสียงเหมือนกัน",
        "Meet the first four vowels, and learn that ই and ঈ sound the same",
      ],
      emblem: "অ",
      after: ["bn-hello-2"],
      minutes: 5,
    },
    [
      tip(
        ["สระ 11 ตัว", "Eleven vowels"],
        [
          "ภาษาเบงกาลีมีสระ 11 ตัว เรียกว่า স্বরবর্ণ อ่านจากซ้ายไปขวาเหมือนภาษาไทย และไม่มีวรรณยุกต์ให้ต้องจำ!",
          "Bengali has 11 vowel letters, called স্বরবর্ণ. It's read left to right like Thai, and there are no tones to learn!",
        ],
      ),
      intro(V("o"), W("ojogor")),
      intro(V("aa"), W("aam")),
      listen(V("aa"), [V("o")]),
      intro(V("i"), W("idur")),
      intro(V("ii"), W("igol")),
      tip(
        ["ই กับ ঈ", "ই and ঈ"],
        [
          "ই (ตัวสั้น) กับ ঈ (ตัวยาว) ออกเสียงเหมือนกัน ต่างกันแค่การสะกด เวลาเจอคำใหม่ให้จำว่าคำนั้นใช้ตัวไหน",
          "ই (short) and ঈ (long) sound the same. Only the spelling differs, so remember which one each new word uses.",
        ],
        [W("idur"), W("igol")],
      ),
      recall(V("ii"), [V("i"), V("aa")]),
      match([V("o"), V("aa"), V("i"), V("ii")]),
      meaning(W("idur"), [W("igol"), W("ojogor")]),
    ],
  ),
  lesson(
    {
      id: "bn-vowels-2",
      world: "bn-vowels",
      order: 2,
      title: ["উ ঊ ঋ এ", "উ ঊ ঋ এ"],
      objective: ["รู้จักสระอีกสี่ตัว", "Meet four more vowels"],
      emblem: "উ",
      after: ["bn-vowels-1"],
      minutes: 5,
    },
    [
      intro(V("u"), W("ut")),
      intro(V("uu"), W("usha")),
      intro(V("ri"), W("rishi")),
      intro(V("e"), W("ektara")),
      listen(V("e"), [V("u"), V("ri")]),
      recall(V("uu"), [V("u"), V("e")]),
      match([V("u"), V("ri"), V("e"), V("aa")]),
      meaning(W("rishi"), [W("ut"), W("ektara")]),
      fillBlank(W("ut"), "", "উ", "ট", ["এ", "আ"]),
    ],
  ),
  lesson(
    {
      id: "bn-vowels-3",
      world: "bn-vowels",
      order: 3,
      title: ["ঐ ও ঔ", "ঐ ও ঔ"],
      objective: ["ครบสระทั้ง 11 ตัว", "Finish all 11 vowels"],
      emblem: "ঐ",
      after: ["bn-vowels-2"],
      minutes: 5,
    },
    [
      intro(V("oi"), W("oirabot")),
      intro(V("oo"), W("ol")),
      intro(V("ou"), W("oushodh")),
      listen(V("ou"), [V("oo"), V("oi")]),
      recall(V("oo"), [V("o"), V("ou")]),
      match([V("oi"), V("oo"), V("ou"), V("e")]),
      meaning(W("oirabot"), [W("ol"), W("oushodh")]),
      fillBlank(W("ol"), "", "ও", "ল", ["এ", "ঐ"]),
      tip(
        ["สระตัวเต็มกับสระตัวเล็ก", "Full vowels and vowel signs"],
        [
          "สระตัวเต็มเหล่านี้ใช้ตอนขึ้นต้นคำ เมื่อสระตามหลังพยัญชนะจะเปลี่ยนเป็นเครื่องหมายเล็ก ๆ เรียกว่า কার ซึ่งจะได้เรียนเร็ว ๆ นี้",
          "These full vowel letters start words. After a consonant, a vowel shrinks into a small sign called a কার, which you'll learn soon.",
        ],
      ),
    ],
  ),
];

const consonants: Lesson[] = [
  lesson(
    {
      id: "bn-consonants-1",
      world: "bn-consonants",
      order: 1,
      title: ["ক খ গ ঘ ঙ", "ক খ গ ঘ ঙ"],
      objective: [
        "แถวแรก เสียงจากด้านหลังของปาก และเสียงที่มีลม",
        "Row one, made at the back of the mouth, and sounds with a puff of air",
      ],
      emblem: "ক",
      after: ["bn-vowels-3"],
      minutes: 6,
    },
    [
      tip(
        ["พยัญชนะเรียงเป็นแถว", "Consonants come in rows"],
        [
          "พยัญชนะเบงกาลีเรียงเป็นแถวละ 5 ตัวตามจุดที่เกิดเสียงในปาก แถวแรกเกิดที่ด้านหลังของปาก: ক খ গ ঘ ঙ ทุกตัวมีเสียง “ออ” ซ่อนอยู่ เหมือน ก ข ที่อ่านว่า กอ ขอ",
          "Bengali consonants come in rows of five, grouped by where the sound is made. Row one is made at the back of the mouth: ক খ গ ঘ ঙ. Each carries a hidden “ô”, just as Thai ก ข are read กอ ขอ.",
        ],
      ),
      intro(C("k"), W("kola")),
      intro(C("kh"), W("khorgosh")),
      tip(
        ["มีลมหรือไม่มีลม", "With or without a puff of air"],
        [
          "ক กับ খ ต่างกันที่ลม เหมือน ก กับ ข ในภาษาไทย ลองเอามือไว้หน้าปาก ตอนพูด খ จะรู้สึกว่ามีลมออกมา",
          "ক and খ differ by a puff of air, like Thai ก and ข. Hold a hand in front of your mouth: you'll feel the air on খ.",
        ],
      ),
      listen(C("kh"), [C("k")]),
      intro(C("g"), W("goru")),
      intro(C("gh"), W("ghori")),
      intro(C("ng"), W("byang")),
      listen(C("gh"), [C("g"), C("k")]),
      recall(C("ng"), [C("k"), C("gh")]),
      match([C("k"), C("kh"), C("g"), C("gh")]),
      fillBlank(W("kola"), "", "ক", "লা", ["খ", "গ"]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-2",
      world: "bn-consonants",
      order: 2,
      title: ["চ ছ জ ঝ ঞ", "চ ছ জ ঝ ঞ"],
      objective: ["แถวที่สอง เสียงจากเพดานปาก", "Row two, made at the roof of the mouth"],
      emblem: "চ",
      after: ["bn-consonants-1"],
      minutes: 5,
    },
    [
      intro(C("c"), W("chand")),
      intro(C("ch"), W("chhata")),
      listen(C("ch"), [C("c")]),
      intro(C("j"), W("jahaj")),
      intro(C("jh"), W("jhor")),
      intro(C("ny")),
      listen(C("jh"), [C("j"), C("c")]),
      recall(C("j"), [C("jh"), C("ch")]),
      match([C("c"), C("ch"), C("j"), C("jh")]),
      meaning(W("chhata"), [W("jahaj"), W("jhor")]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-3",
      world: "bn-consonants",
      order: 3,
      title: ["ট ঠ ড ঢ ণ", "ট ঠ ড ঢ ণ"],
      objective: [
        "แถวที่สาม เสียงม้วนลิ้นที่ภาษาไทยไม่มี",
        "Row three: curled-tongue sounds that Thai doesn't have",
      ],
      emblem: "ট",
      after: ["bn-consonants-2"],
      minutes: 6,
    },
    [
      tip(
        ["เสียงม้วนลิ้น", "Curled-tongue sounds"],
        [
          "แถวนี้ออกเสียงโดยม้วนปลายลิ้นขึ้นไปแตะเพดานปาก ภาษาไทยไม่มีเสียงแบบนี้ ลองพูด ต แล้วม้วนลิ้นไปด้านหลังนิดหนึ่ง",
          "This row is made by curling the tip of your tongue back to the roof of your mouth. Thai has no sound like it: say ต with your tongue curled back a little.",
        ],
      ),
      intro(C("tt"), W("tometo")),
      intro(C("tth"), W("thont")),
      intro(C("dd"), W("dim")),
      intro(C("ddh"), W("dhol")),
      intro(C("nn"), W("horin")),
      listen(C("tth"), [C("tt"), C("dd")]),
      recall(C("dd"), [C("tt"), C("ddh")]),
      match([C("tt"), C("tth"), C("dd"), C("ddh")]),
      fillBlank(W("horin"), "হরি", "ণ", "", ["ন", "ড"]),
      meaning(W("tometo"), [W("thont"), W("dhol")]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-4",
      world: "bn-consonants",
      order: 4,
      title: ["ত থ দ ধ ন", "ত থ দ ধ ন"],
      objective: ["แถวที่สี่ เสียงที่ลิ้นแตะฟัน", "Row four, made with the tongue on the teeth"],
      emblem: "ত",
      after: ["bn-consonants-3"],
      minutes: 6,
    },
    [
      tip(
        ["ত กับ ট", "ত and ট"],
        [
          "ত ออกเสียงโดยแตะลิ้นที่ฟันบน คล้าย ต ในภาษาไทย ส่วน ট ม้วนลิ้นไปด้านหลัง คนบังกลาเทศได้ยินเป็นคนละเสียงกัน",
          "For ত, touch your tongue to your top teeth, like Thai ต. For ট, curl it back. Bengali speakers hear these as different sounds.",
        ],
      ),
      intro(C("t"), W("tara-star")),
      intro(C("th"), W("thala")),
      intro(C("d"), W("doi")),
      intro(C("dh"), W("dhan")),
      intro(C("n"), W("nouka")),
      listen(C("dh"), [C("d"), C("th")]),
      recall(C("t"), [C("tt"), C("th")]),
      match([C("t"), C("th"), C("d"), C("dh")]),
      findThePicture(W("nouka"), [W("chand"), W("kola")]),
      meaning(W("thala"), [W("doi"), W("dhan")]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-5",
      world: "bn-consonants",
      order: 5,
      title: ["প ফ ব ভ ম", "প ফ ব ভ ম"],
      objective: ["แถวที่ห้า เสียงจากริมฝีปาก", "Row five, made with the lips"],
      emblem: "প",
      after: ["bn-consonants-4"],
      minutes: 6,
    },
    [
      intro(C("p"), W("pakhi")),
      intro(C("ph"), W("phul")),
      intro(C("b"), W("boi")),
      intro(C("bh"), W("bhat")),
      intro(C("m"), W("mach")),
      listen(C("bh"), [C("b"), C("p")]),
      recall(C("ph"), [C("p"), C("bh")]),
      match([C("p"), C("ph"), C("b"), C("bh")]),
      buildWord(W("boi"), ["ব", "ই"], ["ম"]),
      nameThePicture(W("phul"), [W("pakhi"), W("mach")]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-6",
      world: "bn-consonants",
      order: 6,
      title: ["য র ল শ ষ স হ", "য র ল শ ষ স হ"],
      objective: [
        "พยัญชนะที่ไม่อยู่ในแถว และเสียง sh สามตัว",
        "The consonants outside the rows, and the three “sh” letters",
      ],
      emblem: "শ",
      after: ["bn-consonants-5"],
      minutes: 7,
    },
    [
      intro(C("y")),
      intro(C("r"), W("ruti")),
      intro(C("l"), W("lau")),
      listen(C("l"), [C("r"), C("y")]),
      intro(C("sh"), W("shapla")),
      intro(C("ss"), W("shar")),
      intro(C("s"), W("shurjo")),
      tip(
        ["สามตัวเสียง sh", "Three letters for “sh”"],
        [
          "শ ষ স ออกเสียง sh เหมือนกันเกือบทุกคำ (স บางคำออกเสียง s) ต้องจำว่าคำไหนสะกดด้วยตัวไหน",
          "শ, ষ and স are nearly always said “sh” (স is “s” in a few words). Remember which one each word uses.",
        ],
      ),
      intro(C("h"), W("hash")),
      recall(C("h"), [C("r"), C("l")]),
      match([C("r"), C("l"), C("sh"), C("h")]),
      nameThePicture(W("hash"), [W("kola"), W("goru")]),
      buildWord(W("shapla"), ["শা", "প", "লা"], ["সা"]),
    ],
  ),
  lesson(
    {
      id: "bn-consonants-7",
      world: "bn-consonants",
      order: 7,
      title: ["ড় ঢ় য় ৎ ং ঃ ঁ", "ড় ঢ় য় ৎ ং ঃ ঁ"],
      objective: [
        "ตัวพิเศษท้ายตาราง และเครื่องหมายที่เปลี่ยนเสียง",
        "The special letters at the end, and the marks that change a sound",
      ],
      emblem: "ং",
      after: ["bn-consonants-6"],
      minutes: 7,
    },
    [
      tip(
        ["ตัวพิเศษท้ายแถว", "The special last letters"],
        [
          "ตัวสุดท้ายของพยัญชนะมักอยู่กลางหรือท้ายคำ ড় ঢ় য় มีจุดข้างใต้ ส่วน ৎ ং ঃ ঁ เป็นเครื่องหมายเล็ก ๆ ที่เปลี่ยนเสียง",
          "The last letters usually sit in the middle or at the end of a word. ড় ঢ় য় have a dot underneath, and ৎ ং ঃ ঁ are small marks that change the sound.",
        ],
      ),
      intro(C("rr"), W("pahar")),
      intro(C("rrh")),
      intro(C("ya"), W("moyur")),
      intro(C("khanda-t"), W("utshob")),
      intro(C("anusvara"), W("rong")),
      intro(C("visarga"), W("dukkho")),
      intro(C("chandrabindu"), W("chand")),
      recall(C("rr"), [C("dd"), C("r")]),
      match([C("rr"), C("ya"), C("anusvara"), C("chandrabindu")]),
      fillBlank(W("rong"), "র", "ং", "", ["ম", "ন"]),
      fillBlank(W("pahar"), "পাহা", "ড়", "", ["ড", "র"]),
      meaning(W("moyur"), [W("utshob"), W("pahar")]),
    ],
  ),
];

const vowelSigns: Lesson[] = [
  lesson(
    {
      id: "bn-kar-1",
      world: "bn-kar",
      order: 1,
      title: ["া ি ী", "া ি ী"],
      objective: ["ต่อสระ อา อิ อี เข้ากับพยัญชนะ", "Join the a, i and long i signs to consonants"],
      emblem: "কা",
      after: ["bn-consonants-7"],
      minutes: 6,
    },
    [
      tip(
        ["কার คือสระตัวเล็ก", "A কার is a little vowel"],
        [
          "เมื่อสระตามหลังพยัญชนะ จะเปลี่ยนเป็นเครื่องหมายตัวเล็กเรียกว่า কার เช่น আ กลายเป็น া",
          "When a vowel follows a consonant, it shrinks into a sign called a কার. For example, আ becomes া.",
        ],
      ),
      intro(K("aa"), S("ka")),
      buildSyllable(S("ka"), ["ক", "া"], ["ি"]),
      intro(K("i"), S("ki")),
      tip(
        ["ি เขียนก่อน อ่านทีหลัง", "ি is written first, said second"],
        [
          "ি เขียนไว้หน้าพยัญชนะ แต่ออกเสียงหลังพยัญชนะ เหมือนสระ เ- ในภาษาไทยที่เขียนก่อนแต่ออกเสียงทีหลัง",
          "ি is written in front of the consonant but said after it, just as Thai เ- is written first but said second.",
        ],
        [S("ki"), W("pakhi")],
      ),
      buildSyllable(S("ki"), ["ক", "ি"], ["া"]),
      intro(K("ii"), W("nodi")),
      listen(S("ka"), [S("ki")]),
      recall(K("ii"), [K("aa"), K("i")]),
      fillBlank(W("pakhi"), "পাখ", "ি", "", ["া", "ু"]),
      meaning(W("nodi"), [W("pakhi"), W("baba")]),
    ],
  ),
  lesson(
    {
      id: "bn-kar-2",
      world: "bn-kar",
      order: 2,
      title: ["ু ূ ৃ ে", "ু ূ ৃ ে"],
      objective: [
        "เครื่องหมายใต้ตัว และ ে ที่อยู่ข้างหน้า",
        "Signs that sit underneath, and ে that sits in front",
      ],
      emblem: "কে",
      after: ["bn-kar-1"],
      minutes: 6,
    },
    [
      intro(K("u"), S("ku")),
      buildSyllable(S("ku"), ["ক", "ু"], ["ে"]),
      intro(K("uu"), W("shurjo")),
      intro(K("ri"), W("krishok")),
      buildSyllable(S("kri"), ["ক", "ৃ"], ["ু"]),
      intro(K("e"), W("megh")),
      buildSyllable(S("ke"), ["ক", "ে"], ["ি"]),
      listen(S("ke"), [S("ku"), S("kri")]),
      match([K("u"), K("ri"), K("e"), K("aa")]),
      fillBlank(W("megh"), "ম", "ে", "ঘ", ["া", "ু"]),
      meaning(W("megh"), [W("krishok"), W("nodi")]),
    ],
  ),
  lesson(
    {
      id: "bn-kar-3",
      world: "bn-kar",
      order: 3,
      title: ["ৈ ো ৌ", "ৈ ো ৌ"],
      objective: [
        "เครื่องหมายที่คร่อมพยัญชนะ และตำแหน่งของ কার ทั้งหมด",
        "Signs that wrap around a consonant, and where every কার goes",
      ],
      emblem: "কো",
      after: ["bn-kar-2"],
      minutes: 7,
    },
    [
      intro(K("oi"), W("boishakh")),
      intro(K("o"), W("dokan")),
      intro(K("ou"), W("nouka")),
      tip(
        ["কার อยู่ตรงไหนบ้าง", "Where each কার goes"],
        [
          "อยู่หลังพยัญชนะ: া ী  อยู่หน้า: ি ে ৈ  อยู่ข้างใต้: ু ূ ৃ  คร่อมทั้งหน้าและหลัง: ো ৌ",
          "After the consonant: া ী. In front: ি ে ৈ. Underneath: ু ূ ৃ. Wrapped around both sides: ো ৌ.",
        ],
        [S("ka"), S("ki"), S("ku"), S("ko")],
      ),
      buildSyllable(S("ko"), ["ক", "ো"], ["ে"]),
      buildSyllable(S("koi"), ["ক", "ৈ"], ["ে"]),
      listen(S("kou"), [S("ko"), S("koi")]),
      recall(K("ou"), [K("o"), K("oi")]),
      match([K("oi"), K("o"), K("ou"), K("i")]),
      buildWord(W("nouka"), ["নৌ", "কা"], ["নো"]),
      meaning(W("boishakh"), [W("dokan"), W("nouka")]),
    ],
  ),
];

const joined: Lesson[] = [
  lesson(
    {
      id: "bn-joined-1",
      world: "bn-joined",
      order: 1,
      title: ["হসন্ত และอักษรควบ", "Hosonto and joined letters"],
      objective: ["ใช้ ্ รวมพยัญชนะสองตัวเป็นตัวเดียว", "Use ্ to merge two consonants into one"],
      emblem: "স্ক",
      after: ["bn-kar-3"],
      minutes: 7,
    },
    [
      tip(
        ["พยัญชนะสองตัวติดกัน", "Two consonants in a row"],
        [
          "ถ้าพยัญชนะสองตัวอยู่ติดกันโดยไม่มีสระคั่น จะใส่ ্ (ฮสันตะ) แล้วมักรวมร่างเป็นตัวเดียว เรียกว่า যুক্তাক্ষর",
          "When two consonants meet with no vowel between them, a ্ (hosonto) joins them, and they usually merge into one shape called a যুক্তাক্ষর.",
        ],
        [J("sk"), W("school")],
      ),
      intro("bn.sign.hasanta"),
      intro(J("sk"), W("school")),
      buildSyllable(J("sk"), ["স", "্", "ক"], ["ত"]),
      intro(J("st"), W("rasta")),
      buildSyllable(J("st"), ["স", "্", "ত"], ["ক"]),
      intro(J("nt"), W("panta")),
      buildSyllable(J("nt"), ["ন", "্", "ত"], ["স"]),
      intro(J("kss"), W("khir")),
      recall(J("kss"), [J("sk"), J("st")]),
      meaning(W("school"), [W("rasta"), W("khir")]),
      match([J("sk"), J("st"), J("nt"), J("kss")]),
    ],
  ),
  lesson(
    {
      id: "bn-joined-2",
      world: "bn-joined",
      order: 2,
      title: ["ফলা และ রেফ", "Folas and ref"],
      objective: ["ร และ য ที่กลายเป็นขีดเล็ก ๆ", "When r and য turn into small strokes"],
      emblem: "প্র",
      after: ["bn-joined-1"],
      minutes: 6,
    },
    [
      tip(
        ["ফলা และ রেফ", "Folas and ref"],
        [
          "ร และ য ที่ตามหลังพยัญชนะจะไม่เขียนเต็มตัว แต่กลายเป็นขีดเล็ก ๆ เรียกว่า ফলা ส่วน ร ที่อยู่ข้างหน้าจะขึ้นไปอยู่บนหัว เรียกว่า রেফ",
          "An r or য after a consonant isn't written in full. It becomes a small stroke called a ফলা. An r in front climbs on top and is called a রেফ.",
        ],
      ),
      intro(J("pr"), W("projapoti")),
      buildSyllable(J("pr"), ["প", "্", "র"], ["ত"]),
      intro(J("by"), W("byang")),
      buildSyllable(J("by"), ["ব", "্", "য"], ["র"]),
      intro(J("ny"), P("dhonnobad")),
      intro(J("rj"), W("shurjo")),
      recall(J("pr"), [J("by"), J("rj")]),
      meaning(W("projapoti"), [W("byang"), W("shurjo")]),
      match([J("pr"), J("by"), J("ny"), J("rj")]),
    ],
  ),
];

const numbers: Lesson[] = [
  lesson(
    {
      id: "bn-numbers-1",
      world: "bn-numbers",
      order: 1,
      title: ["১ ถึง ৫", "১ to ৫"],
      objective: ["อ่านตัวเลขและนับหนึ่งถึงห้า", "Read the digits and count from one to five"],
      emblem: "১",
      after: ["bn-hello-2"],
      minutes: 5,
    },
    [
      tip(
        ["ตัวเลขเบงกาลี", "Bengali digits"],
        [
          "ภาษาเบงกาลีมีตัวเลขของตัวเอง เหมือนเลขไทย ๑ ๒ ๓ จะเห็นได้บนธนบัตรและป้ายต่าง ๆ",
          "Bengali has its own digits, just like Thai ๑ ๒ ๓. You'll see them on money and signs.",
        ],
        [D("1"), D("2"), D("3")],
      ),
      intro(W("ek")),
      intro(W("dui")),
      intro(W("tin")),
      match([D("1"), D("2"), D("3"), D("4")]),
      intro(W("char")),
      intro(W("panch")),
      listen(W("dui"), [W("ek"), W("tin")]),
      recall(W("tin"), [W("dui"), W("char")]),
      meaning(W("panch"), [W("char"), W("ek")]),
      recall(D("5"), [D("4"), D("2")]),
    ],
  ),
  lesson(
    {
      id: "bn-numbers-2",
      world: "bn-numbers",
      order: 2,
      title: ["৬ ถึง ১০ และ ০", "৬ to ১০, and ০"],
      objective: ["นับต่อถึงสิบ และรู้จักศูนย์", "Count on to ten and meet zero"],
      emblem: "১০",
      after: ["bn-numbers-1"],
      minutes: 5,
    },
    [
      intro(W("chhoy")),
      intro(W("shat")),
      intro(W("at")),
      match([D("6"), D("7"), D("8"), D("9")]),
      intro(W("noy")),
      intro(W("dosh")),
      intro(W("shunno")),
      recall(D("10"), [D("0"), D("1")]),
      recall(W("shat"), [W("chhoy"), W("at")]),
      meaning(W("noy"), [W("dosh"), W("chhoy")]),
      listen(W("dosh"), [W("at"), W("shunno")]),
      match([D("0"), D("5"), D("10"), D("3")]),
    ],
  ),
];

const myWorld: Lesson[] = [
  lesson(
    {
      id: "bn-world-1",
      world: "bn-world",
      order: 1,
      title: ["อาหารบนโต๊ะ", "Food on the table"],
      objective: ["ข้าว ไข่ น้ำ นม และกล้วย", "Rice, eggs, water, milk and bananas"],
      emblem: "ভাত",
      after: ["bn-hello-2"],
      minutes: 6,
    },
    [
      intro(W("bhat")),
      intro(W("dim")),
      findThePicture(W("bhat"), [W("dim"), W("mach")]),
      intro(W("pani")),
      intro(W("dudh")),
      nameThePicture(W("dim"), [W("bhat"), W("dudh")]),
      listen(W("pani"), [W("dudh"), W("aam")], "image"),
      intro(W("kola")),
      match([W("bhat"), W("dim"), W("pani"), W("kola")], "image"),
      recall(W("dudh"), [W("pani"), W("dim")]),
      meaning(W("mach"), [W("dim"), W("bhat")]),
    ],
  ),
  lesson(
    {
      id: "bn-world-2",
      world: "bn-world",
      order: 2,
      title: ["บ้านและโรงเรียน", "Home and school"],
      objective: ["ปากกา บ้าน ต้นไม้ ลูกบอล และโรงเรียน", "Pen, house, tree, ball and school"],
      emblem: "বাড়ি",
      after: ["bn-world-1"],
      minutes: 6,
    },
    [
      intro(W("kolom")),
      intro(W("bari")),
      nameThePicture(W("kolom"), [W("boi"), W("bol")]),
      intro(W("gach")),
      intro(W("bol")),
      findThePicture(W("bari"), [W("gach"), W("bol")]),
      listen(W("gach"), [W("bari"), W("kolom")], "image"),
      intro(W("school")),
      match([W("kolom"), W("bari"), W("gach"), W("bol")], "image"),
      meaning(W("school"), [W("bari"), W("boi")]),
      buildWord(W("kolom"), ["ক", "ল", "ম"], ["খ"]),
    ],
  ),
  lesson(
    {
      id: "bn-world-3",
      world: "bn-world",
      order: 3,
      title: ["สัตว์และธรรมชาติ", "Animals and nature"],
      objective: [
        "แมว สุนัข วัว เป็ด นก ดอกไม้ ดวงจันทร์ และเรือ",
        "Cat, dog, cow, duck, bird, flower, moon and boat",
      ],
      emblem: "পাখি",
      after: ["bn-world-2"],
      minutes: 6,
    },
    [
      intro(W("biral")),
      intro(W("kukur")),
      findThePicture(W("kukur"), [W("biral"), W("goru")]),
      intro(W("goru")),
      intro(W("hash")),
      nameThePicture(W("hash"), [W("pakhi"), W("kukur")]),
      listen(W("goru"), [W("hash"), W("biral")], "image"),
      match([W("biral"), W("kukur"), W("pakhi"), W("phul")], "image"),
      match([W("chand"), W("nouka"), W("goru"), W("hash")], "image"),
      recall(W("biral"), [W("kukur"), W("pakhi")]),
      buildWord(W("biral"), ["বি", "ড়া", "ল"], ["বা"]),
    ],
  ),
  lesson(
    {
      id: "bn-world-4",
      world: "bn-world",
      order: 4,
      title: ["สีและครอบครัว", "Colours and family"],
      objective: ["สีหกสี และพี่น้อง", "Six colours, brothers and sisters"],
      emblem: "লাল",
      after: ["bn-world-3"],
      minutes: 7,
    },
    [
      intro(W("lal")),
      intro(W("nil")),
      intro(W("sobuj")),
      intro(W("holud")),
      match([W("lal"), W("nil"), W("sobuj"), W("holud")], "image"),
      intro(W("sada")),
      intro(W("kalo")),
      findThePicture(W("kalo"), [W("sada"), W("lal")]),
      nameThePicture(W("sada"), [W("kalo"), W("nil")]),
      intro(W("bhai")),
      intro(W("bon")),
      meaning(W("baba"), [W("ma"), W("bhai")]),
      recall(W("bon"), [W("bhai"), W("ma")]),
      match([W("ma"), W("baba"), W("bhai"), W("bon")]),
    ],
  ),
];

const grammar: Lesson[] = [
  lesson(
    {
      id: "bn-grammar-1",
      world: "bn-grammar",
      order: 1,
      title: ["ใครกิน: আমি তুমি সে", "Who eats? আমি, তুমি, সে"],
      objective: [
        "วางกริยาไว้ท้ายประโยค และเปลี่ยนรูปตามคนทำ",
        "Put the verb last, and change it to match who does it",
      ],
      emblem: "আমি",
      after: ["bn-world-4"],
      minutes: 7,
    },
    [
      tip(
        ["กริยาอยู่ท้ายประโยค", "The verb goes last"],
        [
          "ภาษาไทยพูดว่า ฉัน-กิน-ข้าว แต่ภาษาเบงกาลีพูดว่า ฉัน-ข้าว-กิน: আমি ভাত খাই คำกริยาจะอยู่ท้ายประโยค",
          "In Thai you say I–eat–rice. In Bengali you say I–rice–eat: আমি ভাত খাই. The verb goes at the end.",
        ],
        [P("ami-bhat-khai")],
      ),
      intro(W("ami")),
      intro(W("tumi")),
      intro(W("se")),
      orderWords(P("ami-bhat-khai"), ["আমি", "ভাত", "খাই"]),
      tip(
        ["กริยาเปลี่ยนตามคนทำ", "Verbs change with who does them"],
        [
          "กริยาเบงกาลีเปลี่ยนรูปตามคนที่ทำ: আমি খাই, তুমি খাও, সে খায় แต่ไม่ต้องสนใจเพศ เพราะ সে ใช้ได้ทั้งผู้ชายและผู้หญิง",
          "Bengali verbs change with who is doing the action: আমি খাই, তুমি খাও, সে খায়. Gender doesn't matter: সে means he or she.",
        ],
        [P("ami-bhat-khai"), P("tumi-bhat-khao"), P("se-bhat-khay")],
      ),
      withInstruction(VERB_FOR("সে"), fillBlank(P("se-bhat-khay"), "সে ভাত ", "খায়", "", ["খাই", "খাও"])),
      withInstruction(
        VERB_FOR("তুমি"),
        fillBlank(P("tumi-bhat-khao"), "তুমি ভাত ", "খাও", "", ["খায়", "খাই"]),
      ),
      meaning(P("se-bhat-khay"), [P("ami-bhat-khai"), P("tumi-bhat-khao")]),
      makeSentence(EAT_FRAME),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-2",
      world: "bn-grammar",
      order: 2,
      title: ["อ่าน ไป เล่น", "Read, go, play"],
      objective: [
        "กริยาใหม่สามคำ และคำลงท้าย -এ ที่แปลว่า ที่/ไปยัง",
        "Three new verbs, and the ending -এ meaning “at” or “to”",
      ],
      emblem: "যাই",
      after: ["bn-grammar-1"],
      minutes: 7,
    },
    [
      intro(P("ami-boi-pori")),
      intro(P("se-skule-jay")),
      intro(P("amra-bol-kheli")),
      tip(
        ["-এ แปลว่า “ที่” หรือ “ไปยัง”", "-এ means “at” or “to”"],
        [
          "เติม -এ หรือ -তে ท้ายสถานที่: স্কুল → স্কুলে (ที่โรงเรียน / ไปโรงเรียน), বাড়ি → বাড়িতে (ที่บ้าน)",
          "Add -এ or -তে to a place: স্কুল → স্কুলে (at/to school), বাড়ি → বাড়িতে (at home).",
        ],
        [W("skule"), W("barite")],
      ),
      orderWords(P("se-boi-pore"), ["সে", "বই", "পড়ে"]),
      orderWords(P("ami-skule-jai"), ["আমি", "স্কুলে", "যাই"], ["যায়"]),
      withInstruction(VERB_FOR("সে"), fillBlank(P("se-skule-jay"), "সে স্কুলে ", "যায়", "", ["যাই", "যাও"])),
      recall(P("amra-bol-kheli"), [P("ami-boi-pori"), P("se-boi-pore")]),
      makeSentence(GO_FRAME),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-3",
      world: "bn-grammar",
      order: 3,
      title: ["এটা কী? นี่คืออะไร", "এটা কী? What is this?"],
      objective: [
        "ชี้แล้วบอกว่าสิ่งนั้นคืออะไร และรู้จักลักษณนาม -টা",
        "Point and say what something is, and meet the counter -টা",
      ],
      emblem: "এটা",
      after: ["bn-grammar-2"],
      minutes: 6,
    },
    [
      intro(W("eta")),
      intro(W("ota")),
      intro(P("eta-ki")),
      tip(
        ["-টা เหมือนลักษณนามไทย", "-টা is like a Thai counter word"],
        [
          "-টা ทำหน้าที่เหมือน “อัน” “ตัว” “ลูก” ในภาษาไทย: একটা বই คือหนังสือหนึ่งเล่ม ถ้าใส่ไว้หลังคำนาม বইটা จะแปลว่า “หนังสือเล่มนั้น”",
          "-টা works like Thai counter words (อัน, ตัว, ลูก): একটা বই is “one book”. Put it after a noun, বইটা, and it means “the book”.",
        ],
        [W("ekta"), P("eta-ekta-boi")],
      ),
      orderWords(P("eta-ekta-boi"), ["এটা", "একটা", "বই"]),
      meaning(P("ota-ekta-pakhi"), [P("eta-ekta-boi"), P("eta-ekta-phul")]),
      fillBlank(P("eta-ekta-phul"), "এটা একটা ", "ফুল", "", ["বই", "পাখি"]),
      recall(P("eta-ki"), [P("eta-ekta-boi"), P("ota-ekta-pakhi")]),
      makeSentence(THIS_FRAME),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-4",
      world: "bn-grammar",
      order: 4,
      title: ["না: บอกว่าไม่", "না: saying no"],
      objective: ["ปฏิเสธโดยใส่ না ไว้ท้ายประโยค", "Make a sentence negative with না at the end"],
      emblem: "না",
      after: ["bn-grammar-3"],
      minutes: 5,
    },
    [
      tip(
        ["না อยู่ท้ายสุด", "না goes at the very end"],
        [
          "จะปฏิเสธ ให้ใส่ না หลังคำกริยา: আমি মাছ খাই না (ฉันไม่กินปลา) ภาษาไทยใส่ “ไม่” ไว้หน้ากริยา แต่ภาษาเบงกาลีใส่ไว้ท้ายสุด",
          "To say “not”, put না after the verb: আমি মাছ খাই না, “I don't eat fish”. Thai puts ไม่ before the verb; Bengali puts না at the very end.",
        ],
        [W("na"), P("ami-mach-khai-na")],
      ),
      intro(W("na")),
      intro(P("ami-mach-khai-na")),
      orderWords(P("ami-mach-khai-na"), ["আমি", "মাছ", "খাই", "না"]),
      orderWords(P("se-dudh-khay-na"), ["সে", "দুধ", "খায়", "না"], ["খাই"]),
      meaning(P("ami-skule-jai-na"), [P("ami-skule-jai"), P("ami-mach-khai-na")]),
      fillBlank(P("ami-skule-jai-na"), "আমি স্কুলে যাই ", "না", "", ["হ্যাঁ", "কি"]),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-5",
      world: "bn-grammar",
      order: 5,
      title: ["ถามคำถาม", "Asking questions"],
      objective: [
        "ถามด้วย কি কী และ কোথায় แล้วตอบด้วย হ্যাঁ หรือ না",
        "Ask with কি, কী and কোথায়, and answer হ্যাঁ or না",
      ],
      emblem: "কি",
      after: ["bn-grammar-4"],
      minutes: 6,
    },
    [
      tip(
        ["কি กับ কী", "কি and কী"],
        [
          "ใส่ কি หลังคนที่ถูกถาม จะกลายเป็นคำถามใช่หรือไม่: তুমি কি ভাত খাও? (เธอกินข้าวไหม) ส่วน কী แปลว่า “อะไร”: এটা কী? ตอบด้วย হ্যাঁ (ใช่) หรือ না (ไม่)",
          "Put কি after the person to make a yes/no question: তুমি কি ভাত খাও? “Do you eat rice?”. কী means “what”: এটা কী? Answer with হ্যাঁ (yes) or না (no).",
        ],
        [W("ki-question"), W("ki-what")],
      ),
      intro(P("tumi-ki-bhat-khao")),
      intro(W("hya")),
      orderWords(P("tumi-ki-bhat-khao"), ["তুমি", "কি", "ভাত", "খাও"]),
      meaning(P("hya-ami-bhat-khai"), [P("ami-mach-khai-na"), P("tumi-ki-bhat-khao")]),
      intro(W("kothay")),
      orderWords(P("biralta-kothay"), ["বিড়ালটা", "কোথায়"], ["বাড়িতে"]),
      recall(P("biralta-barite"), [P("biralta-kothay"), P("ami-skule-jai")]),
      fillBlank(P("eta-ki"), "এটা ", "কী", "?", ["কি", "না"]),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-6",
      world: "bn-grammar",
      order: 6,
      title: ["ของฉัน และคำบอกลักษณะ", "My things and describing words"],
      objective: ["พูดว่า “ฉันมี...” และบอกสีหรือขนาด", "Say “I have…” and describe colour or size"],
      emblem: "আমার",
      after: ["bn-grammar-5"],
      minutes: 7,
    },
    [
      tip(
        ["ฉันมี...", "I have…"],
        [
          "আমার = ของฉัน, তোমার = ของเธอ เวลาจะบอกว่า “ฉันมี...” ให้พูดว่า আমার ... আছে เช่น আমার একটা লাল বল আছে",
          "আমার means “my” and তোমার means “your”. To say “I have…”, Bengali says “my … is there”: আমার একটা লাল বল আছে.",
        ],
        [P("amar-ekta-lal-bol-achhe")],
      ),
      intro(W("amar")),
      intro(W("achhe")),
      orderWords(P("amar-ekta-lal-bol-achhe"), ["আমার", "একটা", "লাল", "বল", "আছে"]),
      tip(
        ["คำบอกลักษณะอยู่ข้างหน้า", "Describing words go first"],
        [
          "คำบอกลักษณะวางไว้หน้าคำนาม (লাল বল = บอลสีแดง) กลับกันกับภาษาไทย และไม่ต้องมีคำว่า “เป็น”: ফুলটা লাল (ดอกไม้สีแดง)",
          "Describing words come before the noun (লাল বল, “red ball”), the opposite of Thai. And no word for “is” is needed: ফুলটা লাল, “the flower is red”.",
        ],
        [P("phulta-lal"), P("biralta-chhoto")],
      ),
      meaning(P("phulta-lal"), [P("akash-nil"), P("biralta-chhoto")]),
      fillBlank(P("akash-nil"), "আকাশ ", "নীল", "", ["লাল", "কালো"]),
      recall(P("tomar-ki-boi-achhe"), [P("amar-ekta-lal-bol-achhe"), P("phulta-lal")]),
      makeSentence(DESCRIBE_FRAME),
      makeSentence(HAVE_FRAME),
    ],
  ),
  lesson(
    {
      id: "bn-grammar-7",
      world: "bn-grammar",
      order: 7,
      title: ["ห้องทำประโยค", "Sentence workshop"],
      objective: ["แต่งประโยคของตัวเองเก็บไว้ในสมุด", "Make your own sentences for your sentence book"],
      emblem: "✎",
      after: ["bn-grammar-6"],
      minutes: 8,
    },
    [
      makeSentence(EAT_FRAME),
      orderWords(P("tumi-bhat-khao"), ["তুমি", "ভাত", "খাও"], ["খায়"]),
      makeSentence(GO_FRAME),
      fillBlank(P("se-boi-pore"), "সে বই ", "পড়ে", "", ["পড়ি", "পড়ো"]),
      makeSentence(THIS_FRAME),
      orderWords(P("biralta-chhoto"), ["বিড়ালটা", "ছোট"], ["বড়"]),
      makeSentence(DESCRIBE_FRAME),
      meaning(P("tomar-ki-boi-achhe"), [P("amar-ekta-lal-bol-achhe"), P("eta-ekta-boi")]),
      makeSentence(HAVE_FRAME),
    ],
  ),
];

const reading: Lesson[] = [
  lesson(
    {
      id: "bn-reading-1",
      world: "bn-reading",
      order: 1,
      title: ["วันของรีนา", "Rina's day"],
      objective: ["อ่านเรื่องสั้นห้าประโยค แล้วตอบคำถาม", "Read a five-sentence story and answer questions"],
      emblem: "রিনা",
      after: ["bn-grammar-7", "bn-kar-3"],
      minutes: 8,
    },
    [
      tip(
        ["อ่านเรื่องสั้น", "Reading a story"],
        [
          "อ่านทีละประโยค ถ้าเจอคำใหม่ ให้ดูคำอ่านใต้ประโยคช่วย",
          "Read one sentence at a time. If a word is new, use the reading aid underneath.",
        ],
      ),
      intro(P("story-1")),
      intro(P("story-2")),
      intro(P("story-3")),
      intro(P("story-4")),
      intro(P("story-5")),
      fillBlank(P("story-2"), "রিনা সকালে ", "ভাত", " খায়", ["মাছ", "দুধ"], FROM_STORY),
      fillBlank(P("story-3"), "তারপর সে ", "স্কুলে", " যায়", ["বাজারে", "বাড়িতে"], FROM_STORY),
      meaning(P("story-4"), [P("story-5"), P("story-2")]),
      orderWords(P("story-5"), ["বিকেলে", "সে", "বল", "খেলে"]),
      intro(P("tomar-nam-ki")),
      intro(P("amar-nam-rina")),
      recall(P("story-1"), [P("amar-nam-rina"), P("eta-ki")]),
    ],
  ),
  lesson(
    {
      id: "bn-reading-2",
      world: "bn-reading",
      order: 2,
      title: ["ทบทวนใหญ่", "The big review"],
      objective: [
        "ทบทวนตัวอักษร คำ และประโยคจากทุกบท",
        "Review letters, words and sentences from every chapter",
      ],
      emblem: "★",
      after: ["bn-reading-1", "bn-joined-2", "bn-numbers-2"],
      minutes: 8,
    },
    [
      listen(V("ou"), [V("oi"), V("oo")]),
      recall(C("bh"), [C("b"), C("ph")]),
      buildSyllable(S("ki"), ["ক", "ি"], ["ে"]),
      buildSyllable(J("st"), ["স", "্", "ত"], ["ন"]),
      recall(W("shat"), [W("at"), W("noy")]),
      match([W("kukur"), W("hash"), W("nouka"), W("phul")], "image"),
      orderWords(P("se-skule-jay"), ["সে", "স্কুলে", "যায়"], ["যাই"]),
      fillBlank(P("ami-mach-khai-na"), "আমি মাছ খাই ", "না", "", ["কি", "হ্যাঁ"]),
      meaning(P("tomar-ki-boi-achhe"), [P("amar-ekta-lal-bol-achhe"), P("eta-ekta-boi")]),
      makeSentence(EAT_FRAME),
    ],
  ),
];

export const bnLessons: Lesson[] = [
  ...hello,
  ...vowels,
  ...consonants,
  ...vowelSigns,
  ...joined,
  ...numbers,
  ...myWorld,
  ...grammar,
  ...reading,
];
