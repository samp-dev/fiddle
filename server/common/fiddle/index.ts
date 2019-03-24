import getUUID from 'uuid-by-string';
import fs from 'async-file';
import path from 'path';
import os from 'os';
import execa, { ExecaChildProcess } from 'execa';

import { IBuildResponse, IDependency, IMetaData, IPawnPackage } from './interfaces';
import { IExtendedSocket } from '../socket/interfaces';

import l from '../logger';

const FIDDLE_PATH = './fiddles/';

export default class Fiddle {
  private fiddleID: string;
  public title: string;
  public dependencies: IDependency[];
  public content: string;
  public process: ExecaChildProcess;

  //constructor() {
  //  Moved everything to setData() because async operations in constructors are bAd PrAcTiCe
  //}

  static getUUIDbyFiddleID(humanReadableID: string): string {
    return getUUID(humanReadableID);
  }

  static getErrorFormat(errorType: string): string {
    switch (errorType) {
      case 'fatal': return ' FATAL ';
      case 'error': return ' ERROR ';
      case 'warning': return 'WARNING';
    }
  }

  private getFiddleRootPath(): string {
    const fiddleUUID: string = Fiddle.getUUIDbyFiddleID(this.fiddleID);
    return path.join(FIDDLE_PATH, fiddleUUID);
  }

  private getMetaDataPath(): string {
    return path.join(this.getFiddleRootPath(), 'fiddle.json');
  }

  private getScriptPath(): string {
    return path.join(this.getFiddleRootPath(), 'script.pwn');
  }

  private getPawnPackagePath(): string {
    return path.join(this.getFiddleRootPath(), 'pawn.json');
  }

  async setData(fiddleID: string, title: string = undefined, dependencies: IDependency[] = undefined, content: string = undefined): Promise<boolean> {
    this.fiddleID = fiddleID;
    this.title = title;
    this.dependencies = dependencies;
    this.content = content;

    if (!title && !dependencies && !content) {
      // Load existing fiddle
      if (!await this.loadFiddle())
        return false;
    }

    return true;
  }

  async loadFiddle(): Promise<boolean> {
    const metaDataPath: string = this.getMetaDataPath();
    const scriptPath: string = this.getScriptPath();

    if (!(await fs.exists(metaDataPath) && await fs.exists(scriptPath)))
      return false;

    try {
      const metaData: IMetaData = JSON.parse(await fs.readFile(metaDataPath, 'utf8'));

      this.title = metaData.title;
      this.dependencies = metaData.dependencies;
      this.content = await fs.readFile(scriptPath, 'utf8');
    } catch (ex) {
      return false;
    }

    return true;
  }

  async save(share: boolean = false): Promise<boolean> {
    try {
      const fiddleRootPath: string = this.getFiddleRootPath();
      const pawnPackagePath: string = this.getPawnPackagePath();
      const metaDataPath: string = this.getMetaDataPath();
      const scriptPath: string = this.getScriptPath();

      this.dependencies = [...new Set(this.dependencies)];

      if (!(await fs.exists(fiddleRootPath)))
        await fs.createDirectory(fiddleRootPath);

      if (!(await fs.exists(metaDataPath))) {
        const metaData: IMetaData = {
          uuid: Fiddle.getUUIDbyFiddleID(this.fiddleID),
          title: this.title.trim(),
          dependencies: this.dependencies,
          shared: false
        };

        await fs.writeFile(metaDataPath, JSON.stringify(metaData));
      }

      const { shared }: IMetaData = JSON.parse(await fs.readFile(metaDataPath, 'utf8'));

      if (shared) // Return immediately, if the fiddle has already been shared
        return true;

      const metaData: IMetaData = {
        uuid: Fiddle.getUUIDbyFiddleID(this.fiddleID),
        title: this.title.trim(),
        dependencies: this.dependencies,
        shared: share
      };
      await fs.writeFile(metaDataPath, JSON.stringify(metaData));

      const pawnPackage: IPawnPackage = {
        entry: 'script.pwn',
        output: 'script.amx',
        dependencies: this.dependencies.map(dependency => `${dependency.user}/${dependency.repo}`)
      }
      await fs.writeFile(pawnPackagePath, JSON.stringify(pawnPackage));

      await fs.writeFile(scriptPath, this.content); // TODO: Encoding?
    } catch (ex) {
      return false;
    }

    return true;
  }

  async ensure(): Promise<boolean> {
    try {
      const process = await execa('sampctl', ['package', 'ensure'], {
        cwd: this.getFiddleRootPath()
      });

      l.debug('[ENSURE]', process);

      return true;
    } catch (ex) {
      l.error('[ENSURE]', ex);
      return false;
    }
  }

  async build(): Promise<IBuildResponse> {
    try {
      const process = await execa('sampctl', ['package', 'build'], {
        cwd: this.getFiddleRootPath()
      });

      l.debug('[BUILD]', process);

      return {
        success: true,
        error: ''
      };
    } catch (ex) {
      l.debug('[BUILD ERROR]', ex); // Can be an error caused by the user (errors in script)

      const stdout: string = ex.stdout.replace('\\n', os.EOL);
      const regex: RegExp = /\/.*\/script\.pwn\:(\d+)\s\((\w+)\)\s(.*)/g;
      const matches: RegExpMatchArray = stdout.match(regex);

      let errors: string[] = [];

      if (matches.length) {
        let groups: RegExpExecArray;
        while (groups = regex.exec(stdout)) { // ehre @Bios-Marcel
          errors.push(`<b>[${Fiddle.getErrorFormat(groups[2])}]</b> Line ${groups[1]}: ${groups[3]}`);
        }
      }

      return {
        success: false,
        error: errors.join('<br />')
      };
    }
  }

  async run(): Promise<boolean> {
    try {
      if (this.process)
        return false;
      
      // TODO: Readd docker (docker-in-docker) support to run fiddles in a container
      this.process = execa('firejail', [
        '--overlay-tmpfs',
        '-c',
        'sampctl',
        'package',
        'run'
      ], {
        cwd: path.resolve(this.getFiddleRootPath())
      });
      setTimeout(this.terminate.bind(this, this.process), 2 * 60 * 1000); // 2 Minutes

      return true;
    } catch (ex) {
      l.error('[RUN]', ex);
      return false;
    }
  }

  terminate(process: ExecaChildProcess = null): boolean {
    if (process) {
      process.kill('SIGINT');
      return true;
    }

    if (!this.process)
      return false;

    this.process.kill('SIGINT');
    this.process = null;

    return true;
  }

  subscribeConsole(socket: IExtendedSocket): void {
    let packagesDownloaded = false;

    socket.emit('appendConsole', 'Running script...<br />');

    this.process.stdout.on('data', (data: Buffer) => {
      const bufferString: string = data.toString('utf8');
      const line: string = bufferString.replace(/\n/g, '<br />');

      l.debug('[CONSOLE]', `[${Fiddle.getUUIDbyFiddleID(socket.fiddleID)}]`, bufferString);

      if (line.match(/Server\sPlugins/g)) 
        packagesDownloaded = true;

      if (packagesDownloaded)
        socket.emit('appendConsole', line);
    });
  }

  subscribeTerminate(socket: IExtendedSocket, callback: Function) {
    this.process.on('error', () => {
      this.process = null;
      callback(socket);
    });
    
    this.process.on('close', () => {
      this.process = null;
      callback(socket);
    });

    /*
     * TODO: Hide update messages when server shuts down / crashes:
     *
     * INFO: 
     * -
     *
     * INFO: sampctl version 1.8.38 available!
     * INFO: You are currently using 1.8.37
     * INFO: To upgrade, use the following command:
     * INFO: Debian/Ubuntu based systems:
     * INFO: curl https://raw.githubusercontent.com/Southclaws/sampctl/master/install-deb.sh | sh
     * INFO: CentOS/Red Hat based systems
     * INFO: curl https://raw.githubusercontent.com/Southclaws/sampctl/master/install-rpm.sh | sh
     * INFO: If you have any problems upgrading, please open an issue:
     * INFO: https://github.com/Southclaws/sampctl/issues/new
     */
  }
}
