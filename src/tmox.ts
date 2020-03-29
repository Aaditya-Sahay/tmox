
import Scanner from './scanner'
import Parser from './parser'
import Token from './token'
import TokenType from './tokentype'
import AstDebugger from './AstDebugger'

import { Expr } from './expression'
import fs from 'fs'


export default class Tmox {
    file: string
    hadError: boolean
    constructor(file: string) {
        this.file = file;

        this.hadError = false;
    }
    init() {
        if (this.file) {
            if (this.hadError) process.exit(42);
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
        let parser = new Parser(tokens, this)
        let expression = parser.parse()
        if (this.hadError) {
            return
        }

        console.log(new AstDebugger().print(expression))


    }

    error(token: Token, message: string) {
        if (token.type == TokenType.EOF) {
            this.report(token.line, " at end", message);
        } else {
            this.report(token.line, " at '" + token.lexeme + "'", message);
        }

    }

    report(line: number, where: string, message: string) {
        console.log("[line " + line + "] Error" + where + ": " + message)
        this.hadError = true
    }
}
