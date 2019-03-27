export interface IDependency {
  user: string;
  repo: string;
  classification: string;
  dependencies?: string[];
  resources?: Object[];
}

export interface IMetaData {
  uuid: string;
  title: string;
  dependencies: IDependency[];
  shared: boolean;
}

export interface IPawnPackage {
  entry: string;
  output: string;
  dependencies: string[];
}

export interface IBuildResponse {
  success: boolean;
  error: string;
}
