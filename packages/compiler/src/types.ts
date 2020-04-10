export type Location = {
  first_column: number;
  last_column: number;
  first_line: number;
  last_line: number;
};

export type BinaryExpressionOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "|"
  | "&"
  | "^"
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">=";

export type AssignmentOperator = "+=" | "=" | "-=" | "*=" | "/=" | "%=";
export type LogicalExpressionOperator = "&&" | "||";
export type UnaryExpressionOperator = "+" | "-" | "!";

export type IdentifierAstNode = {
  type: "IDENTIFIER";
  value: string;
  loc: Location;
};

export type CallExpressionAstNode = {
  type: "CALL_EXPRESSION";
  callee: IdentifierAstNode;
  arguments: Ast[];
};

export type NumberLiteralAstNode = {
  type: "NUMBER_LITERAL";
  value: number;
};

export type ScriptAstNode = {
  type: "SCRIPT";
  body: Ast[];
};

export type ExpressionBlockAstNode = {
  type: "EXPRESSION_BLOCK";
  body: Ast[];
};

export type BinaryExpressionAstNode = {
  type: "BINARY_EXPRESSION";
  left: Ast;
  right: Ast;
  operator: BinaryExpressionOperator;
};

export type AssignmentExpressionAstNode = {
  type: "ASSIGNMENT_EXPRESSION";
  left: IdentifierAstNode | CallExpressionAstNode;
  right: Ast;
  operator: AssignmentOperator;
};

export type LogicalExpressionAstNode = {
  type: "LOGICAL_EXPRESSION";
  left: Ast;
  right: Ast;
  operator: LogicalExpressionOperator;
};

export type UnaryExpressionAstNode = {
  type: "UNARY_EXPRESSION";
  value: Ast;
  operator: UnaryExpressionOperator;
};

export type Ast =
  | ScriptAstNode
  | ExpressionBlockAstNode
  | BinaryExpressionAstNode
  | CallExpressionAstNode
  | AssignmentExpressionAstNode
  | LogicalExpressionAstNode
  | UnaryExpressionAstNode
  | IdentifierAstNode
  | NumberLiteralAstNode;

export interface Shims extends Record<string, Function> {
  sin(n: number): number;
  cos(n: number): number;
  tan(n: number): number;
  asin(n: number): number;
  acos(n: number): number;
  atan(n: number): number;
  atan2(n: number, m: number): number;
  rand(n: number): number;
  pow(n: number, m: number): number;
  log(n: number): number;
  log10(n: number): number;
  exp(n: number): number;
  sigmoid(n: number, m: number): number;
  floor(n: number): number;
  ceil(n: number): number;
}

export interface CompilerContext {
  resolveVar(name: string): number[];
  resolveLocalFunc(name: string): number[];
  resolveLocalF64(): number;
}