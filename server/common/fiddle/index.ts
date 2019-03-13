import { Socket } from 'socket.io';
import getUUID from 'uuid-by-string';
import fs from 'async-file';
import path from 'path';

import { IDependency } from '../socket/interfaces';

interface IMetaData {
  uuid: string,
  title: string,
  dependencies: IDependency[],
  shared: boolean
}

interface IPawnPackage {
  entry: string,
  output: string,
  dependencies: string[]
}

const FIDDLE_PATH = './fiddles/';

export default class Fiddle {
  private fiddleID: string;
  public title: string;
  public dependencies: IDependency[];
  public content: string;

  //constructor() {
  //  Moved everything to setData() because async operations in constructors are bAd PrAcTiCe
  //}

  static getUUIDbyFiddleID(humanReadableID: string): string {
    return getUUID(humanReadableID);
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
      const pawnPackagePath: string = this.getPawnPackagePath();
      const metaDataPath: string = this.getMetaDataPath();
      const scriptPath: string = this.getScriptPath();

      if (!(await fs.exists(metaDataPath))) {
        const metaData: IMetaData = {
          uuid: Fiddle.getUUIDbyFiddleID(this.fiddleID),
          title: this.title || `${this.fiddleID}.pwn`,
          dependencies: this.dependencies,
          shared: false
        };

        await fs.writeFile(metaDataPath, metaData);
      }

      const { shared }: IMetaData = JSON.parse(await fs.readFile(metaDataPath, 'utf8'));
      const metaData: IMetaData = {
        uuid: Fiddle.getUUIDbyFiddleID(this.fiddleID),
        title: this.title || `${this.fiddleID}.pwn`,
        dependencies: this.dependencies,
        shared: share ? true : shared
      };
      await fs.writeFile(metaDataPath, metaData);

      const pawnPackage: IPawnPackage = {
        entry: 'script.pwn',
        output: 'script.amx',
        dependencies: this.dependencies.map(dependency => `${dependency.user}/${dependency.repo}`)
      }
      await fs.writeFile(pawnPackagePath, pawnPackage);

      await fs.writeFile(scriptPath, this.content); // TODO: Encoding?
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }

  async run(): Promise<boolean> {
    if (!await this.save())
      return false;
        
    return true;
  }

  subscribeConsole(socket: Socket): void {

  }
}
