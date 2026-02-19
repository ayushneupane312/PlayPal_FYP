/**
 * Dynamic split payment utility – no decimals, remainder distributed.
 * First `remainder` players pay (baseAmount + 1), remaining pay baseAmount.
 *
 * @param {number} totalAmount - Total to split (integer)
 * @param {number} teamSize - Number of players (integer, >= 1)
 * @returns {{ amounts: number[], baseAmount: number, remainder: number }}
 * @example totalAmount=5000, teamSize=6 → baseAmount=833, remainder=2 → [834,834,833,833,833,833]
 */
function calculateSplit(totalAmount, teamSize) {
  const total = Math.floor(Number(totalAmount)) || 0;
  const size = Math.max(1, Math.floor(Number(teamSize)) || 1);

  if (total <= 0) {
    return { amounts: Array(size).fill(0), baseAmount: 0, remainder: 0 };
  }

  const baseAmount = Math.floor(total / size);
  const remainder = total % size;

  const amounts = [];
  for (let i = 0; i < size; i++) {
    amounts.push(i < remainder ? baseAmount + 1 : baseAmount);
  }

  return { amounts, baseAmount, remainder };
}

module.exports = { calculateSplit };
