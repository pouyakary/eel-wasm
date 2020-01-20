const wabt = require("wabt")();
const { emit } = require("./emitter");
const { parse } = require("./parser");

function compileModule({ globals, functions }) {
  const exportedFunctions = Object.entries(functions).map(
    ([functionName, expression]) => {
      return {
        type: "FUNCTION_EXPORT",
        name: functionName,
        function: parse(expression)
      };
    }
  );

  const ast = { type: "MODULE", exportedFunctions };
  const wat = emit(ast, { globals });
  return wabt.parseWat("somefile.wat", wat);
}

async function loadModule({ globals, functions }) {
  const wasmModule = compileModule({
    globals: new Set(Object.keys(globals)),
    functions
  });
  const { buffer } = wasmModule.toBinary({});
  const mod = await WebAssembly.compile(buffer);

  var importObject = {
    js: { ...globals },
    imports: {
      // TODO: Reimplement these functions natively in Wasm
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      atan2: Math.atan2
    }
  };

  return await WebAssembly.instantiate(mod, importObject);
}

module.exports = { loadModule };
