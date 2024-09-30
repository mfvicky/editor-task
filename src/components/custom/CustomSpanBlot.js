// import Quill from 'quill';

// const Inline = Quill.import('blots/inline');

// class CustomSpanBlot extends Inline {
//   static create() {
//     const node = super.create();
//     node.classList.add('custom-span'); // Add the desired class
//     node.innerHTML = '● '; // Content inside the span
//     return node;
//   }

//   static formats(node) {
//     return node.classList.contains('custom-span') ? 'custom-span' : null;
//   }
// }

// // Register the custom blot
// CustomSpanBlot.blotName = 'customSpan';
// CustomSpanBlot.tagName = 'span';
// Quill.register(CustomSpanBlot);
import Quill from 'quill';

// Define an inline blot for the custom span
const Inline = Quill.import('blots/inline');

class CustomSpanBlot extends Inline {
  static create() {
    const node = super.create();
    node.classList.add('custom-span');
    node.innerHTML = '● '; // Dot or any content for the span
    return node;
  }
}

CustomSpanBlot.blotName = 'customSpan';
CustomSpanBlot.tagName = 'span';
Quill.register(CustomSpanBlot);
