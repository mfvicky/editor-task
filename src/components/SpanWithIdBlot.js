import Quill from 'quill';

// Custom inline blot for adding a `data-id` attribute to a span element
const Inline = Quill.import('blots/inline');

class SpanWithIdBlot extends Inline {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-id', value); // Add the custom data-id attribute
    return node;
  }

  static formats(node) {
    return node.getAttribute('data-id'); // Retrieve the `data-id` attribute
  }

  format(name, value) {
    if (name === 'data-id' && value) {
      this.domNode.setAttribute('data-id', value); // Update the `data-id` attribute if it exists
    } else {
      super.format(name, value); // Otherwise, use the parent format method
    }
  }
}

// Register the custom blot
SpanWithIdBlot.blotName = 'spanWithId';
SpanWithIdBlot.tagName = 'span'; // Tag associated with the blot

Quill.register(SpanWithIdBlot); // Register the custom blot globally

export default SpanWithIdBlot; // Export the custom blot
