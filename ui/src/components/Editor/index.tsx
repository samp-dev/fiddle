import React, { Component } from 'react';

import MonacoEditor from '@uiw/react-monacoeditor';
import _ from 'lodash';

import socketClient from '../../socketClient';

import scssVars from './style.scss';

interface Props {
  readonly width?: Number,
  readonly height?: Number,
  readonly top?: Number,
  readonly bottom?: Number,
  readonly left?: Number,
  readonly right?: Number,
}

class Editor extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.editorDidMount = this.editorDidMount.bind(this);
    this.onContentChange = this.onContentChange.bind(this);
  }

  editorDidMount(editor: any, monaco: any) {
    monaco.editor.defineTheme('pawnFiddle', {
      base: 'vs-dark',
      inherit: true,
      rules: [{ background: scssVars.monacoBackground }],
      colors: {
        'editor.background': scssVars.monacoBackground,
        'editorCursor.foreground': scssVars.monacoCursor,
        'editorGutter.background': scssVars.monacoGutterBackground,
        'editor.lineHighlightBorder': scssVars.monacoGutterBackground
      }
    });
    monaco.editor.setTheme('pawnFiddle');

    editor.focus();
  }

  onContentChange(newValue: string, event: Event): void {
    socketClient.socket.emit('setContent', newValue);
  }

  render() {
    return (
      <MonacoEditor
        width={this.props.width}
        height={this.props.height}
        language={'c'}
        defaultValue={'#include <a_samp>'}
        options={{
          theme: 'vs-dark',
          readOnly: false
        }}
        editorDidMount={this.editorDidMount}
        onChange={_.debounce(this.onContentChange, 550)}
        >
      </MonacoEditor>
    );
  }
}

export default Editor;
