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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import LineChartIcon from '@mui/icons-material/ShowChart';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

import { IconButton, Popover, Tooltip, Typography, TextField, Badge, Button, Slider, } from '@mui/material';

import DottedLineModule from './custom/DottedLineModule';
import LineChart from './custom/LineChart';
import VoiceGraph from './custom/VoiceGraph';
import SpanWithIdBlot from './custom/SpanWithIdBlot';


Quill.register(DottedLineModule);
Quill.register(SpanWithIdBlot);

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


  const [chartData, setChartData] = useState(initialChartData);
  const [voiceData, setVoiceData] = useState([]); // New state for voice data
  const [tempChartData, setTempChartData] = useState([]);
  const [open, setOpen] = useState(false);
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
  const inlineCommentRef = useRef(null);



  const handleSetComment = (action, e) => {
    switch (action) {
      case 'add':
        setTempComment(e.target.value)
        e.target.value === '' && setTempCommentId(0)
        setIsToolbarVisible(true);
        break;
    }
  }

  const handleUpdateChart = (index, newValue) => {
    const newValues = [...tempChartData.values];
    newValues[index] = newValue; // Update the value at the given index
    setTempChartData({ ...tempChartData, values: newValues });
  };

  const handleShowChart = () => {

    setShowChart(!showChart); // graph line 
    setTempChartData(chartData); // Use current chart data as temporary
    setShowComment(false);

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

    setShowChart(false);
    setIsToolbarVisible(false);
    highlightSelectedText(); // Highlight the selected text
  };

  // Cancel and discard the changes
  const handleCancelChart = () => {
    setShowChart(false);
    setIsToolbarVisible(false);
    setTempChartData(chartData); // Reset to original chart data

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
        const toolbarTop = bounds.top + bounds.height + 20; // 20px below the selected text
        const toolbarLeft = bounds.left;
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
          // const matchedCommentsVoiceData = voiceData.filter((voice) => {
          //   const commentRange = voice.range;
          //   return (
          //     // Check if the selection range overlaps with any comment range
          //     (range.index <= commentRange.index + commentRange.length - 1) &&
          //     (range.index + range.length - 1 >= commentRange.index)
          //   );
          // });
          setInlineCommentList(matchedComments);
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
          }




          // Handle text deletion
          // if (op.delete) {
          //   const deleteIndex = editor.getSelection(true).index; // Get the affected range
          //   const deleteLength = op.delete; // Number of characters deleted
          //   const deleteEnd = deleteIndex + deleteLength;

          //   // Remove or adjust comments that are fully or partially deleted
          //   newComments = newComments.filter((comment) => {
          //     const commentEnd = comment.range.index + comment.range.length;
          //     const isDeleted =
          //       (comment.range.index >= deleteIndex && comment.range.index <= deleteEnd) ||
          //       (commentEnd >= deleteIndex && commentEnd <= deleteEnd);

          //     // Remove if it's fully deleted
          //     if (isDeleted) {
          //       editor.formatText(comment.range.index, comment.range.length, "background", false);
          //       return false;
          //     }

          //     // Adjust the position of the comment if it's after the deleted text
          //     if (comment.range.index >= deleteIndex) {
          //       return {
          //         ...comment,
          //         range: {
          //           ...comment.range,
          //           index: Math.max(comment.range.index - deleteLength, deleteIndex), // Shift backward
          //         },
          //       };
          //     }

          //     return true; // Keep the comment unchanged if unaffected
          //   });
          // }

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
          }



          // Retain operations don't require any adjustments, so they can be skipped
        });
        newComments = newComments.filter(item => typeof item === 'object' && item !== null);
        setComments(newComments); 
        applyDottedLineFormatting();
      }

      // Update format state
      setIsBold(editor.getFormat().bold || false);
      setIsItalic(editor.getFormat().italic || false);
      setIsUnderline(editor.getFormat().underline || false);
    };

    // const handleTextChange = (delta, oldDelta, source) => {
    //   if (source === "user") {
    //     let newComments = JSON.parse(JSON.stringify(comments)); // Copy existing comments

    //     delta.ops.forEach((op, index) => {
    //       const oldOp = oldDelta.ops[index]; // Get corresponding old operation

    //       // Handle text insertion
    //       if (op.insert) {
    //         const insertIndex = op.retain || 0;
    //         const insertLength = op.insert.length;

    //         // Use oldDelta to see if text is being replaced
    //         if (oldOp && oldOp.delete) {
    //           const deletedLength = oldOp.delete;
    //           // Adjust comments based on the replaced text
    //           newComments = newComments.map((comment) => {
    //             if (comment.range.index >= insertIndex) {
    //               return {
    //                 ...comment,
    //                 range: {
    //                   ...comment.range,
    //                   index: comment.range.index + insertLength - deletedLength, // Shift forward by net length change (insert - delete)
    //                 },
    //               };
    //             }
    //             return comment;
    //           });
    //         } else {
    //           // Shift all comments after the insertion point forward
    //           newComments = newComments.map((comment) => {
    //             if (comment.range.index >= insertIndex) {
    //               return {
    //                 ...comment,
    //                 range: {
    //                   ...comment.range,
    //                   index: comment.range.index + insertLength, // Shift forward by inserted text length
    //                 },
    //               };
    //             }
    //             return comment;
    //           });
    //         }
    //       }

    //       // Handle text deletion (same as before, using oldDelta if needed)
    //       if (op.delete) {
    //         const deleteIndex = op.retain || 0;
    //         const deleteLength = op.delete;
    //         const deleteEnd = deleteIndex + deleteLength;

    //         // Adjust comments based on deleted range
    //         newComments = newComments.filter((comment) => {
    //           const commentEnd = comment.range.index + comment.range.length;
    //           const isDeleted =
    //             (comment.range.index >= deleteIndex && comment.range.index <= deleteEnd) ||
    //             (commentEnd >= deleteIndex && commentEnd <= deleteEnd);

    //           if (isDeleted) {
    //             editor.formatText(comment.range.index, comment.range.length, "background", false);
    //             return false; // Remove the comment if fully deleted
    //           }

    //           if (comment.range.index >= deleteIndex) {
    //             return {
    //               ...comment,
    //               range: {
    //                 ...comment.range,
    //                 index: Math.max(comment.range.index - deleteLength, deleteIndex), // Shift the comment's starting point backward
    //               },
    //             };
    //           }

    //           return comment;
    //         });
    //       }
    //     });

    //     setComments(newComments); // Update state with adjusted comments
    //     applyDottedLineFormatting(); // Optional visual formatting
    //   }

    //   // Update format state
    //   setIsBold(editor.getFormat().bold || false);
    //   setIsItalic(editor.getFormat().italic || false);
    //   setIsUnderline(editor.getFormat().underline || false);
    // };

    editor.on("selection-change", handleSelectionChange);
    editor.on("text-change", handleTextChange);
    editor.root.addEventListener('click', handleTextClick);
    // --- dot-dashed code ---
    // Apply dotted-line formatting on initial load
    applyDottedLineFormatting();
    // --- dot-dashed code end ---
    // Cleanup function
    return () => {
      editor.off("selection-change", handleSelectionChange);
      editor.off("text-change", handleTextChange);
      editor.root.removeEventListener('click', handleTextClick);
    };
  }, [comments]);

  useEffect(() => {
    if (showComment === false) {
      setSelectedRange(null);
      clearCommentStates();
    }
  }, [showComment])

  useEffect(() => {
    const editor = quillRef.current.getEditor();
    if (comments.length !== 0) {
      editor.root.addEventListener('click', handleTextClick);
    }
    return () => {
      editor.root.removeEventListener('click', handleTextClick);
    }
  }, [comments])

  // useEffect(() => {
  // Add a class to the editor container based on dark mode state
  // if (isDarkMode) {
  //   document.body.classList.add("dark-mode");
  // } else {
  //   document.body.classList.remove("dark-mode");
  // }
  // }, [isDarkMode]);

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


  function handleTextClick(e) {
    const target = e.target;
    // const spanElement = document.querySelector(target);
    const dataId = target.getAttribute('data-id');


    if (target.tagName === 'SPAN' && dataId) {
      const comment = comments.find((c) => c.id === Number(dataId));

      if (comment) {
        // Show the popover with the comment
        setPopoverContent(comment.text + " | " + comment.comment);
        // const rect = target.getBoundingClientRect();
        // const position = {
        //   top: rect.top + e.scrollY, // Adjust for scrolling
        //   left: rect.left + e.scrollX,
        // };
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const bounds = editor.getBounds(range.index);
        const toolbarTop = bounds.top + bounds.height + 20; // 20px below the selected text
        const toolbarLeft = bounds.left;
        // setPopoverPosition({ top: e.clientY, left: e.clientX });

        setPopoverPosition({ top: toolbarTop, left: toolbarLeft })
        setIsPopoverVisible(true);
      }
    }

    // setIsToolbarVisible(false);
  };

  // Function to wrap selected text in a <span> with an ID
  const addCommentSpan = (commentId) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (range && range.length > 0) {
      const selectedText = editor.getText(range.index, range.length);
      const delta = editor.getContents(); // Get current Delta operations

      let _deltaDataId = {};
      let newDataIdObject = {};
      // delta.ops.forEach((op) => {
      //   if (op.insert && op.insert.includes(selectedText)) {
      //     op.attributes = {
      //       ...op.attributes,
      //       'data-id': commentId,
      //     };
      //     newDataIdObject = op

      //   }
      // });
      // if (Object.keys(deltaDataId).length === 0) {
      //   _deltaDataId = JSON.parse(JSON.stringify(delta));
      //   console.log("deltaDataId is empty");
      // } else {
      //   _deltaDataId = JSON.parse(JSON.stringify(deltaDataId))
      //   console.log("deltaDataId is not empty");
      //   _deltaDataId.ops.forEach((op) => {
      //     if (op.insert && op.insert.includes(selectedText)) {
      //       op = newDataIdObject
      //     }
      //   });
      // }
      // setDeltaDataId(_deltaDataId);


      let editorHTML = editor.root.innerHTML;
      const escapedText = selectedText.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'); // Escape special regex chars
      const regex = new RegExp(`(${escapedText})`, 'g');

      // Only replace the first instance of the selected text
      editorHTML = editorHTML.replace(regex, `<span data-id="${commentId}">$1</span>`);
      // editor.format('spanWithId', commentId);
      // editor.formatText(range.index, range.length, 'spanWithId', commentId);

      editor.format('spanWithId', commentId);
      editor.root.innerHTML = editorHTML;
      // Set the updated innerHTML back into the editor
      // Add a span tag with the commentId as the ID
      // const spanHtml = `<span id="${commentId}">${selectedText}</span>`;

      // Replace the selected text with the span tag
      // editor.clipboard.dangerouslyPasteHTML(range.index, spanHtml);

      // // Add the comment to the comments state
      // setComments((prevComments) => [
      //   ...prevComments,
      //   { id: commentId, text: selectedText, range }
      // ]);
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
        // addCommentSpan(newComment.id)
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

    // Since SSML isn't fully supported in Chrome, use plain text for now
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
              <IconButton color="info" onClick={() => { setShowChart(false); setShowComment(!showComment) }}>
                <Badge badgeContent={inlineCommentList.length} color="warning" variant="small">
                  <CommentIcon />
                </Badge>
              </IconButton>
            </div>
            {showComment && <div className="comment-message">
              <div style={{ marginBottom: "10px" }}>

                <TextField
                  id="outlined-Comment-static"
                  label="Comment"
                  inputRef={inlineCommentRef}
                  multiline
                  onChange={(e) => handleSetComment('add', e)}
                  rows={2}
                  sx={{ width: "100%", color: "#F9F9F3" }}
                  defaultValue={tempComment}
                  placeholder="Please enter your comment"
                />
              </div>
              <div className="action-btn-comment">
                <Tooltip title="Cancel" placement="bottom">
                  <IconButton onClick={() => clearCommentStates()} color="warning">
                    <HighlightOffIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Confirm" placement="bottom">
                  <IconButton color="primary" onClick={handleComment}>
                    <CheckCircleOutlineIcon />
                  </IconButton>
                </Tooltip>
              </div>
              {inlineCommentList.length !== 0 && <div className="inline-comment-list">
                <div className="comment-list-div">
                  {inlineCommentList.map((comment, index) => (
                    <li key={index} style={{
                      cursor: "pointer", display: "flex", justifyContent: "space-between",
                      padding: "2px",
                      marginTop: "5px",
                      marginBottom: "5px",
                      fontSize: "small",
                      backgroundColor: "#333333",
                      borderRadius: "6px"
                    }} onClick={() => handleSelectComment(comment.range)}>
                      <div>
                        <strong>Text:</strong>{" "}
                        <span>
                          {comment.text}
                        </span>
                        <br />
                        <strong>Comment:{comment?.range?.index} : {comment?.range?.length}</strong> {comment.comment}
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <div>
                          <IconButton onClick={() => {
                            setIsToolbarVisible(false);
                            setShowComment(false);
                            handleEditComment(comment.id);
                          }}>
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
                </div>

              </div>}

              <div>

              </div>

            </div>}
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
        <div className="comment-sidebar">
          <h3> Voice Data</h3>
          <ul>
            {/* {comments.map((comment, index) => (
              <li key={index} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }} onClick={() => handleSelectComment(comment.range)}>
                <div>
                  <strong>Text:</strong>{" "}
                  <span>
                    {comment.text}
                  </span>
                  <br />
                  <strong>Comment:{comment.range.index} : {comment.range.length}</strong> {comment.comment}
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
            ))} */}
            {voiceData.map((voice, index) => (
              <li key={voice.id} style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{voice.label} | {selectedTextKeyValue[voice.id].selectedText}</strong>
                  <ul style={{ fontSize: "small", padding: "4px", boxShadow: "none !important" }}>
                    {voice.values.map((value, i) => (
                      <div style={{ padding: "5px" }} key={i}>Time {i}s: {value}</div>
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
