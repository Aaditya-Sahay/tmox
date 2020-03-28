import Token from './token'




export interface Visitor<R> {
    visitAssignExpr(expr: Assign): R;         
    visitBinaryExpr(expr: Binary): R;         
    // visitCallExpr(expr: Call): R;             
    // visitGetExpr(expr: Get): R;               
    visitGroupingExpr(expr: Grouping): R;     
    visitLiteralExpr(expr: Literal): R;       
    // visitLogicalExpr(expr: Logical): R;       
    // visitSetExpr(expr: Set): R;               
    // visitSuperExpr(expr: Super): R;           
    // visitThisExpr(expr: This): R;             
    visitUnaryExpr(expr: Unary): R;           
    // visitVariableExpr(expr: Variable): R; 
}

export abstract class Expr  {
    abstract accept(visitor: Visitor<any>): any;

}

export class Binary extends Expr {
    left: Expr
    right: Expr
    operator: Token
    constructor(left: Expr, operator: Token, right: Expr,) {
        super()
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
    accept(visitor: Visitor<any>): any{             
        return visitor.visitBinaryExpr(this);        
    }
}

export class Assign extends Expr {
    name: Token
    value: Expr
    constructor(name: Token, value: Expr) {
        super()
        this.name = name;
        this.value = value;
    }
    accept(visitor: Visitor<any>): any{             
        return visitor.visitAssignExpr(this);        
    }
}

// export class Call extends Expr {
//     callee: Expr
//     paren: Token
//     args: Array<Expr>
//     constructor(callee: Expr, paren: Token, args: Array<Expr>) {
//         super()
//         this.callee = callee
//         this.paren = paren
//         this.args = args
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitCallExpr(this);        
//     }
// }

// export class Get extends Expr {
//     name: Token
//     object: Expr
//     constructor(name: Token, object: Expr) {
//         super()
//         this.name = name;
//         this.object = object;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitGetExpr(this);        
//     }
// }

export class Grouping extends Expr {
    expression: Expr
    constructor(expr: Expr) {
        super()
        this.expression = expr;
    }
    accept(visitor: Visitor<any>): any{             
        return visitor.visitGroupingExpr(this);        
    }
}


export class Literal extends Expr {
    value: any
    constructor(value: any) {
        super()
        this.value = value;
    }
    accept(visitor: Visitor<any>): any{             
        return visitor.visitLiteralExpr(this);        
    }
}


// export class Logical extends Expr {
//     left: Expr
//     right: Expr
//     operator: Token
//     constructor(left: Expr, right: Expr, operator: Token) {
//         super()
//         this.left = left;
//         this.right = right;
//         this.operator = operator;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitLogicalExpr(this);        
//     }
// }

// export class Set extends Expr {
//     object: Expr
//     name: Token
//     value: Expr
//     constructor(name: Token, value: Expr, object: Expr) {
//         super()
//         this.name = name;
//         this.value = value;
//         this.object = object;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitSetExpr(this);        
//     }
// }

// export class Super extends Expr {
//     keyword: Token;
//     method: Token;
//     constructor(keyword: Token, method: Token) {
//         super()
//         this.keyword = keyword;
//         this.method = method;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitSuperExpr(this);        
//     }
// }
// export class This extends Expr {
//     keyword: Token
//     constructor(keyword: Token) {
//         super()
//         this.keyword = keyword;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitThisExpr(this);        
//     }
//}

export class Unary extends Expr {
    right: Expr
    operator: Token
    constructor(operator: Token, right: Expr) {
        super()
        this.right = right;
        this.operator = operator;
    }
    accept(visitor: Visitor<any>): any{             
        return visitor.visitUnaryExpr(this);        
    }

}

// export class Variable extends Expr {
//     name: Token
//     constructor(name: Token) {
//         super()
//         this.name = name;
//     }
//     accept(visitor: Visitor<any>): any{             
//         return visitor.visitVariableExpr(this);        
//     }
// }


