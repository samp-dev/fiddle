import React, { Component } from 'react';
import { Navbar, Alignment, EditableText, Button } from '@blueprintjs/core';

import './style.scss';

class NavBar extends Component {
  render() {
    return (
      <Navbar className={'row navbar'}>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>
            Logo
          </Navbar.Heading>
          <Navbar.Heading>
            <EditableText confirmOnEnterKey={true} placeholder={'Click here to give your fiddle a meaningful title'} />
          </Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Button className="bp3-minimal" icon={'fork'} text={'Fork'} large />
          <Button className="bp3-minimal" icon={'play'} text={'Run (F5)'} large />
        </Navbar.Group>
      </Navbar>
    );
  }
}

export default NavBar;