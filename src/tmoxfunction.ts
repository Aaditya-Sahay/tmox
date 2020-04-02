import { Callable } from './callable'
import { Func } from './statement'
import Interpreter from './interpreter'
import Environment from './environment'

export default class TmoxFunction implements Callable {
    declaration: Func
    constructor(declaration: Func) {
        this.declaration = declaration
    }
    arity(): number {
        return this.declaration.params.length
    }
    call(interpreter: Interpreter, args: any[]): any{
        let environment = new Environment(interpreter.globals)
        for (let i = 0; i < this.declaration.params.length; i++) {
            environment.define(this.declaration.params[i].lexeme, args[i])
        }

        interpreter.executeBlock(this.declaration.body, environment)
        return null;
    }
    toString(): string {
        return `fn ${this.declaration.name.lexeme}`
    }

}