import Quill from 'quill';

// Custom blot for dotted line paragraphs
const Block = Quill.import('blots/block');

class DottedLineBlot extends Block {
  static create() {
    const node = super.create();
    node.classList.add('dotted-line-paragraph');
    return node;
  }
}

// Register the custom blot
DottedLineBlot.blotName = 'dottedLine';
DottedLineBlot.tagName = 'p';
Quill.register(DottedLineBlot);

const applyDottedLineFormatting = (editor) => {
  const paragraphs = editor.root.querySelectorAll('p');
  paragraphs.forEach((p) => {
    if (!p.classList.contains('dotted-line-paragraph')) {
      p.classList.add('dotted-line-paragraph');
    }
  });
};

export default applyDottedLineFormatting;
