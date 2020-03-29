import * as Expression from './expression'

export default class AstDebugger implements Expression.Visitor<String> {
    print(expr: Expression.Expr | null): string{
        if (expr){
            return expr.accept(this)
        }else {
            return ""
        }
       
    }

    visitAssignExpr(expr: Expression.Assign): string{
        return this.parenthesize(expr.name.literal, expr.value)
    }

    visitBinaryExpr(expr: Expression.Binary): string{
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right);
    }

    visitUnaryExpr(expr: Expression.Unary): string{
        return this.parenthesize(expr.operator.lexeme, expr.right)
    }

    visitLiteralExpr(expr: Expression.Literal): string{
        if (expr.value == null) return "nil";                            
        return expr.value.toString();   
    }

    visitGroupingExpr(expr: Expression.Grouping) {
        return this.parenthesize("group", expr.expression)
    }

    visitLogicalExpr(expr: Expression.Logical){
        return this.parenthesize(expr.operator.lexeme, expr.left, expr.right)
    }

    visitThisExpr(expr: Expression.This) {
        return this.parenthesize("this", expr.keyword.literal.toString())
    }

    visitGetExpr(expr: Expression.Get){
        return this.parenthesize(expr.name.lexeme, expr.object)
    }

    visitSetExpr(expr: Expression.Set){
        return this.parenthesize(expr.name.lexeme, expr.object, expr.value)
    }

    visitSuperExpr(expr: Expression.Super){
        return this.parenthesize("super")
    }

    visitCallExpr(expr: Expression.Call) {
        return this.parenthesize(expr.paren.lexeme, expr.callee, ...expr.args)
    }

    visitVariableExpr(expr: Expression.Variable){
        return this.parenthesize("variable")
    }

    parenthesize(name: string, ...exprs: Array<Expression.Expr>){
        let builder:string = ""
        builder = builder.concat("(").concat(name);                      
        for (let expr of exprs) {                              
            builder = builder.concat(" ");                                 
            builder = builder.concat(expr.accept(this));                   
        }                                                      
        builder = builder.concat(")");                                   
    
        return builder.toString();    
    }
}

