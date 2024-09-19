import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor1 = () => {
  const quillRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [lineTop, setLineTop] = useState(0);
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    const quill = new Quill(quillRef.current, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }]
        ]
      }
    });

    quill.on('selection-change', (range) => {
      if (range) {
        const [line, offset] = quill.getLine(range.index);
        const lineBounds = quill.getBounds(range.index);

        // Calculate the line's position and height
        setLineTop(lineBounds.top);
        setLineHeight(lineBounds.height);

        // Show the dot whenever the cursor is inside the editor
        setShowDot(true);
      } else {
        // Hide the dot when there's no selection (e.g. blur)
        setShowDot(false);
      }
    });
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={quillRef} style={{ height: '300px', marginRight: '50px' }}></div>

      {/* Vertical Line */}
      <div
        style={{
          position: 'absolute',
          left: '-30px', // Adjust this for your layout
          top: `${lineTop}px`,
          height: `${lineHeight}px`,
          borderLeft: '2px solid #FF0000',
          display: 'inline-block',
          transition: 'top 0.2s ease'
        }}
      >
        {/* Dot */}
        {showDot && (
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              left: '-5px',
              height: '10px',
              width: '10px',
              backgroundColor: '#00FF00',
              borderRadius: '50%'
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default QuillEditor1;
