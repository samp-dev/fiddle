import React, { Component } from 'react';
import 'tabler-react/dist/Tabler.css';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import {
  Site,
  Card,
  Header,
  Button,
} from "tabler-react";


class App extends Component {
  render() {
    return (
      <>
        {/*<Router>
            <Switch>
                <Route exact path='/'>
                    <Redirect to={'/route'} />
                </Route>
                <Route exact path={'/:fiddle'} component={Fiddle} />
                <Route component={Error_404} />
            </Switch>
        </Router>*/}
        <Site>
          <Site.Header>
            <Header>PAWN fiddle</Header>
            <Button color={'success'} icon={'play'}>
              Run (F5)
            </Button>
          </Site.Header>
          <Site.Header>
            Powered by
          </Site.Header>
        </Site>
      </>
    );
  }
}

export default App;
