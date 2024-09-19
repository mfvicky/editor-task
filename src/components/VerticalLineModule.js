import Quill from 'quill';

const LineModule = Quill.import('core/module');

class VerticalLineModule extends LineModule {
  constructor(quill, options = {}) {
    super(quill, options);
    this.quill = quill;
    this.lineColor = options.lineColor || '#FF0000'; // Default line color
    this.dotColor = options.dotColor || '#00FF00'; // Default dot color
    this.createLine();
    this.createDot();
    this.quill.on('selection-change', this.updateDot.bind(this));
  }

  createLine() {
    this.line = document.createElement('div');
    this.line.style.position = 'absolute';
    this.line.style.top = '0';
    this.line.style.bottom = '0';
    this.line.style.left = '0';
    this.line.style.width = '2px';
    this.line.style.backgroundColor = this.lineColor; // Use custom color
    this.line.style.pointerEvents = 'none';
    this.quill.container.appendChild(this.line);
  }

  createDot() {
    this.dot = document.createElement('div');
    this.dot.style.position = 'absolute';
    this.dot.style.width = '10px';
    this.dot.style.height = '10px';
    this.dot.style.borderRadius = '50%';
    this.dot.style.backgroundColor = this.dotColor; // Use custom color
    this.dot.style.display = 'none'; // Initially hidden
    this.dot.style.transform = 'translate(-50%, -50%)'; // Center dot on the line
    this.quill.container.appendChild(this.dot);
  }

  updateDot() {
    const range = this.quill.getSelection();
    if (range) {
      const bounds = this.quill.getBounds(range.index);
      if (range.length > 0) {
        const linePos = bounds.left + bounds.width / 2;
        this.line.style.left = `${linePos}px`;
        this.dot.style.left = `${linePos}px`;
        this.dot.style.top = `${bounds.top + bounds.height / 2}px`;
        this.dot.style.display = 'block';
      } else {
        this.dot.style.display = 'none';
      }
    }
  }
}

// Register the module
Quill.register('modules/verticalLine', VerticalLineModule);

// Export the module
// export default VerticalLineModule;
