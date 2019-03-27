import React, { Component } from 'react';
import { Classes, Dialog } from '@blueprintjs/core';

import './style.scss';

interface IErrorDialogProps {
  open: boolean;
  message: string;
}

class ErrorDialog extends Component<IErrorDialogProps> {
  render() {
    return (
      <Dialog
        icon={'error'}
        isOpen={this.props.open}
        title={'PAWN Fiddle Error'}
        className={'bp3-dark'}
        isCloseButtonShown={false}
      >
        <div className={Classes.DIALOG_BODY}>
          <p>{this.props.message}</p>
        </div>
      </Dialog>
    );
  }
}

export default ErrorDialog;
