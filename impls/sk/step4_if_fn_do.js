const readline = require("readline");
const Env = require("./env");
const core = require("./core");
const { read_str } = require("./reader");
const { pr_str, MalSymbol, List, Vector, Hashmap, Nil } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env(core);

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
  if (ast === undefined) return Nil;
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
  if (firstElement === "if") {
    const exp = EVAL(ast.ast[1], env);
    if (exp === false || exp === Nil) {
      return EVAL(ast.ast[3], env);
    }
    return EVAL(ast.ast[2], env);
  }
  if (firstElement === "do") {
    return ast.ast.slice(1).reduce((_, form) => EVAL(form, env), Nil);
  }
  if (firstElement === "fn*") {
    return function (...exprs) {
      const newEnv = Env.createEnv(env, ast.ast[1].ast, exprs);
      return EVAL(ast.ast[2], newEnv);
    };
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (fn instanceof Function) {
    return fn.apply(null, args);
  }
};
const PRINT = (val) => pr_str(val, true);

const rep = (str) => PRINT(EVAL(READ(str), env));
rep("(def! not(fn* [a] (if a false true)))");

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
