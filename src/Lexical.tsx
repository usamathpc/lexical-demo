import { $getRoot, $getSelection, EditorState, LexicalEditor } from "lexical";
import { useEffect, useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import axios from "axios";

const theme = {
  // Theme styling goes here
  // ...
};

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(
  editorState: EditorState,
  editor: LexicalEditor,
  setEnteredText,
  setTransliteratedArray
) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    if (root.__cachedText) {
      const arrayOfWords = root.__cachedText.match(/\b(\w+)\b/g);

      if (!arrayOfWords) {
        return;
      }

      setEnteredText(arrayOfWords[arrayOfWords.length - 1]);

      console.log(arrayOfWords[arrayOfWords.length - 1], selection);
    }
  });
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error) {
  console.error(error);
}

function Editor() {
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
  };

  const [enteredText, setEnteredText] = useState<string | null>();
  const [transliteratedArray, setTransliteratedArray] = useState<string[]>();

  useEffect(() => {
    if (enteredText) {
      axios
        .get(
          `https://inputtools.google.com/request?text=${enteredText}&itc=ml-t-i0-und&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8`
        )
        .then((response) => {
          setTransliteratedArray(response.data[1][0][1]);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [enteredText]);

  return (
    <>
      <LexicalComposer initialConfig={initialConfig}>
        <PlainTextPlugin
          contentEditable={<ContentEditable />}
          placeholder={<div>Enter some text...</div>}
        />
        <OnChangePlugin
          onChange={(editorState, editor) =>
            onChange(
              editorState,
              editor,
              setEnteredText,
              setTransliteratedArray
            )
          }
        />
        <HistoryPlugin />
        <MyCustomAutoFocusPlugin />
      </LexicalComposer>
      {transliteratedArray?.map((word) => (
        <div>{word}</div>
      ))}
    </>
  );
}

export default Editor;
