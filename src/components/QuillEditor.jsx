import React, { useRef, useState, useEffect } from "react";
import Quill from 'quill';
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./QuillEditor.css";

// all icons
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import CommentIcon from '@mui/icons-material/Comment';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import LineChartIcon from '@mui/icons-material/ShowChart';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { IconButton, Popover, Badge, Slider, } from '@mui/material';


//custom components
import DottedLineModule from './custom/DottedLineModule';
import SpanWithIdBlot from './custom/SpanWithIdBlot';
import VoiceList from "./voicelist/VoiceList";
import CommentList from "./commentlist/CommentList";


Quill.register(DottedLineModule);
Quill.register(SpanWithIdBlot);

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
  const [showChart, setShowChart] = useState(false);

  const initialChartData = {
    labels: ['0s', '1s', '2s', '3s', '4s', '5s', '6s'], // Time labels
    values: [20, 20, 20, 20, 20, 20, 20], // Initial values for the chart
  };


  const [chartData, setChartData] = useState(initialChartData);
  const [voiceData, setVoiceData] = useState([]); // New state for voice data
  const [tempChartData, setTempChartData] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectedTextData, setSelectedTextData] = useState([]);
  const [popoverContent, setPopoverContent] = useState(''); // New state for popover content
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
  const [isPopoverVisible, setIsPopoverVisible] = useState(false);
  const popoverRef = useRef(null);
  const [deltaDataId, setDeltaDataId] = useState({});
  const [showComment, setShowComment] = useState(false);
  const [tempComment, setTempComment] = useState("");
  const [tempCommentId, setTempCommentId] = useState(0);
  const [inlineCommentList, setInlineCommentList] = useState([]);
  const [inlineVoiceList, setInlineVoiceList] = useState([]);
  const inlineCommentRef = useRef(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);

  const handleVoiceEntrySelect = async (id) => {
    await setChartDataByClick(id)
    setSelectedVoiceId(id); // Set the active voice entry
  };
  const setChartDataByClick = (chartId) => {
    const _chartVoiceData = voiceData.find(item => item.id === chartId);
    let _chartData = { ...chartData };
    if (_chartVoiceData) {
      _chartData = {
        labels: _chartVoiceData.values.map((_, index) => `${index}s`), // Create time labels dynamically based on the number of values
        values: _chartVoiceData.values // Use the values as they are
      };
    } else {
      _chartData = _chartData
    }
    setChartData(_chartData);
    setTempChartData(_chartData)
    setSelectedVoiceId(null);

  }

  console.log(chartData, "vicky chart data", tempChartData, showChart)


  const handleSetComment = (action, e) => {
    switch (action) {
      case 'add':
        setTempComment(e.target.value)
        // e.target.value === '' && setTempCommentId(0)
        setIsToolbarVisible(true);
        break;
    }
  }


  const handleUpdateChart = (index, newValue) => {
    setVoiceData(prevVoiceData =>
      prevVoiceData.map(voiceEntry =>
        voiceEntry.id === selectedVoiceId // Assuming `selectedVoiceId` is the current active voice entry ID
          ? {
            ...voiceEntry,
            values: voiceEntry.values.map((value, i) => i === index ? newValue : value) // Only update the value at the specific index
          }
          : voiceEntry // Leave other voice entries unchanged
      )
    );
  };

  const handleResetnNewChart = () => {
    setSelectedVoiceId(null);
    setTempChartData(initialChartData);

  }

  const handleResetnNewComment = () => {
    setTempComment('')
    setTempCommentId(0)
    setIsToolbarVisible(true);
  }

  const handleShowChart = () => {

    setShowChart(!showChart); // graph line 
    setTempChartData(chartData); // Use current chart data as temporary
    setShowComment(false);
    setSelectedVoiceId(null);
  };


  const handleApplyChart = () => {

    if (selectedVoiceId === null) {

      const newVoiceEntry = {
        id: Date.now(),
        range: { ...selectedRange },
        label: `Voice Point ${voiceData.length + 1}`,
        values: [...tempChartData.values], // Copy the values to avoid direct mutation
      };

      console.log("newchart entry", newVoiceEntry);

      setSelectedTextData(prevSelectedTextData => [
        ...prevSelectedTextData,
        { id: newVoiceEntry.id, selectedText }
      ]);

      // Append the new voice entry to the voiceData array
      setVoiceData(prevVoiceData => [
        ...prevVoiceData,
        newVoiceEntry
      ]);
    } else if (selectedVoiceId !== null) {
      setChartDataByClick(selectedVoiceId)
    }

    setShowChart(false);
    setIsToolbarVisible(false);
    handleResetnNewChart();
    setChartData(initialChartData);
    highlightSelectedText(); // Highlight the selected text
  };


  console.log("newchart entry-------", voiceData, " :", selectedTextData)

  // Cancel and discard the changes
  const handleCancelChart = () => {
    setShowChart(false);
    setIsToolbarVisible(false);
    setTempChartData(chartData); // Reset to original chart data
    setSelectedVoiceId(null);
  };

  const highlightSelectedText = () => {
    const editor = quillRef.current.getEditor();
    if (selectedRange) {
      editor.formatText(selectedRange.index, selectedRange.length, "background", selectedColor);
    }
  };



  useEffect(() => {
    // getSpeech();
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
        console.log(bounds, 'vicky bounds')
        const toolbarTop = bounds.top + bounds.height + 20; // 20px below the selected text
        const toolbarLeft = bounds.left - 200;
        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });
        setIsToolbarVisible(true);
        setSelectedRange(range);
        const selected = editor.getText(range.index, range.length);
        setSelectedText(selected);

        if (comments.length !== 0) {
          const matchedComments = comments.filter((comment) => {
            const commentRange = comment?.range;
            return (
              // Check if the selection range overlaps with any comment range
              (range?.index <= commentRange?.index + commentRange?.length - 1) &&
              (range?.index + range?.length - 1 >= commentRange?.index)
            );
          });

          setInlineCommentList(matchedComments);
          setIsToolbarVisible(true);

        }
        if (voiceData.length !== 0) {

          const matchedCommentsVoiceData = voiceData.filter((voice) => {
            const voiceRange = voice.range;
            return (
              // Check if the selection range overlaps with any comment range
              (range.index <= voiceRange.index + voiceRange.length - 1) &&
              (range.index + range.length - 1 >= voiceRange.index)
            );
          });
          setInlineVoiceList(matchedCommentsVoiceData);
          setIsToolbarVisible(true);

        }
      } else {
        setIsToolbarVisible(false);
        // setSelectedRange(null);
        removePopOverState(false)
        // setInlineCommentList([])
      }
    };


    const handleTextChange = (delta, oldDelta, source) => {

      if (source === "user") {
        let newComments = JSON.parse(JSON.stringify(comments)); // Copy existing comments
        let newVoiceData = JSON.parse(JSON.stringify(voiceData));
        delta.ops.forEach((op) => {
          // Handle text insertion
          let currentLocationRetain = 0;
          if (op.retain) {
            currentLocationRetain = op.retain;
          }
          if (op.insert) {
            // const insertIndex = op.retain || 0;
            const insertIndex = editor.getSelection(true).index || 0;

            // Shift all comments after the insertion point forward
            newComments = newComments.map((comment) => {

              if (comment?.range?.index >= insertIndex) {
                return {
                  ...comment,
                  range: {
                    ...comment.range,
                    index: comment?.range?.index + op.insert.length, // Shift forward by inserted text length
                  },
                };
              }
              return comment;
            });
            newVoiceData = newVoiceData.map((voice) => {

              if (voice?.range?.index >= insertIndex) {
                return {
                  ...voice,
                  range: {
                    ...voice.range,
                    index: voice?.range?.index + op.insert.length, // Shift forward by inserted text length
                  },
                };
              }
              return voice;
            });
          }


          if (op.delete) {
            // Calculate the position where text is deleted
            // const deleteIndex = op.retain || 0;
            const deleteIndex = editor.getSelection(true).index || 0;
            // const deleteIndex = editor.getSelection(true).index; // Get the affected range
            const deleteLength = op.delete; // Number of characters deleted
            const deleteEnd = deleteIndex + deleteLength;
            // Adjust comments that appear after the deleted text by shifting their ranges backward
            newComments = newComments.map((comment) => {

              const commentEnd = comment?.range?.index + comment?.range?.length;
              const isDeleted =
                (comment?.range?.index >= deleteIndex && comment?.range?.index <= deleteEnd) ||
                (commentEnd >= deleteIndex && commentEnd <= deleteEnd);
              // if (isDeleted)
              if (isDeleted) {
                editor.formatText(comment?.range?.index, comment?.range?.length, "background", false);
                return false;
              }

              if (comment?.range?.index >= deleteIndex) {
                return {
                  ...comment,
                  range: {
                    ...comment?.range,
                    index: Math.max(comment?.range?.index - op.delete, deleteIndex), // Shift the comment's starting point backward
                  },
                };
              }
              return comment;
            });

            newVoiceData = newVoiceData.map((voice) => {
              const voiceEnd = voice?.range?.index + voice?.range?.length;
              const isDeleted =
                (voice?.range?.index >= deleteIndex && voice?.range?.index <= deleteEnd) ||
                (voiceEnd >= deleteIndex && voiceEnd <= deleteEnd);
              // if (isDeleted)
              if (isDeleted) {
                editor.formatText(voice?.range?.index, voice?.range?.length, "background", false);
                return false;
              }

              if (voice?.range?.index >= deleteIndex) {
                return {
                  ...voice,
                  range: {
                    ...voice?.range,
                    index: Math.max(voice?.range?.index - op.delete, deleteIndex), // Shift the voice's starting point backward
                  },
                };
              }
              return voice;
            });
          }

          // Retain operations don't require any adjustments, so they can be skipped
        });
        newComments = newComments.filter(item => typeof item === 'object' && item !== null);
        newVoiceData = newVoiceData.filter(item => typeof item === 'object' && item !== null);
        setVoiceData(newVoiceData);
        setComments(newComments);
        applyDottedLineFormatting();
      }

      // Update format state
      setIsBold(editor.getFormat().bold || false);
      setIsItalic(editor.getFormat().italic || false);
      setIsUnderline(editor.getFormat().underline || false);
    };


    editor.on("selection-change", handleSelectionChange);
    editor.on("text-change", handleTextChange);

    // Apply dotted-line formatting on initial load
    applyDottedLineFormatting();

    // Cleanup function
    return () => {
      editor.off("selection-change", handleSelectionChange);
      editor.off("text-change", handleTextChange);
    };
  }, [comments, voiceData]);
  console.log("comments", comments, "voiceData", voiceData)
  useEffect(() => {
    if (showComment === false) {
      setSelectedRange(null);
    }
  }, [showComment])

  const handleBold = () => {
    const editor = quillRef.current.getEditor();
    editor.format("bold", !isBold);
    setIsToolbarVisible(true)
  };

  const handleItalic = () => {
    const editor = quillRef.current.getEditor();
    editor.format("italic", !isItalic);
    setIsToolbarVisible(true)

  };

  const handleUnderline = () => {
    const editor = quillRef.current.getEditor();
    editor.format("underline", !isUnderline);
    setIsToolbarVisible(true)

  };

  const handleRateChange = (e) => {
    const editor = quillRef.current.getEditor();
    const color = `hsl(${e.target.value}, 100%, 50%)`;
    editor.formatText(selectedRange.index, selectedRange.length, "background", color);
    setRateValue(e.target.value);
    setSelectedColor(color);
    setIsToolbarVisible(true)

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

    const commentText = tempComment;
    if (tempCommentId === 0) {
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
    } else if (tempCommentId !== 0) {
      if (tempComment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempCommentId ? { ...comment, comment: tempComment } : comment
          )
        );
      }
    }
    clearCommentStates();

  };

  const clearCommentStates = () => {
    setShowComment(false);
    setIsToolbarVisible(false);
    setTempComment("");
    setTempCommentId(0);
  }

  useEffect(() => {
    if (tempCommentId !== 0 && inlineCommentRef.current) {
      inlineCommentRef.current.focus();
    }
  }, [tempCommentId, tempComment])

  const handleEditComment = (commentId) => {
    const commentToEdit = comments.find((comment) => comment.id === commentId);
    setTempComment(commentToEdit.comment)
    setIsToolbarVisible(true);
    setShowComment(true);
    setTempCommentId(commentId);
  };

  const handleDeleteComment = (commentId) => {
    const commentToDelete = comments.find((comment) => comment.id === commentId);
    setComments((prevComments) => prevComments.filter((comment) => comment.id !== commentId));
    setInlineCommentList((prevInlineComment) => prevInlineComment.filter((icomment) => icomment.id !== commentId));
    if (commentToDelete && inlineCommentList.length <= 1) {
      const editor = quillRef.current.getEditor();
      editor.formatText(commentToDelete.range.index, commentToDelete.range.length, "background", false);
    }
  };

  const handleSelectComment = (range) => {
    const editor = quillRef.current.getEditor();
    editor.setSelection(range.index, range.length);
  };


  const handleDeleteVoiceData = (voiceId) => {
    setVoiceData((prevVoiceData) => prevVoiceData.filter((voice) => voice.id !== voiceId));
    setInlineVoiceList((prevVoiceData) => prevVoiceData.filter((voice) => voice.id !== voiceId));
  };

  const selectedTextKeyValue = selectedTextData.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  function deltaToSSML(delta) {
    // Helper function to apply SSML tags based on attributes
    const applySSMLTags = (text, attributes) => {
      let result = text;

      // Bold text is emphasized
      if (attributes?.bold) {
        result = `<emphasis level="strong">${result}</emphasis>`;
      }

      // Italic text gets moderate emphasis
      if (attributes?.italic) {
        result = `<emphasis level="moderate">${result}</emphasis>`;
      }

      // Apply other SSML tags based on delta attributes (e.g., prosody for rate, pitch)
      if (attributes?.rate) {
        result = `<prosody rate="${attributes.rate}">${result}</prosody>`;
      }

      if (attributes?.volume) {
        result = `<prosody volume="${attributes.volume}">${result}</prosody>`;
      }

      // Add more SSML attributes as needed (underline, color, etc.)

      return result;
    };

    // Start SSML document
    let ssml = '<speak>';

    // Iterate over the delta operations
    delta.ops.forEach(op => {
      if (op.insert) {
        // Handle plain text insertion
        if (typeof op.insert === 'string') {
          ssml += applySSMLTags(op.insert, op.attributes);
        }

        // Handle breaks (like new lines or pauses)
        if (op.insert === '\n') {
          ssml += '<break time="500ms" />';
        }
      }
    });

    // Close SSML document
    ssml += '</speak>';

    return ssml;
  }

  function getSpeech() {
    const utterance = new SpeechSynthesisUtterance();

    const ssmlText = `
  <speak>
    Hello! This is a <emphasis level="strong">test</emphasis>.
    <break time="500ms"/> How are you doing today?
  </speak>
`;

    // utterance.text = "Hello! This is a test. How are you doing today?";
    utterance.text = ssmlText;
    // Set pitch, rate, and volume
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    // Play the audio using the Web Speech API
    window.speechSynthesis.speak(utterance);
  }

  const removePopOverState = () => {

    setIsPopoverVisible(false);
    setPopoverContent("")
    setPopoverPosition({ top: 0, left: 0 });

  };

  // useEffect(() => {
  //   if (isPopoverVisible) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   } else {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside); // Cleanup listener on unmount
  //   };
  // }, [isPopoverVisible]);

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
        <IconButton onClick={getSpeech}>
          <PlayCircleOutlineIcon />
        </IconButton>

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




        {(isToolbarVisible || showComment) && (
          <div
            className="inline-toolbar"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              position: "absolute",
              display: "block",
            }}
          // onClick={() => setIsToolbarVisible(false)}
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
                <Badge badgeContent={inlineVoiceList.length} color="warning" variant="small">
                  <LineChartIcon />
                </Badge>
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
              <IconButton color="info" onClick={() => { setShowChart(false); setShowComment(!showComment) }}>
                <Badge badgeContent={inlineCommentList.length} color="warning" variant="small">
                  <CommentIcon />
                </Badge>
              </IconButton>
            </div>
            <CommentList
              showComment={showComment}
              clearCommentStates={clearCommentStates}
              handleComment={handleComment}
              inlineCommentRef={inlineCommentRef}
              inlineCommentList={inlineCommentList}
              handleSelectComment={handleSelectComment}
              tempComment={tempComment}
              handleSetComment={handleSetComment}
              setIsToolbarVisible={setIsToolbarVisible}
              setShowComment={setShowComment}
              handleEditComment={handleEditComment}
              handleDeleteComment={handleDeleteComment}
              handleResetnNewComment={handleResetnNewComment}
            />

            <VoiceList
              showChart={showChart}
              inlineVoiceList={inlineVoiceList}
              selectedTextKeyValue={selectedTextKeyValue}
              handleVoiceEntrySelect={handleVoiceEntrySelect}
              handleDeleteVoiceData={handleDeleteVoiceData}
              handleUpdateChart={handleUpdateChart}
              tempChartData={tempChartData}
              handleResetnNewChart={handleResetnNewChart}
              handleCancelChart={handleCancelChart}
              handleApplyChart={handleApplyChart} />


          </div>
        )}
        {console.log(showChart, isToolbarVisible, showComment, "showChart vicky")}
        {isPopoverVisible && (
          <div
            // ref={popoverRef}
            className="inline-toolbar"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              position: "absolute",
              display: "block",
              // backgroundColor:"#3b3a3a"
            }}>

            {popoverContent}
          </div>
        )}

      </div>
    </div >
  );
};

export default QuillEditor;