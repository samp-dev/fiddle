import React, { Component } from 'react';
import { Button, Classes, Dialog, Icon, Intent } from '@blueprintjs/core';

import './style.scss';

interface IState {
  helpDialogOpen: boolean
}

class Footer extends Component<{}, IState> {
  state = {
    helpDialogOpen: false
  }

  constructor(props: any) {
    super(props);

    this.handleDialogOpen = this.handleDialogOpen.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  private handleDialogOpen() {
    this.setState({ helpDialogOpen: true });
  }

  private handleDialogClose() {
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
            <p><strong>Usage</strong></p>
            <p>
              Palantir Foundry radically reimagines the way enterprises interact with data by amplifying
              and extending the power of data integration. With Foundry, anyone can source, fuse, and
              transform data into any shape they desire. Business analysts become data engineers — and
              leaders in their organization’s data revolution.
            </p>
            <br />
            <p><strong>Hotkeys</strong></p>
            <p>
              In Foundry, tables, applications, reports, presentations, and spreadsheets operate as data
              integrations in their own right. Access controls, transformation logic, and data quality
              flow from original data source to intermediate analysis to presentation in real time. Every
              end product created in Foundry becomes a new data source that other users can build upon.
              And the enterprise data foundation goes where the business drives it.
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
        </div>
      </>
    );
  }
}

export default Footer;
