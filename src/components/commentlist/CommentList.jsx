import React, { useEffect } from 'react'
import { IconButton, TextField, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';

const CommentList = ({
  showComment,
  clearCommentStates,
  handleComment,
  inlineCommentRef,
  inlineCommentList,
  handleSelectComment,
  tempComment,
  handleSetComment,
  setIsToolbarVisible,
  setShowComment,
  handleEditComment,
  handleDeleteComment,
  handleResetnNewComment }) => {

  return (
    <div>
      {showComment && <div className="comment-message">
        <div className="action-btn-comment">
          <Tooltip title="Reset data for a new start" placement="bottom">
            <IconButton onClick={handleResetnNewComment} color="inherit">
              <RotateLeftIcon />
            </IconButton>
          </Tooltip>
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
        <div style={{ marginBottom: "10px" }}>

          <TextField
            id="outlined-Comment-static"
            label="Comment"
            inputRef={inlineCommentRef}
            multiline
            onChange={(e) => handleSetComment('add',
              e)}
            rows={2}
            sx={{ width: "100%", color: "#F9F9F3" }}
            defaultValue={tempComment}
            placeholder="Please enter your comment"
          />
        </div>

        {inlineCommentList.length !== 0 && <div className="inline-comment-list">
          <div className="comment-list-div">
            {inlineCommentList.sort((a, b) => b.id - a.id).map((comment, index) => (
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
                  <strong>Comment:</strong> {comment.comment}
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div>
                    <IconButton onClick={() => {
                      setIsToolbarVisible(true);
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
    </div>
  )
}

export default CommentList