import { EmojiEntity, parse } from "twemoji-parser";

/*
 * Split Text
 * ex)
 *  '君👼の味方🤝だよ'
 *  > ['君', TwemojiObj(👼), 'の味方', TwemojiObj(🤝), 'だよ']
 */

const discordEmojiPattern = "<a?:\\w+:(\\d{17,19})>";

function parseDiscordEmojis(textEntities: (string | EmojiEntity)[]) {
  const newTextEntities = [];

  for (const entity of textEntities) {
    if (typeof entity === "string")
      for (const word of entity
        .replace(new RegExp(discordEmojiPattern, "g"), "\u200b$&\u200b")
        .split("\u200b")) {
        const match = word.match(new RegExp(discordEmojiPattern));
        newTextEntities.push(
          match
            ? { url: `https://cdn.discordapp.com/emojis/${match[1]}.png` }
            : word
        );
      }
    else newTextEntities.push(entity);
  }

  return newTextEntities;
}

export function splitEntitiesFromText(text: string) {
  // \ufe0f が含が含まれる場合にエラーになるので除去
  text = text.replace(/\ufe0f/g, "");

  const twemojiEntities = parse(text, {
    assetType: "png",
    buildUrl: (codepoints, assetType) =>
      `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/72x72/${codepoints}.${assetType}`,
  });

  let unparsedText = text;
  let lastTwemojiIndice = 0;
  const textEntities = [];

  twemojiEntities.forEach((twemoji) => {
    textEntities.push(
      unparsedText.slice(0, twemoji.indices[0] - lastTwemojiIndice)
    );

    textEntities.push(twemoji);

    unparsedText = unparsedText.slice(twemoji.indices[1] - lastTwemojiIndice);
    lastTwemojiIndice = twemoji.indices[1];
  });

  textEntities.push(unparsedText);

  return parseDiscordEmojis(textEntities);
}
