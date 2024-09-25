import React from 'react'
import { IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import LineChart from '../custom/LineChart';
// import VoiceGraph from '../custom/VoiceGraph';
const VoiceList = ({ showChart, inlineVoiceList, selectedTextKeyValue, handleVoiceEntrySelect, handleDeleteVoiceData,
  handleUpdateChart, tempChartData, handleResetnNewChart, handleCancelChart, handleApplyChart }) => {
  return (
    <div>
      {showChart && ( // graph line 
        <div className="chart-container">
          {showChart && (
            // <VoiceGraph
            // data={chartData}
            // onUpdate={handleUpdateChart} />
            <div className="chart-container">
              <div className="chart-controls">


                <Tooltip title="Reset data for a new start" placement="bottom">
                  <IconButton onClick={handleResetnNewChart} color="inherit">
                    <RotateLeftIcon />
                  </IconButton>
                </Tooltip>
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
              {/* <VoiceGraph data={tempChartData} onUpdate={handleUpdateChart} /> */}
              <LineChart data={tempChartData} onUpdate={handleUpdateChart} />


            </div>
          )}
        </div>
      )}
      {showChart && inlineVoiceList.length !== 0 &&
        <div className="inline-comment-list">
          <div className="comment-list-div">
            {inlineVoiceList.sort((a, b) => b.id - a.id).map((voice, index) => (
              <li key={index} style={{
                cursor: "pointer",
                display: "block",
                padding: "2px",
                marginTop: "5px",
                marginBottom: "5px",
                fontSize: "small",
                backgroundColor: "#333333",
                borderRadius: "6px",
              }}>

                <div style={{ padding: "10px" }}>{voice.label} | {selectedTextKeyValue[voice.id].selectedText}</div>
                <div className="voice-item">

                  <ul style={{ fontSize: "small", padding: "4px", boxShadow: "none !important" }}>
                    {voice.values.map((value, i) => (
                      <div style={{ padding: "5px" }} key={i}>Time {i}s: {value}</div>
                    ))}
                  </ul>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={() => handleVoiceEntrySelect(voice.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteVoiceData(voice.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              </li>
            ))}
          </div>
        </div>}
    </div>
  )
}

export default VoiceList