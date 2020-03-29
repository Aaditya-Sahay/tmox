
import Scanner from './scanner'
import Parser from './parser'
import Token from './token'
import TokenType from './tokentype'

import Interpreter from './interpreter'
import RuntimeError from './runtimeerror'
import fs from 'fs'


export default class Tmox {
    file: string
    interpreter: Interpreter
    hadError: boolean
    hadRuntimeError: boolean
    constructor(file: string) {
        this.file = file;
        this.interpreter = new Interpreter(this)
        this.hadError = false;
        this.hadRuntimeError = false;
    }
    init() {
        if (this.file) {
            if (this.hadError) process.exit(42);
            if (this.hadRuntimeError) process.exit(75);
            this.execute();

        }
        else {
            this.prompt(); // TODO
        }
    }
    // executes file 
    execute() {
        let string = fs.readFileSync(this.file).toString()
        this.run(string)
    }
    //executes prompts
    prompt() {

    }
    //scanner 
    run(source: string) {
        let scanner = new Scanner(source, this);
        let tokens = scanner.tokenize();
        for (let token of tokens) {
            //console.log(token.toString())
        }
        let parser = new Parser(tokens, this)
        let statements = parser.parse()
        if (this.hadError) {
            return
        }

        // console.log(new AstDebugger().print(expression))
        this.interpreter.interpret(statements)


    }

    error(token: Token, message: string) {
        if (token.type == TokenType.EOF) {
            this.report(token.line, " at end", message);
        } else {
            this.report(token.line, " at '" + token.lexeme + "'", message);
        }

    }
    runtimeError(error: RuntimeError) {
        console.log(error.message + "[line" + error.token.line + "]" );
        this.hadRuntimeError = true
    }

    report(line: number, where: string, message: string) {
        console.log("[line " + line + "] Error" + where + ": " + message)
        this.hadError = true
    }
}
