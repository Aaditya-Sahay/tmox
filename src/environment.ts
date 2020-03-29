import Token from './token'
import RuntimeError from './runtimeerror'

export default class Environment {
    values: Map<string,object>
    enclosing: Environment

    constructor(enclosing?: Environment){
        this.values = new Map<string,object>()
        if (enclosing) {
            this.enclosing = enclosing
        }else {
            this.enclosing = null;
        }
    }
    define(name:string, value: object){
        this.values.set(name, value)

    }
    get (name: Token): any{
        if (this.values.has(name.lexeme)){
            return this.values.get(name.lexeme)
        }
        if (this.enclosing != null) {
            return this.enclosing.get(name)
        }

        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }
    assign(name: Token, value: any){
        if (this.values.has(name.lexeme)){
   
            this.values.set(name.lexeme,value)
            return
        }
        if (this.enclosing != null) {
            this.enclosing.assign(name, value)
            return 
        }
        throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`)
    }
}