import React, { Component } from 'react';
import { Button, H5, Intent, ITagProps, MenuItem, Switch, H4, Tree, TreeNode, ITreeNode, Divider } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import Scrollbars from 'react-custom-scrollbars';
import AsyncSelect from 'react-select/lib/Async';

import './style.scss';
import { reporters } from 'mocha';

interface IState {
  dependencies: IDependency[]
}

interface IDependency {
  user: string,
  repo: string,
  dependencies?: string[],
  resources?: Object[]
}

class DependenciesBar extends Component<{}, IState> {
  state: IState = {
    // @ts-ignore
    dependencies: [
      {
        "user": "maddinat0r",
        "repo": "samp-log",
        // @ts-ignore
        "contributors": [
          "maddinat0r"
        ],
        "runtime": {
          "plugins": [
            "maddinat0r/samp-log"
          ]
        },
        "resources": [
          {
            "name": "^log-plugin-(.*)-[Ll]inux.tar.gz$",
            "platform": "linux",
            "archive": true,
            "includes": [
              "pawno/include"
            ],
            "plugins": [
              "plugins/log-plugin.so"
            ],
            "files": {
              "log-core.so": "log-core.so"
            }
          },
          {
            "name": "^log-plugin-(.*)-win32.zip$",
            "platform": "windows",
            "archive": true,
            "includes": [
              "pawno/include"
            ],
            "plugins": [
              "plugins/log-plugin.dll"
            ],
            "files": {
              "log-core.dll": "log-core.dll"
            }
          }
        ],
        "classification": "full",
        "stars": 17,
        "updated": "2019-01-30T14:18:57Z",
        "topics": [
          "cpp",
          "logger",
          "sa-mp"
        ],
        "tags": [
          "v0.4",
          "v0.3",
          "v0.2.1",
          "v0.2",
          "v0.1"
        ]
      },
      {
        "user": "Osamakurdi",
        "repo": "DS-and-OS",
        // @ts-ignore
        "classification": "basic",
        "stars": 0,
        "updated": "2018-01-16T17:03:37Z",
        "topics": [],
        "tags": null
      },
      {
        "user": "Aktah",
        "repo": "SA-MP-CODEAK",
        // @ts-ignore
        "entry": "gamemodes\\codeak.pwn",
        "output": "gamemodes\\codeak.amx",
        "dependencies": [
          "sampctl/samp-stdlib",
          "Awsomedude/easyDialog:2.0",
          "pBlueG/SA-MP-MySQL",
          "urShadow/Pawn.CMD",
          "Zeex/samp-plugin-crashdetect",
          "AGraber/samp-dl-compat",
          "samp-incognito/samp-streamer-plugin",
          "maddinat0r/sscanf:v2.8.2",
          "Open-GTO/foreach:v19.0",
          "Southclaws/samp-whirlpool",
          "aktah/SAMP-CEFix",
          "pawn-lang/YSI-Includes"
        ],
        "local": true,
        "runtime": {
          "version": "0.3.7",
          "mode": "server",
          "echo": "-",
          "gamemodes": [
            "codeak"
          ],
          "rcon_password": "-/JaZg523/?<",
          "port": 7777,
          "hostname": "SA-MP-CODEAK",
          "maxplayers": 32,
          "language": "TH",
          "mapname": "San Andreas",
          "weburl": "www.sa-mp.com",
          "gamemodetext": "CAKE:1.0.0",
          "announce": true,
          "lanmode": false,
          "query": true,
          "rcon": false,
          "logqueries": false,
          "sleep": 5,
          "maxnpc": 0,
          "stream_rate": 1000,
          "stream_distance": 200,
          "onfoot_rate": 30,
          "incar_rate": 30,
          "weapon_rate": 30,
          "chatlogging": true,
          "timestamp": true,
          "messageholelimit": 3000,
          "messageslimit": 500,
          "ackslimit": 3000,
          "playertimeout": 10000,
          "minconnectiontime": 0,
          "lagcompmode": 1,
          "connseedtime": 300000,
          "db_logging": false,
          "db_log_queries": false,
          "conncookies": true,
          "cookielogging": false,
          "output": true
        },
        "classification": "full",
        "stars": 0,
        "updated": "2018-11-10T02:22:17Z",
        "topics": [],
        "tags": null
      }
    ]
  }

  constructor(props: any) {
    super(props);

    this.dependencyTreeBuilder = this.dependencyTreeBuilder.bind(this);
    this.removeDependency = this.removeDependency.bind(this);
  }

  private dependencyTreeBuilder(): ITreeNode[] {
    return this.state.dependencies.map((value: IDependency, index: number): ITreeNode => ({
      id: index,
      icon: (value.resources) ? 'code-block' : 'document',
      label: `${value.user}/${value.repo}`,
      secondaryLabel: <Button icon={'remove'} className={'bp3-minimal'} onClick={() => this.removeDependency(value)} />,
      hasCaret: !(!value.dependencies),
      isExpanded: true,
      childNodes: (!value.dependencies) ? [] : value.dependencies.map((dependency: string, offsetIndex: number): ITreeNode => ({
        id: 1000 * index + offsetIndex,
        icon: 'import',
        label: dependency
      }))
    }));
  }

  private removeDependency(dependency: IDependency) {
    let { dependencies } = this.state;
    dependencies = dependencies.filter(e => e !== dependency)
    this.setState({ dependencies });
  }

  render() {
    return (
      <Scrollbars className={'dependencies-bar'}>
        <H4 className={'heading-margin'}>Add dependency</H4>
        <AsyncSelect className={'dependency-select-margin'}></AsyncSelect>
        <Divider />
        <H4 className={'heading-margin'}>Manage dependencies</H4>
        <Tree
          contents={this.dependencyTreeBuilder()}
          onNodeCollapse={(node: ITreeNode) => { node.isExpanded = false; this.setState(this.state); console.log(node); }}
          onNodeExpand={(node: ITreeNode) => { node.isExpanded = true; this.setState(this.state); console.log(node); }}
        >
        </Tree>
      </Scrollbars>
    );
  }
}

export default DependenciesBar;
