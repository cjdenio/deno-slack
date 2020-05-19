# Contributing Guidelines

Yes, please contribute!

## Rules

- You _must_ run `deno fmt` in the `deno-slack` directory **before** opening a pull request. This ensures that files are formatted equally across contributors.
- All files must be written in TypeScript, and types _must_ be fully documented. Here's an example:

```ts
// BAD
function add(one, two) {
    return one + two;
}

// GOOD
function add(one: number, two: number): number {
    return one + two;
}
```

That's it! Happy coding!