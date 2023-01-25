import { readFile } from "fs/promises";
import neatCsv from "neat-csv";
import p from "pinyin";
import { IPinyinMode } from "pinyin/lib/declare";
import { CharDetails, Gender, MingResult, MingRow, XingRow } from "../types";

const xingsRaw = await readFile("./data/xings.csv", { encoding: "utf-8" });
const xingRows = await neatCsv<XingRow>(xingsRaw);

const mingsRaw = await readFile("./data/ming_chars.csv", { encoding: "utf-8" });
const mingRows = await neatCsv<MingRow>(mingsRaw);

const getPronunciation = (pinyinTone: string) => {
  const pinyinToneNumber = p(pinyinTone, { style: "TO3NE" });
  return `https://github.com/shikangkai/Chinese-Pinyin-Audio/blob/master/Pinyin-Female/${pinyinToneNumber}.mp3?raw=true`;
};

const getPinyins = (chars: string, mode: IPinyinMode) =>
  p(chars, { style: "normal", mode }).map((el) => el[0]);

export const beautifyMing = (originalMing: string, gender: Gender) => {
  const twoCharMing =
    originalMing.length === 1
      ? originalMing.repeat(2)
      : originalMing.slice(0, 2);

  const pinyins = getPinyins(twoCharMing, "NORMAL");

  const filteredMingRows = [
    mingRows
      .filter(
        ({ pinyin, position, gender: genderFromFile }) =>
          position === "1" && pinyin === pinyins[0] && gender === genderFromFile
      )
      .slice(0, 5),
    mingRows
      .filter(
        ({ pinyin, position, gender: genderFromFile }) =>
          position === "2" && pinyin === pinyins[1] && gender === genderFromFile
      )
      .slice(0, 5),
  ] as [MingRow[], MingRow[]];

  const beautifiedMing = filteredMingRows.map((rows) =>
    rows.map(({ char, pinyin_tone }) => ({
      char,
      pinyin: pinyin_tone,
      pronunciation: getPronunciation(pinyin_tone),
    }))
  ) as MingResult;

  return beautifiedMing;
};

export const beautifyXing = (
  originalXing: string,
  position = 0
): CharDetails[] => {
  if (originalXing.length === 0)
    throw new Error("I don't know how to pronunce this name :/");

  const pinyin = getPinyins(originalXing[position], "SURNAME")[0];
  console.log(pinyin);
  const filteredXingRows = xingRows
    .filter(({ pinyin: pinyinFromFile }) => pinyin === pinyinFromFile)
    .slice(0, 5);
  const beautifiedXing = filteredXingRows.map(({ xing, pinyin_tone }) => ({
    char: xing,
    pinyin: pinyin_tone,
    pronunciation: getPronunciation(pinyin_tone),
  })) as CharDetails[];

  if (beautifiedXing.length === 0) {
    // We can't find a good xing
    if (position !== originalXing.length - 1) {
      // We haven't used all of our options here, move to next char
      return beautifyXing(originalXing, position + 1);
    } else {
      // We already got the end of the name, so go back to the first
      const char = originalXing[0];
      const pinyin = getPinyins(char, "SURNAME")[0];
      return [{ char, pinyin, pronunciation: getPronunciation(pinyin) }];
    }
  }
  return beautifiedXing;
};
