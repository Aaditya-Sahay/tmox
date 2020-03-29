import Token from './token'
import { Expr } from './expression'
export default class Parser {
    tokens: Array<Token>
    current: number
    constructor(tokens: Array<Token>) {
        this.tokens = tokens
        this.current = 0
    }
    expression: Expr
}