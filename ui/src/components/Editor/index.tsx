import React, { Component } from 'react';

//import MonacoEditor from 'react-monaco-editor';
import MonacoEditor from '@uiw/react-monacoeditor';

import './style.scss';

class Editor extends Component {
  render() {
    return (
      <MonacoEditor
        language="html"
        value="<h1>I ♥ react-monacoeditor</h1>"
        options={{
          theme: 'vs-dark',
        }}>
      </MonacoEditor>
    );
  }
}

export default Editor;
