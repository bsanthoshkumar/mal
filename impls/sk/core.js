const { readFileSync } = require("fs");
const Env = require("./env");
const { read_str } = require("./reader");
const {
  MalSymbol,
  pr_str,
  Nil,
  List,
  Str,
  isEqual,
  Atom,
  MalValue,
} = require("./types");

const env = new Env(null);
env.set(new MalSymbol("+"), (...args) => args.reduce((a, b) => a + b, 0));
env.set(new MalSymbol("*"), (...args) => args.reduce((a, b) => a * b, 1));
env.set(new MalSymbol("-"), (...args) => {
  if (args.length == 1) args.unshift(0);
  return args.reduce((a, b) => a - b);
});
env.set(new MalSymbol("/"), (...args) => {
  if (args.length == 1) args.unshift(1);
  return args.reduce((a, b) => a / b);
});
env.set(new MalSymbol("="), isEqual);
env.set(new MalSymbol("%"), (...args) => args.reduce((a, b) => a % b));
env.set(new MalSymbol("<"), (...args) => args.reduce((a, b) => a < b));
env.set(new MalSymbol("<="), (...args) => args.reduce((a, b) => a <= b));
env.set(new MalSymbol(">"), (...args) => args.reduce((a, b) => a > b));
env.set(new MalSymbol(">="), (...args) => args.reduce((a, b) => a >= b));

env.set(new MalSymbol("list"), (...values) => new List(values));
env.set(new MalSymbol("list?"), (list) => list instanceof List);
env.set(new MalSymbol("pi"), Math.PI);
env.set(new MalSymbol("empty?"), (x) => x.isEmpty());
env.set(new MalSymbol("count"), (x) => x.count());

env.set(
  new MalSymbol("pr-str"),
  (...values) => new Str(values.map((x) => pr_str(x, true)).join(" "))
);
env.set(new MalSymbol("prn"), (...values) => {
  const str = values.map((x) => pr_str(x, true)).join(" ");
  console.log(str);
  return Nil;
});

env.set(
  new MalSymbol("str"),
  (...values) => new Str(values.map((x) => pr_str(x, false)).join(""))
);

env.set(new MalSymbol("println"), (...values) => {
  const str = values.map((x) => pr_str(x, false)).join(" ");
  console.log(str);
  return Nil;
});

env.set(new MalSymbol("read-string"), (ast) => {
  if (ast instanceof Str) return read_str(ast.pr_str());
  throw new Error(`${pr_str(ast)} is not String`);
});

env.set(new MalSymbol("slurp"), (ast) => {
  const filePath = pr_str(ast);
  try {
    return new Str(readFileSync(filePath, "utf-8"));
  } catch (e) {
    throw `File ${filePath} ${e} not found`;
  }
});

env.set(new MalSymbol("atom"), (value) => new Atom(value));
env.set(new MalSymbol("atom?"), (value) => value instanceof Atom);
env.set(new MalSymbol("deref"), (atom) => {
  if (atom instanceof Atom) return atom.malValue;
  throw `${pr_str(atom)} is not an Atom`;
});
env.set(new MalSymbol("reset!"), (atom, malValue) => {
  if (atom instanceof Atom) {
    return atom.reset(malValue);
  }
  throw `${pr_str(atom)} is not an Atom`;
});
env.set(new MalSymbol("swap!"), (atom, fn, ...args) => {
  if (atom instanceof Atom) {
    const malValue = fn.apply(null, [atom.malValue, ...args]);
    console.log(malValue);
    return atom.reset(malValue);
  }
  throw `${pr_str(atom)} is not an Atom`;
});

env.set(new MalSymbol("cons"), (element, collection) => {
  return collection.cons(element);
});
env.set(new MalSymbol("concat"), (...lists) => {
  return lists.reduce((a, b) => a.concat(b));
});

module.exports = env;
