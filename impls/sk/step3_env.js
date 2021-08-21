const readline = require("readline");
const { Env } = require("./env");
const { read_str } = require("./reader");
const { pr_str, MalSymbol, List, Vector, Hashmap } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();
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
env.set(new MalSymbol("%"), (...args) => args.reduce((a, b) => a % b));
env.set(new MalSymbol("pi"), Math.PI);
env.set(new MalSymbol("empty?"), (x) => x.isEmpty());

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof List) {
    return new List(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.ast.map((x) => EVAL(x, env)));
  }

  if (ast instanceof Hashmap) {
    const newAst = [];
    for (const [key, value] of ast.hashmap.entries()) {
      newAst.push(EVAL(key, env), EVAL(value, env));
    }
    return new Hashmap(newAst);
  }

  return ast;
};
const READ = (str) => read_str(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }

  const firstElement = ast.ast[0].symbol;
  if (firstElement === "def!") {
    if (ast.ast.length !== 3) {
      throw "Incorrect number of arguments to def!";
    }
    return env.set(ast.ast[1], EVAL(ast.ast[2], env));
  }
  if (firstElement === "let*") {
    const newEnv = new Env(env);
    const bindings = ast.ast[1].ast;
    for (let i = 0; i < bindings.length; i += 2) {
      newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
    }
    return EVAL(ast.ast[2], newEnv);
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (fn instanceof Function) {
    return fn.apply(null, args);
  }
};
const PRINT = (val) => pr_str(val, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

const main = () => {
  rl.question("user> ", (input) => {
    try {
      console.log(rep(input));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();
