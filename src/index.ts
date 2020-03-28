import Tmox from './tmox'
import AstDebugger from './AstDebugger'
import * as Expression from './expression'
import Token from './token'
import TokenType from './tokentype'

let tmox = new Tmox('./codebase/hello.tmox')

tmox.init()

let astdebugger = new AstDebugger();

let left:Expression.Expr = new Expression.Unary(new Token(TokenType.MINUS, "-", null, 1), new Expression.Literal(6969))
let right: Expression.Expr = new Expression.Grouping(new Expression.Literal(42));

let expression: Expression.Expr = new Expression.Binary(left,new Token(TokenType.STAR, "*", null, 1), right)          
    
console.log(astdebugger.print(expression))
