import { Expr } from './expression'
import Token from './token'
export interface Visitor<R> {
    visitBlockStmt(stmt: Block): R;
    // visitClassStmt(stmt: Class): R;           
    visitExpressionStmt(stmt: Expression): R;
    visitFuncStmt(stmt: Func): R;
    visitIfStmt(stmt: If): R;
    visitPrintStmt(stmt: Print): R;
    // visitReturnStmt(stmt: Return): R;         
    visitDecStmt(stmt: Declare): R;
    visitWhileStmt(stmt: While): R;
}

export abstract class Stmt {
    abstract accept(visitor: Visitor<any>): any;
}

export class Print extends Stmt {
    expression: Expr
    constructor(expression: Expr) {
        super()
        this.expression = expression
    }
    accept(visitor: Visitor<any>): any {
        return visitor.visitPrintStmt(this);
    }
}

export class Expression extends Stmt {
    expression: Expr
    constructor(expression: Expr) {
        super()
        this.expression = expression
    }
    accept(visitor: Visitor<any>): any {
        return visitor.visitExpressionStmt(this);
    }
}

export class Declare extends Stmt {
    name: Token
    initializer: Expr
    constructor(name: Token, initializer: Expr) {
        super()
        this.name = name
        this.initializer = initializer
    }
    accept(visitor: Visitor<any>): any {
        return visitor.visitDecStmt(this);
    }

}

export class Block extends Stmt {
    statements: Array<Stmt>
    constructor(statements: Array<Stmt>) {
        super()
        this.statements = statements;
    }


    accept(visitor: Visitor<any>): any {
        return visitor.visitBlockStmt(this);
    }
}

export class If extends Stmt {
    condition: Expr
    thenBranch: Stmt
    elseBranch: Stmt
    constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
        super()
        this.condition = condition;
        this.thenBranch = thenBranch;
        this.elseBranch = elseBranch;
    }
    accept(visitor: Visitor<any>): any {
        return visitor.visitIfStmt(this);
    }
}


export class While extends Stmt {
    condition: Expr
    body: Stmt
    constructor(condition: Expr, body: Stmt) {
        super()
        this.condition = condition;
        this.body = body;
    }

    accept(visitor: Visitor<any>): any {
        return visitor.visitWhileStmt(this);
    }
}

export class Func extends Stmt {
    name: Token;
    params: Array<Token>
    body: Array<Stmt>
    constructor(name: Token, params: Array<Token>, body: Array<Stmt>) {
        super()
        this.name = name;
        this.params = params;
        this.body = body;
    }


    accept(visitor: Visitor<any>): any {
        return visitor.visitFuncStmt(this);
    }


}       