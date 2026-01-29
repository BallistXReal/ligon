grammar Ligon;

program: statement* EOF;

statement
    : assignment (SEMICOLON|COLON)?
    | call (SEMICOLON|COLON)?
    | block
    ;

assignment: IDENT ASSIGN expression;

expression
    : literal
    | call
    | member
    ;

call: member LPAREN argList? RPAREN;

member: IDENT (DOT (IDENT | STRING))*;

argList: expression (COMMA expression)*;

block
    : ifBlock
    | callBlock
    | serviceDecl
    ;

ifBlock: IF LPAREN expression RPAREN DOT RUN COLON? blockBody;

callBlock: call COLON? blockBody;

serviceDecl: IDENT LBRACE IDENT RBRACE (COLON|SEMICOLON)?;

blockBody: LBRACE statement* RBRACE (COMMA|SEMICOLON)?;

literal: NUMBER | STRING;

IF: 'if';
RUN: 'run';

ASSIGN: '=';
DOT: '.';
COMMA: ',';
LPAREN: '(';
RPAREN: ')';
LBRACE: '{';
RBRACE: '}';
COLON: ':';
SEMICOLON: ';';

NUMBER: [0-9]+ ('.' [0-9]+)?;
STRING: '"' (~["\\] | '\\' .)* '"';

IDENT: [a-zA-Z_][a-zA-Z0-9_]*;

WS: [ \t\r\n]+ -> skip;
