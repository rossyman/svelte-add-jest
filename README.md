<h1 align="center">๐งช Add Jest to Sveltekit</h1>

## โ What is this?

This is an **experimental** command to run to add Jest to your SvelteKit project.

## ๐  Usage

You must start with a fresh copy of the official SvelteKit template, which is currently created by running this command:

```sh
npm init svelte@next
```

Once that is set up, run this command in your project directory to set up Jest:

> โ๏ธ __When running with TypeScript support enabled, remove comments within `tsconfig.json` or the adder will fail. This is a known limitation of [Preset](https://usepreset.dev/), as it relies upon JSON.parse.__

```sh
npx apply rossyman/svelte-add-jest # --no-ssh
```

After the preset runs,

-   `npm install`, `pnpm i`, or `yarn` to update dependencies.

-   You can apply _another_ [Svelte Adder](https://github.com/svelte-add/svelte-adders) to your project for more functionality.

### โ๏ธ Options

| Description               | Flag            | Negated            | Default |
| ------------------------- | --------------- | ------------------ | ------- |
| Interactive Mode          | `--interaction` | `--no-interaction` | True    |
| Jest DOM Support          | `--jest-dom`    | `--no-jest-dom`    | True    |
| Typescript Support        | `--ts`          | `--no-ts`          | False   |
| JSDOM Jest Env by Default | `--jsdom`       | `--jsdom`          | True    |
| Generate Example          | `--examples`    | `--no-examples`    | True    |

### ๐ Relevant Documentation

-   [Svelte Testing Library Docs](https://testing-library.com/docs/svelte-testing-library/intro/)
-   [Jest DOM](https://github.com/testing-library/jest-dom#usage)
-   [Jest](https://jestjs.io)

### ๐ต Help! I have a question

[Create an issue](https://github.com/svelte-add/jest/issues/new) and we'll try to help.

### ๐ก Fix! There is something that needs improvement

[Create an issue](https://github.com/rossyman/svelte-add-jest/issues/new) or [pull request](https://github.com/rossyman/svelte-add-jest/pulls) and we'll try to fix.

These are new tools, so there are likely to be problems in this project. Thank you for bringing them to our attention or fixing them for us.

## ๐ License

MIT

---

_Repository preview image generated with [GitHub Social Preview](https://social-preview.pqt.dev)_

_This README was generated with โค๏ธ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
