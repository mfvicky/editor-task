import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./QuillEditor.css";

// Custom Undo/Redo
const CustomUndoRedo = (editor) => {
  const toolbar = editor.getModule("toolbar");

  // Check if the toolbar module exists
  if (toolbar) {
    toolbar.addHandler("undo", () => {
      editor.history.undo();
    });

    toolbar.addHandler("redo", () => {
      editor.history.redo();
    });
  } else {
    console.error("Toolbar module is not defined.");
  }
};

const QuillEditor = () => {
  const [editorContent, setEditorContent] = useState("");
  const quillRef = useRef(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [isBold, setIsBold] = useState(false);
  const [rateValue, setRateValue] = useState(50); // default value for slider
  console.log(rateValue,"ratevalue", editorContent)
  // Set Undo/Redo custom buttons
  useEffect(() => {
    const editor = quillRef.current.getEditor();
    CustomUndoRedo(editor);

    editor.on("selection-change", (range) => {
      setSelectedRange(range);
    });

    // Check if the selected text is bold
    editor.on("text-change", () => {
      setIsBold(editor.getFormat().bold || false);
    });
  }, []);

  const handleBold = () => {
    const editor = quillRef.current.getEditor();
    editor.format("bold", !isBold);
  };

  const handleRateChange = (e) => {
    const editor = quillRef.current.getEditor();
    const color = `hsl(${e.target.value}, 100%, 50%)`; // Using HSL to generate colors based on slider
    editor.formatText(selectedRange.index, selectedRange.length, "background", color);
    setRateValue(e.target.value);
  };

  const handleComment = () => {
    const comment = prompt("Add a comment:");
    if (comment) {
      console.log(`Comment added: ${comment}`);
      // Handle comment logic (optional UI or backend)
    }
  };

  return (
    <div className="editor-container">
      <div className="custom-toolbar">
        <button onClick={() => quillRef.current.getEditor().history.undo()}>Undo</button>
        <button onClick={() => quillRef.current.getEditor().history.redo()}>Redo</button>
      </div>

      <ReactQuill
        ref={quillRef}
        value={editorContent}
        onChange={setEditorContent}
        modules={{
          toolbar: [
            [{ undo: "Undo" }, { redo: "Redo" }],
            ["bold", "italic", "underline"],
          ],
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true,
          },
        }}
        className="custom-quill"
      />

      {selectedRange && (
        <div className="inline-toolbar">
          <button onClick={handleBold} className={isBold ? "active" : ""}>
            Bold
          </button>
          <label>
            Rate:
            <input
              type="range"
              min="0"
              max="100"
              value={rateValue}
              onChange={handleRateChange}
            />
          </label>
          <button onClick={handleComment}>Comment</button>
        </div>
      )}
    </div>
  );
};

export default QuillEditor;
