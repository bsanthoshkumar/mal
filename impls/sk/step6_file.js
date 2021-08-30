const readline = require("readline");
const Env = require("./env");
const core = require("./core");
const { read_str } = require("./reader");
const {
  pr_str,
  MalSymbol,
  List,
  Vector,
  Hashmap,
  Nil,
  MalFunction,
} = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env(core);
env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));

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
  while (true) {
    if (ast === undefined) return Nil;
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }

    const firstElement = ast.ast[0].symbol;
    if (firstElement === "def!") {
      if (ast.ast.length !== 3) throw "Incorrect number of arguments to def!";
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));
    }

    if (firstElement === "let*") {
      if (ast.ast.length !== 3) throw "Incorrect number of arguments to let*";
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;

      for (let i = 0; i < bindings.length; i += 2) {
        newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      }
      ast = ast.ast[2];
      env = newEnv;
      continue;
    }

    if (firstElement === "if") {
      const exp = EVAL(ast.ast[1], env);
      ast = exp === false || exp === Nil ? ast.ast[3] : ast.ast[2];
      continue;
    }

    if (firstElement === "do") {
      ast.ast.slice(1, -1).reduce((_, form) => EVAL(form, env), Nil);
      ast = ast.ast.length[ast.ast.length - 1];
      continue;
    }

    if (firstElement === "fn*") {
      return new MalFunction(ast.ast[2], ast.ast[1].ast, env);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;
    if (fn instanceof MalFunction) {
      ast = fn.ast;
      env = Env.createEnv(env, fn.binds, args);
      continue;
    }

    if (!(fn instanceof Function)) throw `${fn} is not a function`;
    return fn.apply(null, args);
  }
};
const PRINT = (val) => pr_str(val, true);

const rep = (str) => PRINT(EVAL(READ(str), env));
rep("(def! not(fn* [a] (if a false true)))");
rep(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

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
