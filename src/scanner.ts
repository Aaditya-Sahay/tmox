import Token from './token'
import TokenType from './tokentype'
import Tmox from './tmox'

export default class Scanner {
    source: string;
    tokens: Array<Token>
    start: number
    current: number
    line: number
    tmoxInstance: Tmox
    keywords: Map<String, TokenType>
    constructor(source: string, tmoxInstance: Tmox) {
        this.source = source;
        this.tokens = [];
        this.start = 0;
        this.current = 0;
        this.line = 1;
        this.tmoxInstance = tmoxInstance
        this.keywords = new Map<String, TokenType>();
        this.keywords.set("and", TokenType.AND);
        this.keywords.set("class", TokenType.CLASS);
        this.keywords.set("else", TokenType.ELSE);
        this.keywords.set("false", TokenType.FALSE);
        this.keywords.set("for", TokenType.FOR);
        this.keywords.set("fun", TokenType.FUN);
        this.keywords.set("if", TokenType.IF);
        this.keywords.set("nil", TokenType.NIL);
        this.keywords.set("or", TokenType.OR);
        this.keywords.set("print", TokenType.PRINT);
        this.keywords.set("return", TokenType.RETURN);
        this.keywords.set("super", TokenType.SUPER);
        this.keywords.set("this", TokenType.THIS);
        this.keywords.set("true", TokenType.TRUE);
        this.keywords.set("dec", TokenType.DEC);
        this.keywords.set("while", TokenType.WHILE);
    }
    tokenize(): Array<Token> {
        while (!this.isEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF, "", {}, this.line));
        return this.tokens;
    }
    scanToken() {
        let c = this.proceed();
        // would kill for rust's match here but ok
        switch (c) {
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '*': this.addToken(TokenType.STAR); break;
            case '!': this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '<': this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '>': this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;

            case '/': {
                if (this.match('/')) {
                    while (this.peek() != '\n' && !this.isEnd()) this.proceed();
                } else {
                    this.addToken(TokenType.SLASH)
                }
                break;
            }
            case '"': this.scanString(); break;

            //handling whitespace
            case ' ':
            case '\r':
            case '\t':
                break;
            case '\n': {
                this.line++
                break;
            }

            default: {
                if (this.isDigit(c)) {
                    this.scanNumber();
                } else if (this.isAlpha(c)) {
                    this.scanIdentifier()
                }
                else {
                    this.tmoxInstance.report(this.line, `${this.source.substring(this.start, this.current)}`, "Unexpected token")
                }

                break;
            }


        }
    }

    addToken(type: TokenType, literal?: any) {
        if (!literal) {
            literal = null
        }
        let text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }

    match(char: string): boolean {
        if (this.isEnd()) return false;
        if (this.source.charAt(this.current) != char) return false;
        this.current++
        return true;
    }

    peek(ahead?: number): string {
        if (this.isEnd()) return '\0';
        if (!ahead) {
            return this.source.charAt(this.current)
        }
        else {
            let lookahead = (ahead - 1) + this.current;
            if ((lookahead) > this.source.length) {
                return '\0';
            } else {
                return this.source.charAt(lookahead)
            }
        }

    }

    proceed(): string {
        this.current++
        return this.source.charAt(this.current - 1)
    }

    isEnd(): boolean {
        return this.current >= this.source.length;
    }

    isDigit(char: string): boolean {
        return (char >= '0' && char <= '9')
    }

    isAlpha(char: string): boolean {
        return (char >= 'a' && char <= 'z') ||
            (char >= 'A' && char <= 'Z') ||
            char == '_';
    }

    isAlphaNumeric(char: string): boolean {
        return this.isDigit(char) || this.isAlpha(char)
    }

    scanString() {
        while (this.peek() !== `"` && !this.isEnd()) {
            if (this.peek() === '\n') {
                this.line++;
            }
            this.proceed()
        }

        if (this.isEnd()) {
            this.tmoxInstance.report(this.line, this.source.substring(this.start, this.current), "Unterminated string")
            return
        }

        this.proceed();
        let value: string = this.source.substring(this.start + 1, this.current - 1)
        this.addToken(TokenType.STRING, value)
    }

    scanNumber() {
        while (this.isDigit(this.peek())) this.proceed();
        if (this.peek() === '.' && this.isDigit(this.peek(2))) {
            this.proceed();
            while (this.isDigit(this.peek())) this.proceed();
        }
        this.addToken(TokenType.NUMBER, Number(this.source.substring(this.start, this.current)))
    }
    
    scanIdentifier() {
        while (this.isAlphaNumeric(this.peek())) this.proceed();
        let text: string = this.source.substring(this.start, this.current);
        let type = this.keywords.get(text)
        if (!type){
            type = TokenType.IDENTIFIER
        }
        this.addToken(type)
    }

}