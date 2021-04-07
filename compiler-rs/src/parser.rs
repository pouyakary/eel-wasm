use std::num::ParseFloatError;

use crate::ast::{
    Assignment, AssignmentOperator, BinaryExpression, BinaryOperator, ExpressionBlock,
    FunctionCall, Identifier, UnaryExpression, UnaryOperator,
};

use super::ast::{EelFunction, Expression, NumberLiteral};
use super::error::CompilerError;
use super::lexer::Lexer;
use super::span::Span;
use super::tokens::{Token, TokenKind};

static SUM_PRECEDENCE: u8 = 1;
static DIFFERENCE_PRECEDENCE: u8 = 1;
static PRODUCT_PRECEDENCE: u8 = 2;
static QUOTIENT_PRECEDENCE: u8 = 2;
static PREFIX_PRECEDENCE: u8 = 6;

struct Parser<'a> {
    lexer: Lexer<'a>,
    token: Token,
}

type ParseResult<T> = Result<T, CompilerError>;

pub fn parse(src: &str) -> ParseResult<EelFunction> {
    let mut parser = Parser::new(&src);
    parser.parse()
}

impl<'a> Parser<'a> {
    pub fn new(source: &'a str) -> Self {
        Parser {
            lexer: Lexer::new(source),
            token: Token {
                kind: TokenKind::SOF,
                span: Span::empty(),
            },
        }
    }

    fn advance(&mut self) -> ParseResult<()> {
        self.token = self.lexer.next_token()?;
        Ok(())
    }

    fn expect_kind(&mut self, expected: TokenKind) -> ParseResult<()> {
        let token = self.peek();
        if token.kind == expected {
            self.advance()?;
            Ok(())
        } else {
            Err(CompilerError::new(
                format!("Expected a {:?} but found {:?}", expected, self.token.kind),
                token.span,
            ))
        }
    }

    pub fn parse(&mut self) -> ParseResult<EelFunction> {
        self.expect_kind(TokenKind::SOF)?;
        let program = self.parse_program()?;
        self.expect_kind(TokenKind::EOF)?;
        Ok(program)
    }

    pub fn parse_program(&mut self) -> ParseResult<EelFunction> {
        Ok(EelFunction {
            expressions: self.parse_expression_block()?,
        })
    }

    pub fn parse_expression_block(&mut self) -> ParseResult<ExpressionBlock> {
        let mut expressions = vec![];
        while self.peek_expression() {
            expressions.push(self.parse_expression(0)?);
            // TODO: This is probably not quite right. We should require semis between expressions.
            while self.peek().kind == TokenKind::Semi {
                self.advance()?;
            }
        }
        Ok(ExpressionBlock { expressions })
    }

    fn peek_expression(&self) -> bool {
        self.peek_prefix()
    }

    fn parse_expression(&mut self, precedence: u8) -> ParseResult<Expression> {
        let left = self.parse_prefix()?;
        self.maybe_parse_infix(left, precedence)
    }

    fn peek_prefix(&self) -> bool {
        let token = self.peek();
        match token.kind {
            TokenKind::OpenParen => true,
            TokenKind::Int => true,
            TokenKind::Plus => true,
            TokenKind::Minus => true,
            TokenKind::Bang => true,
            TokenKind::Identifier => true,
            _ => false,
        }
    }

    fn parse_prefix(&mut self) -> ParseResult<Expression> {
        match self.token.kind {
            TokenKind::OpenParen => {
                self.advance()?;
                let expression_block = self.parse_expression_block()?;
                self.expect_kind(TokenKind::CloseParen)?;
                Ok(Expression::ExpressionBlock(expression_block))
            }
            TokenKind::Int => Ok(Expression::NumberLiteral(self.parse_int()?)),
            TokenKind::Plus => {
                self.advance()?;
                Ok(Expression::UnaryExpression(UnaryExpression {
                    right: Box::new(self.parse_expression(PREFIX_PRECEDENCE)?),
                    op: UnaryOperator::Plus,
                }))
            }
            TokenKind::Minus => {
                self.advance()?;
                Ok(Expression::UnaryExpression(UnaryExpression {
                    right: Box::new(self.parse_expression(PREFIX_PRECEDENCE)?),
                    op: UnaryOperator::Minus,
                }))
            }
            TokenKind::Bang => {
                self.advance()?;
                Ok(Expression::UnaryExpression(UnaryExpression {
                    right: Box::new(self.parse_expression(PREFIX_PRECEDENCE)?),
                    op: UnaryOperator::Not,
                }))
            }
            // TokenKind::OpenParen => self.parse_parenthesized_expression(),
            // Once we have other prefix operators: `+-!` they  will go here.
            TokenKind::Identifier => self.parse_identifier_expression(),
            _ => Err(CompilerError::new(
                format!("Expected Int or Identifier but got {:?}", self.token.kind),
                self.token.span,
            )),
        }
    }

    fn maybe_parse_infix(&mut self, left: Expression, precedence: u8) -> ParseResult<Expression> {
        let mut next = left;
        loop {
            next = match self.token.kind {
                TokenKind::Plus if precedence < SUM_PRECEDENCE => self.parse_sum(next)?,
                TokenKind::Minus if precedence < DIFFERENCE_PRECEDENCE => {
                    self.parse_difference(next)?
                }
                TokenKind::Asterisk if precedence < PRODUCT_PRECEDENCE => {
                    self.parse_product(next)?
                }
                TokenKind::Slash if precedence < QUOTIENT_PRECEDENCE => {
                    self.parse_quotient(next)?
                }
                TokenKind::DoubleEqual => self.parse_comparison(next)?,
                _ => return Ok(next),
            }
        }
    }

    fn parse_comparison(&mut self, left: Expression) -> ParseResult<Expression> {
        self.expect_kind(TokenKind::DoubleEqual)?;
        // TODO: What precedence?
        let right = self.parse_expression(0)?;
        Ok(Expression::BinaryExpression(BinaryExpression {
            left: Box::new(left),
            right: Box::new(right),
            op: BinaryOperator::Eq,
        }))
    }

    fn parse_sum(&mut self, left: Expression) -> ParseResult<Expression> {
        self.expect_kind(TokenKind::Plus)?;
        let right = self.parse_expression(left_associative(SUM_PRECEDENCE))?;
        Ok(Expression::BinaryExpression(BinaryExpression {
            left: Box::new(left),
            right: Box::new(right),
            op: BinaryOperator::Add,
        }))
    }

    fn parse_difference(&mut self, left: Expression) -> ParseResult<Expression> {
        self.expect_kind(TokenKind::Minus)?;
        let right = self.parse_expression(left_associative(DIFFERENCE_PRECEDENCE))?;
        Ok(Expression::BinaryExpression(BinaryExpression {
            left: Box::new(left),
            right: Box::new(right),
            op: BinaryOperator::Subtract,
        }))
    }

    fn parse_product(&mut self, left: Expression) -> ParseResult<Expression> {
        self.expect_kind(TokenKind::Asterisk)?;
        let right = self.parse_expression(left_associative(PRODUCT_PRECEDENCE))?;
        Ok(Expression::BinaryExpression(BinaryExpression {
            left: Box::new(left),
            right: Box::new(right),
            op: BinaryOperator::Multiply,
        }))
    }

    fn parse_quotient(&mut self, left: Expression) -> ParseResult<Expression> {
        self.expect_kind(TokenKind::Slash)?;
        let right = self.parse_expression(left_associative(QUOTIENT_PRECEDENCE))?;
        Ok(Expression::BinaryExpression(BinaryExpression {
            left: Box::new(left),
            right: Box::new(right),
            op: BinaryOperator::Divide,
        }))
    }

    fn parse_int(&mut self) -> ParseResult<NumberLiteral> {
        if let TokenKind::Int = self.token.kind {
            let value = self.lexer.source(self.token.span);
            match parse_number(value) {
                Ok(value) => {
                    self.advance()?;
                    Ok(NumberLiteral { value })
                }
                Err(_) => Err(CompilerError::new(
                    format!("Could not parse \"{}\" to a number", value),
                    self.token.span,
                )),
            }
        } else {
            Err(CompilerError::new(
                format!("Expected an Int but found {:?}", self.token.kind),
                self.token.span,
            ))
        }
    }

    fn parse_identifier(&mut self) -> ParseResult<Identifier> {
        let span = self.token.span;
        self.expect_kind(TokenKind::Identifier)?;
        Ok(Identifier {
            name: self.lexer.source(span).to_lowercase(),
            span,
        })
    }

    fn parse_identifier_expression(&mut self) -> ParseResult<Expression> {
        let identifier = self.parse_identifier()?;

        match &self.token.kind {
            TokenKind::Equal => {
                self.advance()?;
                let right = self.parse_expression(0)?;
                Ok(Expression::Assignment(Assignment {
                    left: identifier,
                    operator: AssignmentOperator::Equal,
                    right: Box::new(right),
                }))
            }
            TokenKind::OpenParen => {
                self.advance()?;
                let mut arguments = vec![];
                while self.peek_expression() {
                    arguments.push(self.parse_expression(0)?);
                    match self.peek().kind {
                        TokenKind::Comma => self.advance()?,
                        TokenKind::CloseParen => {
                            self.advance()?;
                            break;
                        }
                        _ => {
                            return Err(CompilerError::new(
                                "Expected , or )".to_string(),
                                self.token.span,
                            ))
                        }
                    }
                }
                Ok(Expression::FunctionCall(FunctionCall {
                    name: identifier,
                    arguments,
                }))
            }
            _ => Ok(Expression::Identifier(identifier)),
        }
        // TODO: Support other operator types
    }

    fn peek(&self) -> &Token {
        &self.token
    }
}

fn parse_number(raw: &str) -> Result<f64, ParseFloatError> {
    if raw.starts_with('.') {
        format!("0{}", raw).parse::<f64>()
    } else {
        raw.parse::<f64>()
    }
}

#[inline]
#[allow(dead_code)] // Save this for when we need it.
fn left_associative(precedence: u8) -> u8 {
    precedence
}

#[inline]
#[allow(dead_code)] // Save this for when we need it.
fn right_associative(precedence: u8) -> u8 {
    precedence - 1
}

#[test]
fn can_parse_integer() {
    assert_eq!(
        Parser::new("1").parse(),
        Ok(EelFunction {
            expressions: ExpressionBlock {
                expressions: vec![Expression::NumberLiteral(NumberLiteral { value: 1.0 })]
            }
        })
    );
}

#[test]
fn can_parse_integer_2() {
    assert_eq!(
        Parser::new("2").parse(),
        Ok(EelFunction {
            expressions: ExpressionBlock {
                expressions: vec![Expression::NumberLiteral(NumberLiteral { value: 2.0 })]
            }
        })
    );
}
