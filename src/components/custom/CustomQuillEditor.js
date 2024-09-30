// import React, { useState, useRef, useEffect } from 'react';
// import ReactQuill, { Quill } from 'react-quill';
// import 'react-quill/dist/quill.snow.css';
// import { PlusCircle } from 'lucide-react';

// // Register a custom blot for line nodes
// const Inline = Quill.import('blots/inline');
// class LineNodeBlot extends Inline {
//   static create(value) {
//     const node = super.create();
//     node.setAttribute('data-line-node', value);
//     node.innerHTML = '● ';  // Customize the appearance of the line node here
//     return node;
//   }

//   static formats(node) {
//     return node.getAttribute('data-line-node');
//   }
// }
// LineNodeBlot.blotName = 'lineNode';
// LineNodeBlot.tagName = 'span';
// Quill.register(LineNodeBlot);

// const CustomQuillEditor = () => {
//   const [value, setValue] = useState('');
//   const quillRef = useRef(null);

//   const insertLineNode = (editor, index) => {
//     editor.insertEmbed(index, 'lineNode', Date.now(), 'user');  // Insert the line node
//   };

//   useEffect(() => {
//     if (quillRef.current) {
//       const editor = quillRef.current.getEditor();
      
//       // Add custom handler for 'lineNode' button in toolbar
//       const toolbar = editor.getModule('toolbar');
//       toolbar.addHandler('lineNode', () => {
//         const range = editor.getSelection();
//         if (range) {
//           insertLineNode(editor, range.index);
//           editor.setSelection(range.index + 1);
//         }
//       });
//     }
//   }, []);

//   const modules = {
//     toolbar: {
//       container: [
//         ['lineNode']  // Add 'lineNode' as a toolbar button
//       ]
//     }
//   };

//   const formats = ['lineNode'];

//   return (
//     <div className="relative">
//       <ReactQuill
//         ref={quillRef}
//         value={value}
//         onChange={setValue}
//         modules={modules}
//         formats={formats}
//         theme="snow"
//       />
//       <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-100 flex flex-col items-center pt-2">
//         {value.split('\n').map((_, index) => (
//           <PlusCircle
//             key={index}
//             size={20}
//             className="text-gray-400 hover:text-blue-500 cursor-pointer mb-1"
//             onClick={() => {
//               const editor = quillRef.current.getEditor();
//               const line = editor.getLine(index);
//               const lineIndex = line ? editor.getIndex(line[0]) : editor.getLength();
//               insertLineNode(editor, lineIndex);
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default CustomQuillEditor;
import React, { useState, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PlusCircle } from 'lucide-react';

// Register a custom blot for line nodes
const Inline = Quill.import('blots/inline');
class LineNodeBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-line-node', value);
    node.innerHTML = '● ';  // Customize the appearance of the line node here
    return node;
  }

  static formats(node) {
    return node.getAttribute('data-line-node');
  }
}
LineNodeBlot.blotName = 'lineNode';
LineNodeBlot.tagName = 'span';
Quill.register(LineNodeBlot);

const CustomQuillEditor = () => {
  const [value, setValue] = useState('');
  const quillRef = useRef(null);

  const insertLineNode = (editor, index) => {
    editor.insertEmbed(index, 'lineNode', Date.now(), 'user');  // Insert the line node
  };

  const handleBackspace = (event) => {
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection();
    if (!range || range.index === 0) return;

    const [leaf, offset] = editor.getLeaf(range.index - 1); // Get the leaf before the cursor

    // Check if the leaf is an element node (blot) and prevent deletion if it's a custom line node
    if (leaf && leaf.domNode instanceof HTMLElement && leaf.domNode.hasAttribute('data-line-node')) {
      event.preventDefault(); // Prevent the default backspace behavior on the line node
      if (offset > 0) {
        // If there is text, delete it but not the line node
        editor.deleteText(range.index - 1, 1);
      }
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();

      // Listen for keydown event to handle backspace
      editor.root.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
          handleBackspace(event);
        }
      });

      // Add custom handler for 'lineNode' button in toolbar
      const toolbar = editor.getModule('toolbar');
      toolbar.addHandler('lineNode', () => {
        const range = editor.getSelection();
        if (range) {
          insertLineNode(editor, range.index);
          editor.setSelection(range.index + 1);
        }
      });
    }
  }, []);

  const modules = {
    toolbar: {
      container: [
        ['lineNode']  // Add 'lineNode' as a toolbar button
      ]
    }
  };

  const formats = ['lineNode'];

  return (
    <div className="relative">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={setValue}
        modules={modules}
        formats={formats}
        theme="snow"
      />
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-100 flex flex-col items-center pt-2">
        {value.split('\n').map((_, index) => (
          <PlusCircle
            key={index}
            size={20}
            className="text-gray-400 hover:text-blue-500 cursor-pointer mb-1"
            onClick={() => {
              const editor = quillRef.current.getEditor();
              const line = editor.getLine(index);
              const lineIndex = line ? editor.getIndex(line[0]) : editor.getLength();
              insertLineNode(editor, lineIndex);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomQuillEditor;
