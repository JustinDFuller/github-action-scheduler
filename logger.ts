export interface Logger {
  debug: (message: string) => void;
  notice: (message: string) => void;
  fail: (message: string) => void;
  setOutput: (name: string, value: any) => void;
}
