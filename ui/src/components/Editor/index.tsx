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
    this.syncContent = this.syncContent.bind(this);

    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('setContentLockState', this.onSetContentLockState.bind(this));
    socketClient.socket.on('setContent', this.onSetContent.bind(this));
  }

  private onReconnect(): void {
    this.syncContent(this.state.editorInstance.getValue());
  }

  private onSetContentLockState(locked: boolean): void {
    this.setState({ locked }, this.state.editorInstance.updateOptions({ readOnly: locked }));
  }

  private onSetContent(initialContent: string): void {
    this.setState({ initialContent });
  }

  private onContentChange(newValue: string, event: Event): void {
    this.syncContent(newValue);
  }

  private syncContent(value: string): void {
    if (!this.state.locked)
      socketClient.socket.emit('setContent', value);
  }

  editorDidMount(editor: any, monaco: any): void {
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
