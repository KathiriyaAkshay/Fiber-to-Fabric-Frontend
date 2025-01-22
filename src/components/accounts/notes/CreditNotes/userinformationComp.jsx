export default function UserInformationComp({user}){
    return(
        <div>

            {user?.is_supplier !== undefined && (
                <>
                    {user?.user_company !== undefined && (
                        <strong style={{
                            fontSize: 18, 
                            color: "blue"
                        }}>{String(user?.user_company).toUpperCase()}</strong>
                    )}

                    <div className="credit-note-info-title">
                        <span>{user?.is_supplier?"Supplier : ":"Party : "}</span>{" "}
                            {`${user?.username}` || ""}<br/>
                            {user?.user_address || ""}
                    </div>
                    <div className="credit-note-info-title">
                            <span>GSTIN/UIN: </span> {user?.user_gst_number || ""}
                    </div>
                    <div className="credit-note-info-title">
                            <span>PAN/IT No : </span> {user?.user_pancard}
                    </div>
                    <div>
                        <span style={{fontWeight: 600}}>Email:</span> {user?.user_email} 
                    </div>
                </>
            )}

        </div>
    )
}