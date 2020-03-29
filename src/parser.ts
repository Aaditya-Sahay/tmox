import Tmox from './tmox'
import Token from './token'
import TokenType from './tokentype'
import { Expr, Binary, Unary, Literal, Grouping } from './expression'


class ParseError {

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

    parse(){
        try { 
            return this.expression()
        }catch(error) {
            return null;
        }
    }

    expression(): Expr {
        return this.equality()
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
            let right = this.comparision()
            expr = new Binary(expr, operator, right)
        }
        return expr

    }

    addition(): Expr {
        let expr: Expr = this.multiplication();
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            let operator: Token = this.previous();
            let right = this.comparision()
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

        if (this.match(TokenType.BANG, TokenType.MINUS)){
            let operator: Token = this.previous();
            let right: Expr = this.unary();
            return new Unary(operator, right)
        }

        return this.primary()
    }

    primary(): Expr {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)){
            return new Literal(this.previous().literal)
        }

        if (this.match(TokenType.LEFT_PAREN)){
            let expr: Expr = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expected ')' after expression." )
            return new Grouping(expr)
        }

        throw this.error(this.peek(), "Expected Expression")
    }

    consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.proceed();
        throw this.error(this.peek(), message)
    }

    error(token: Token, message: string): ParseError{
        this.tmoxInstance.error(token, message)
        return new ParseError()
    } 

    synchronize(){
        this.proceed();
        while (!this.isEnd()){
            if (this.previous().type == TokenType.SEMICOLON) return;
            switch(this.peek().type){
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


    match(...types: Array<TokenType>): boolean{
        for (let type of types) {
            if (this.check(type)){
                this.proceed()
                return true
            }
        }

        return false;
    }

    check(type: TokenType): boolean{
        if (this.isEnd()){
            return false
        }
        return this.peek().type == type;
    }

    proceed(): Token{
        if (!this.isEnd()) this.current++;
        return this.previous()
    }

    isEnd(): boolean{
        return this.peek().type == TokenType.EOF
    }

    peek(): Token{
        return this.tokens[this.current]
    }

    previous(): Token {
        return this.tokens[this.current-1]
    }


}
