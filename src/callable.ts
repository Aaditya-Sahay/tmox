import Interpreter from './interpreter'




export interface Callable {
    arity():number 
    call(interpreter: Interpreter, args: any[]) : any
    toString():string
   
}

export function isCallable(object: any): object is Callable{
    return 'call' in object;
}
