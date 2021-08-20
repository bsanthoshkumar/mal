class MalValue {
  pr_str(print_readably = false) {
    return "default mal value";
  }
}

const pr_str = (val, print_readably) => {
  if (val instanceof MalValue) {
    return val.pr_str(print_readably);
  }

  return val.toString();
};

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(print_readably = false) {
    return `(${this.ast.map((x) => pr_str(x, print_readably)).join(" ")})`;
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
}

class NilVal extends MalValue {
  constructor() {
    super();
  }

  pr_str(print_readably = false) {
    return "nil";
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  pr_str(print_readably = false) {
    if (print_readably) {
      return (
        '"' +
        this.string
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n") +
        '"'
      );
    }
    return `"${this.string}"`;
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
}
class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(print_readably = false) {
    return this.symbol;
  }
}

const Nil = new NilVal();
module.exports = {
  MalValue,
  List,
  Vector,
  pr_str,
  Hashmap,
  Nil,
  Str,
  Keyword,
  MalSymbol,
};
