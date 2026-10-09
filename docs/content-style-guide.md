# Content style guide

How to write and correct the explanations so the whole poem reads as one voice. Content is licensed
[CC BY-SA 4.0](../LICENSE-CONTENT.md).

## The goal

A reader meets a verse in the original Elu, then reads *what it means*. The explanation should let them feel the
verse, not decode it word by word. If someone reads our explanation and then the original again, the original should
make more sense, and move them more.

## Each verse has

| Field | Language | What it is |
| --- | --- | --- |
| `si` | modern Sinhala | the meaning in everyday, respectful Sinhala |
| `en` | English | the same meaning in clear, natural English |
| `note` (optional) | both | real context: history, a place, a custom, a story |

## Writing the meaning (`si` and `en`)

1. **Say the meaning, not the grammar.** Translate the picture and the feeling. "Waists so slender a fist could
   circle them" beats "waists able to be grasped by a fist".
2. **Keep it short.** Usually 25 to 55 words. One breath of reading.
3. **Keep the speaker.** Much of the poem is the poet speaking to the bird: "look", "go", "worship", "tell him". Keep
   that voice (imperative and warm) instead of turning it into a report.
4. **Keep the images.** The poet compares women to golden creepers and a river to a silk garment. Do not flatten
   them. Do not add images the verse does not contain.
5. **Do not pad.** No "In this verse, the poet says...". No opinions about quality.
6. **Names and places:** use the form people know: Kelaniya, Kotte (Jayawardhanapura), Vibhishana, Samanalakanda
   (Adam's Peak). Give the Sinhala name in `si` and the common English name in `en`.
7. **Do not guess silently.** If a line or a word is unclear, say so, briefly, in the text.

## Sinhala (`si`)

- Modern written Sinhala (*lipi* register), not Elu and not colloquial speech.
- Prefer common words over Sanskritised ones when both are natural.
- Use "ය" or "යි" endings consistently; avoid mixing registers in one sentence.
- Write the Sinhala conjuncts and the zero-width joiner correctly (පුත්‍ර, ශ්‍රී, ක්‍ෂ). Paste from a Sinhala keyboard
  rather than retyping from a screenshot.

## English (`en`)

- Plain, warm, slightly literary. Not archaic ("thee", "thou") and not slangy.
- Short sentences are fine. Keep line-like rhythm where the verse has it.
- Spell Sinhala terms as they are commonly romanised, and explain a term once in `note` if it needs it.

## Notes (`note`)

- Only for context that genuinely helps: why a place matters, what a custom was, which story a verse echoes.
- State only what you are confident of. If you can point to a source, mention it in your pull request.
- Keep each note to one or two sentences per language.

## "General sense" verses

A verse listed in `APPROXIMATE` (in `src/data/index.ts`) shows a notice that the explanation conveys the overall
meaning, not a close rendering. Use it when the verse is dense with wordplay, damaged in the source, or genuinely
obscure.

- **Add** a verse to `APPROXIMATE` if you are not confident of the explanation.
- **Remove** one only when you are confident, and say in the pull request how you checked.

## The original text (`poem.json`)

- Change it only to fix a transcription error, and **cite the edition or manuscript** you compared with.
- Do not "modernise" spelling. The text is Elu and should stay Elu.
- Verse 1 is incomplete in our source; completing it from a reliable edition would be a very welcome contribution.

## Copyright

- Write your own explanation. **Do not copy or closely paraphrase** a printed commentary (*sannaya*), a school guide
  or someone's published translation, because they are copyrighted even though the poem is not.
- You can read them to understand a verse; then close the book and write in your own words.
- If a source helped, say so in the pull request description (not in the verse text).
