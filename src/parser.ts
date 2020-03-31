import Tmox from './tmox'
import Token from './token'
import TokenType from './tokentype'
import { Expr, Binary, Unary, Literal, Grouping, Variable, Assign, Logical, Call } from './expression'
import { Stmt, Print, Expression, Declare, Block, If, While, Func } from './statement'

class ParseError extends Error {

}

export default class Parser {
    tokens: Array<Token>
    current: number
    tmoxInstance: Tmox

    constructor(tokens: Array<Token>, tmoxInstance: Tmox) {
        this.tokens = tokens
        this.current = 0
        this.tmoxInstance = tmoxInstance
    }

    parse(): Array<Stmt> {
        let statements = new Array<Stmt>()

        while (!this.isEnd()) {
            statements.push(this.declaration())
        }

        return statements;


        // try { 
        //     return this.expression()
        // }catch(error) {
        //     return null;
        // }
    }

    declaration(): Stmt {
        try {
            if (this.match(TokenType.FUN)) return func("function")
            if (this.match(TokenType.DEC)) return this.decDeclaration();
            return this.statement()
        } catch (error) {
            this.synchronize();
            throw new ParseError
        }
    }

    func(kind: string): Func {
        let name = this.consume(TokenType.IDENTIFIER, "Expect " + kind + " name");
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after " + kind + " name.");
        let parameters = new Array<Token>()
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (parameters.length >= 255) {
                   this.error(this.peek(), "Cannot have more than 255 parameters.");
                }

                parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));
            } while (this.match(TokenType.COMMA));
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(TokenType.LEFT_BRACE, "Expect '{' before " + kind + " body.");
        let body = this.block();                                  
        return new Func(name, parameters, body); 
    }

    decDeclaration(): Stmt {
        let name: Token = this.consume(TokenType.IDENTIFIER, "Expect Variable Name");
        let initializer = null;

        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression()
        }
        this.consume(TokenType.SEMICOLON, " Expect ';' after variable declaration")
        return new Declare(name, initializer)
    }
    statement(): Stmt {
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.IF)) return this.ifStatement()
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block())
        return this.expressionStatement()
    }

    forStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Wrap your conditions in parenthesis after for");
        let initializer: Stmt;
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.match(TokenType.DEC)) {
            initializer = this.decDeclaration();
        } else {
            initializer = this.expressionStatement();
        }
        let condition: Expr = null;
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }
        this.consume(TokenType.SEMICOLON, "Expected ; after loop condition")

        let increment: Expr = null;
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression()
        }
        this.consume(TokenType.RIGHT_PAREN, "Expect after ) clauses")

        let body: Stmt = this.statement();

        if (increment != null) {
            body = new Block([
                body,
                new Expression(increment)
            ])
        }
        if (condition == null) condition = new Literal(true);
        body = new While(condition, body);


        if (initializer != null) {
            body = new Block([
                initializer,
                body
            ])
        }

        return body;
    }

    ifStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Wrap your conditions in parenthesis")
        let condition = this.expression()
        this.consume(TokenType.RIGHT_PAREN, "Wrap your conditions in parenthesis")

        let thenBranch: Stmt = this.statement()
        let elseBranch: Stmt = null;
        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }


        return new If(condition, thenBranch, elseBranch)

    }

    printStatement(): Stmt {
        let value: Expr = this.expression()
        this.consume(TokenType.SEMICOLON, "Expect ';' after value")
        return new Print(value)
    }

    whileStatement(): Stmt {
        this.consume(TokenType.LEFT_PAREN, "Wrap your condition in parenthesis")
        let condition = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Wrap your condition in parenthesis")
        let body: Stmt = this.statement();

        return new While(condition, body)

    }

    block(): Array<Stmt> {
        let statements: Array<Stmt> = new Array<Stmt>();
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isEnd()) {
            statements.push(this.declaration())
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect } after block opening");
        return statements;
    }



    expressionStatement(): Stmt {
        let value: Expr = this.expression()
        this.consume(TokenType.SEMICOLON, "Expect ';' after value")
        return new Expression(value)
    }

    expression(): Expr {
        return this.assignment()
    }

    assignment(): Expr {
        let expr: Expr = this.or();
        if (this.match(TokenType.EQUAL)) {
            let equals: Token = this.previous();
            let value: Expr = this.assignment()

            if (expr instanceof Variable) {
                let name: Token = expr.name;
                return new Assign(name, value)
            }

            this.error(equals, "Invalid assignment")
        }
        return expr
    }

    or(): Expr {
        let expr: Expr = this.and();

        while (this.match(TokenType.OR)) {
            let operator: Token = this.previous();
            let right = this.and()
            expr = new Logical(expr, operator, right)
        }

        return expr
    }

    and(): Expr {
        let expr: Expr = this.equality();

        while (this.match(TokenType.AND)) {
            let operator: Token = this.previous();
            let right = this.equality()
            expr = new Logical(expr, operator, right)
        }

        return expr
    }

    equality(): Expr {
        let expr: Expr = this.comparision();

        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            let operator: Token = this.previous();
            let right = this.comparision()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    comparision(): Expr {
        let expr: Expr = this.addition();
        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            let operator: Token = this.previous();
            let right = this.addition()
            expr = new Binary(expr, operator, right)
        }
        return expr

    }

    addition(): Expr {
        let expr: Expr = this.multiplication();
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            let operator: Token = this.previous();
            let right = this.multiplication()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    multiplication(): Expr {
        let expr: Expr = this.unary();
        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            let operator: Token = this.previous();
            let right = this.unary()
            expr = new Binary(expr, operator, right)
        }
        return expr
    }

    unary(): Expr {

        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            let operator: Token = this.previous();
            let right: Expr = this.unary();
            return new Unary(operator, right)
        }

        return this.call()
    }
    call() {
        let expr: Expr = this.primary()

        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr)
            } else {
                break;
            }
        }

        return expr;
    }

    finishCall(callee: Expr): Expr {

        let args = new Array<Expr>();
        if (!this.check(TokenType.RIGHT_PAREN)) {

            do {
                if (args.length > 255) {
                    this.error(this.peek(), "Easy there bud, you have way too many arguments")
                }
                args.push(this.expression());
            } while (this.match(TokenType.COMMA))
        }

        let paren: Token = this.consume(TokenType.RIGHT_PAREN, "Expect right parenthesis after arguments")

        return new Call(callee, paren, args)

    }

    primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal)
        }

        if (this.match(TokenType.IDENTIFIER)) {
            return new Variable(this.previous())
        }

        if (this.match(TokenType.LEFT_PAREN)) {
            let expr: Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression.")
            return new Grouping(expr)
        }

        throw this.error(this.peek(), "Expected Expression")
    }

    consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.proceed();
        throw this.error(this.peek(), message)
    }

    error(token: Token, message: string): ParseError {
        this.tmoxInstance.error(token, message)
        return new ParseError()
    }

    synchronize() {
        this.proceed();
        while (!this.isEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return;
            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.DEC:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return

            }
            this.proceed()
        }

    }


    match(...types: Array<TokenType>): boolean {
        for (let type of types) {
            if (this.check(type)) {
                this.proceed()
                return true
            }
        }

        return false;
    }

    check(type: TokenType): boolean {
        if (this.isEnd()) {
            return false
        }
        return this.peek().type == type;
    }

    proceed(): Token {
        if (!this.isEnd()) this.current++;
        return this.previous()
    }

    isEnd(): boolean {
        return this.peek().type == TokenType.EOF
    }

    peek(): Token {
        return this.tokens[this.current]
    }

    previous(): Token {
        return this.tokens[this.current - 1]
    }


}
