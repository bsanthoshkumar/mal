const pr_str = (val, print_readably) => {
  if (val instanceof MalValue) {
    return val.pr_str(print_readably);
  }

  return val.toString();
};

const isEqual = (...args) => {
  if (args[0] instanceof MalValue) {
    return args.slice(1).every((x) => args[0].isEqual(x));
  }
  return args.slice(1).every((x) => x === args[0]);
};

class MalValue {
  pr_str(print_readably = false) {
    return "default mal value";
  }
  isEqual(_) {
    return false;
  }
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return `(${this.ast.map((x) => pr_str(x, print_readably)).join(" ")})`;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(x) {
    if (
      (!(x instanceof List) && !(x instanceof Vector)) ||
      this.count() !== x.count()
    ) {
      return false;
    }
    return this.ast.every((value, index) => isEqual(value, x.ast[index]));
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return `[${this.ast.map(pr_str).join(" ")}]`;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(x) {
    if (
      (!(x instanceof Vector) && !(x instanceof List)) ||
      this.count() !== x.count()
    ) {
      return false;
    }
    return this.ast.every((value, index) => isEqual(value, x.ast[index]));
  }
}

class Hashmap extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
    this.hashmap = new Map();
    this.initializeHashmap();
  }

  initializeHashmap() {
    for (let i = 0; i < this.ast.length; i += 2) {
      this.hashmap.set(this.ast[i], this.ast[i + 1]);
    }
  }

  pr_str(print_readably = false) {
    let str = [];
    for (const [key, value] of this.hashmap.entries()) {
      str.push(
        pr_str(key, print_readably) + " " + pr_str(value, print_readably)
      );
    }
    return `{${str.join(", ")}}`;
  }

  isEqual(x) {
    if (!(x instanceof Hashmap) || this.hashmap.size !== x.hashmap.size) {
      return false;
    }

    const keys = [...this.hashmap.keys()];
    return keys.every((key) =>
      isEqual(this.hashmap.get(key), x.hashmap.get(key))
    );
  }
}

class NilVal extends MalValue {
  constructor() {
    super();
  }

  pr_str(print_readably = false) {
    return "nil";
  }

  count() {
    return 0;
  }
  isEqual(x) {
    return x instanceof NilVal;
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  pr_str(print_readably = false) {
    if (print_readably) {
      return `"${this.string
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")}"`;
    }
    return this.string;
  }

  isEqual(x) {
    return x instanceof Str && this.string === x.string;
  }
}
class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  pr_str(print_readably = false) {
    return `:${this.keyword}`;
  }

  isEqual(x) {
    return x instanceof Keyword && this.keyword === x.keyword;
  }
}
class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(print_readably = false) {
    return this.symbol;
  }

  isEqual(x) {
    return x instanceof MalSymbol && this.symbol === x.symbol;
  }
}

class MalFunction extends MalValue {
  constructor(ast = null, binds = [], env = null, fn = null) {
    super();
    this.ast = ast;
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  pr_str(print_readably = false) {
    return "#<function>";
  }

  apply(thisArg = null, params = []) {
    return this.fn.apply(thisArg, params);
  }
}

class Atom extends MalValue {
  constructor(malValue) {
    super();
    this.malValue = malValue;
  }

  pr_str(print_readably = false) {
    return `(atom ${pr_str(this.malValue, print_readably)})`;
  }

  isEqual(other) {
    if (!(other instanceof Atom)) return false;
    return isEqual(this.malValue, other.malValue);
  }

  reset(malValue) {
    this.malValue = malValue;
    return this.malValue;
  }
}

const Nil = new NilVal();
module.exports = {
  pr_str,
  isEqual,
  MalValue,
  List,
  Vector,
  Hashmap,
  Nil,
  Str,
  Keyword,
  MalSymbol,
  MalFunction,
  Atom,
};
