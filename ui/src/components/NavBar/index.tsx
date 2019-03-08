import React, { Component } from 'react';
import { Classes, Navbar, Alignment, EditableText, Button, Popover, Spinner, KeyCombo } from '@blueprintjs/core';

import './style.scss';

import logoPath from '../../assets/images/pawnlogo.png';

class NavBar extends Component {
  render() {
    return (
      <Navbar className={'row navbar'}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            <img src={logoPath} style={{ marginTop: '4px' }} alt={'PAWN Logo'} />
          </Navbar.Heading>
          <Navbar.Heading>
            <EditableText confirmOnEnterKey={true} placeholder={'Click here to give your fiddle a meaningful title'} maxLength={100} />
          </Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Popover>
              <Button className={'bp3-minimal'} icon={'share'} text={'Share'} large />
              <div className={'sharePopover'}>
                <Spinner intent={'primary'} size={Spinner.SIZE_SMALL} />
                {/*<p>Your fiddle is now publicly available here:</p>
                <code className={'bp3-code shareURL'}>https://fiddle.sa-mp.dev/OddPortentBullfrog</code>*/}
              </div>
          </Popover>
          <Button className={'bp3-minimal'} icon={'fork'} text={'Fork'} large />
          <Button className={'bp3-minimal'} icon={'play'} text={'Run'} large />
        </Navbar.Group>
      </Navbar>
    );
  }
}

export default NavBar;