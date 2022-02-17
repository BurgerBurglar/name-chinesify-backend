import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import useSWRImmutable from "swr/immutable";
import CharSelect from "../components/CharSelect";
import NameForm from "../components/NameForm";
import { getMingOptions, getXingOptions } from "../fetch";
import { useClipboard } from "../hooks/useClipBoard";
import { Inputs } from "../types";
import { INITIAL_MING_OPTIONS, INITIAL_XING_OPTIONS } from "../utils/constants";
import playAudioFiles from "../utils/playAudioFiles";

const Home: NextPage = () => {
  const { register, handleSubmit, watch } = useForm<Inputs>({
    defaultValues: {
      givenName: "Chandan",
      familyName: "Amonkar",
      gender: "m",
    },
  });

  const { givenName, familyName, gender }: Inputs = watch();

  const [error, setError] = useState<string>("");

  const { data: mingOptions, mutate: mutateMingOptions } = useSWRImmutable(
    "ming",
    () => getMingOptions(givenName, { gender }),
    {
      fallbackData: INITIAL_MING_OPTIONS,
      onError: ({ message }) => setError(message),
      shouldRetryOnError: false,
    }
  );
  const { data: xingOptions, mutate: mutateXingOptions } = useSWRImmutable(
    "xing",
    () => getXingOptions(familyName),
    {
      fallbackData: INITIAL_XING_OPTIONS,
      onError: ({ message }) => setError(message),
      shouldRetryOnError: false,
    }
  );

  const [selectedIndices, setSelectedIndices] = useState([0, 0, 0]);

  const setSelectedIndex = (selectIndex: number, charIndex: number) => {
    setSelectedIndices((prev) => {
      const duplication = [...prev];
      duplication[charIndex] = selectIndex;
      return duplication;
    });
  };

  const selectedName = [
    xingOptions![selectedIndices[0]],
    mingOptions![0][selectedIndices[1]],
    mingOptions![1][selectedIndices[2]],
  ];

  const fullname = selectedName.map((charDetail) => charDetail?.char).join("");

  const pronunciations =
    typeof Audio === "undefined"
      ? []
      : selectedName.map((char) => {
          const audio = new Audio(char?.pronunciation);
          audio.playbackRate = 2;
          return audio;
        });

  const { onCopy } = useClipboard(fullname);

  const onSubmit: SubmitHandler<Inputs> = async () => {
    setError("");

    mutateMingOptions();
    mutateXingOptions();

    setSelectedIndices([0, 0, 0]);
  };

  const onPlay = () => playAudioFiles(pronunciations);

  const shouldDisplayName =
    error.length === 0 && xingOptions!.length > 0 && mingOptions!.length > 0;

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full max-w-sm h-full flex justify-center items-start pt-5 px-4 mx-auto">
        <div className="flex flex-col gap-5 justify-between items-center w-full">
          <NameForm
            register={register}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
          <div className="text-red-600">{error}</div>
          {shouldDisplayName && (
            <div className="flex flex-col gap-3 items-center">
              <div className="flex gap-2">
                <CharSelect
                  chars={xingOptions!}
                  isXing
                  selectIndex={selectedIndices[0]}
                  setSelectIndex={(selectIndex) =>
                    setSelectedIndex(selectIndex, 0)
                  }
                />
                <CharSelect
                  chars={mingOptions![0]}
                  selectIndex={selectedIndices[1]}
                  setSelectIndex={(selectIndex) =>
                    setSelectedIndex(selectIndex, 1)
                  }
                />
                <CharSelect
                  chars={mingOptions![1]}
                  selectIndex={selectedIndices[2]}
                  setSelectIndex={(selectIndex) =>
                    setSelectedIndex(selectIndex, 2)
                  }
                />
              </div>
              <div className="flex gap-3 justify-center w-full">
                <button
                  className="rounded-full bg-sky-200 hover:bg-sky-300 text-sky-800 text-md w-fit px-4 py-1"
                  onClick={onCopy}
                >
                  copy
                </button>
                <button
                  className="rounded-full bg-sky-200 hover:bg-sky-300 text-sky-800 text-md w-fit px-4 py-1"
                  onClick={onPlay}
                >
                  pronounce
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
