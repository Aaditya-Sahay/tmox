import Token from './token'
import RuntimeError from './runtimeerror'

export default class Environment {
    values: Map<string,object>
    constructor(){
        this.values = new Map<string,object>()
    }
    define(name:string, value: object){
        this.values.set(name, value)
    }
    get (name: Token): any{
        if (this.values.has(name.lexeme)){
            return this.values.get(name.lexeme)
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }
}