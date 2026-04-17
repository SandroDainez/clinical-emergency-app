declare module "expo-asset" {
  export class Asset {
    static fromModule(module: number | string | { uri?: string }): Asset;
    localUri: string | null;
    uri: string;
    downloadAsync(): Promise<Asset>;
  }
}
