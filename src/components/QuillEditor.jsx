import React, { useRef, useState, useEffect } from "react";
import Quill from 'quill';
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
import Button from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { Popover, Tooltip, Typography } from '@mui/material';
import DottedLineModule from './DottedLineModule';  // Assuming you moved the custom blot code here
import LineChartIcon from '@mui/icons-material/ShowChart';
import LineChart from './LineChart';
import VoiceGraph from './VoiceGraph';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// --- dot-dashed code ---
// Register the custom blot for dotted-line paragraphs
// const Block = Quill.import('blots/block');
// class DottedLineBlot extends Block {
//   static create() {
//     const node = super.create();
//     node.classList.add('dotted-line-paragraph');
//     return node;
//   }
// }

// DottedLineBlot.blotName = 'dottedLine';
// DottedLineBlot.tagName = 'p';
Quill.register(DottedLineModule);
// --- dot-dashed code end ---


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
  const [isHighlighted, setIsHighlighted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const initialChartData = {
    labels: ['0s', '1s', '2s', '3s', '4s', '5s', '6s'], // Time labels
    values: [20, 15, 30, 25, 35, 30, 20], // Initial values for the chart
  };
  const [chartVisible, setChartVisible] = useState(false);
  const [chartData, setChartData] = useState(initialChartData);
  const [voiceData, setVoiceData] = useState([]); // New state for voice data
  const [tempChartData, setTempChartData] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextData, setSelectedTextData] = useState([]);
  const handleUpdateChart = (index, newValue) => {
    console.log(index, newValue, 'vicky')
    const newValues = [...tempChartData.values];
    newValues[index] = newValue; // Update the value at the given index
    setTempChartData({ ...tempChartData, values: newValues });
  };
  console.log(chartData, " - ", voiceData, " - ", tempChartData, "graph vicky ")
  console.log(voiceData, "voiceData vicky", selectedTextData)
  const handleShowChart = () => {

    setShowChart(!showChart); // graph line 
    setTempChartData(chartData); // Use current chart data as temporary
    // setChartVisible(true);
  };

  const handleApplyChart = () => {
    const newVoiceEntry = {
      id: Date.now(),
      label: `Voice Point ${voiceData.length + 1}`,
      values: tempChartData.values,
    };
    setSelectedTextData([...selectedTextData, { id: newVoiceEntry.id, selectedText: selectedText }])
    setVoiceData([...voiceData, newVoiceEntry]);
    setChartData(tempChartData); // Update the main chart data
    // setChartVisible(false); // Hide the chart
    setShowChart(false);
    setIsToolbarVisible(false);
    highlightSelectedText(); // Highlight the selected text
  };

  // Cancel and discard the changes
  const handleCancelChart = () => {
    setShowChart(false);
    setIsToolbarVisible(false);
    setTempChartData(chartData); // Reset to original chart data
    // setChartVisible(false); // Hide the chart without saving
  };

  const highlightSelectedText = () => {
    const editor = quillRef.current.getEditor();
    if (selectedRange) {
      editor.formatText(selectedRange.index, selectedRange.length, "background", selectedColor);
    }
  };

  useEffect(() => {
    const editor = quillRef.current.getEditor();
    CustomUndoRedo(editor);
    // --- dot-dashed code ---
    const applyDottedLineFormatting = () => {
      const paragraphs = editor.root.querySelectorAll('p');
      paragraphs.forEach((p) => {
        if (!p.classList.contains('dotted-line-paragraph')) {
          p.classList.add('dotted-line-paragraph');
        }
        if (p.textContent.trim() === "") { // Check if paragraph is empty
          p.classList.add('empty'); // Add 'empty' class for empty paragraphs
        } else {
          p.classList.remove('empty'); // Remove 'empty' class if not empty
        }
      });
    };
    // --- dot-dashed code end ---
    const handleSelectionChange = (range) => {
      if (range && range.length > 0) {
        const bounds = editor.getBounds(range.index);
        const toolbarTop = bounds.top + bounds.height + 20; // 20px below the selected text
        const toolbarLeft = bounds.left;
        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });
        setIsToolbarVisible(true);
        setSelectedRange(range);
        const selected = editor.getText(range.index, range.length);
        setSelectedText(selected);
        console.log('Vicky Selected Text:', selected);
      } else {
        setIsToolbarVisible(false);
        setSelectedRange(null);
      }
    };

    const handleTextChange = (delta, oldDelta, source) => {
      console.log(editor.getContents(), editor.root.innerHTML, 'vicky')
      if (source === "user") {
        delta.ops.forEach((op) => {
          if (op.delete) {
            const affectedRangeStart = editor.getSelection(true).index;
            const affectedRangeEnd = affectedRangeStart + op.delete;

            setComments((prevComments) =>
              prevComments.filter((comment) => {
                const commentEnd = comment.range.index + comment.range.length;
                if (
                  (comment.range.index >= affectedRangeStart && comment.range.index <= affectedRangeEnd) ||
                  (commentEnd >= affectedRangeStart && commentEnd <= affectedRangeEnd)
                ) {
                  editor.formatText(comment.range.index, comment.range.length, "background", false);
                  return false; // remove comment
                }
                return true; // keep comment
              })
            );
          }
        });
        // --- dot-dashed code ---
        // Apply dotted-line formatting after content change
        applyDottedLineFormatting();
        // --- dot-dashed code end ---
      }

      setIsBold(editor.getFormat().bold || false);
      setIsItalic(editor.getFormat().italic || false);
      setIsUnderline(editor.getFormat().underline || false);
    };

    editor.on("selection-change", handleSelectionChange);
    editor.on("text-change", handleTextChange);
    // --- dot-dashed code ---
    // Apply dotted-line formatting on initial load
    applyDottedLineFormatting();
    // --- dot-dashed code end ---
    // Cleanup function
    return () => {
      editor.off("selection-change", handleSelectionChange);
      editor.off("text-change", handleTextChange);
    };
  }, []);

  useEffect(() => {
    // Add a class to the editor container based on dark mode state
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

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
    console.log(comments, "comment.find")
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
  const handleToggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleAddVoiceData = () => {
    const newVoiceData = {
      id: Date.now(),
      label: `Voice Point ${voiceData.length + 1}`,
      values: [...chartData.values], // Copy the chart data
    };

    setVoiceData((prevVoiceData) => [...prevVoiceData, newVoiceData]);
  };

  const handleDeleteVoiceData = (voiceId) => {
    setVoiceData((prevVoiceData) => prevVoiceData.filter((voice) => voice.id !== voiceId));
  };


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowChart(false)
  };


  console.log(comments, "comments")

  const selectedTextKeyValue = selectedTextData.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  return (
    <div className="editor-container">


      {/* <Dialog
        open={showChart}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ backgroundColor: "#1e1e1e", color: "#e0e0e0" }}>
          Change text voice modulation
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#1e1e1e" }}>
          <DialogContentText id="alert-dialog-description">
            {showChart && ( // graph line 
              <div className="chart-container">
                {showChart && (
                 
                  <div className="chart-container">
                    <LineChart data={tempChartData} onUpdate={handleUpdateChart} />

                    <div className="chart-controls">

                      <Tooltip title="Cancel" placement="bottom">
                        <IconButton onClick={handleCancelChart} color="warning">
                          <HighlightOffIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Apply" placement="bottom">
                        <IconButton onClick={handleApplyChart} color="primary">
                          <CheckCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>

                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelChart} size="small">Cancel</Button>
          <Button onClick={handleApplyChart} size="small" autoFocus>
            Apply
          </Button>
        </DialogActions>
      </Dialog> */}
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
        {/* <IconButton onClick={handleToggleDarkMode}>
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton> */}
        {/* <IconButton onClick={handleShowChart}> 
          <LineChartIcon /> 
        </IconButton> */}
      </div>

      <div className="editor-and-comments">
        <ReactQuill
          placeholder="Type Here.."
          ref={quillRef}
          value={editorContent}
          onChange={setEditorContent}
          modules={{
            toolbar: [
              [{ undo: "Undo" }, { redo: "Redo" }],
            ],
            history: {
              delay: 2000,
              maxStack: 5000,
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
              display: "block",
            }}
          >
            <div style={{ display: "flex" }}>
              <IconButton color="info" onClick={handleBold} className={isBold ? "active" : ""}>
                <FormatBoldIcon />
              </IconButton>
              <IconButton color="info" onClick={handleItalic} className={isItalic ? "active" : ""}>
                <FormatItalicIcon />
              </IconButton>
              <IconButton color="info" onClick={handleUnderline} className={isUnderline ? "active" : ""}>
                <FormatUnderlinedIcon />
              </IconButton>
              {/* <IconButton onClick={handleShowChart}> */}
              <IconButton color="info" className="color-white" onClick={handleShowChart}>
                <LineChartIcon />
              </IconButton>

              <label style={{ marginLeft: '10px' }}>
                Rate:{rateValue}
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

              <IconButton color="info" onClick={handleComment}>
                <CommentIcon />
              </IconButton>
            </div>
            <div>
              {showChart && ( // graph line 
                <div className="chart-container">
                  {showChart && (
                    // <VoiceGraph
                    // data={chartData}
                    // onUpdate={handleUpdateChart} />
                    <div className="chart-container">
                      {/* <VoiceGraph data={tempChartData} onUpdate={handleUpdateChart} /> */}
                      <LineChart data={tempChartData} onUpdate={handleUpdateChart} />

                      <div className="chart-controls">

                        <Tooltip title="Cancel" placement="bottom">
                          <IconButton onClick={handleCancelChart} color="warning">
                            <HighlightOffIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Apply" placement="bottom">
                          <IconButton onClick={handleApplyChart} color="primary">
                            <CheckCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>

                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

        <div className="comment-sidebar">
          <h3>Comments & Voice Data</h3>
          <ul>
            {comments.map((comment, index) => (
              <li key={index} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }} onClick={() => handleSelectComment(comment.range)}>
                <div>
                  <strong>Text:</strong>{" "}
                  <span>
                    {comment.text}
                  </span>
                  <br />
                  <strong>Comment:</strong> {comment.comment}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    <IconButton onClick={() => handleEditComment(comment.id)}>
                      <EditIcon />
                    </IconButton>
                  </div>
                  <div>
                    <IconButton onClick={() => handleDeleteComment(comment.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
            {voiceData.map((voice, index) => (
              <li key={voice.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{voice.label} | {selectedTextKeyValue[voice.id].selectedText}</strong>
                  <ul style={{ fontSize: "small", padding: "4px", boxShadow: "none !important" }}>
                    {voice.values.map((value, i) => (
                      <li key={i}>Time {i}s: {value}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconButton onClick={() => handleDeleteVoiceData(voice.id)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div >
  );
};

export default QuillEditor;
