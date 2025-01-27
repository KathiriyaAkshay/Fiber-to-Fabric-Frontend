import { CREDIT_NOTE_BEAM_SALE_RETURN, CREDIT_NOTE_CLAIM_NOTE, CREDIT_NOTE_DISCOUNT_NOTE, CREDIT_NOTE_OTHER_TYPE, CREDIT_NOTE_SALE_RETURN, CREDIT_NOTE_YARN_SALE_RETURN, DEBIT_NOTE_DISCOUNT_TYPE, DEBIT_NOTE_OTHER_TYPE, DEBIT_NOTE_PURCHASE_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_YARN_RETURN } from "./bill.model";
import { calculateFinalNetAmount } from "./taxHandler";
import { PURCHASE_TAKA_BILL_MODEL } from "./bill.model";
import { generatePurchaseBillDueDate, generateJobBillDueDate } from "../pages/accounts/reports/utils";
import moment from "moment";
import { bool } from "yup";

function calculateDaysDifference(dueDate) {
    const today = new Date(); // Get today's date
    const [day, month, year] = dueDate.split("-");
    const due = new Date(year, month - 1, day);
    const timeDifference = today - due; // Difference in milliseconds
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return dayDifference;
}

const CalculateInterest = (due_days, bill_amount) => {
    const INTEREST_RATE = 0.12; // Annual interest rate of 12%
    if (due_days <= 0 || bill_amount <= 0) {
      return 0; // Return 0 if inputs are invalid
    }
    // Calculate interest
    const interestAmount = (+bill_amount * INTEREST_RATE * due_days) / 365;
    return interestAmount.toFixed(2); // Return the interest amount rounded to 2 decimal places
};

export function sundryCreditorHandler(bill){

    let credit_note_details = bill?.creditNotes ;
    let credit_note_number = undefined ; 
    let credit_note_amount = undefined ; 
    let credit_note_id = undefined ; 

    let debit_note_details = bill?.debitNotes ; 
    let debit_note_number = []; 
    let paid_amount = undefined ; 
    let total_return_amount = 0 ; // 20
    let total_discount_amount = 0 ;  // 20

    let bill_amount = +bill?.net_amount ; // 100
    let bill_remaing_amount = +bill?.part_payment == 0?null:+bill?.part_payment;
       
    let bill_net_amount = null ; 
    let bill_net_amount_info_string = undefined ; 

    let bill_date = moment(bill?.bill_date).format("DD-MM-YYYY") ; 

    const dueDate =
        bill?.due_date == null
            ? bill?.model == PURCHASE_TAKA_BILL_MODEL
            ? generatePurchaseBillDueDate(bill?.bill_date)
            : generateJobBillDueDate(bill?.bill_date)
            : moment(bill?.due_date).format("DD-MM-YYYY");
        let dueDays = calculateDaysDifference(dueDate);
    if (dueDays < 0){
        dueDays = 0 ; 
    } 

    const interestAmount = CalculateInterest(dueDays, bill?.net_amount);
    
    let interstAmountColor = "black" ; 

    if (dueDays > 0 ){
        interstAmountColor  = "red" ; 
    }

    credit_note_details?.map((element) => {
        if (element?.credit_note?.credit_note_type == CREDIT_NOTE_OTHER_TYPE){
            credit_note_number = element?.credit_note?.credit_note_number ; 
            credit_note_amount = element?.credit_note?.net_amount ; 
            credit_note_id = element?.credit_note?.id ; 
            return ; 
        }
    })    

    debit_note_details?.map((element) => {
        let type = element?.debit_note?.debit_note_type ; 
        if ([DEBIT_NOTE_PURCHASE_RETURN,
            DEBIT_NOTE_SIZE_BEAM_RETURN, 
            DEBIT_NOTE_YARN_RETURN, 
            DEBIT_NOTE_DISCOUNT_TYPE
        ]?.includes(type)){
            if ([DEBIT_NOTE_PURCHASE_RETURN, 
                DEBIT_NOTE_SIZE_BEAM_RETURN, 
                DEBIT_NOTE_YARN_RETURN
            ]?.includes(type)){
                debit_note_number.push({
                    "number": element?.debit_note?.debit_note_number,
                    "amount": element?.debit_note?.net_amount
                }) 
                total_return_amount += +element?.debit_note?.net_amount
            }   else {
                let amount = +element?.amount ; 
                let SGST_value = +element?.debit_note?.SGST_value ; 
                let CGST_value = +element?.debit_note?.CGST_value ; 
                let IGST_value = +element?.debit_note?.IGST_value ; 
                let Discount_value = +element?.debit_note?.discount_value || 0 ;
                let TCS_value = +element?.debit_note?.tcs_value ||  0 ;
                let TDS_value = +element?.debit_note?.extra_tex_value || 0 ;

                const discountAmount = (amount * +Discount_value) / 100;
                amount = +amount - +discountAmount ;  

                let billData = calculateFinalNetAmount(
                    +amount, 
                    SGST_value, 
                    CGST_value, 
                    IGST_value, 
                    TCS_value, 
                    TDS_value
                ); 

                let netAmount = billData?.roundedNetAmount ; 
                debit_note_number.push({
                    "number": element?.debit_note?.debit_note_number,
                    "amount": netAmount, 
                    "id": element?.debit_note?.id
                }) 
                total_discount_amount += +netAmount

            }
        }
    })

    // Calculate bill net amount 
    if (bill_remaing_amount == null){
        bill_net_amount = +bill_amount - +total_return_amount - +total_discount_amount 
        bill_net_amount_info_string = `${bill_net_amount} - ${total_return_amount} - ${total_discount_amount} - 0 = ${bill_net_amount}`
    }   else {
        let temp_amount = (+bill_amount - +total_discount_amount - +total_return_amount) ; 
        paid_amount = +temp_amount - +bill_remaing_amount  ; 
        bill_net_amount = bill_remaing_amount ; 
        bill_net_amount_info_string = `${bill_amount} - ${total_return_amount} - ${total_discount_amount} - ${paid_amount} = ${bill_net_amount}` 
    }

    // Calculate interestamount related calculation 


    return {
        debit_note_number,
        credit_note_number,
        credit_note_id, 
        bill_net_amount: parseFloat(bill_net_amount).toFixed(2),
        bill_net_amount_info_string, 
        dueDate, 
        interestAmount: parseFloat(interestAmount).toFixed(2), 
        interstAmountColor,
        credit_note_amount: parseFloat(credit_note_amount).toFixed(2), 
        bill_date
    };
    
    
}

export function sundaryDebitorHandler(bill){

    let bill_id = bill?.bill_id ; 
    let bill_model = bill?.model ; 

    let debite_note_details = bill?.debit_notes ; 
    let debite_note_id = undefined ; 
    let debite_note_number = undefined ; 
    let debite_note_amount = undefined ; 

    let credit_note_details = bill?.credit_notes ; 
    let credit_note_number = [] ; 
    let total_return_amount = 0 ; 
    let total_claim_amount = 0 ; 
    let total_discount_amount = 0 ; 
    let bill_remaing_amount = bill?.part_payment ;
    let bill_amount = +bill?.net_amount ;  
    let bill_net_amount =  0 ; 
    let bill_net_amount_info_string = undefined ; 
    let paid_amount = 0 ; 
    let due_day_color = "black" ; 
    let interest_paid_date = bill?.interest_paid_date ; 
    let interest_paid_amount = bill?.interest_amount ; 


    // Due date and bill date related information 
     let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
    let dueDays = 0;

    if (parseFloat(paid_amount).toFixed(2) > 0) {
        dueDays = 0;
    } else {
        dueDays = isNaN(calculateDaysDifference(dueDate))
            ? 0
            : calculateDaysDifference(dueDate);
    }

    if (dueDays > 0){
        due_day_color = 'red'  ; 
    }

    // Bill date calculation
    let billDate = moment(bill?.createdAt).format("DD-MM-YYYY");
    let billDays = isNaN(calculateDaysDifference(billDate))
    ? 0
    : calculateDaysDifference(billDate);

    debite_note_details?.map((element) => {
        if (element?.debit_note_type == DEBIT_NOTE_OTHER_TYPE){
            debite_note_id = element?.id 
            debite_note_number = element?.debit_note_number 
            debite_note_amount = element?.net_amount 
        }
    })

    credit_note_details?.map((element) => {
        let type = element?.credit_note_type ;
        let RETURN_TYPE = "return" ; 
        let DISCOUNT_TYPE = "discount" ; 
        let CLAIM_TYPE = "claim" ; 
        
        if ([CREDIT_NOTE_SALE_RETURN, 
            CREDIT_NOTE_BEAM_SALE_RETURN, 
            CREDIT_NOTE_YARN_SALE_RETURN
        ]?.includes(type)){

            // Return amount 
            credit_note_number.push({
                "number": element?.credit_note_number, 
                "amount": element?.net_amount, 
                "id": element?.id, 
                "type": RETURN_TYPE
            })
            total_return_amount += +element?.net_amount ; 

        }   else if (type == CREDIT_NOTE_DISCOUNT_NOTE){
            
            // Discount note

            let Discount_value = element?.discount_value || 0 ; 
            let SGST_value = element?.SGST_value; 
            let CGST_value = element?.CGST_value ; 
            let IGST_value = element?.IGST_value  ; 
            let TCS_value = element?.tcs_value || 0; 
            let TDS_value = element?.extra_tex_value || 0 ; 
            let amount =  0 ; 

            element?.credit_note_details?.map((item) => {
                if (+item?.bill_id == +bill_id && item?.model == bill_model){
                    amount = item?.amount ; 
                }
            })

            const discountAmount = (+amount * +Discount_value) / 100;
            amount = +amount - +discountAmount ; 
             

            let billData = calculateFinalNetAmount(
                +amount,
                SGST_value, 
                CGST_value, 
                IGST_value, 
                TCS_value, 
                TDS_value
            ) ; 

            credit_note_number.push({
                "number": element?.credit_note_number, 
                "amount": billData?.roundedNetAmount, 
                "id": element?.id, 
                "type": DISCOUNT_TYPE
            })

            total_discount_amount = +total_discount_amount + +billData?.roundedNetAmount ; 

        }   else if (type == CREDIT_NOTE_CLAIM_NOTE){

            // Claim note
            credit_note_number.push({
                "number": element?.credit_note_number, 
                "amount": element?.net_amount, 
                "id": element?.id, 
                "type": CLAIM_TYPE
            })
            total_claim_amount = +total_claim_amount + element?.net_amount
        }

        if (bill_remaing_amount == null){
            bill_net_amount = +bill_amount - +total_return_amount - +total_claim_amount - +total_discount_amount ; 
            bill_net_amount_info_string = `${+bill_amount} - ${+total_return_amount} - ${+total_discount_amount} - ${+total_claim_amount} - 0 = ${bill_net_amount}` ; 
        }   else {
            let temp_amount = (+bill_amount - +total_discount_amount - +total_return_amount - +total_claim_amount) ; 
            paid_amount = +temp_amount - +bill_remaing_amount ; 
            bill_net_amount = bill_remaing_amount ; 
            bill_net_amount_info_string = `${+bill_amount} - ${+total_return_amount} - ${+total_discount_amount} - ${+total_claim_amount} - ${+paid_amount} = ${bill_net_amount}`
        }
         
    })

    // Calculate interest amount 
    let interest_amount = CalculateInterest(dueDays, bill_amount)

    return {
        debite_note_id, 
        debite_note_number, 
        debite_note_amount, 
        total_discount_amount: parseFloat(total_discount_amount).toFixed(2), 
        total_return_amount: parseFloat(total_return_amount).toFixed(2) , 
        total_claim_amount: parseFloat(total_claim_amount).toFixed(2), 
        credit_note_number, 
        bill_net_amount: parseFloat(bill_net_amount).toFixed(2), 
        bill_net_amount_info_string: bill_net_amount_info_string || "", 
        paid_amount: parseFloat(paid_amount).toFixed(2), 
        dueDays, 
        billDays, 
        due_day_color, 
        dueDate, 
        billDate, 
        interest_paid_date, 
        interest_paid_amount, 
        interest_amount: parseFloat(interest_amount).toFixed(2), 
        bill_amount_without_gst: parseFloat(bill?.amount).toFixed(2), 
        bill_amount: bill_amount
        
    }
}