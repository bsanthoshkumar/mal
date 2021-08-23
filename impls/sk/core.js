const Env = require("./env");
const { MalSymbol, pr_str, Nil, List, Str, isEqual } = require("./types");

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

env.set(new MalSymbol("list"), (...values) => new List(values));
env.set(new MalSymbol("list?"), (list) => list instanceof List);
env.set(new MalSymbol("pi"), Math.PI);
env.set(new MalSymbol("empty?"), (x) => x.isEmpty());
env.set(new MalSymbol("count"), (x) => x.count());

module.exports = env;
