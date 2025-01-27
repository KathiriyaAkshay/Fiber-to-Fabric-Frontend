export function calculateFinalNetAmount(netAmount, sgstRate, cgstRate, igstRate, tcsRate, tdsRate) {
  
  try {
    
    // Ensure all inputs are numbers
    netAmount = parseFloat(netAmount);
    sgstRate = parseFloat(sgstRate);
    cgstRate = parseFloat(cgstRate);
    igstRate = parseFloat(igstRate);
    tcsRate = parseFloat(tcsRate);
    tdsRate = parseFloat(tdsRate);
  
    // Validate inputs to avoid NaN issues
    if (isNaN(netAmount) || isNaN(sgstRate) || isNaN(cgstRate) || isNaN(igstRate) || isNaN(tcsRate) || isNaN(tdsRate)) {
      
    }
  
    // Step 1: Calculate tax amounts (SGST, CGST, IGST)
    const sgstAmount = netAmount * (sgstRate / 100);
    const cgstAmount = netAmount * (cgstRate / 100);
    const igstAmount = netAmount * (igstRate / 100);
  
    // Step 2: Calculate TCS and TDS amounts
    const tcsAmount = netAmount * (tcsRate / 100);
    const tdsAmount = netAmount * (tdsRate / 100);
  
    // Step 3: Calculate the final net amount (including taxes and TCS/TDS)
    const finalNetAmount = netAmount + sgstAmount + cgstAmount + igstAmount + tcsAmount - tdsAmount;
  
    // Step 4: Calculate the round-off value
    const roundedNetAmount = Math.round(finalNetAmount);
    const roundOffValue = (roundedNetAmount - finalNetAmount).toFixed(2); // Difference between rounded and actual amount
  
    // Return the results
    return {
      netAmount: netAmount.toFixed(2),
      sgstAmount: sgstAmount.toFixed(2),
      cgstAmount: cgstAmount.toFixed(2),
      igstAmount: igstAmount.toFixed(2),
      tcsAmount: tcsAmount.toFixed(2),
      tdsAmount: tdsAmount.toFixed(2),
      finalNetAmount: isNaN(finalNetAmount.toFixed(2))?0:finalNetAmount.toFixed(2),
      roundedNetAmount: roundedNetAmount.toFixed(2),
      roundOffValue: roundOffValue,
    };
  } catch (error) {
    return {
      netAmount :0 ,
      sgstAmount: 0, 
      cgstAmount: 0, 
      igstAmount: 0, 
      tcsAmount: 0, 
      tdsAmount : 0 ,
      finalNetAmount: 0, 
      roundedNetAmount: 0 , 
      roundOffValue: 0
    }
  }
  
}
