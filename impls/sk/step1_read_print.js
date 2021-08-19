const readline = require("readline");
const { read_str } = require("./reader");
const { pr_str } = require("./types");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (str) => read_str(str);
const EVAL = (ast) => ast;
const PRINT = (val) => pr_str(val);

const rep = (str) => PRINT(EVAL(READ(str)));

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
