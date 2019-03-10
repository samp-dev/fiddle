import React, { Component } from 'react';

import MonacoEditor from '@uiw/react-monacoeditor';
import _ from 'lodash';

import socketClient from '../../socketClient';

import scssVars from './style.scss';

interface IProps {
  readonly width?: Number,
  readonly height?: Number,
  readonly top?: Number,
  readonly bottom?: Number,
  readonly left?: Number,
  readonly right?: Number,
}

interface IState {
  editorInstance: any,
  locked: boolean,
  initialContent: string | null
}

class Editor extends Component<IProps, IState> {
  state: IState = {
    editorInstance: null,
    locked: false,
    initialContent: null
  }
  
  constructor(props: IProps) {
    super(props);

    this.editorDidMount = this.editorDidMount.bind(this);
    this.onContentChange = this.onContentChange.bind(this);

    socketClient.socket.on('setContentLockState', this.onSetContentLockState.bind(this));
    socketClient.socket.on('setContent', this.onSetContent.bind(this));
  }

  private onSetContentLockState(locked: boolean) {
    this.setState({ locked }, this.state.editorInstance.updateOptions({ readOnly: locked }));
  }

  private onSetContent(initialContent: string) {
    this.setState({ initialContent });
  }

  editorDidMount(editor: any, monaco: any) {
    this.setState({ editorInstance: editor });

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
        value={this.state.initialContent}
        language={'c'}
        defaultValue={'#include <a_samp>'}
        options={{
          theme: 'vs-dark'
        }}
        editorDidMount={this.editorDidMount}
        onChange={_.debounce(this.onContentChange, 550)}
        >
      </MonacoEditor>
    );
  }
}

export default Editor;
