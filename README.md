# Deno Task CLI

## Install

```bash
deno install -A -f -n dx --config ./deno.json https://deno.land/x/dx@v1.0.13/mod.ts
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
