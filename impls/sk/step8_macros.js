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
  Str,
} = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env(core);
env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
env.set(
  new MalSymbol("*ARGV*"),
  new List(process.argv.slice(3).map((s) => new Str(s)))
);

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

const quasiquote = (ast) => {
  if (ast instanceof List && ast.beginsWith("unquote")) {
    return ast.ast[1];
  }
  if (ast instanceof List) {
    let result = new List([]);
    for (let i = ast.ast.length - 1; i >= 0; i--) {
      const elt = ast.ast[i];
      if (elt instanceof List && elt.beginsWith("splice-unquote")) {
        result = new List([new MalSymbol("concat"), elt.ast[1], result]);
      } else {
        result = new List([new MalSymbol("cons"), quasiquote(elt), result]);
      }
    }
    return result;
  }
  if (ast instanceof Vector) {
    let result = new List([]);
    for (let i = ast.ast.length - 1; i >= 0; i--) {
      const elt = ast.ast[i];
      if (elt instanceof List && elt.beginsWith("splice-unquote")) {
        result = new List([new MalSymbol("concat"), elt.ast[1], result]);
      } else {
        result = new List([new MalSymbol("cons"), quasiquote(elt), result]);
      }
    }
    return new List([new MalSymbol("vec"), result]);
  }
  if (ast instanceof MalSymbol || ast instanceof Hashmap) {
    return new List([new MalSymbol("quote"), ast]);
  }
  return ast;
};

const is_macro_call = (ast, env) => {
  if (!(ast instanceof List)) return false;
  const elt = ast.ast[0];
  return (
    elt instanceof MalSymbol &&
    env.find(elt) &&
    env.get(elt) instanceof MalFunction &&
    env.get(elt).isMacro
  );
};

const macroExpand = (ast, env) => {
  while (is_macro_call(ast, env)) {
    const macro = env.get(ast.ast[0]);
    ast = macro.apply(null, ast.ast.slice(1));
  }
  return ast;
};

const READ = (str) => read_str(str);
const EVAL = (ast, env) => {
  while (true) {
    ast = macroExpand(ast, env);
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

    if (firstElement === "defmacro!") {
      if (ast.ast.length !== 3) throw "Incorrect number of arguments to def!";
      const val = EVAL(ast.ast[2], env);
      val.isMacro = true;
      return env.set(ast.ast[1], val);
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
      ast = ast.ast[ast.ast.length - 1];
      continue;
    }

    if (firstElement === "fn*") {
      return new MalFunction(ast.ast[2], ast.ast[1].ast, env, (...exprs) =>
        EVAL(ast.ast[2], Env.createEnv(env, ast.ast[1].ast, exprs))
      );
    }

    if (firstElement === "quote") {
      return ast.ast[1];
    }

    if (firstElement === "quasiquoteexpand") {
      return quasiquote(ast.ast[1]);
    }

    if (firstElement === "quasiquote") {
      ast = quasiquote(ast.ast[1]);
      continue;
    }

    if (firstElement === "macroexpand") {
      return macroExpand(ast.ast[1], env);
    }

    const [fn, ...args] = eval_ast(ast, env).ast;
    if (fn instanceof MalFunction) {
      ast = fn.ast;
      env = Env.createEnv(fn.env, fn.binds, args);
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
rep(
  "(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list 'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw \"odd number of forms to cond\")) (cons 'cond (rest (rest xs)))))))"
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

const executeMalFile = () => {
  rep(`(load-file "${process.argv[2]}")`);
  process.exit(0);
};

process.argv.length > 2 ? executeMalFile() : main();
