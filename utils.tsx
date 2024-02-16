import BigNumber from "bignumber.js";

export const formatAptos = (val: string, decimals?: number) =>
  BigNumber(val)
    .shiftedBy(-8)
    .toFormat(decimals ?? 0);

export const formatAptosBigNumber = (bn: BigNumber, decimals?: number) =>
  bn.shiftedBy(-8).toFormat(decimals ?? 2);
