class MalValue {
  pr_str() {
    return "default mal value";
  }
}

const pr_str = (val) => {
  if (val instanceof MalValue) {
    return val.pr_str();
  }

  return val.toString();
};

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return `(${this.ast.map(pr_str).join(" ")})`;
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return `[${this.ast.map(pr_str).join(" ")}]`;
  }
}

class NilVal extends MalValue {
  constructor() {
    super();
  }

  pr_str() {
    return "nil";
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  pr_str() {
    return `"${this.string}"`;
  }
}

const Nil = new NilVal();
module.exports = { MalValue, List, Vector, pr_str, Nil, Str };
