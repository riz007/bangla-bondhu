import type { CurriculumItem } from "@/features/curriculum/schema";
import { bnItem } from "./build";

// Reviewed by the project owner; audio not yet recorded (docs/CONTENT_REVIEW.md).
// Letter readings use dots for the curled-tongue sounds (ṭ, ḍ, ṇ, ṣ, ṛ); word
// readings stay plain.

const vowel = (id: string, text: string, tr: string, th: string, en: string, note?: [string, string]) =>
  bnItem("letter", `bn.vowel.${id}`, text, tr, [th, en], { note });

const cons = (id: string, text: string, tr: string, th: string, en: string, note?: [string, string]) =>
  bnItem("letter", `bn.cons.${id}`, text, tr, [th, en], { note });

const kar = (id: string, sign: string, tr: string, th: string, en: string, note?: [string, string]) =>
  bnItem("vowel-sign", `bn.kar.${id}`, sign, tr, [th, en], { display: `◌${sign}`, note, difficulty: 2 });

const syllable = (id: string, text: string, tr: string, th: string, en: string) =>
  bnItem("syllable", `bn.syl.${id}`, text, tr, [th, en], { difficulty: 2 });

const conjunct = (id: string, text: string, tr: string, th: string, en: string, note: [string, string]) =>
  bnItem("conjunct", `bn.joined.${id}`, text, tr, [th, en], { note, difficulty: 3 });

const numeral = (id: string, digit: string, th: string, en: string) =>
  bnItem("numeral", `bn.digit.${id}`, digit, id, [th, en]);

type WordExtras = Parameters<typeof bnItem>[5];

const word = (id: string, text: string, tr: string, th: string, en: string, extras?: WordExtras) =>
  bnItem("word", `bn.word.${id}`, text, tr, [th, en], extras);

const pic = (image: string, th: string, en: string): WordExtras => ({ image, alt: [th, en] });

const phrase = (id: string, text: string, tr: string, th: string, en: string, extras?: WordExtras) =>
  bnItem("phrase", `bn.phrase.${id}`, text, tr, [th, en], { difficulty: 3, ...extras });

export const vowels: CurriculumItem[] = [
  vowel("o", "অ", "ô", "สระเสียง ออ", "the vowel “ô”, as in hot", [
    "อ เป็นสระที่ซ่อนอยู่ในพยัญชนะทุกตัว เช่น ক อ่านว่า กอ",
    "অ hides inside every consonant: ক on its own is read “kô”.",
  ]),
  vowel("aa", "আ", "a", "สระเสียง อา", "the vowel “a”, as in father"),
  vowel("i", "ই", "i", "สระ อิ (ตัวสั้น)", "the vowel “i” (short i, hroshsho-i)", [
    "คนบังกลาเทศเรียกตัวนี้ว่า “হ্রস্ব-ই” (อิตัวสั้น)",
    "Children call this one হ্রস্ব-ই, “short i”.",
  ]),
  vowel("ii", "ঈ", "i", "สระ อี (ตัวยาว)", "the vowel “i” (long i, dirgho-i)", [
    "ภาษาพูดออกเสียง ঈ เหมือน ই ทุกอย่าง ต่างกันแค่การสะกด",
    "In everyday Bengali ঈ sounds exactly like ই. Only the spelling differs.",
  ]),
  vowel("u", "উ", "u", "สระ อุ (ตัวสั้น)", "the vowel “u” (short u, hroshsho-u)"),
  vowel("uu", "ঊ", "u", "สระ อู (ตัวยาว)", "the vowel “u” (long u, dirgho-u)", [
    "ออกเสียงเหมือน উ เช่นเดียวกับคู่ ই และ ঈ",
    "Said just like উ, the same way ই and ঈ match.",
  ]),
  vowel("ri", "ঋ", "ri", "สระ ฤ (อ่านว่า ริ)", "the vowel “ri”", [
    "คล้าย ฤ ในภาษาไทย เช่น ঋষি = ฤๅษี",
    "Like the Thai ฤ: ঋষি is the Thai ฤๅษี, a wise hermit.",
  ]),
  vowel("e", "এ", "e", "สระเสียง เอ", "the vowel “e”"),
  vowel("oi", "ঐ", "oi", "สระเสียง โอย", "the vowel “oi”, as in boy"),
  vowel("oo", "ও", "o", "สระเสียง โอ", "the vowel “o”, as in go"),
  vowel("ou", "ঔ", "ou", "สระเสียง โอว", "the vowel “ou”"),
];

export const consonants: CurriculumItem[] = [
  cons("k", "ক", "ko", "พยัญชนะเสียง ก", "the sound k"),
  cons("kh", "খ", "kho", "พยัญชนะเสียง ข (มีลมออก)", "the sound kh, with a puff of air"),
  cons("g", "গ", "go", "พยัญชนะเสียง g แบบ go", "the sound g, as in go"),
  cons("gh", "ঘ", "gho", "พยัญชนะเสียง g มีลม (gh)", "the sound gh, a breathy g"),
  cons("ng", "ঙ", "ngo", "พยัญชนะเสียง ง", "the sound ng, as in sing", [
    "มักอยู่ท้ายคำ เช่น ব্যাঙ (กบ)",
    "Usually at the end of a word, as in ব্যাঙ (frog).",
  ]),
  cons("c", "চ", "cho", "พยัญชนะเสียง จ", "the sound ch, as in chip"),
  cons("ch", "ছ", "chho", "พยัญชนะเสียง ฉ (มีลมออก)", "the sound chh, ch with a puff of air"),
  cons("j", "জ", "jo", "พยัญชนะเสียง j แบบ jam", "the sound j, as in jam"),
  cons("jh", "ঝ", "jho", "พยัญชนะเสียง j มีลม (jh)", "the sound jh, a breathy j"),
  cons("ny", "ঞ", "nyo", "พยัญชนะนาสิก มักออกเสียงคล้าย น", "a nasal sound, usually said like n", [
    "แทบไม่อยู่ต้นคำ จะเจอในอักษรควบ เช่น ঞ্চ",
    "Almost never starts a word. You'll meet it inside joined letters like ঞ্চ.",
  ]),
  cons("tt", "ট", "ṭo", "พยัญชนะเสียง ต แบบม้วนลิ้น", "the sound ṭ, t with the tongue curled back"),
  cons("tth", "ঠ", "ṭho", "พยัญชนะเสียง ถ แบบม้วนลิ้น", "the sound ṭh, curled-tongue t with air"),
  cons("dd", "ড", "ḍo", "พยัญชนะเสียง ด แบบม้วนลิ้น", "the sound ḍ, d with the tongue curled back"),
  cons("ddh", "ঢ", "ḍho", "พยัญชนะเสียง ด ม้วนลิ้นและมีลม", "the sound ḍh, a breathy curled-tongue d"),
  cons("nn", "ণ", "ṇo", "พยัญชนะเสียง น ตัวที่สอง", "the sound n (the second n letter)", [
    "ออกเสียงเหมือน ন ต่างกันแค่การสะกด",
    "Said exactly like ন. Only the spelling differs.",
  ]),
  cons("t", "ত", "to", "พยัญชนะเสียง ต (ลิ้นแตะฟัน)", "the sound t, tongue on the teeth"),
  cons("th", "থ", "tho", "พยัญชนะเสียง ถ (ลิ้นแตะฟัน)", "the sound th, t with air (not as in “the”)"),
  cons("d", "দ", "do", "พยัญชนะเสียง ด (ลิ้นแตะฟัน)", "the sound d, tongue on the teeth"),
  cons("dh", "ধ", "dho", "พยัญชนะเสียง ด มีลม (dh)", "the sound dh, a breathy d"),
  cons("n", "ন", "no", "พยัญชนะเสียง น", "the sound n"),
  cons("p", "প", "po", "พยัญชนะเสียง ป", "the sound p"),
  cons("ph", "ফ", "pho", "พยัญชนะเสียง ผ หรือ f", "the sound ph or f", [
    "ในบังกลาเทศ หลายคนออกเสียงคล้าย f เช่น ফুল",
    "Many people in Bangladesh say it like f, as in ফুল.",
  ]),
  cons("b", "ব", "bo", "พยัญชนะเสียง บ", "the sound b"),
  cons("bh", "ভ", "bho", "พยัญชนะเสียง บ มีลม (bh)", "the sound bh, a breathy b"),
  cons("m", "ম", "mo", "พยัญชนะเสียง ม", "the sound m"),
  cons("y", "য", "jo", "พยัญชนะเสียง j (เหมือน জ)", "the sound j (same as জ)", [
    "ชื่อเต็มคือ অন্তঃস্থ য ออกเสียงเหมือน জ",
    "Its full name is ontostho-jo, and it sounds like জ.",
  ]),
  cons("r", "র", "ro", "พยัญชนะเสียง ร (รัวลิ้นเบา ๆ)", "the sound r, a light tap"),
  cons("l", "ল", "lo", "พยัญชนะเสียง ล", "the sound l"),
  cons("sh", "শ", "sho", "พยัญชนะเสียง sh (ชู่ว)", "the sound sh"),
  cons("ss", "ষ", "ṣo", "พยัญชนะเสียง sh (เหมือน শ)", "the sound sh (same as শ)"),
  cons("s", "স", "so", "พยัญชนะเสียง s หรือ sh", "the sound s or sh", [
    "มักออกเสียง sh เช่น সাত แต่บางคำเป็น s เช่น স্কুল",
    "Usually sh, as in সাত, but s in some words, like স্কুল.",
  ]),
  cons("h", "হ", "ho", "พยัญชนะเสียง ห", "the sound h"),
  cons("rr", "ড়", "ṛo", "พยัญชนะเสียง ร แบบตวัดลิ้น", "the sound ṛ, a flapped r", [
    "มีจุดข้างใต้ ต่างจาก ড ที่ไม่มีจุด",
    "It has a dot underneath. ড without the dot is a different sound.",
  ]),
  cons("rrh", "ঢ়", "ṛho", "พยัญชนะเสียง ร ตวัดลิ้น (เหมือน ড়)", "the sound ṛh (said like ড়)"),
  cons("ya", "য়", "yo", "พยัญชนะเสียง ย", "the sound y"),
  cons("khanda-t", "ৎ", "t", "ต สะกด (খণ্ড-ত)", "a final t (khondo-t)"),
  cons("anusvara", "ং", "ng", "ง สะกด (অনুস্বার)", "a final ng (onusshar)"),
  cons("visarga", "ঃ", "h", "เครื่องหมาย বিসর্গ ทำให้เสียงถัดไปหนักขึ้น", "bisorgo: doubles the next sound"),
  cons(
    "chandrabindu",
    "ঁ",
    "~",
    "จันทรบินดุ ทำให้สระเป็นเสียงขึ้นจมูก",
    "chondrobindu: makes the vowel nasal",
  ),
];

export const signs: CurriculumItem[] = [
  kar("aa", "া", "a", "เครื่องหมายสระเสียง อา", "the vowel sign for “a”", [
    "ขีดตั้งวางหลังพยัญชนะ: ক + া = কা",
    "An upright stroke after the consonant: ক + া = কা.",
  ]),
  kar("i", "ি", "i", "เครื่องหมายสระเสียง อิ", "the vowel sign for “i” (short)", [
    "เขียนไว้หน้าพยัญชนะ แต่ออกเสียงทีหลัง: ক + ি = কি",
    "Written before the consonant but said after it: ক + ি = কি.",
  ]),
  kar("ii", "ী", "i", "เครื่องหมายสระเสียง อี", "the vowel sign for “i” (long)"),
  kar("u", "ু", "u", "เครื่องหมายสระเสียง อุ", "the vowel sign for “u” (short)"),
  kar("uu", "ূ", "u", "เครื่องหมายสระเสียง อู", "the vowel sign for “u” (long)"),
  kar("ri", "ৃ", "ri", "เครื่องหมายสระเสียง ริ", "the vowel sign for “ri”"),
  kar("e", "ে", "e", "เครื่องหมายสระเสียง เอ", "the vowel sign for “e”", [
    "เขียนไว้หน้าพยัญชนะ เหมือนสระ เ- ในภาษาไทย",
    "Written before the consonant, just like Thai เ-.",
  ]),
  kar("oi", "ৈ", "oi", "เครื่องหมายสระเสียง โอย", "the vowel sign for “oi”"),
  kar("o", "ো", "o", "เครื่องหมายสระเสียง โอ", "the vowel sign for “o”", [
    "มีสองส่วน คร่อมพยัญชนะทั้งหน้าและหลัง เหมือนสระ เ-า ในภาษาไทย",
    "It comes in two parts that wrap around the consonant, like Thai เ-า.",
  ]),
  kar("ou", "ৌ", "ou", "เครื่องหมายสระเสียง โอว", "the vowel sign for “ou”"),
  bnItem(
    "sign",
    "bn.sign.hasanta",
    "্",
    "-",
    ["ฮสันตะ: ตัดเสียงสระที่ติดมา", "hosonto: removes the hidden vowel"],
    {
      display: "◌্",
      note: [
        "ใส่ใต้พยัญชนะเพื่อไม่ให้มีเสียง อ ตามมา แล้วพยัญชนะสองตัวมักรวมเป็นตัวเดียว",
        "Put under a consonant to drop its hidden “ô”. Two consonants then usually join into one shape.",
      ],
      difficulty: 3,
    },
  ),
];

export const syllables: CurriculumItem[] = [
  syllable("ka", "কা", "ka", "พยางค์เสียง กา", "the syllable ka"),
  syllable("ki", "কি", "ki", "พยางค์เสียง กิ", "the syllable ki"),
  syllable("kii", "কী", "ki", "พยางค์เสียง กี", "the syllable ki (long i)"),
  syllable("ku", "কু", "ku", "พยางค์เสียง กุ", "the syllable ku"),
  syllable("kuu", "কূ", "ku", "พยางค์เสียง กู", "the syllable ku (long u)"),
  syllable("kri", "কৃ", "kri", "พยางค์เสียง กริ", "the syllable kri"),
  syllable("ke", "কে", "ke", "พยางค์เสียง เก", "the syllable ke"),
  syllable("koi", "কৈ", "koi", "พยางค์เสียง โกย", "the syllable koi"),
  syllable("ko", "কো", "ko", "พยางค์เสียง โก", "the syllable ko"),
  syllable("kou", "কৌ", "kou", "พยางค์เสียง โกว", "the syllable kou"),
  syllable("ma", "মা", "ma", "พยางค์เสียง มา", "the syllable ma"),
  syllable("ba", "বা", "ba", "พยางค์เสียง บา", "the syllable ba"),
  syllable("mi", "মি", "mi", "พยางค์เสียง มิ", "the syllable mi"),
  syllable("pi", "পি", "pi", "พยางค์เสียง ปิ", "the syllable pi"),
];

export const joinedLetters: CurriculumItem[] = [
  conjunct("sk", "স্ক", "sk", "อักษรควบ ส+ก", "joined s + k", [
    "স + ্ + ক = স্ক เหมือนในคำว่า স্কুল",
    "স + ্ + ক = স্ক, as in স্কুল.",
  ]),
  conjunct("st", "স্ত", "st", "อักษรควบ ส+ต", "joined s + t", [
    "স + ্ + ত = স্ত เหมือนในคำว่า রাস্তা",
    "স + ্ + ত = স্ত, as in রাস্তা.",
  ]),
  conjunct("nt", "ন্ত", "nt", "อักษรควบ น+ต", "joined n + t", [
    "ন + ্ + ত = ন্ত เหมือนในคำว่า পান্তা",
    "ন + ্ + ত = ন্ত, as in পান্তা.",
  ]),
  conjunct("kss", "ক্ষ", "kkh", "อักษรควบ ก+ษ (อ่านว่า ก-ข)", "joined k + ṣ (said “kkh”)", [
    "ক + ্ + ষ = ক্ষ หน้าตาเปลี่ยนไปมาก ต้องจำเป็นรูปใหม่",
    "ক + ্ + ষ = ক্ষ. It looks quite different, so learn it as a new shape.",
  ]),
  conjunct("pr", "প্র", "pr", "ร-ফলা: ป + ร", "ro-fola: p + r", [
    "ร ที่ตามพยัญชนะจะกลายเป็นขีดเฉียงข้างใต้ เรียกว่า র-ফলা",
    "An r after a consonant becomes a slanted stroke underneath, called ro-fola.",
  ]),
  conjunct("by", "ব্য", "by", "য-ফলা: บ + য", "jo-fola: b + y", [
    "য ที่ตามพยัญชนะกลายเป็นขีดด้านขวา เรียกว่า য-ফলা มักเปลี่ยนเสียงสระเป็น แอ เช่น ব্যাঙ",
    "A য after a consonant becomes a hook on the right, called jo-fola. It often changes the vowel to “æ”, as in ব্যাঙ.",
  ]),
  conjunct("ny", "ন্য", "nn", "য-ফলা: น + য (อ่าน น ซ้อน)", "jo-fola on n (said as a double n)", [
    "เจอแล้วในคำว่า ধন্যবাদ อ่านว่า ดน-โน-บาด",
    "You've met it in ধন্যবাদ, read “dhon-no-bad”.",
  ]),
  conjunct("rj", "র্য", "rj", "রেফ: ร ที่อยู่บนหัว", "ref: an r written on top", [
    "ร ที่อยู่หน้าพยัญชนะอีกตัวจะขึ้นไปอยู่บนหัวเป็นขีดเล็ก ๆ เช่น সূর্য",
    "An r before another consonant moves up as a small mark on top, as in সূর্য.",
  ]),
];

export const numbers: CurriculumItem[] = [
  numeral("0", "০", "เลข 0", "the digit 0"),
  numeral("1", "১", "เลข 1", "the digit 1"),
  numeral("2", "২", "เลข 2", "the digit 2"),
  numeral("3", "৩", "เลข 3", "the digit 3"),
  numeral("4", "৪", "เลข 4", "the digit 4"),
  numeral("5", "৫", "เลข 5", "the digit 5"),
  numeral("6", "৬", "เลข 6", "the digit 6"),
  numeral("7", "৭", "เลข 7", "the digit 7"),
  numeral("8", "৮", "เลข 8", "the digit 8"),
  numeral("9", "৯", "เลข 9", "the digit 9"),
  numeral("10", "১০", "เลข 10", "the number 10"),
  word("shunno", "শূন্য", "shunno", "ศูนย์", "zero"),
  word("ek", "এক", "ek", "หนึ่ง", "one"),
  word("dui", "দুই", "dui", "สอง", "two"),
  word("tin", "তিন", "tin", "สาม", "three"),
  word("char", "চার", "char", "สี่", "four"),
  word("panch", "পাঁচ", "panch", "ห้า", "five"),
  word("chhoy", "ছয়", "chhoy", "หก", "six"),
  word("shat", "সাত", "shat", "เจ็ด", "seven"),
  word("at", "আট", "at", "แปด", "eight"),
  word("noy", "নয়", "noy", "เก้า", "nine"),
  word("dosh", "দশ", "dosh", "สิบ", "ten"),
];

// Example words for each letter, the way Bangladeshi alphabet books pair them.
export const letterWords: CurriculumItem[] = [
  word("ojogor", "অজগর", "ojogor", "งูเหลือม", "python"),
  word("idur", "ইঁদুর", "indur", "หนู", "mouse"),
  word("igol", "ঈগল", "igol", "นกอินทรี", "eagle"),
  word("ut", "উট", "ut", "อูฐ", "camel"),
  word("usha", "ঊষা", "usha", "รุ่งอรุณ", "dawn"),
  word("rishi", "ঋষি", "rishi", "ฤๅษี", "sage"),
  word("ektara", "একতারা", "ektara", "พิณสายเดียว", "one-stringed lute", {
    note: ["เครื่องดนตรีของนักร้องพื้นบ้านบาวล์", "The instrument of Baul folk singers."],
  }),
  word("oirabot", "ঐরাবত", "oirabot", "ช้างเอราวัณ", "Airavata, the white elephant", {
    note: ["ช้างตัวเดียวกับ “เอราวัณ” ของไทย", "The same elephant Thai people call Erawan."],
  }),
  word("ol", "ওল", "ol", "หัวบุก", "elephant-foot yam"),
  word("oushodh", "ঔষধ", "oushodh", "ยา", "medicine"),
  word("kola", "কলা", "kola", "กล้วย", "banana", {
    ...pic("banana", "กล้วยหนึ่งลูก", "A banana"),
    gloss: ["กล้วย", "bananas"],
  }),
  word("khorgosh", "খরগোশ", "khorgosh", "กระต่าย", "rabbit"),
  word("goru", "গরু", "goru", "วัว", "cow", pic("cow", "วัวหนึ่งตัว", "A cow")),
  word("ghori", "ঘড়ি", "ghori", "นาฬิกา", "clock"),
  word("byang", "ব্যাঙ", "byang", "กบ", "frog"),
  word("chand", "চাঁদ", "chand", "ดวงจันทร์", "moon", pic("moon", "พระจันทร์เสี้ยว", "A crescent moon")),
  word("chhata", "ছাতা", "chhata", "ร่ม", "umbrella"),
  word("jahaj", "জাহাজ", "jahaj", "เรือใหญ่", "ship"),
  word("jhor", "ঝড়", "jhor", "พายุ", "storm"),
  word("tometo", "টমেটো", "tometo", "มะเขือเทศ", "tomato"),
  word("thont", "ঠোঁট", "thont", "ริมฝีปาก", "lips"),
  word("dhol", "ঢোল", "dhol", "กลอง", "drum"),
  word("horin", "হরিণ", "horin", "กวาง", "deer"),
  word("tara-star", "তারা", "tara", "ดาว", "star"),
  word("thala", "থালা", "thala", "จาน", "plate"),
  word("doi", "দই", "doi", "โยเกิร์ต", "yogurt"),
  word("dhan", "ধান", "dhan", "ต้นข้าว", "rice plant"),
  word("nouka", "নৌকা", "nouka", "เรือ", "boat", pic("boat", "เรือไม้ลำเล็ก", "A small wooden boat")),
  word("pakhi", "পাখি", "pakhi", "นก", "bird", {
    ...pic("bird", "นกหนึ่งตัว", "A bird"),
    gloss: ["นก", "bird"],
  }),
  word("phul", "ফুল", "phul", "ดอกไม้", "flower", {
    ...pic("flower", "ดอกไม้สีแดง", "A red flower"),
    gloss: ["ดอกไม้", "flower"],
  }),
  word("ruti", "রুটি", "ruti", "โรตี (ขนมปังแผ่น)", "flatbread"),
  word("lau", "লাউ", "lau", "น้ำเต้า", "bottle gourd"),
  word("shapla", "শাপলা", "shapla", "ดอกบัวสาย", "water lily", {
    note: ["ดอกไม้ประจำชาติบังกลาเทศ", "Bangladesh's national flower."],
  }),
  word("shar", "ষাঁড়", "shar", "วัวตัวผู้", "bull"),
  word("shurjo", "সূর্য", "shurjo", "ดวงอาทิตย์", "sun"),
  word("hash", "হাঁস", "hash", "เป็ด", "duck", pic("duck", "เป็ดหนึ่งตัว", "A duck")),
  word("pahar", "পাহাড়", "pahar", "ภูเขา", "hill"),
  word("moyur", "ময়ূর", "moyur", "นกยูง", "peacock"),
  word("utshob", "উৎসব", "utshob", "งานเทศกาล", "festival"),
  word("rong", "রং", "rong", "สี", "colour"),
  word("dukkho", "দুঃখ", "dukkho", "ความเศร้า", "sadness"),
];

// Words that show each vowel sign and joined letter in use.
export const spellingWords: CurriculumItem[] = [
  word("nodi", "নদী", "nodi", "แม่น้ำ", "river", {
    note: ["บังกลาเทศมีแม่น้ำหลายร้อยสาย", "Bangladesh has hundreds of rivers."],
  }),
  word("megh", "মেঘ", "megh", "เมฆ", "cloud"),
  word("krishok", "কৃষক", "krishok", "ชาวนา", "farmer"),
  word("boishakh", "বৈশাখ", "boishakh", "เดือนไบศาข", "Boishakh (first month)", {
    note: [
      "เดือนแรกของปีเบงกาลี วันปีใหม่ পহেলা বৈশাখ ตรงกับช่วงสงกรานต์ของไทย",
      "The first month of the Bengali year. New Year, পহেলা বৈশাখ, falls around Thai Songkran.",
    ],
  }),
  word("dokan", "দোকান", "dokan", "ร้านค้า", "shop"),
  word("moumachhi", "মৌমাছি", "moumachhi", "ผึ้ง", "bee"),
  word("school", "স্কুল", "skul", "โรงเรียน", "school"),
  word("rasta", "রাস্তা", "rasta", "ถนน", "road"),
  word("panta", "পান্তা", "panta", "ข้าวแช่น้ำ", "soaked rice", {
    note: ["อาหารเช้าวันปีใหม่ পহেলা বৈশাখ", "A traditional breakfast on Bengali New Year."],
  }),
  word("khir", "ক্ষীর", "khir", "ข้าวต้มนมหวาน", "rice pudding"),
  word("projapoti", "প্রজাপতি", "projapoti", "ผีเสื้อ", "butterfly"),
];

export const vocabulary: CurriculumItem[] = [
  // Family
  word("ma", "মা", "ma", "แม่", "mother"),
  word("baba", "বাবা", "baba", "พ่อ", "father"),
  word("bhai", "ভাই", "bhai", "พี่ชาย / น้องชาย", "brother"),
  word("bon", "বোন", "bon", "พี่สาว / น้องสาว", "sister", {
    note: ["ภาษาเบงกาลีใช้คำเดียวทั้งพี่และน้อง", "Bengali uses one word for older and younger sister."],
  }),

  // Food
  word("aam", "আম", "aam", "มะม่วง", "mango", {
    ...pic("mango", "มะม่วงสีเหลืองหนึ่งลูก", "One yellow mango"),
    note: ["มะม่วงเป็นผลไม้ที่คนบังกลาเทศรักมาก", "Mangoes are a much-loved fruit in Bangladesh."],
    gloss: ["มะม่วง", "mangoes"],
  }),
  word("bhat", "ভাত", "bhat", "ข้าว (ข้าวสวย)", "rice (cooked)", {
    ...pic("rice", "ข้าวสวยในชาม", "A bowl of cooked rice"),
    gloss: ["ข้าว", "rice"],
  }),
  word("mach", "মাছ", "machh", "ปลา", "fish", {
    ...pic("fish", "ปลาหนึ่งตัว", "A fish"),
    note: ["ข้าวกับปลาคืออาหารประจำบ้านของคนบังกลาเทศ", "Rice and fish is the everyday meal in Bangladesh."],
    gloss: ["ปลา", "fish"],
  }),
  word("dim", "ডিম", "dim", "ไข่", "egg", { ...pic("egg", "ไข่หนึ่งฟอง", "An egg"), gloss: ["ไข่", "eggs"] }),
  word("pani", "পানি", "pani", "น้ำ (น้ำดื่ม)", "water (to drink)", {
    ...pic("water", "น้ำหนึ่งแก้ว", "A glass of water"),
    note: ["ในบังกลาเทศ คนส่วนใหญ่พูดว่า পানি", "Most people in Bangladesh say পানি for water."],
  }),
  word("dudh", "দুধ", "dudh", "นม", "milk", pic("milk", "นมหนึ่งแก้ว", "A glass of milk")),

  // Home and school
  word("boi", "বই", "boi", "หนังสือ", "book", {
    ...pic("book", "หนังสือเปิดอยู่หนึ่งเล่ม", "An open book"),
    gloss: ["หนังสือ", "book"],
  }),
  word("kolom", "কলম", "kolom", "ปากกา", "pen", {
    ...pic("pen", "ปากกาหนึ่งด้าม", "A pen"),
    gloss: ["ปากกา", "pen"],
  }),
  word(
    "bari",
    "বাড়ি",
    "bari",
    "บ้าน",
    "house, home",
    pic("house", "บ้านหลังเล็กมีหลังคา", "A small house with a roof"),
  ),
  word("gach", "গাছ", "gachh", "ต้นไม้", "tree", pic("tree", "ต้นไม้ใบเขียวหนึ่งต้น", "A green tree")),
  word("bol", "বল", "bol", "ลูกบอล", "ball", {
    ...pic("ball", "ลูกบอลหนึ่งลูก", "A ball"),
    gloss: ["บอล", "ball"],
  }),

  // Animals
  word("biral", "বিড়াল", "biral", "แมว", "cat", {
    ...pic("cat", "แมวนั่งอยู่หนึ่งตัว", "A cat sitting down"),
    gloss: ["แมว", "cat"],
  }),
  word("kukur", "কুকুর", "kukur", "สุนัข", "dog", pic("dog", "สุนัขหนึ่งตัว", "A dog")),

  // Colours and sizes
  word("lal", "লাল", "lal", "สีแดง", "red", {
    ...pic("red", "สีแดง", "The colour red"),
    gloss: ["สีแดง", "red"],
  }),
  word("nil", "নীল", "nil", "สีน้ำเงิน", "blue", {
    ...pic("blue", "สีน้ำเงิน", "The colour blue"),
    gloss: ["สีน้ำเงิน", "blue"],
  }),
  word("sobuj", "সবুজ", "shobuj", "สีเขียว", "green", {
    ...pic("green", "สีเขียว", "The colour green"),
    gloss: ["สีเขียว", "green"],
  }),
  word("holud", "হলুদ", "holud", "สีเหลือง", "yellow", {
    ...pic("yellow", "สีเหลือง", "The colour yellow"),
    gloss: ["สีเหลือง", "yellow"],
  }),
  word("sada", "সাদা", "shada", "สีขาว", "white", {
    ...pic("white", "สีขาว", "The colour white"),
    gloss: ["สีขาว", "white"],
  }),
  word("kalo", "কালো", "kalo", "สีดำ", "black", {
    ...pic("black", "สีดำ", "The colour black"),
    gloss: ["สีดำ", "black"],
  }),
  word("boro", "বড়", "boro", "ใหญ่", "big", { gloss: ["ใหญ่", "big"] }),
  word("chhoto", "ছোট", "chhoto", "เล็ก", "small", { gloss: ["เล็ก", "small"] }),
  word("akash", "আকাশ", "akash", "ท้องฟ้า", "sky"),
];

export const grammarWords: CurriculumItem[] = [
  // People
  word("ami", "আমি", "ami", "ฉัน", "I", { gloss: ["ฉัน", "I"] }),
  word("tumi", "তুমি", "tumi", "เธอ (กับเพื่อน)", "you (friends, family)", {
    gloss: ["เธอ", "You"],
    note: ["ใช้กับเพื่อนและคนในครอบครัว", "Used with friends and family."],
  }),
  word("apni", "আপনি", "apni", "คุณ (สุภาพ)", "you (polite)", {
    gloss: ["คุณ", "You"],
    note: ["ใช้กับผู้ใหญ่และครู", "Used with grown-ups and teachers."],
  }),
  word("se", "সে", "she", "เขา (ผู้ชายหรือผู้หญิงก็ได้)", "he or she", {
    gloss: ["เขา", "He/She"],
    note: [
      "ภาษาเบงกาลีไม่แยกเพศ เหมือนคำว่า “เขา” ในภาษาไทย",
      "Bengali doesn't mark gender, so সে means he or she, just like Thai เขา.",
    ],
  }),
  word("amra", "আমরা", "amra", "พวกเรา", "we", { gloss: ["พวกเรา", "We"] }),
  word("tara", "তারা", "tara", "พวกเขา", "they", { gloss: ["พวกเขา", "They"] }),

  // Verbs: one form per person
  word("khai", "খাই", "khai", "กิน (ฉัน/พวกเรา)", "eat (I, we)", {
    gloss: ["กิน", "eat"],
    note: ["คำกริยามักอยู่ท้ายประโยค", "The verb usually comes at the end of the sentence."],
  }),
  word("khao", "খাও", "khao", "กิน (เธอ)", "eat (you, friendly)", { gloss: ["กิน", "eat"] }),
  word("khay", "খায়", "khay", "กิน (เขา)", "eats (he, she)", { gloss: ["กิน", "eats"] }),
  word("khan", "খান", "khan", "กิน (คุณ)", "eat (you, polite)", { gloss: ["กิน", "eat"] }),
  word("pori", "পড়ি", "pori", "อ่าน (ฉัน)", "read (I, we)", { gloss: ["อ่าน", "read"] }),
  word("poro", "পড়ো", "poro", "อ่าน (เธอ)", "read (you)", { gloss: ["อ่าน", "read"] }),
  word("pore", "পড়ে", "pore", "อ่าน (เขา)", "reads (he, she)", { gloss: ["อ่าน", "reads"] }),
  word("jai", "যাই", "jai", "ไป (ฉัน)", "go (I, we)", { gloss: ["ไป", "go"] }),
  word("jao", "যাও", "jao", "ไป (เธอ)", "go (you)", { gloss: ["ไป", "go"] }),
  word("jay", "যায়", "jay", "ไป (เขา)", "goes (he, she)", { gloss: ["ไป", "goes"] }),
  word("kheli", "খেলি", "kheli", "เล่น (ฉัน)", "play (I, we)", { gloss: ["เล่น", "play"] }),
  word("khele", "খেলে", "khele", "เล่น (เขา)", "plays (he, she)", { gloss: ["เล่น", "plays"] }),

  // Places
  word("skule", "স্কুলে", "skule", "ไปโรงเรียน / ที่โรงเรียน", "to school, at school", {
    gloss: ["โรงเรียน", "to school"],
    note: ["-এ ท้ายคำแปลว่า “ที่” หรือ “ไปยัง”", "The ending -এ means “at” or “to”."],
  }),
  word("barite", "বাড়িতে", "barite", "ที่บ้าน / กลับบ้าน", "at home, home", { gloss: ["บ้าน", "home"] }),
  word("bajare", "বাজারে", "bajare", "ไปตลาด / ที่ตลาด", "to the market", {
    gloss: ["ตลาด", "to the market"],
  }),

  // Little words
  word("eta", "এটা", "eta", "นี่ (อันนี้)", "this", { gloss: ["นี่", "This"] }),
  word("ota", "ওটা", "ota", "นั่น (อันนั้น)", "that", { gloss: ["นั่น", "That"] }),
  word("ekta", "একটা", "ekta", "หนึ่ง (อัน/ตัว)", "a, one", {
    gloss: ["หนึ่ง", "a"],
    note: [
      "-টা เป็นลักษณนาม คล้าย “อัน” “ตัว” “ลูก” ในภาษาไทย",
      "-টা is a counter word, like Thai อัน, ตัว or ลูก.",
    ],
  }),
  word("ki-what", "কী", "ki", "อะไร", "what"),
  word("ki-question", "কি", "ki", "ไหม (คำถาม ใช่/ไม่ใช่)", "question word for yes/no", {
    note: [
      "কি (สระสั้น) ใช้ถาม ใช่ไหม ส่วน কী (สระยาว) แปลว่า อะไร",
      "কি with a short i makes a yes/no question; কী with a long i means “what”.",
    ],
  }),
  word("na", "না", "na", "ไม่", "not, no", {
    note: ["ใส่ না ไว้หลังคำกริยา", "না goes after the verb."],
  }),
  word("hya", "হ্যাঁ", "hya", "ใช่", "yes"),
  word("kothay", "কোথায়", "kothay", "ที่ไหน", "where"),
  word("amar", "আমার", "amar", "ของฉัน", "my", { gloss: ["ฉัน", "I have"] }),
  word("tomar", "তোমার", "tomar", "ของเธอ", "your", { gloss: ["เธอ", "You have"] }),
  word("achhe", "আছে", "achhe", "มี / อยู่", "there is, has", {
    gloss: ["มี", "have"],
    note: ["আমার ... আছে แปลว่า “ฉันมี ...”", "আমার ... আছে means “I have ...”."],
  }),

  // Nouns with -টা, "the ..."
  word("phulta", "ফুলটা", "phulta", "ดอกไม้ (ดอกนั้น)", "the flower", { gloss: ["ดอกไม้", "The flower"] }),
  word("bolta", "বলটা", "bolta", "ลูกบอล (ลูกนั้น)", "the ball", { gloss: ["ลูกบอล", "The ball"] }),
  word("pakhita", "পাখিটা", "pakhita", "นก (ตัวนั้น)", "the bird", { gloss: ["นก", "The bird"] }),
  word("biralta", "বিড়ালটা", "biralta", "แมว (ตัวนั้น)", "the cat", { gloss: ["แมว", "The cat"] }),
];

export const phrases: CurriculumItem[] = [
  phrase("kemon-acho", "কেমন আছো?", "kemon achho?", "สบายดีไหม", "How are you?", {
    note: ["ใช้ถามเพื่อนหรือคนในครอบครัว", "Used with friends and family."],
    difficulty: 2,
  }),
  phrase("bhalo-achi", "ভালো আছি", "bhalo achhi", "สบายดี", "I'm fine", {
    note: ["ใช้ตอบเมื่อมีคนถามว่า কেমন আছো?", "The answer when someone asks কেমন আছো?"],
    difficulty: 2,
  }),
  phrase("dhonnobad", "ধন্যবাদ", "dhonnobad", "ขอบคุณ", "thank you", { difficulty: 2 }),
  phrase("abar-dekha-hobe", "আবার দেখা হবে", "abar dekha hobe", "แล้วพบกันใหม่", "see you again", {
    difficulty: 2,
  }),
  phrase("tomar-nam-ki", "তোমার নাম কী?", "tomar nam ki?", "เธอชื่ออะไร", "What's your name?"),
  phrase("amar-nam-rina", "আমার নাম রিনা", "amar nam rina", "ฉันชื่อรีนา", "My name is Rina"),

  phrase("ami-bhat-khai", "আমি ভাত খাই", "ami bhat khai", "ฉันกินข้าว", "I eat rice", {
    note: ["เรียงคำเป็น ฉัน + ข้าว + กิน", "The word order is I + rice + eat."],
  }),
  phrase("tumi-bhat-khao", "তুমি ভাত খাও", "tumi bhat khao", "เธอกินข้าว", "You eat rice"),
  phrase("se-bhat-khay", "সে ভাত খায়", "she bhat khay", "เขากินข้าว", "He/She eats rice"),
  phrase("ami-aam-khai", "আমি আম খাই", "ami aam khai", "ฉันกินมะม่วง", "I eat mangoes"),
  phrase("ami-boi-pori", "আমি বই পড়ি", "ami boi pori", "ฉันอ่านหนังสือ", "I read a book"),
  phrase("se-boi-pore", "সে বই পড়ে", "she boi pore", "เขาอ่านหนังสือ", "He/She reads a book"),
  phrase("ami-skule-jai", "আমি স্কুলে যাই", "ami skule jai", "ฉันไปโรงเรียน", "I go to school"),
  phrase("se-skule-jay", "সে স্কুলে যায়", "she skule jay", "เขาไปโรงเรียน", "He/She goes to school"),
  phrase("amra-bol-kheli", "আমরা বল খেলি", "amra bol kheli", "พวกเราเล่นบอล", "We play ball"),

  phrase("eta-ki", "এটা কী?", "eta ki?", "นี่คืออะไร", "What is this?"),
  phrase("eta-ekta-boi", "এটা একটা বই", "eta ekta boi", "นี่คือหนังสือ", "This is a book"),
  phrase("ota-ekta-pakhi", "ওটা একটা পাখি", "ota ekta pakhi", "นั่นคือนก", "That is a bird"),
  phrase("eta-ekta-phul", "এটা একটা ফুল", "eta ekta phul", "นี่คือดอกไม้", "This is a flower"),

  phrase("ami-mach-khai-na", "আমি মাছ খাই না", "ami machh khai na", "ฉันไม่กินปลา", "I don't eat fish"),
  phrase(
    "se-dudh-khay-na",
    "সে দুধ খায় না",
    "she dudh khay na",
    "เขาไม่ดื่มนม",
    "He/She doesn't drink milk",
    {
      note: ["ภาษาเบงกาลีใช้ খাওয়া (กิน) กับนมและน้ำด้วย", "Bengali uses “eat” for milk and water too."],
    },
  ),
  phrase(
    "ami-skule-jai-na",
    "আমি স্কুলে যাই না",
    "ami skule jai na",
    "ฉันไม่ไปโรงเรียน",
    "I don't go to school",
  ),

  phrase("tumi-ki-bhat-khao", "তুমি কি ভাত খাও?", "tumi ki bhat khao?", "เธอกินข้าวไหม", "Do you eat rice?"),
  phrase(
    "hya-ami-bhat-khai",
    "হ্যাঁ, আমি ভাত খাই",
    "hya, ami bhat khai",
    "ใช่ ฉันกินข้าว",
    "Yes, I eat rice",
  ),
  phrase("biralta-kothay", "বিড়ালটা কোথায়?", "biralta kothay?", "แมวอยู่ที่ไหน", "Where is the cat?"),
  phrase("biralta-barite", "বিড়ালটা বাড়িতে", "biralta barite", "แมวอยู่ที่บ้าน", "The cat is at home"),

  phrase(
    "amar-ekta-lal-bol-achhe",
    "আমার একটা লাল বল আছে",
    "amar ekta lal bol achhe",
    "ฉันมีลูกบอลสีแดง",
    "I have a red ball",
  ),
  phrase(
    "tomar-ki-boi-achhe",
    "তোমার কি বই আছে?",
    "tomar ki boi achhe?",
    "เธอมีหนังสือไหม",
    "Do you have a book?",
  ),
  phrase("phulta-lal", "ফুলটা লাল", "phulta lal", "ดอกไม้สีแดง", "The flower is red", {
    note: ["ไม่ต้องมีคำว่า “เป็น” เหมือนภาษาไทยเลย", "No word for “is” is needed, just like in Thai."],
  }),
  phrase("akash-nil", "আকাশ নীল", "akash nil", "ท้องฟ้าสีน้ำเงิน", "The sky is blue"),
  phrase("biralta-chhoto", "বিড়ালটা ছোট", "biralta chhoto", "แมวตัวเล็ก", "The cat is small"),

  // Rina's day: the reading chapter
  phrase("story-1", "এটা রিনা", "eta rina", "นี่คือรีนา", "This is Rina"),
  phrase(
    "story-2",
    "রিনা সকালে ভাত খায়",
    "rina shokale bhat khay",
    "รีนากินข้าวตอนเช้า",
    "Rina eats rice in the morning",
  ),
  phrase(
    "story-3",
    "তারপর সে স্কুলে যায়",
    "tarpor she skule jay",
    "จากนั้นเธอไปโรงเรียน",
    "Then she goes to school",
  ),
  phrase(
    "story-4",
    "স্কুলে সে বই পড়ে",
    "skule she boi pore",
    "ที่โรงเรียนเธออ่านหนังสือ",
    "At school she reads books",
  ),
  phrase(
    "story-5",
    "বিকেলে সে বল খেলে",
    "bikele she bol khele",
    "ตอนบ่ายเธอเล่นบอล",
    "In the afternoon she plays ball",
  ),
];

export const bnItems: CurriculumItem[] = [
  ...vowels,
  ...consonants,
  ...signs,
  ...syllables,
  ...joinedLetters,
  ...numbers,
  ...letterWords,
  ...spellingWords,
  ...vocabulary,
  ...grammarWords,
  ...phrases,
];
