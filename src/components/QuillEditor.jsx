import React, { useRef, useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./QuillEditor.css";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import CommentIcon from '@mui/icons-material/Comment';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Slider from '@mui/material/Slider';
import IconButton from '@mui/material/IconButton';

const CustomUndoRedo = (editor) => {
  const toolbar = editor.getModule("toolbar");

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
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [rateValue, setRateValue] = useState(50); // default value for slider
  const [selectedColor, setSelectedColor] = useState(`hsl(50, 100%, 50%)`);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [isHighlighted, setIsHighlighted] = useState(false);


  useEffect(() => {
    const editor = quillRef.current.getEditor();
    CustomUndoRedo(editor);

    editor.on("selection-change", (range) => {
      if (range && range.length > 0) {
        const bounds = editor.getBounds(range.index);
        const toolbarTop = bounds.top + bounds.height + 20; // 20px below the selected text
        const toolbarLeft = bounds.left;
        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });
        setIsToolbarVisible(true);
        setSelectedRange(range);
      } else {
        setIsToolbarVisible(false);
        setSelectedRange(null);
      }
    });

    editor.on("text-change", () => {
      setIsBold(editor.getFormat().bold || false);
      setIsItalic(editor.getFormat().italic || false);
      setIsUnderline(editor.getFormat().underline || false);
    });
  }, []);

  const handleBold = () => {
    const editor = quillRef.current.getEditor();
    editor.format("bold", !isBold);
  };

  const handleItalic = () => {
    const editor = quillRef.current.getEditor();
    editor.format("italic", !isItalic);
  };

  const handleUnderline = () => {
    const editor = quillRef.current.getEditor();
    editor.format("underline", !isUnderline);
  };

  const handleRateChange = (e) => {
    const editor = quillRef.current.getEditor();
    const color = `hsl(${e.target.value}, 100%, 50%)`;
    editor.formatText(selectedRange.index, selectedRange.length, "background", color);
    setRateValue(e.target.value);
    setSelectedColor(color);
  };

  const handleHighlight = () => {
    const editor = quillRef.current.getEditor();
    if (selectedRange) {
      if (isHighlighted) {

        editor.formatText(selectedRange.index, selectedRange.length, "background", false);
      } else {

        editor.formatText(selectedRange.index, selectedRange.length, "background", selectedColor);
      }
      setIsHighlighted(!isHighlighted);
    }
  };

  const handleComment = () => {
    const commentText = prompt("Add a comment:");
    if (commentText && selectedRange) {
      const editor = quillRef.current.getEditor();
      const selectedText = editor.getText(selectedRange.index, selectedRange.length);
      const color = `hsl(${rateValue}, 100%, 50%)`;
      editor.formatText(selectedRange.index, selectedRange.length, "background", color);

      const newComment = {
        id: Date.now(),
        text: selectedText,
        comment: commentText,
        range: selectedRange,
        color,
      };

      setComments((prevComments) => [...prevComments, newComment]);
    }
  };

  const handleEditComment = (commentId) => {
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    const updatedCommentText = prompt("Edit your comment:", commentToEdit.comment);
    if (updatedCommentText) {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? { ...comment, comment: updatedCommentText } : comment
        )
      );
    }
  };

  const handleDeleteComment = (commentId) => {
    const commentToDelete = comments.find((comment) => comment.id === commentId);
    setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    if (commentToDelete) {
      const editor = quillRef.current.getEditor();
      editor.formatText(commentToDelete.range.index, commentToDelete.range.length, "background", false);
    }
  };

  const handleSelectComment = (range) => {
    const editor = quillRef.current.getEditor();
    editor.setSelection(range.index, range.length);
  };

  return (
    <div className="editor-container">
      <div className="custom-toolbar">
        <IconButton onClick={() => quillRef.current.getEditor().history.undo()}>
          <UndoIcon />
        </IconButton>
        <IconButton onClick={() => quillRef.current.getEditor().history.redo()}>
          <RedoIcon />
        </IconButton>
        <IconButton onClick={handleHighlight}>
          <FormatColorFillIcon />
        </IconButton>
      </div>

      <div className="editor-and-comments">
        <ReactQuill
          ref={quillRef}
          value={editorContent}
          onChange={setEditorContent}
          modules={{
            toolbar: [
              [{ undo: "Undo" }, { redo: "Redo" }],
            ],
            history: {
              delay: 2000,
              maxStack: 500,
              userOnly: true,
            },
          }}
          className="custom-quill"
        />

        {isToolbarVisible && (
          <div
            className="inline-toolbar"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              position: "absolute",
            }}
          >
            <IconButton onClick={handleBold} className={isBold ? "active" : ""}>
              <FormatBoldIcon />
            </IconButton>
            <IconButton onClick={handleItalic} className={isItalic ? "active" : ""}>
              <FormatItalicIcon />
            </IconButton>
            <IconButton onClick={handleUnderline} className={isUnderline ? "active" : ""}>
              <FormatUnderlinedIcon />
            </IconButton>

            <label style={{ marginLeft: '10px' }}>
              Rate:
              <Slider
                min={0}
                max={100}
                value={rateValue}
                onChange={handleRateChange}
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </label>

            <div
              className="color-preview"
              style={{
                backgroundColor: selectedColor,
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                display: "inline-block",
                marginLeft: "10px",
                marginRight: "10px",
                marginTop: "4px"
              }}
            ></div>

            <IconButton onClick={handleComment}>
              <CommentIcon />
            </IconButton>
          </div>
        )}

        <div className="comment-sidebar">
          <h3>Comments</h3>
          <ul>
            {comments.map((comment, index) => (
              <li key={index}>
                <strong>Text:</strong>{" "}
                <span
                  style={{ cursor: "pointer", textDecoration: "underline", color: comment.color }}
                  onClick={() => handleSelectComment(comment.range)}
                >
                  {comment.text}
                </span>
                <br />
                <strong>Comment:</strong> {comment.comment}
                <br />
                <IconButton onClick={() => handleEditComment(comment.id)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteComment(comment.id)}>
                  <DeleteIcon />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuillEditor;

