import { JOB_GREAY_SALE_BILL_MODEL, JOB_REWORK_BILL_MODEL, JOB_TAKA_BILL_MODEL, JOB_WORK_BILL_MODEL, PURCHASE_TAKA_BILL_MODEL, RECEIVE_SIZE_BEAM_BILL_MODEL, SALE_BILL_MODEL, YARN_RECEIVE_BILL_MODEL, YARN_SALE_BILL_MODEL } from "../constants/bill.model";
import moment from "moment";
import { generatePurchaseBillDueDate, generateJobBillDueDate } from "../pages/accounts/reports/utils";

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

export function extractSupplierInformation(details, model){
    
    // Suppllier information 
    let supplier_name = undefined ; 
    let supplier_company =  undefined ; 
    let suplier_gst_number = undefined ; 
    let supplier_pan_number = undefined ; 
    let supplier_address = undefined ; 
    let supplier_email = undefined ; 
    let supplier_id = undefined ; 
    let yarn_company_id = null ; 

    // Bill Information 
    let SGST_value = undefined ; 
    let CGST_value = undefined ; 
    let IGST_value = undefined ; 
    let quality_id = undefined ; 
    let quality = undefined ; 
    let bill_no = undefined; 
    let total_meter = undefined ; 
    let total_taka = undefined ; 
    let rate = undefined ; 
    let TCS_value  = undefined ; 
    let bill_amount = undefined ; 
    let bill_net_amount = undefined ; 
    let interest_amount = 0 ; 
    let due_date = 0 ; 

    if (model == YARN_RECEIVE_BILL_MODEL){
        
        // Supplier information 
        supplier_name = details?.supplier?.supplier?.supplier_name ; 
        supplier_company = details?.supplier?.supplier?.supplier_company ; 
        suplier_gst_number = details?.supplier?.gst_no ; 
        supplier_pan_number = details?.supplier?.pancard_no ; 
        supplier_address = details?.supplier?.address ; 
        supplier_email = details?.supplier?.email ;
        supplier_id = details?.supplier?.supplier?.user_id ;

        // Bill information 
        SGST_value = details?.SGST_value; 
        CGST_value = details?.CGST_value ; 
        IGST_value = details?.IGST_value ; 
        TCS_value = details?.TCS_value ; 
        quality_id  = undefined ; 
        quality = undefined ; 
        bill_no = details?.invoice_no ; 
        total_meter = 0 ; 
        total_taka = 0 ;
        rate = details?.rate ; 
        bill_amount = details?.discount_brokerage_amount ; 
        bill_net_amount = details?.net_amount ; 

        // Calculated inerest amount calculation 
        due_date = moment(details?.due_date).format("DD-MM-YYYY");
        let dueDays = calculateDaysDifference(due_date);
        if (dueDays < 0){
            dueDays = 0 ; 
        }
        interest_amount = CalculateInterest(dueDays, +details?.after_TDS_amount) ; 


    }   else if (model == JOB_TAKA_BILL_MODEL){
        
        // Supplier information
        supplier_name = details?.job_taka_challan?.supplier?.supplier_name ; 
        supplier_company = details?.job_taka_challan?.supplier?.supplier_company ; 
        supplier_id = details?.job_taka_challan?.supplier?.user_id ; 
        suplier_gst_number = details?.job_taka_challan?.supplier?.user?.gst_no ; 
        supplier_pan_number = details?.job_taka_challan?.supplier?.user?.pancard_no ; 
        supplier_address = details?.job_taka_challan?.supplier?.user?.address ; 
        supplier_email = details?.job_taka_challan?.supplier?.user?.email ; 

        // Bill Information 
        SGST_value = details?.SGST_value ; 
        CGST_value = details?.CGST_value; 
        IGST_value = details?.IGST_value ; 
        TCS_value = details?.TCS_value ; 
        quality_id = details?.job_taka_challan?.quality_id ; 
        quality = undefined ; 
        bill_no = details?.invoice_no ; 
        total_meter = details?.job_taka_challan?.total_meter ; 
        total_taka = details?.job_taka_challan?.total_taka ; 
        rate = details?.rate ; 
        bill_amount = details?.discount_amount ; 
        bill_net_amount = details?.after_TDS_amount

        // Calculated interest amount calculation 
        due_date = generateJobBillDueDate(details?.bill_date) ; 
        let dueDays = calculateDaysDifference(due_date);
          if (dueDays < 0){
            dueDays = 0 ; 
        } 
        interest_amount = CalculateInterest(dueDays, +details?.after_TDS_amount)

    }   else if (model == PURCHASE_TAKA_BILL_MODEL){

        
        
        // Supplier information 
        supplier_name = details?.purchase_taka_challan?.supplier?.supplier_name ; 
        supplier_company = details?.purchase_taka_challan?.supplier?.supplier_company ; 
        supplier_id = details?.purchase_taka_challan?.supplier?.user_id ; 
        suplier_gst_number = details?.purchase_taka_challan?.supplier?.user?.gst_no ; 
        supplier_pan_number = details?.purchase_taka_challan?.supplier?.user?.pancard_no ; 
        supplier_address = details?.purchase_taka_challan?.supplier?.user?.address ; 
        supplier_email = details?.purchase_taka_challan?.supplier?.user?.email ; 

        // Bill Information 
        SGST_value = details?.SGST_value ; 
        CGST_value = details?.CGST_value; 
        IGST_value = details?.IGST_value ; 
        TCS_value = details?.TCS_value ; 
        quality_id = details?.purchase_taka_challan?.quality_id ; 
        quality = undefined ; 
        bill_no = details?.invoice_no ; 
        total_meter = details?.purchase_taka_challan?.total_meter ;
        total_taka = details?.purchase_taka_challan?.total_taka ; 
        rate = details?.rate ; 
        bill_amount = details?.discount_amount ; 
        bill_net_amount = details?.after_TDS_amount

        // Calculated interest amount calculation 
        due_date = generatePurchaseBillDueDate(details?.bill_date) ; 
        let dueDays = calculateDaysDifference(due_date);
          if (dueDays < 0){
            dueDays = 0 ; 
        } 
        interest_amount = CalculateInterest(dueDays, +details?.after_TDS_amount)
        

    }   else if (model == JOB_REWORK_BILL_MODEL){

        // Supplier information 
        supplier_name = details?.supplier?.supplier_name ; 
        supplier_company = details?.supplier?.supplier_company ; 
        supplier_id = details?.supplier?.user_id ; 
        suplier_gst_number = details?.supplier?.user?.gst_no ; 
        supplier_pan_number = details?.supplier?.user?.pancard_no ; 
        supplier_address = details?.supplier?.user?.address ; 
        supplier_email = details?.supplier?.user?.email ; 
    
        // Bill Information 
        let job_rework_bill = details?.job_rework_bill ; 
        SGST_value = job_rework_bill?.SGST_value ; 
        CGST_value = job_rework_bill?.CGST_value ; 
        IGST_value = job_rework_bill?.IGST_value ; 
        TCS_value = job_rework_bill?.TCS_value ; 
        quality_id = details?.quality_id ; 
        quality = undefined ; 
        bill_no = job_rework_bill?.invoice_no 
        total_meter = details?.total_meter ; 
        total_taka = details?.total_taka ; 
        rate = job_rework_bill?.rate ; 
        bill_amount = job_rework_bill?.discount_amount ; 
        bill_net_amount = job_rework_bill?.net_amount ; 

        // Calculate interest amount calculation 
        due_date = moment(details?.due_date).format("DD-MM-YYYY");
        let dueDays = calculateDaysDifference(due_date);
        if (dueDays < 0){
            dueDays = 0 ; 
        }
        interest_amount = CalculateInterest(dueDays, +details?.net_amount) ; 
        
    }   else if (model == RECEIVE_SIZE_BEAM_BILL_MODEL){
        supplier_name = details?.supplier?.supplier_name ; 
        supplier_company = details?.supplier?.supplier_company ; 
        supplier_id = details?.supplier?.user_id ; 
        suplier_gst_number = details?.supplier?.user?.gst_no ; 
        supplier_pan_number = details?.supplier?.user?.pancard_no ; 
        supplier_address = details?.supplier?.user?.address ; 
        supplier_email = details?.supplier?.user?.email ; 

        // Bill Information 
        SGST_value = details?.SGST_value ; 
        CGST_value = details?.CGST_value ; 
        IGST_value = details?.IGST_value ; 
        TCS_value = details?.TCS_value ; 
        quality_id = details?.receive_size_beam?.quality_id ; 
        quality = undefined ; 
        bill_no = details?.bill_number ; 
        total_meter = details?.total_meter ; 
        total_taka = details?.total_taka ; 
        rate = details?.rate ; 
        bill_amount = details?.amount ; 
        bill_net_amount = details?.net_amount ; 

        // Calculate interest amount calculation 
        due_date = moment(details?.due_date).format("DD-MM-YYYY");
        let dueDays = calculateDaysDifference(due_date);
        if (dueDays < 0){
            dueDays = 0 ; 
        }
        interest_amount = CalculateInterest(dueDays, +details?.net_amount) ; 

    }   else {
        supplier_name = details?.supplier?.supplier_name ; 
        supplier_company = details?.supplier?.supplier_company ; 
        supplier_id = details?.supplier?.user_id ; 
        suplier_gst_number = details?.supplier?.user?.gst_no ; 
        supplier_pan_number = details?.supplier?.user?.pancard_no ; 
        supplier_address = details?.supplier?.user?.address ; 
        supplier_email = details?.supplier?.user?.email ; 
    }
    


    return {
        "supplier": {
            supplier_name,
            supplier_company, 
            supplier_address, 
            suplier_gst_number,
            supplier_pan_number, 
            supplier_address, 
            supplier_email, 
            supplier_id, 
            yarn_company_id
        }, 
        "bill": {
            SGST_value, 
            CGST_value, 
            IGST_value, 
            TCS_value, 
            quality, 
            quality_id, 
            bill_no, 
            total_meter, 
            total_taka,
            rate, 
            bill_amount, 
            bill_net_amount, 
            interest_amount, 
            due_date, 
            interest_amount
        }
    } 

}

export function extractCreditNoteData(details, model){
    console.log("Model information", model);
    console.log(details);
    
    
    // Supplier and Party information 
    let is_supplier = undefined ; 
    let username = undefined ; 
    let user_company = undefined ; 
    let user_gst_number = undefined ; 
    let user_email = undefined ; 
    let user_address = undefined ; 
    let user_pancard = undefined ; 
    let user_id = undefined ; 

    // Bill data information 
    let SGST_value = undefined ; 
    let CGST_value = undefined ; 
    let IGST_value = undefined ; 
    let quality_id = null ;
    let yarn_company_id = null ;  
    let quality = undefined ; 
    let total_meter = undefined ; 
    let total_taka = undefined ; 
    let rate = undefined ; 
    let TCS_value = undefined ; 
    let bill_amount = undefined ; 
    let bill_net_amount = undefined ;
    let bill_number = undefined ; 
    let bill_id = undefined ; 

    if (model == SALE_BILL_MODEL){
        // User information 
        is_supplier = false ; 
        username = String(`${details?.party?.first_name} ${details?.party?.last_name}`).toUpperCase() ; 
        user_company = details?.party?.party?.company_name ; 
        user_gst_number = details?.party?.gst_no ; 
        user_email = details?.party?.email ; 
        user_address = details?.party?.address ; 
        user_pancard = details.party?.pancard_no ; 
        user_id = details?.party_id ; 

        // Bill Information 
        SGST_value = details?.SGST_value ; 
        CGST_value = details?.CGST_value ; 
        IGST_value = details?.IGST_value ; 
        quality_id = details?.quality_id ; 
        quality = undefined ; 
        total_meter = details?.total_meter ; 
        total_taka = details?.total_taka ; 
        rate = details?.rate ; 
        TCS_value = 0 ; 
        bill_amount = details?.amount;  
        bill_net_amount = details?.net_amount ;
        bill_number = details?.e_way_bill_no ;
        bill_id = details?.id ;  

    }   else if (model == JOB_GREAY_SALE_BILL_MODEL){

        // User information
        is_supplier = false ; 
        username = String(`${details?.party?.first_name} ${details?.party?.last_name}`).toUpperCase() ; 
        user_company = details?.party?.party?.company_name ; 
        user_gst_number = details?.party?.gst_no ; 
        user_email = details?.party?.email ; 
        user_address = details?.party?.address ; 
        user_pancard = details.party?.pancard_no ; 
        user_id = details?.party_id ; 

        // Bill Information 
        SGST_value = details?.SGST_value ; 
        CGST_value = details?.CGST_value ; 
        IGST_value = details?.IGST_value ; 
        quality_id = details?.quality_id ; 
        quality = undefined ; 
        total_meter = details?.total_meter ; 
        total_taka = details?.total_taka ; 
        rate = details?.rate ; 
        TCS_value = 0 ; 
        bill_amount = details?.amount;  
        bill_net_amount = details?.net_amount ;
        bill_number = details?.invoice_no ;
        bill_id = details?.id ;  

    }   else if (model == JOB_WORK_BILL_MODEL){

        // User information
        is_supplier = true ; 
        username = String(`${details?.supplier?.supplier_name}`).toUpperCase() ; 
        user_company = details?.supplier?.supplier_company ; 
        user_gst_number = details?.supplier?.user?.gst_no ; 
        user_email = details?.supplier?.user?.email ; 
        user_address = details?.supplier?.user?.address ; 
        user_pancard = details.supplier?.user?.pancard_no ; 
        user_id = details?.supplier?.user_id ; 

        // Bill Information 
        let job_work_bill = details?.job_work_bill ; 

        SGST_value = job_work_bill?.SGST_value ; 
        CGST_value = job_work_bill?.CGST_value ; 
        IGST_value = job_work_bill?.IGST_value ; 
        quality_id = null ; 
        quality = undefined ; 
        yarn_company_id = details?.yarn_company_id ; 
        total_meter = details?.kg ; 
        total_taka = details?.quantity ; 
        rate = job_work_bill?.rate ; 
        TCS_value = 0 ; 
        bill_amount = job_work_bill?.amount;  
        bill_net_amount = job_work_bill?.net_amount ;
        bill_number = job_work_bill?.E_way_bill_no ;
        bill_id = job_work_bill?.id ;  
        
    }   else if (model == YARN_SALE_BILL_MODEL){

        // User information
        is_supplier = true ; 
        username = String(`${details?.supplier?.supplier_name}`).toUpperCase() ; 
        user_company = details?.supplier?.supplier_company ; 
        user_gst_number = details?.supplier?.user?.gst_no ; 
        user_email = details?.supplier?.user?.email ; 
        user_address = details?.supplier?.user?.address ; 
        user_pancard = details.supplier?.user?.pancard_no ; 
        user_id = details?.supplier?.user_id ; 

        // Bill Information 
        let job_work_bill = details?.yarn_sale_bill ; 

        SGST_value = job_work_bill?.SGST_value ; 
        CGST_value = job_work_bill?.CGST_value ; 
        IGST_value = job_work_bill?.IGST_value ; 
        quality_id = null ; 
        quality = undefined ; 
        yarn_company_id = details?.yarn_company_id ; 
        total_meter = details?.kg ; 
        total_taka = details?.quantity || 0 ; 
        rate = job_work_bill?.rate ; 
        TCS_value = 0 ; 
        bill_amount = job_work_bill?.amount;  
        bill_net_amount = job_work_bill?.net_amount ;
        bill_number = job_work_bill?.E_way_bill_no ;
        bill_id = job_work_bill?.id ;  
    
    }   else  {
        // User information
        is_supplier = true ; 
        username = String(`${details?.supplier?.supplier_name}`).toUpperCase() ; 
        user_company = details?.supplier?.supplier_company ; 
        user_gst_number = details?.supplier?.user?.gst_no ; 
        user_email = details?.supplier?.user?.email ; 
        user_address = details?.supplier?.user?.address ; 
        user_pancard = details.supplier?.user?.pancard_no ; 
        user_id = details?.supplier?.user_id ; 

        // Bill information 
        let job_work_bill = details?.beam_sale_bill ; 

        SGST_value = job_work_bill?.SGST_value ; 
        CGST_value = job_work_bill?.CGST_value ; 
        IGST_value = job_work_bill?.IGST_value ; 
        quality_id = details?.quality_id ; 
        quality = undefined ; 
        yarn_company_id = null ; 
        total_meter = details?.total_meter ; 
        total_taka = details?.enter_weight || 0 ; 
        rate = job_work_bill?.rate ; 
        TCS_value = 0 ; 
        bill_amount = job_work_bill?.amount;  
        bill_net_amount = job_work_bill?.net_amount ;
        bill_number = job_work_bill?.invoice_no ;
        bill_id = job_work_bill?.id ;  
    }

    return {
        "user": {
            is_supplier, 
            username, 
            user_company, 
            user_gst_number, 
            user_email, 
            user_address, 
            user_pancard , 
            user_id
        }, 
        "bill": {
            SGST_value, 
            CGST_value, 
            IGST_value, 
            quality_id, 
            quality, 
            total_meter, 
            total_taka, 
            rate, 
            TCS_value, 
            bill_amount, 
            bill_net_amount , 
            bill_number , 
            bill_id, 
            yarn_company_id
        }
    }
}