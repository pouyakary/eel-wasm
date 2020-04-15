import {
  encodef64,
  unsignedLEB128,
  op,
  VAL_TYPE,
  IS_NOT_ZEROISH,
} from "./encoding";
import { FunctionDefinition } from "./types";

export const localFuncMap: { [functionName: string]: FunctionDefinition } = {
  sqr: {
    args: [VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      op.local_get,
      ...unsignedLEB128(0),
      op.f64_mul,
    ],
  },
  bor: {
    args: [VAL_TYPE.f64, VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      ...IS_NOT_ZEROISH,
      op.local_get,
      ...unsignedLEB128(1),
      ...IS_NOT_ZEROISH,
      op.i32_or,
      op.i32_const,
      // TODO: Is this the right encoding for an int32?
      ...unsignedLEB128(0),
      op.i32_ne,
      op.f64_convert_i32_s,
    ],
  },
  band: {
    args: [VAL_TYPE.f64, VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      ...IS_NOT_ZEROISH,
      op.local_get,
      ...unsignedLEB128(1),
      ...IS_NOT_ZEROISH,
      op.i32_and,
      op.i32_const,
      // TODO: Is this the right encoding for an int32?
      ...unsignedLEB128(0),
      op.i32_ne,
      op.f64_convert_i32_s,
    ],
  },
  sign: {
    args: [VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.f64_const,
      ...encodef64(0),
      op.local_get,
      ...unsignedLEB128(0),
      op.f64_lt,
      op.local_get,
      ...unsignedLEB128(0),
      op.f64_const,
      ...encodef64(0),
      op.f64_lt,
      op.i32_sub,
      op.f64_convert_i32_s,
    ],
  },
  mod: {
    args: [VAL_TYPE.f64, VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    // TODO: Simplify all this type coersion
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      op.i64_trunc_s_f64,
      op.local_get,
      ...unsignedLEB128(1),
      op.i64_trunc_s_f64,
      op.i64_rem_s,
      op.f64_convert_s_i64,
    ],
  },
  bitwiseOr: {
    args: [VAL_TYPE.f64, VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      op.i64_trunc_s_f64,
      op.local_get,
      ...unsignedLEB128(1),
      op.i64_trunc_s_f64,
      op.i64_or,
      op.f64_convert_s_i64,
    ],
  },
  bitwiseAnd: {
    args: [VAL_TYPE.f64, VAL_TYPE.f64],
    returns: [VAL_TYPE.f64],
    binary: [
      op.local_get,
      ...unsignedLEB128(0),
      op.i64_trunc_s_f64,
      op.local_get,
      ...unsignedLEB128(1),
      op.i64_trunc_s_f64,
      op.i64_and,
      op.f64_convert_s_i64,
    ],
  },
};
