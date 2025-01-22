export default function SupplierInformationComp({ supplier }) {
    return (
        <div>
            {/* Suplier company information  */}
            <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: "blue"
            }}>{String(supplier?.supplier_company).toUpperCase()}</div>

            {/* Suplier name information  */}
            <div className="credit-note-info-title">
                <span>Supplier:</span>
                {supplier?.supplier_name}
            </div>

            {/* Supplier address information  */}
            <div>
                <div style={{ fontWeight: 600 }}>
                    <span>Address:</span><br />
                    <span style={{ fontWeight: 400 }}>
                        {supplier?.supplier_address}
                    </span>
                </div>
            </div>

            {/* Supplier GST number information  */}
            <div className="credit-note-info-title">
                <span>GSTIN/UIN:</span>
                {supplier?.suplier_gst_number}
            </div>
            <div className="credit-note-info-title">
                <span>PAN/IT No:</span> {supplier?.supplier_pan_number}
            </div>
            <div className="credit-note-info-title">
                <span>Email:</span>{supplier?.supplier_email}
            </div>
        </div>
    )
}