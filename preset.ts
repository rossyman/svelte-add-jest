import { Preset, color } from 'apply';

type Dependencies = {
  [key: string]: {
    version: string;
    type?: 'DEV' | 'PEER';
    reliesOn?: string;
  }
}

type Configuration = {
  [key: string]: {
    message: string;
    default: any;
    question?: true;
  }
}

/**
 * Svelte adder utility class.
 *
 * Used to simplify interaction with Preset and approach
 * file-structure modification in a configuration-based way.
 */
abstract class Adder {

  /**
   * The adder's name, which is displayed as the name
   * of the Preset. Specified on the implementation level.
   *
   * @protected
   */
  protected abstract readonly ADDER_NAME: string;

  /**
   * A dictionary of configuration options. Each option
   * will either be determined interactively; when the
   * `--interaction` flag is present, or through CLI flags.
   *
   * @protected
   */
  protected abstract readonly CONFIGURATION: Configuration;

  /**
   * A dictionary of required dependencies. Each dependency
   * has an associated version, and the type can be either
   * explicitly set as 'DEV' or 'PEER', or implicitly
   * inferred as a core dependency when left `undefined`.
   *
   * Each dependency can also specify whether or not they
   * should be installed based on the presence of a
   * configuration option, defined in `CONFIGURATION`.
   *
   * @protected
   */
  protected abstract readonly REQUIRED_DEPENDENCIES: Dependencies;

  /**
   * Runs an adder. Initialises all configuration and
   * dependencies, followed by running the implementation
   * specific functionality.
   */
  run(): void {
    this.initialiseAdder();
  }

  /**
   * Safely extracts a file, ensuring the user acknowledges
   * that their previously defined data will be overwritten.
   *
   * @param title    The title of the specific action being
   *                 performed.
   * @param filename The filename to move from the templates
   *                 folder.
   * @protected
   */
  protected safeExtract(title: string, filename: string) {
    return Preset.extract(filename).whenConflict('ask').withTitle(title);
  }

  protected getConfiguration<T>(key): T {
    return Preset.isInteractive() ? Preset.prompts[key] : Preset.options[key];
  }

  private initialiseAdder(): void {
    Preset.setName(this.ADDER_NAME);
    this.setupConfiguration();
    this.setupDependencies();
  }

  private setupConfiguration(): void {

    Object.keys(this.CONFIGURATION).forEach(configurationKey => {

      const configuration = this.CONFIGURATION[configurationKey];

      this.configure(
        configurationKey,
        configuration.message,
        configuration.default,
        configuration.question || false
      );
    });
  }

  private setupDependencies(): void {

    Preset.group(preset => {

      Object.keys(this.REQUIRED_DEPENDENCIES).forEach(dependencyName => {

        const dependencyConfig = this.REQUIRED_DEPENDENCIES[dependencyName];

        let action;

        switch (dependencyConfig.type) {
          case 'DEV':
            action = preset.editNodePackages().addDev(dependencyName, dependencyConfig.version);
            break;
          case 'PEER':
            action = preset.editNodePackages().addPeer(dependencyName, dependencyConfig.version);
            break;
          case undefined:
            action = preset.editNodePackages().add(dependencyName, dependencyConfig.version);
            break;
        }

        action.if(() => dependencyConfig.reliesOn
          ? this.getConfiguration(dependencyConfig.reliesOn)
          : true
        );
      });

    }).withTitle('Adding required dependencies');
  }

  private configure(key: string, msg: string, init: any, confirm: boolean): void {

    Preset
      .group(preset => {
        preset.confirm(key, msg, init).if(() => confirm);
        preset.input(key, msg, init).if(() => !confirm);
      })
      .withoutTitle()
      .ifInteractive();

    Preset
      .group(preset => preset.option(key, init))
      .withoutTitle()
      .if(() => !Preset.isInteractive());
  }
}

class SvelteJestAdder extends Adder {

  protected readonly ADDER_NAME = '@rossyman/svelte-add-jest';

  protected readonly CONFIGURATION: Configuration = {
    'jest-dom': {message: 'Enable Jest DOM support?', default: true, question: true},
    'ts': {message: 'Enable TypeScript support?', default: false, question: true},
    'examples': {message: 'Generate example test file?', default: true, question: true}
  };

  protected readonly REQUIRED_DEPENDENCIES: Dependencies = {
    '@babel/core': {version: '^7.13.0', type: 'DEV'},
    '@babel/preset-env': {version: '^7.13.0', type: 'DEV'},
    'jest': {version: '^26.6.0', type: 'DEV'},
    'babel-jest': {version: '^26.6.0', type: 'DEV'},
    'svelte-jester': {version: '^1.4.0', type: 'DEV'},
    '@testing-library/svelte': {version: '^3.0.0', type: 'DEV'},
    '@testing-library/jest-dom': {version: '^5.11.0', type: 'DEV', reliesOn: 'jest-dom'},
    'ts-jest': {version: '^26.5.0', type: 'DEV', reliesOn: 'ts'},
    '@types/jest': {version: '^26.0.22', type: 'DEV', reliesOn: 'ts'},
    '@types/testing-library__jest-dom': {version: '^5.9.5', type: 'DEV', reliesOn: 'ts'}
  };

  run(): void {

    super.run();

    this.safeExtract('Initializing Jest config', 'jest.config.json');
    this.safeExtract('Initializing Babel config', '.babelrc');

    Preset
      .editJson('jest.config.json')
      .merge({setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect']})
      .withTitle('Enabling Jest DOM Support')
      .if(() => this.getConfiguration('jest-dom'));

    Preset
      .editJson('tsconfig.json').merge({
        exclude: ['src/**/*.spec.ts']
      })
      .withTitle('Modifying TypeScript config for project')
      .if(() => this.getConfiguration('ts'));

    Preset
      .editJson('jest.config.json').merge({
        transform: {
          '^.+\\.svelte$': ['svelte-jester', {preprocess: true}],
          '^.+\\.ts$': 'ts-jest'
        },
        moduleFileExtensions: ['js', 'svelte', 'ts'],
        globals: {
          'ts-jest': {
            tsconfig: 'tsconfig.spec.json'
          }
        }
      })
      .withTitle('Modifying Jest config for TypeScript transformation')
      .if(() => this.getConfiguration('ts'));

    this.safeExtract('Initializing TypeScript config for tests', 'tsconfig.spec.json')
      .if(() => this.getConfiguration('ts'));

    this.safeExtract('Initializing example test file', 'index.spec.js')
      .to('src/routes/')
      .if(() => this.getConfiguration('examples') && this.getConfiguration('jest-dom') && !this.getConfiguration('ts'));

    this.safeExtract('Initializing example test file', 'index.spec.ts')
      .to('src/routes/')
      .if(() => this.getConfiguration('examples') && this.getConfiguration('jest-dom') && this.getConfiguration('ts'));

    Preset
      .editJson('package.json')
      .merge({scripts: {'test': 'jest src --config jest.config.json', 'test:watch': 'npm run test -- --watch'}})
      .withTitle('Adding test scripts to package.json');

    Preset
      .instruct(`Run ${color.magenta("npm install")}, ${color.magenta("pnpm install")}, or ${color.magenta("yarn")} to install dependencies`)
      .withHeading("What's next?");
  }
}

new SvelteJestAdder().run();
