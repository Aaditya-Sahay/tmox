import Interpreter from './interpreter'

export default interface Callable {
    
    call(interpreter: Interpreter, args: any[]) : any
    arity():number
}