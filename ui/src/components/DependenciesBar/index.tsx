import React, { Component } from 'react';
import { Button, Intent, H4, Tree, ITreeNode, Divider } from '@blueprintjs/core';
import Scrollbars from 'react-custom-scrollbars';
import Select/*, { components as selectComponents }*/ from 'react-select';
import { Theme } from 'react-select/lib/types';

import socketClient from '../../socketClient';
import Toast from '../../toast';

import scssVars from './style.scss';

interface IState {
  locked: boolean,
  dependencies: IDependency[]
  availableDependencies: IAvailableDependency[],
  selectedDependency: IAvailableDependency | null
}

interface IDependency {
  user: string,
  repo: string,
  dependencies?: string[],
  resources?: Object[]
}

interface IAvailableDependency {
  label: string,
  value: IDependency
}

class DependenciesBar extends Component<{}, IState> {
  state: IState = {
    locked: false,
    dependencies: [],
    availableDependencies: [],
    selectedDependency: null
  }

  selectTheme = (theme: Theme): Theme => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary: scssVars.selectHover,
      primary25: scssVars.selectHover,
      primary50: scssVars.selectHover,
      neutral0: scssVars.selectBackground,
      neutral40: scssVars.selectCaretHover,
      neutral50: scssVars.selectCaretHover,
      neutral80: scssVars.selectCaretHover
    }
  });

  /* TODO: Scrollbars in Menu
  selectMenu = (props: any): any => (
      <selectComponents.Menu {...props}>
        <Scrollbars>
          {props.children}
        </Scrollbars>
      </selectComponents.Menu>
  );*/

  constructor(props: any) {
    super(props);

    this.dependencyTreeBuilder = this.dependencyTreeBuilder.bind(this);
    this.addDependency = this.addDependency.bind(this);
    this.removeDependency = this.removeDependency.bind(this);
    this.syncDependencies = this.syncDependencies.bind(this);

    socketClient.socket.on('reconnect', this.onReconnect.bind(this));
    socketClient.socket.on('setContentLockState', this.onSetContentLockState.bind(this));
    socketClient.socket.on('setDependencies', this.onSetDependencies.bind(this));
  }

  private onReconnect(): void {
    this.syncDependencies();
  }

  private onSetContentLockState(locked: boolean): void {
    this.setState({ locked });
  }

  private onSetDependencies(dependencies: IDependency[]): void {
    this.setState({ dependencies });
  }

  private dependencyTreeBuilder(): ITreeNode[] {
    return this.state.dependencies.map((value: IDependency, index: number): ITreeNode => ({
      id: index,
      icon: (value.resources) ? 'code-block' : 'document',
      label: `${value.user}/${value.repo}`,
      secondaryLabel: this.state.locked ? null : <Button icon={'remove'} className={'bp3-minimal'} onClick={() => this.removeDependency(value)} />,
      hasCaret: false,
      isExpanded: true,
      childNodes: (!value.dependencies) ? [] : value.dependencies.map((dependency: string, offsetIndex: number): ITreeNode => ({
        id: 1000 * index + offsetIndex,
        icon: 'import',
        label: dependency
      }))
    }));
  }

  private removeDependency(dependency: IDependency): void {
    const dependencies: IDependency[] = this.state.dependencies.filter(e => e !== dependency);
    const availableDependencies: IAvailableDependency[] = this.state.availableDependencies.concat({
      label: `${dependency.user}/${dependency.repo}`,
      value: dependency
    });
    this.setState({ dependencies, availableDependencies });
    Toast.show({ intent: Intent.SUCCESS, icon: 'tick', message: `Removed ${dependency.user}/${dependency.repo} from the dependencies.` });
  }

  private onDependencyList(availableDependencies: IAvailableDependency[]): void {
    this.setState({ availableDependencies });
  }

  // Seems to be incorrectly typed: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/32553
  private addDependency(selectedDependency: IAvailableDependency): any {
    if (this.state.dependencies.length >= 10)
      return Toast.show({ intent: Intent.DANGER, icon: 'error', message: 'You cannot add more than 10 dependencies.' });

    const dependencies: IDependency[] = this.state.dependencies.concat(selectedDependency.value);
    const availableDependencies: IAvailableDependency[] = this.state.availableDependencies.filter(e => e !== selectedDependency);
    this.setState({ dependencies, availableDependencies });
    Toast.show({ intent: Intent.SUCCESS, icon: 'tick', message: `Added ${selectedDependency.label} to the dependencies.` });
  }

  private syncDependencies(): void {
    if (!this.state.locked)
      socketClient.socket.emit('setDependencies', this.state.dependencies);
  }

  componentDidMount() {
    socketClient.socket.on('dependencyList', this.onDependencyList.bind(this));
    socketClient.socket.emit('dependencyList');
  }

  componentDidUpdate(prevProps: {}, prevState: IState) {
    if (this.state.dependencies !== prevState.dependencies)
      this.syncDependencies();
  }

  render() {
    return (
      <Scrollbars className={'dependencies-bar'} style={{ height: 'none !important' }}>
        {this.state.locked ? '' : (
          <>
            <H4 className={'heading-margin'}>Add dependency</H4>
            <Select
              className={'dependency-select-margin'}
              isDisabled={this.state.locked}
              value={this.state.selectedDependency}
              isSearchable={true}
              options={this.state.availableDependencies}
              theme={this.selectTheme}
              //components={{ Menu: this.selectMenu }}
              // @ts-ignore
              onChange={this.addDependency}
            />
            <Divider />
          </>
        )}
        <H4 className={'heading-margin'}>{this.state.locked ? 'D' : 'Manage d'}ependencies ({this.state.dependencies.length})</H4>
        <Tree contents={this.dependencyTreeBuilder()} />
      </Scrollbars>
    );
  }
}

export default DependenciesBar;
