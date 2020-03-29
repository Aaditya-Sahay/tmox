import * as Expression from './expression'
import Tmox from './tmox'
import TokenType from './tokentype'
import Token from './token'
import RuntimeError from './runtimeerror'

export default class Interpreter implements Expression.Visitor<any> {
    tmoxInstance: Tmox
    constructor(tmoxInstance: Tmox){
        this.tmoxInstance = tmoxInstance
    }

    interpret(expression: Expression.Expr | null) {
        try {
            if (expression){
                let value: any = this.evaluate(expression);
                console.log(value)
            }
        }catch(error) {
            this.tmoxInstance.runtimeError(error)
        }
    }

    visitLiteralExpr(expr: Expression.Literal): any {
        return expr.value
    }
    visitGroupingExpr(expr: Expression.Grouping): any {
        return this.evaluate(expr.expression)
    }
    visitUnaryExpr(expr: Expression.Unary): any {
        let right: any = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenType.MINUS: {
                this.checkNumberOperand(expr.operator, right);
                return - Number(right)
            }
        }

        return null;
    }
    visitBinaryExpr(expr: Expression.Binary): any {
        let left: any = this.evaluate(expr.left)
        let right: any = this.evaluate(expr.right)

        switch (expr.operator.type) {
            case TokenType.GREATER: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) > Number(right)
            }
            case TokenType.GREATER_EQUAL: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) >= Number(right)
            }
            case TokenType.LESS : {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) < Number(right)
            }
            case TokenType.LESS_EQUAL: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) <= Number(right)
            }
            case TokenType.BANG_EQUAL: {
                return !this.isEqual(left, right)
            }
            case TokenType.EQUAL_EQUAL: {
                return this.isEqual(left, right)
            }
            case TokenType.MINUS: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) - Number(right)
            }
            case TokenType.SLASH: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) / Number(right)
            }
            case TokenType.STAR: {
                this.checkNumberOperands(expr.operator, left, right)
                return Number(left) * Number(right)
            }
            case TokenType.PLUS: {
                if (typeof left == 'number' && typeof right == 'number') {
                    return Number(left) + Number(right)
                }
                if (typeof left == 'string' && typeof right == 'string') {
                    return String(left) + String(right)
                }
                throw new RuntimeError(expr.operator, "Operands must be of the same type and a number or string")
            }
        }

        return null
    }

    evaluate(expr: Expression.Expr): any {
        return expr.accept(this)
    }

    isTruthy(object: any): boolean {
        if (object === null || object === undefined) {
            return false
        }
        if (typeof object === 'boolean') {
            return Boolean(object)
        }
        return true;
    }
    isEqual(left: any, right: any){
        if (left == null && right == null) return true;   
        if (left == null) return false;

        return left.equals(right);     
    }

    checkNumberOperand(operator: Token, operand: any){
        if (typeof operand == 'number')return
        throw new RuntimeError(operator, "Operand must be a number")
    }
    checkNumberOperands(operator: Token, left: any, right:any){

        if (typeof left == 'number' && typeof right == 'number'){
            return
        }
        throw new RuntimeError(operator, "Operand must be a number")
    }
}