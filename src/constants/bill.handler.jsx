import { PURCHASE_TAKA_BILL_MODEL, JOB_TAKA_BILL_MODEL, DEBIT_NOTE_YARN_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_PURCHASE_RETURN, DEBIT_NOTE_DISCOUNT_TYPE, DEBIT_NOTE_CLAIM_NOTE } from "./bill.model";
import { generatePurchaseBillDueDate, generateJobBillDueDate } from "../pages/accounts/reports/utils";
import moment from "moment";
import { CREDIT_NOTE_BILL_MODEL } from "./bill.model";
import { calculateFinalNetAmount } from "./taxHandler";

function calculateDaysDifference(dueDate) {
    const today = new Date(); // Get today's date
    const [day, month, year] = dueDate.split('-');
    const due = new Date(year, month - 1, day);
    const timeDifference = today - due; // Difference in milliseconds
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    return dayDifference;
}

export function billDataHandler(bill){

    let debit_note_details = bill?.debit_notes ; 
    let debit_note_number = [] ; 

    const dueDate = bill?.due_date == null?
        bill?.model == PURCHASE_TAKA_BILL_MODEL?generatePurchaseBillDueDate(bill?.bill_date):
        generateJobBillDueDate(bill?.bill_date)
        :moment(bill?.due_date).format("DD-MM-YYYY") ;
    let due_days_color = "black"; 
    let dueDays = bill?.model == CREDIT_NOTE_BILL_MODEL?0:calculateDaysDifference(dueDate) ; 
    
    if (dueDays < 0){
        dueDays = 0 ;
    }

    if (dueDays > 0){
        due_days_color = "red" ; 
    }

    const bill_amount_without_gst = bill?.amount ; 
    let bill_date = moment(bill?.bill_date).format("DD-MM-YYYY") ;

    let total_return_amount = 0 ;
    let total_discount_amount = 0 ;
    let total_claim_note_amount = 0 ;

    let bill_remaing_amount = bill?.part_payment || 0 ; 
    let bill_net_amount =  0 ;
    let bill_net_amount_info_string = undefined ; 
    let bill_amount = +bill?.net_amount ; 
    let paid_amount = 0 ; 
    
    debit_note_details?.map((element) => {
        let type = element?.debit_note_type ;
        if ([DEBIT_NOTE_YARN_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_PURCHASE_RETURN]?.includes(type)){
            debit_note_number.push({
                "number": element?.debit_note_number, 
                "id": element?.id, 
                "type": "return", 
                "amount": element?.net_amount
            })
            total_return_amount = +total_return_amount + +element?.net_amount ; 

        }   else if (type == DEBIT_NOTE_DISCOUNT_TYPE){

            let SGST_value = element?.SGST_value ; 
            let CGST_value = element?.CGST_value ; 
            let IGST_value = element?.IGST_value ; 
            let Discount_value = element?.discount_value ; 
            let TCS_value = element?.tcs_value || 0 ; 
            let TDS_value = element?.extra_tex_value || 0 ;
            let amount = 0 ;

            element?.debit_note_details?.map((item) => {
                if (+item?.bill_id === +bill?.id && item?.model == bill?.model){
                    amount = item?.amount ; 
                }
            })

            // Calculate discount amount 
            const discountAmount = (+amount * +Discount_value) / 100;
            amount = +amount - +discountAmount ; 
             

            let billData = calculateFinalNetAmount(
                amount, 
                +SGST_value, 
                CGST_value, 
                IGST_value, 
                TCS_value, 
                TDS_value
            )

            debit_note_details.push({
                "number": element?.debit_note_number, 
                "id": element?.id, 
                "type": "discount", 
                "amount": billData?.roundedNetAmount
            })

            total_discount_amount = +total_discount_amount + +billData?.roundedNetAmount ; 
        
        }  else if (DEBIT_NOTE_CLAIM_NOTE == type){
            debit_note_number.push({
                "number": element?.debit_note_number, 
                "id": element?.id, 
                "type": "claim", 
                "amount": element?.net_amount
            })

            total_claim_note_amount = +total_claim_note_amount + +element?.net_amount ; 
        }
    })

    // Bill net amount calculation 
    if (bill_remaing_amount == 0){
        bill_net_amount = +bill_amount - +total_return_amount - +total_discount_amount - +total_claim_note_amount ; 
        bill_net_amount_info_string = `${+bill_amount} - ${+total_return_amount} - ${+total_discount_amount} - ${+total_claim_note_amount} = ${parseFloat(bill_net_amount).toFixed(2)}` ; 
    }   else {
        let temp_amount = (+bill_amount - +total_return_amount - +total_discount_amount) ; 
        paid_amount = +temp_amount - +bill_remaing_amount ; 
        bill_net_amount = bill_remaing_amount ; 
        bill_net_amount_info_string = `${+bill_amount} - ${+total_return_amount} - ${+total_discount_amount} - ${+total_claim_note_amount} -  ${+paid_amount} = ${parseFloat(bill_amount).toFixed(2)}` ; 
    }
    
    return {
        debit_note_details, 
        debit_note_number, 
        dueDate, 
        dueDays, 
        bill_amount_without_gst, 
        total_return_amount: parseFloat(total_return_amount).toFixed(2), 
        total_discount_amount: parseFloat(total_discount_amount).toFixed(2), 
        bill_net_amount: parseFloat(bill_net_amount).toFixed(2), 
        bill_net_amount_info_string, 
        bill_date, 
        due_days_color,
        bill_id: bill?.bill_id,
        bill_no: bill?.bill_no, 
        model: bill?.model
    }

}