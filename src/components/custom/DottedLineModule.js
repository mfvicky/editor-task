// import Quill from 'quill';

// // Custom blot for dotted line paragraphs
// const Block = Quill.import('blots/block');

// class DottedLineBlot extends Block {
//   static create() {
//     const node = super.create();
//     node.classList.add('dotted-line-paragraph');
//     return node;
//   }
// }

// // Register the custom blot
// DottedLineBlot.blotName = 'dottedLine';
// DottedLineBlot.tagName = 'p';
// Quill.register(DottedLineBlot);

// const applyDottedLineFormatting = (editor) => {
//   const paragraphs = editor.root.querySelectorAll('p');
//   paragraphs.forEach((p) => {
//     if (!p.classList.contains('dotted-line-paragraph')) {
//       p.classList.add('dotted-line-paragraph');
//     }
//   });
// };

// export default { applyDottedLineFormatting };


//final
import Quill from 'quill';
import React from 'react';

// Custom blot for dotted line paragraphs
const Block = Quill.import('blots/block');

class DottedLineBlot extends Block {
  static create() {
    const node = super.create();
    node.classList.add('dotted-line-paragraph');
    //copy paste is not working data-id not unique
    // const uniqueId = 'dotted-' + Math.random().toString(36).substr(2, 9);
    // node.setAttribute('data-id', uniqueId);

    // Create and append a span to simulate ::after
    // const afterSpan = document.createElement('span');
    // afterSpan.classList.add('dotted-line-after');
    // node.appendChild(afterSpan);
    if (!node.querySelector('.dotted-line-after')) {
      const afterSpan = document.createElement('span');
      afterSpan.classList.add('dotted-line-after');
      node.appendChild(afterSpan);
    }

    return node;
  }

  // Optional: a method to get the unique ID of a paragraph
  static getId(node) {
    return node.getAttribute('data-id');
  }
}

// Register the custom blot
DottedLineBlot.blotName = 'dottedLine';
DottedLineBlot.tagName = 'p';
Quill.register(DottedLineBlot);

// Function to apply dotted line formatting
const applyDottedLineFormatting = (editor, setModalData) => {
  const paragraphs = editor.root.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (!p.classList.contains('dotted-line-paragraph')) {
      p.classList.add('dotted-line-paragraph');
    }
    console.log('run-----setModalData(null);')
    setModalData({ id: null, content: null });
    if (p.textContent.trim() === "") { // Check if paragraph is empty
      p.classList.add('empty');
      const uniqueId = 'temp-' + Math.random().toString(36).substr(2, 9);
      p.setAttribute('data-id', uniqueId);
      // const afterSpan = document.createElement('span');
      // afterSpan.classList.add('dotted-line-after');
      // p.appendChild(afterSpan);
      if (!p.querySelector('.dotted-line-after')) {
        // Append the span element only if it does not already exist
        const afterSpan = document.createElement('span');
        afterSpan.classList.add('dotted-line-after');
        p.appendChild(afterSpan);
      }
    } else {
      p.classList.remove('empty');

    }
  });
};

// Click handler to open the input modal
// const handleClick = (event, setModalData) => {
//   const target = event.target;
//   console.log(event.target, "vicky--settttt---")
//   if (target && target.classList.contains('dotted-line-paragraph')) {
//     const uniqueId = target.getAttribute('data-id');
//     // || 'temp-' + Math.random().toString(36).substr(2, 9);
//     // target.setAttribute('data-id', uniqueId);  // Ensure uniqueId is always present

//     // Open modal with the selected paragraph data
//     setModalData({ id: uniqueId, content: target.innerText });
//   }
// };

const handleClick = (event, setModalData) => {
  const target = event.target;
  console.log(target, "Clicked element");

  if (target && target.classList.contains('dotted-line-after')) {
    const parentParagraph = target.closest('.dotted-line-paragraph');
    const uniqueId = parentParagraph.getAttribute('data-id');

    // Open modal with the selected paragraph data
    setModalData({ id: uniqueId, content: parentParagraph.innerText });
  }
};
export { applyDottedLineFormatting, handleClick };
