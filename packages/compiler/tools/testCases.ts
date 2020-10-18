const testCases: [string, string, number][] = [
  ["Empty program", "", 0],
  ["Expressions", "g = ((6- -7)+ 3);", 16],
  ["Number", "g = 5;", 5],
  ["Number with decimal", "g = 5.5;", 5.5],
  ["Number with decimal and no leading whole", "g = .5;", 0.5],
  ["Number with decimal and no trailing dec", "g = 5.;", 5],
  ["Number with no digits", "g = .;", 0],
  ["Optional final semi", "(g = 5; g = 10);", 10],
  ["Unary negeation", "g = -10;", -10],
  ["Unary plus", "g = +10;", 10],
  ["Unary not true", "g = !10;", 0],
  ["Unary not false", "g = !0;", 1],
  ["Unary not 0.1", "g = !0.1;", 0],
  ["Unary not < epsilon", "g = !0.000009;", 1],
  ["Multiply", "g = 10 * 10;", 100],
  ["Divide", "g = 10 / 10;", 1],
  ["Mod", "g = 5 % 2;", 1],
  ["Mod zero", "g = 5 % 0;", 0],
  ["Bitwise and", "g = 3 & 5;", 1],
  ["Bitwise or", "g = 3 | 5;", 7],
  ["To the power", "g = 5 ^ 2;", 25],
  ["Order of operations (+ and *)", "g = 1 + 1 * 10;", 11],
  ["Order of operations (+ and /)", "g = 1 + 1 / 10;", 1.1],
  ["Order of operations (unary - and +)", "g = -1 + 1;", 0],
  ["Parens", "g = (1 + 1) * 10;", 20],
  ["Absolute value negative", "g = abs(-10);", 10],
  ["Absolute value positive", "g = abs(10);", 10],
  ["Function used as expression", "g = 1 + abs(-10);", 11],
  ["Min", "g = min(2, 10);", 2],
  ["Min reversed", "g = min(10, 2);", 2],
  ["Max", "g = max(2, 10);", 10],
  ["Max reversed", "g = max(10, 2);", 10],
  ["Sqrt", "g = sqrt(4);", 2],
  ["Sqrt (negative)", "g = sqrt(-4);", 2],
  ["Sqr", "g = sqr(10);", 100],
  ["Int", "g = int(4.5);", 4],
  ["Sin", "g = sin(10);", Math.sin(10)],
  ["Cos", "g = cos(10);", Math.cos(10)],
  ["Tan", "g = tan(10);", Math.tan(10)],
  ["Asin", "g = asin(0.5);", Math.asin(0.5)],
  ["Acos", "g = acos(0.5);", Math.acos(0.5)],
  ["Atan", "g = atan(0.5);", Math.atan(0.5)],
  ["Atan2", "g = atan2(1, 1);", Math.atan2(1, 1)],
  ["Assign to globals", "g = 10;", 10],
  ["Read globals", "g = x;", 10],
  ["Multiple statements", "g = 10; g = 20;", 20],
  ["Multiple statements expression", "(g = 10; g = 20;);", 20],
  ["Multiple statements expression implcit return", "g = (0; 20 + 5;);", 25],
  ["if", "g = if(0, 20, 10);", 10],
  ["if", "g = if(0, 20, 10);", 10],
  ["if does short-circit (consiquent)", "if(0, (g = 10;), 10);", 0],
  ["if does short-circit (alternate)", "if(1, (10), (g = 10;));", 0],
  ["above (true)", "g = above(10, 4);", 1],
  ["above (false)", "g = above(4, 10);", 0],
  ["below (true)", "g = below(4, 10);", 1],
  ["below (false)", "g = below(10, 4);", 0],
  ["Line comments", "g = 10; // g = 20;", 10],
  ["Line comments (\\\\)", "g = 10; \\\\ g = 20;", 10],
  ["Equal (false)", "g = equal(10, 5);", 0],
  ["Equal (true)", "g = equal(10, 10);", 1],
  ["Pow", "g = pow(2, 10);", 1024],
  ["Log", "g = log(10);", Math.log(10)],
  ["Log10", "g = log10(10);", Math.log10(10)],
  ["Sign (10)", "g = sign(10);", 1],
  ["Sign (-10)", "g = sign(-10);", -1],
  ["Sign (0)", "g = sign(0);", 0],
  ["Sign (-0)", "g = sign(-0);", 0],
  ["Local variables", "a = 10; g = a * a;", 100],
  ["Local variable assignment (implicit return)", "g = a = 10;", 10],
  ["Bor (true, false)", "g = bor(10, 0);", 1],
  ["Bor (false, true)", "g = bor(0, 2);", 1],
  ["Bor (true, true)", "g = bor(1, 7);", 1],
  ["Bor (false, false)", "g = bor(0, 0);", 0],
  ["Bor does not shortcircut", "bor(1, g = 10);", 10],
  ["Bor respects epsilon", "g = bor(0.000009, 0.000009);", 0],
  ["Band (true, false)", "g = band(10, 0);", 0],
  ["Band (false, true)", "g = band(0, 2);", 0],
  ["Band (true, true)", "g = band(1, 7);", 1],
  ["Band (false, false)", "g = band(0, 0);", 0],
  ["Band does not shortcircut", "band(0, g = 10);", 10],
  ["Band respects epsilon", "g = band(0.000009, 0.000009);", 0],
  ["Bnot (true)", "g = bnot(10);", 0],
  ["Bnot (false)", "g = bnot(0);", 1],
  ["Bnot 0.1", "g = bnot(0.1);", 0],
  ["Bnot < epsilon", "g = bnot(0.000009);", 1],
  ["Plus equals", "g = 5; g += 5;", 10],
  ["Plus equals (local var)", "a = 5; a += 5; g = a;", 10],
  ["Plus equals (megabuf)", "g = megabuf(0) += 5;", 5],
  ["Minus equals", "g = 5; g -= 4;", 1],
  ["Minus equals (local var)", "a = 5; a -= 4; g = a;", 1],
  ["Minus equals (megabuf)", "g = megabuf(0) -= 5;", -5],
  ["Times equals", "g = 5; g *= 4;", 20],
  ["Times equals (local var)", "a = 5; a *= 4; g = a;", 20],
  ["Times equals (megabuf)", "g = (megabuf(0) = 9; megabuf(0) *= 2);", 18],
  ["Divide equals", "g = 5; g /= 2;", 2.5],
  ["Divide equals (local var)", "a = 5; a /= 2; g = a;", 2.5],
  ["Divide equals (megabuf)", "g = (megabuf(0) = 8; megabuf(0) /= 2);", 4],
  ["Mod equals", "g = 5; g %= 2;", 1],
  ["Mod equals (local var)", "a = 5; a %= 2; g = a;", 1],
  ["Mod equals (megabuf)", "g = (megabuf(0) = 5; megabuf(0) %= 2);", 1],
  ["Statement block as argument", "g = int(g = 5; g + 10.5;);", 15],
  ["Logical and (both true)", "g = 10 && 2;", 1],
  ["Logical and does not run the left twice", "(g = g + 1; 0;) && 10;", 1],
  ["Logical and (first value false)", "g = 0 && 2;", 0],
  ["Logical and (second value false)", "g = 2 && 0;", 0],
  ["Logical or (both true)", "g = 10 || 2;", 1],
  ["Logical or (first value false)", "g = 0 || 2;", 1],
  ["Logical and shortcircuts", "0 && g = 10;", 0],
  ["Logical or shortcircuts", "1 || g = 10;", 0],
  ["Exec2", "g = exec2(x = 5, x * 3);", 15],
  ["Exec3", "g = exec3(x = 5, x = x * 3, x + 1);", 16],
  ["While", "while(exec2(g = g + 1, g - 10));", 10],
  ["Loop", "loop(10, g = g + 1);", 10],
  ["Equality (true)", "g = 1 == 1;", 1],
  ["Equality epsilon", "g = 0 == 0.000009;", 1],
  ["!Equality (true)", "g = 1 != 0;", 1],
  ["!Equality (false)", "g = 1 != 1;", 0],
  ["!Equality epsilon", "g = 0 != 0.000009;", 0],
  ["Equality (false)", "g = 1 == 0;", 0],
  ["Less than (true)", "g = 1 < 2;", 1],
  ["Less than (false)", "g = 2 < 1;", 0],
  ["Greater than (true)", "g = 2 > 1;", 1],
  ["Greater than (false)", "g = 1 > 2;", 0],
  ["Less than or equal (true)", "g = 1 <= 2;", 1],
  ["Less than or equal (false)", "g = 2 <= 1;", 0],
  ["Greater than or equal (true)", "g = 2 >= 1;", 1],
  ["Greater than or equal (false)", "g = 1 >= 2;", 0],
  ["Script without trailing semi", "g = 1", 1],
  ["Megabuf access", "g = megabuf(1);", 0],
  ["Max index megabuf", "megabuf(8388607) = 10; g = megabuf(8388607);", 10],
  ["Max index + 1 megabuf", "megabuf(8388608) = 10; g = megabuf(8388608);", 0],
  ["Max index gmegabuf", "gmegabuf(8388607) = 10; g = gmegabuf(8388607);", 10],
  ["Max index+1 gmegabuf", "gmegabuf(8388608) = 10; g = gmegabuf(8388608);", 0],
  ["Megabuf assignment", "megabuf(1) = 10; g = megabuf(1);", 10],
  ["Megabuf assignment (idx 100)", "megabuf(100) = 10; g = megabuf(100);", 10],
  ["Megabuf (float)", "megabuf(0) = 1.2; g = megabuf(0);", 1.2],
  ["Gmegabuf", "gmegabuf(0) = 1.2; g = gmegabuf(0);", 1.2],
  ["Megabuf != Gmegabuf", "gmegabuf(0) = 1.2; g = megabuf(0);", 0],
  ["Gmegabuf != Megabuf", "megabuf(0) = 1.2; g = gmegabuf(0);", 0],
  ["Case insensitive vars", "G = 10;", 10],
  ["Case insensitive funcs", "g = InT(10);", 10],
  ["Consecutive semis", "g = 10;;; ;g = 20;;", 20],
  ["Equality (< epsilon)", "g = 0.000009 == 0;", 1],
  ["Equality (< -epsilon)", "g = -0.000009 == 0;", 1],
  ["Variables don't collide", "g = 1; not_g = 2;", 1],
  ["Block comment", "g = 1; /* g = 10 */ g = g * 2;", 2],
  ["Sigmoid 1, 2", "g = sigmoid(1, 2);", 0.8807970779778823],
  ["Sigmoid 2, 1", "g = sigmoid(2, 1);", 0.8807970779778823],
  ["Sigmoid 0, 0", "g = sigmoid(0, 0);", 0.5],
  ["Sigmoid 10, 10", "g = sigmoid(10, 10);", 1],
  ["Exp", "g = exp(10);", Math.exp(10)],
  ["Floor", "g = floor(10.9);", 10],
  ["Floor", "g = floor(-10.9);", -11],
  ["Ceil", "g = ceil(9.1);", 10],
  ["Ceil", "g = ceil(-9.9);", -9],
  ["Assign", "assign(g, 10);", 10],
  ["Assign return value", "g = assign(x, 10);", 10],
  ["EPSILON buffer indexes", "megabuf(9.99999) = 10; g = megabuf(10)", 10],
  ["+EPSILON & rounding -#s toward 0", "megabuf(-1) = 10; g = megabuf(0)", 10],
  ["Negative buffer index read as 0", "g = megabuf(-2);", 0],
  ["Negative buffer index", "g = (megabuf(-2) = 20);", 0],
  ["Negative buffer index gmegabuf", "g = (gmegabuf(-2) = 20);", 0],
  ["Negative buf index execs right hand side", "megabuf(-2) = (g = 10);", 10],
  ["Negative buf index +=", "g = megabuf(-2) += 10;", 10],
  ["Negative buf index -=", "g = megabuf(-2) -= 10;", -10],
  ["Negative buf index *=", "g = megabuf(-2) *= 10;", 0],
  ["Negative buf index /=", "g = megabuf(-2) /= 10;", 0],
  ["Negative buf index %=", "g = megabuf(-2) %= 10;", 0],
  ["Buff += mutates", "megabuf(100) += 10; g = megabuf(100)", 10],
  ["Buffers don't collide", "megabuf(100) = 10; g = gmegabuf(100)", 0],
  [
    "gmegabuf does not write megabuf",
    "i = 100; loop(10000,gmegabuf(i) = 10; i += 1); g = megabuf(100)",
    0,
  ],
  [
    "megabuf does not write gmegabuf",
    "i = 100; loop(10000,megabuf(i) = 10; i += 1); g = gmegabuf(100)",
    0,
  ],
  [
    "Adjacent buf indicies don't collide",
    "megabuf(99) = 10; megabuf(100) = 1; g = megabuf(99)",
    10,
  ],
  ["Exponentiation associativity", "g = 2 ^ 2 ^ 4", 256],
  ["^ has lower precedence than * (left)", "g = 2 ^ 2 * 4", 16],
  ["^ has lower precedence than * (right)", "g = 2 * 2 ^ 4", 32],
  ["% has lower precedence than * (right)", "g = 2 * 5 % 2", 2],
  ["% has lower precedence than * (left)", "g = 2 % 5 * 2", 4],
  ["% and ^ have the same precedence (% first)", "g = 2 % 5 ^ 2", 4],
  ["% and ^ have the same precedence (^ first)", "g = 2 ^ 5 % 2", 0],
  ["Loop limit", "g = 0; while(g = g + 1)", 1048576],
  ["Divide by zero", "g = 100 / 0", 0],
  ["Divide by less than epsilon", "g = 100 / 0.000001", 100000000],
];

export default testCases;
