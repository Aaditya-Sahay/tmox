import * as Expression from './expression'

export default class AstDebugger implements Expression.Visitor<String> {
    print(expr: Expression.Expr): string{
        return expr.accept(this)
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

