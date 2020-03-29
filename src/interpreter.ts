import * as Expression from './expression'
import * as Statement from './statement'
import Tmox from './tmox'
import TokenType from './tokentype'
import Token from './token'
import RuntimeError from './runtimeerror'
import Environment from './environment'

export default class Interpreter implements Expression.Visitor<any>, Statement.Visitor<void> {
    tmoxInstance: Tmox
    environment: Environment
    constructor(tmoxInstance: Tmox){
        this.tmoxInstance = tmoxInstance
        this.environment = new Environment()
    }

    interpret(statements: Array<Statement.Stmt>) {
        try {
            for (let statement of statements) {
                this.execute(statement)
            }
        }catch(error) {
            this.tmoxInstance.runtimeError(error)
        }
    }

    execute (statement: Statement.Stmt){
        statement.accept(this)
    }

    evaluate(expr: Expression.Expr): any {
        return expr.accept(this)
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

    visitVariableExpr(expr: Expression.Variable): any {
        return this.environment.get(expr.name)
    }

    visitAssignExpr(expr: Expression.Assign): any {
        let value: any = this.evaluate(expr.value)
        this.environment.assign(expr.name, value)

    }

    visitDecStmt(stmt: Statement.Declare): void {
        let value = null;
        if (stmt.initializer != null) {
            value = this.evaluate(stmt.initializer)
        }

        this.environment.define(stmt.name.lexeme, value)
      
    }

    visitExpressionStmt(stmt: Statement.Expression): void {
        this.evaluate(stmt.expression)
        
    }
    visitPrintStmt(stmt: Statement.Print): void {
        let value: any = this.evaluate(stmt.expression)
        console.log(value)
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