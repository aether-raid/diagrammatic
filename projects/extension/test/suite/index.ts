import { glob as globCallback } from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '../');

  return new Promise((resolve, reject) => {
    globCallback('**/*.test.js', { cwd: testsRoot })
      .then((files: string[]) => {
        files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

        mocha.run(failures => {
          if (failures > 0) reject(new Error(`${failures} tests failed.`));
          else resolve();
        });
      })
      .catch(err => reject(err));
  });
}
