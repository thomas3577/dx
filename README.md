# Deno Task CLI

A Deno CLI for lazy typists.

**Important!**
This cli is still under development and probably very buggy.

## Install

```bash
deno install -allow-read -f -n dx https://jsr.io/@dx/dx
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
