import getUUID from 'uuid-by-string';

import { IDependency } from '../socket/interfaces';

export default class Fiddle {
  private fiddleID: string;
  private title: string;
  private dependencies: IDependency[];
  private content: string;

  constructor(fiddleID: string, title: string = undefined, dependencies: IDependency[] = undefined, content: string = undefined) {
    this.fiddleID = fiddleID;
    this.title = title;
    this.dependencies = dependencies;
    this.content = content;

    if (!title && !dependencies && !content) {
      // Load existing fiddle
      
    }
  }

  static getUUIDbyFiddleID(humanReadableID: string): string {
    return getUUID(humanReadableID);
  }

  get getFiddleID(): string { return this.fiddleID; }
  get getTitle(): string { return this.title; }
  get getDependencies(): IDependency[] { return this.dependencies; }
  get getContent(): string { return this.content; }


}
