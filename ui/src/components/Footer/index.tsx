import React, { Component } from 'react';
import { Button, Classes, Dialog, Icon, Intent } from '@blueprintjs/core';

import './style.scss';

interface IState {
  helpDialogOpen: boolean;
}

class Footer extends Component<{}, IState> {
  state: IState = {
    helpDialogOpen: false
  }

  constructor(props: any) {
    super(props);

    this.handleDialogOpen = this.handleDialogOpen.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  private handleDialogOpen(): void {
    this.setState({ helpDialogOpen: true });
  }

  private handleDialogClose(): void {
    this.setState({ helpDialogOpen: false });
  }

  render() {
    return (
      <>
        <Dialog
          icon={'help'}
          isOpen={this.state.helpDialogOpen}
          onClose={this.handleDialogClose}
          title={'PAWN Fiddle Help'}
          className={'bp3-dark'}
        >
          <div className={Classes.DIALOG_BODY}>
            <p><strong>What is this?</strong></p>
            <p>
              PAWN Fiddle is a playground platform for the PAWN scripting language. It allows you to create, execute, share and fork code snippets across the SA-MP community.
            </p>
            <br />
            <p><strong>Support</strong></p>
            <p>
              Have you found a bug or do you need help? Don't hesitate and open an issue on GitHub or find me on the <a href={'https://discord.sa-mp.dev'}>SA-MP Discord</a>. (pkfln#1337)
            </p>
            <br />
            <p><strong>Open source</strong></p>
            <p>
              The project source is available on <a href={'https://github.com/samp-dev/fiddle'}>GitHub</a>.
            </p>
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                <Button onClick={this.handleDialogClose}>Close</Button>
            </div>
          </div>
        </Dialog>
        <div className={'row footer bp3-navbar'}>
          PAWN Fiddle <Button className={'bp3-minimal'} onClick={this.handleDialogOpen} icon={'help'}></Button> |
          Made with <Icon icon={'heart'} intent={Intent.DANGER} /> by <a href={'https://sa-mp.dev'}>sa-mp.dev</a> | Powered by <a href={'http://sampctl.com'}>sampctl</a>
          <div className={'recaptcha-footer'}>
            This site is protected by reCAPTCHA and the Google <a href="https://policies.google.com/privacy">Privacy Policy</a> and <a href="https://policies.google.com/terms">Terms of Service</a> apply.
          </div>
        </div>
      </>
    );
  }
}

export default Footer;
