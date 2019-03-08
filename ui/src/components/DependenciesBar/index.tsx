import React, { Component } from 'react';
import { Button, H5, Intent, ITagProps, MenuItem, Switch, H4, Tree, TreeNode, ITreeNode, Divider, Toaster, Position } from '@blueprintjs/core';
import Scrollbars from 'react-custom-scrollbars';
import Select from 'react-select';
import { Styles } from 'react-select/lib/styles';

import './style.scss';
import socketClient from '../../socketClient';

interface IState {
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
    dependencies: [],
    availableDependencies: [],
    selectedDependency: null
  }

  selectStyle: Partial<Styles> = {
    option: (base: React.CSSProperties, {}): React.CSSProperties => {
      return { ...base,  };
    }
  }

  constructor(props: any) {
    super(props);

    this.dependencyTreeBuilder = this.dependencyTreeBuilder.bind(this);
    this.addDependency = this.addDependency.bind(this);
    this.removeDependency = this.removeDependency.bind(this);

    this.onDependencyList = this.onDependencyList.bind(this);
  }

  private dependencyTreeBuilder(): ITreeNode[] {
    return this.state.dependencies.map((value: IDependency, index: number): ITreeNode => ({
      id: index,
      icon: (value.resources) ? 'code-block' : 'document',
      label: `${value.user}/${value.repo}`,
      secondaryLabel: <Button icon={'remove'} className={'bp3-minimal'} onClick={() => this.removeDependency(value)} />,
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
    Toaster
      .create({ position: Position.TOP })
      .show({ intent: Intent.SUCCESS, icon: 'tick', message: `Removed ${dependency.user}/${dependency.repo} from the dependencies.` });
  }

  private onDependencyList(availableDependencies: IAvailableDependency[]): void {
    this.setState({ availableDependencies });
  }

  // Seems to be incorrectly typed: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/32553
  private addDependency(selectedDependency: IAvailableDependency): any {
    if (this.state.dependencies.length >= 10)
      return Toaster.create({ position: Position.TOP }).show({ intent: Intent.DANGER, icon: 'error', message: 'You cannot add more than 10 dependencies.' });

    const dependencies: IDependency[] = this.state.dependencies.concat(selectedDependency.value);
    const availableDependencies: IAvailableDependency[] = this.state.availableDependencies.filter(e => e !== selectedDependency);
    this.setState({ dependencies, availableDependencies });
    Toaster
      .create({ position: Position.TOP })
      .show({ intent: Intent.SUCCESS, icon: 'tick', message: `Added ${selectedDependency.label} to the dependencies.` });
  }

  componentDidMount() {
    socketClient.socket.on('dependencyList', this.onDependencyList);
    socketClient.socket.emit('dependencyList');
  }

  render() {
    return (
      <Scrollbars className={'dependencies-bar'} style={{ height: 'none !important' }}>
        <H4 className={'heading-margin'}>Add dependency</H4>
        <Select
          className={'dependency-select-margin'}
          value={this.state.selectedDependency}
          isSearchable={true}
          options={this.state.availableDependencies}
          styles={this.selectStyle}
          // @ts-ignore
          onChange={this.addDependency}
        />
        <Divider />
        <H4 className={'heading-margin'}>Manage dependencies ({this.state.dependencies.length})</H4>
        <Tree contents={this.dependencyTreeBuilder()} />
      </Scrollbars>
    );
  }
}

export default DependenciesBar;
