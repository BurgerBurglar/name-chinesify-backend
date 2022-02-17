import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CharSelect from "../components/CharSelect";
import { getMingOptions, getXingOptions } from "../fetch";
import { useClipboard } from "../hooks/useClipBoard";
import { CharDetails, Inputs } from "../types";
import playAudioFiles from "../utils/playAudioFiles";

const Home: NextPage = () => {
  const { register, handleSubmit } = useForm<Inputs>();

  const [mingOptions, setMingOptions] = useState<
    [CharDetails[], CharDetails[]]
  >([[], []]);
  const [xingOptions, setXingOptions] = useState<CharDetails[]>([]);

  const [selectedIndices, setSelectedIndices] = useState([0, 0, 0]);

  const setSelectedIndex = (selectIndex: number, charIndex: number) => {
    setSelectedIndices((prev) => {
      const duplication = [...prev];
      duplication[charIndex] = selectIndex;
      return duplication;
    });
  };

  const selectedName = [
    xingOptions[selectedIndices[0]],
    mingOptions[0][selectedIndices[1]],
    mingOptions[1][selectedIndices[2]],
  ];

  const fullname = selectedName.map((char) => char?.char).join("");

  const pronunciations =
    typeof Audio === "undefined"
      ? []
      : selectedName.map((char) => {
          const audio = new Audio(char?.pronunciation);
          audio.playbackRate = 2;
          return audio;
        });

  const { hasCopied, onCopy } = useClipboard(fullname);

  const onSubmit: SubmitHandler<Inputs> = async ({
    givenName,
    familyName,
    gender,
  }) => {
    const newMingOptions = await getMingOptions(givenName, { gender });
    setMingOptions(newMingOptions);

    const newXingOptions = await getXingOptions(familyName);
    setXingOptions(newXingOptions);

    setSelectedIndices([0, 0, 0]);
  };

  const onPlay = () => playAudioFiles(pronunciations);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="items-center max-w-lg mx-auto">
        <form className="flex flex-col gap-2" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col justify-between w-full">
            <label htmlFor="given-name">Given Name</label>
            <input
              id="given-name"
              className="text-3xl outline outline-1 outline-gray-200 text-red-800"
              type="text"
              required
              {...register("givenName", { required: true })}
            />
          </div>
          <div className="flex flex-col justify-between w-full">
            <label htmlFor="family-name">Family Name</label>
            <input
              id="family-name"
              className="text-3xl outline outline-1 outline-gray-200 text-green-800"
              type="text"
              required
              {...register("familyName", { required: true })}
            />
          </div>
          <fieldset id="gender" className="flex gap-2 items-center">
            <input type="radio" id="Male" value="m" {...register("gender")} />
            <label htmlFor="Male">Male</label>
            <input type="radio" id="Female" value="f" {...register("gender")} />
            <label htmlFor="Female">Female</label>
          </fieldset>
          <button className="rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xl w-fit px-2 py-1">
            generate
          </button>
        </form>
        <div className="flex gap-2">
          <CharSelect
            chars={xingOptions}
            isXing
            selectIndex={selectedIndices[0]}
            setSelectIndex={(selectIndex) => setSelectedIndex(selectIndex, 0)}
          />
          <CharSelect
            chars={mingOptions[0]}
            selectIndex={selectedIndices[1]}
            setSelectIndex={(selectIndex) => setSelectedIndex(selectIndex, 1)}
          />
          <CharSelect
            chars={mingOptions[1]}
            selectIndex={selectedIndices[2]}
            setSelectIndex={(selectIndex) => setSelectedIndex(selectIndex, 2)}
          />
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-md bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xl w-fit px-2 py-1"
            onClick={onCopy}
          >
            {hasCopied ? "Copied" : "Copy"}
          </button>
          <button
            className="rounded-md bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-black text-xl w-fit px-2 py-1"
            onClick={onPlay}
          >
            Pronounce
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
