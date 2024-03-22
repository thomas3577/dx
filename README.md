# Deno Task CLI

[![JSR Version](https://jsr.io/badges/@dx/dx)](https://jsr.io/@dx/dx)
[![JSR Score](https://jsr.io/badges/@dx/dx/score)](https://jsr.io/@dx/dx/score)
[![ci](https://github.com/thomas3577/dx/actions/workflows/deno.yml/badge.svg)](https://github.com/thomas3577/dx/actions/workflows/deno.yml)

A Deno CLI for lazy typists.

## Install

```bash
deno install --allow-read --allow-run -n dx -c ./deno.json jsr:@dx/dx
```

## Commands

### Run app

```bash
dx main.ts
```

will execute:

```bash
deno run main.ts
```

### Run app (without extention)

```bash
dx app
```

will execute:

```bash
deno run app.ts
```

**Note:**\
If a deno task with this name exists, it will be executed.

### Run app (with args)

```bash
dx --allow-read app
```

will execute:

```bash
deno run --allow-read app.ts
```

### Run Deno Task

**deno.json:**

```json
{
  "tasks" {
    "do": "deno lint && deno fmt"
  }
}
```

```bash
dx do
```

will execute:

```bash
deno task do
```

### Run Deno Command

```bash
dx test
```

will execute:

```bash
deno test
```

### Init Deno

```bash
dx init
```

will execute:

```bash
deno init
```

...but...

```bash
dx init app
```

...executes a slightly extended init. The value behind `dx init` creates an initial file with this name. This means that `dx init main` creates the file `main.ts` (and `main.test.ts`).
