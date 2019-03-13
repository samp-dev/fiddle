import getUUID from 'uuid-by-string';
import fs from 'async-file';
import path from 'path';

import { IDependency } from '../socket/interfaces';

interface IMetaData {
  uuid: string,
  title: string,
  dependencies: IDependency[],
  shared: string
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

  private getMetaDataPath(): string {
    const fiddleUUID: string = Fiddle.getUUIDbyFiddleID(this.fiddleID);
    console.log(fiddleUUID);
    return path.join(FIDDLE_PATH, fiddleUUID, 'fiddle.json');
  }

  private getScriptPath(): string {
    const fiddleUUID: string = Fiddle.getUUIDbyFiddleID(this.fiddleID);
    return path.join(FIDDLE_PATH, fiddleUUID, 'script.pwn');
  }

  async setData(fiddleID: string, title: string = undefined, dependencies: IDependency[] = undefined, content: string = undefined): Promise<void> {
    this.fiddleID = fiddleID;
    this.title = title;
    this.dependencies = dependencies;
    this.content = content;

    if (!title && !dependencies && !content) {
      // Load existing fiddle
      await this.loadFiddle();
    }
  }

  async loadFiddle(): Promise<boolean> {
    const metaDataPath = this.getMetaDataPath();
    const scriptPath = this.getScriptPath();

    if (!(await fs.exists(metaDataPath) && await fs.exists(scriptPath)))
      return false;

    const metaData: IMetaData = JSON.parse(await fs.readFile(metaDataPath, 'utf8'));

    this.title = metaData.title;
    this.dependencies = metaData.dependencies;
    this.content = await fs.readFile(scriptPath, 'utf8');
  }

  run(): boolean {
    return true;
  }
}
